import * as THREE from 'three';
import type { VRMPose, VRMHumanBoneName } from '@pixiv/three-vrm';

const valueCache = new WeakMap<THREE.KeyframeTrack, number[]>();

function sampleFirstFrame(track: THREE.KeyframeTrack): number[] | null {
  if (!track.values.length) return null;
  const size = track.getValueSize();
  let cached = valueCache.get(track);
  if (!cached || cached.length !== size) {
    cached = new Array(size).fill(0);
    valueCache.set(track, cached);
  }

  for (let i = 0; i < size; i += 1) {
    cached[i] = track.values[i];
  }

  return cached.slice();
}

export function poseFromClip(clip: THREE.AnimationClip): VRMPose {
  const pose: VRMPose = {};

  clip.tracks.forEach((track) => {
    const parts = track.name.split('.');
    if (parts.length < 2) return;
    const boneName = parts[0] as VRMHumanBoneName;

    const sample = sampleFirstFrame(track);
    if (!sample) return;

    if (!pose[boneName]) {
      pose[boneName] = {};
    }

    if (track instanceof THREE.QuaternionKeyframeTrack) {
      pose[boneName]!.rotation = sample as [number, number, number, number];
    }
    // Completely ignore ALL position tracks - we want pure rotation-only poses
    // so all avatars anchor at the same vertical position
  });

  return pose;
}

