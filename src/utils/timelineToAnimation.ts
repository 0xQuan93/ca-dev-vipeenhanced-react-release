import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';
import type { TimelineSequence } from '../types/timeline';

/**
 * Get the hierarchical path to a node from the root
 * Returns format like: "Scene/Armature/Hips"
 */
function getNodePath(node: THREE.Object3D, root: THREE.Object3D): string | null {
  const path: string[] = [];
  let current: THREE.Object3D | null = node;

  while (current && current !== root) {
    path.unshift(current.name);
    current = current.parent;
  }

  if (current === root) {
    return path.join('/');
  }

  return null;
}

/**
 * Converts a TimelineSequence into a THREE.AnimationClip
 * capable of being played by the AnimationManager on the given VRM.
 */
export function timelineToAnimationClip(sequence: TimelineSequence, vrm: VRM): THREE.AnimationClip {
  const tracks: THREE.KeyframeTrack[] = [];
  
  // 1. Identify all participating bones
  // We map Node Path -> { times: [], values: [] }
  const rotationTracks = new Map<string, { times: number[], values: number[] }>();
  const positionTracks = new Map<string, { times: number[], values: number[] }>();

  // Helper to get track data or create it
  const getRotationTrack = (nodePath: string) => {
    if (!rotationTracks.has(nodePath)) {
      rotationTracks.set(nodePath, { times: [], values: [] });
    }
    return rotationTracks.get(nodePath)!;
  };

  const getPositionTrack = (nodePath: string) => {
    if (!positionTracks.has(nodePath)) {
      positionTracks.set(nodePath, { times: [], values: [] });
    }
    return positionTracks.get(nodePath)!;
  };

  // 2. Iterate through keyframes and gather data
  // Sort keyframes by time just in case
  const sortedKeyframes = [...sequence.keyframes].sort((a, b) => a.time - b.time);

  sortedKeyframes.forEach((kf) => {
    if (!kf.pose) return;

    Object.entries(kf.pose).forEach(([boneName, transform]) => {
      // Resolve VRM bone name to actual Object3D node
      // We accept generic VRMHumanBoneName strings here
      const node = vrm.humanoid?.getNormalizedBoneNode(boneName as any);
      
      if (!node) return;

      const nodePath = getNodePath(node, vrm.scene);
      if (!nodePath) return;

      // Handle Rotation
      if (transform.rotation) {
        const trackData = getRotationTrack(nodePath);
        trackData.times.push(kf.time);
        // VRM Pose rotation is [x, y, z, w]
        trackData.values.push(...transform.rotation);
      }

      // Handle Position (mostly for Hips)
      if (transform.position) {
        const trackData = getPositionTrack(nodePath);
        trackData.times.push(kf.time);
        // VRM Pose position is [x, y, z]
        trackData.values.push(...transform.position);
      }
    });
  });

  // 3. Create KeyframeTracks
  rotationTracks.forEach((data, nodePath) => {
    if (data.times.length > 0) {
      // Create Quaternion track
      // Name format: "NodePath.quaternion"
      tracks.push(new THREE.QuaternionKeyframeTrack(
        `${nodePath}.quaternion`,
        data.times,
        data.values
      ));
    }
  });

  positionTracks.forEach((data, nodePath) => {
    if (data.times.length > 0) {
      // Create Vector track
      // Name format: "NodePath.position"
      tracks.push(new THREE.VectorKeyframeTrack(
        `${nodePath}.position`,
        data.times,
        data.values
      ));
    }
  });

  // 4. Build AnimationClip
  const clip = new THREE.AnimationClip(
    'TimelineAnimation',
    sequence.duration,
    tracks
  );

  return clip;
}

