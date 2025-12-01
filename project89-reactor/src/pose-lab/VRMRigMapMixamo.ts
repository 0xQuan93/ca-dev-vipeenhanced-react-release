import * as THREE from 'three';
import type { VRMHumanBoneName } from '@pixiv/three-vrm';

type MixamoMap = Record<string, VRMHumanBoneName>;

const baseMap: MixamoMap = {
  mixamorigHips: 'hips',
  mixamorigSpine: 'spine',
  mixamorigSpine1: 'chest',
  mixamorigSpine2: 'upperChest',
  mixamorigNeck: 'neck',
  mixamorigHead: 'head',
  mixamorigLeftShoulder: 'leftShoulder',
  mixamorigLeftArm: 'leftUpperArm',
  mixamorigLeftForeArm: 'leftLowerArm',
  mixamorigLeftHand: 'leftHand',
  mixamorigLeftHandThumb1: 'leftThumbMetacarpal',
  mixamorigLeftHandThumb2: 'leftThumbProximal',
  mixamorigLeftHandThumb3: 'leftThumbDistal',
  mixamorigLeftHandIndex1: 'leftIndexProximal',
  mixamorigLeftHandIndex2: 'leftIndexIntermediate',
  mixamorigLeftHandIndex3: 'leftIndexDistal',
  mixamorigLeftHandMiddle1: 'leftMiddleProximal',
  mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
  mixamorigLeftHandMiddle3: 'leftMiddleDistal',
  mixamorigLeftHandRing1: 'leftRingProximal',
  mixamorigLeftHandRing2: 'leftRingIntermediate',
  mixamorigLeftHandRing3: 'leftRingDistal',
  mixamorigLeftHandPinky1: 'leftLittleProximal',
  mixamorigLeftHandPinky2: 'leftLittleIntermediate',
  mixamorigLeftHandPinky3: 'leftLittleDistal',
  mixamorigRightShoulder: 'rightShoulder',
  mixamorigRightArm: 'rightUpperArm',
  mixamorigRightForeArm: 'rightLowerArm',
  mixamorigRightHand: 'rightHand',
  mixamorigRightHandThumb1: 'rightThumbMetacarpal',
  mixamorigRightHandThumb2: 'rightThumbProximal',
  mixamorigRightHandThumb3: 'rightThumbDistal',
  mixamorigRightHandIndex1: 'rightIndexProximal',
  mixamorigRightHandIndex2: 'rightIndexIntermediate',
  mixamorigRightHandIndex3: 'rightIndexDistal',
  mixamorigRightHandMiddle1: 'rightMiddleProximal',
  mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
  mixamorigRightHandMiddle3: 'rightMiddleDistal',
  mixamorigRightHandRing1: 'rightRingProximal',
  mixamorigRightHandRing2: 'rightRingIntermediate',
  mixamorigRightHandRing3: 'rightRingDistal',
  mixamorigRightHandPinky1: 'rightLittleProximal',
  mixamorigRightHandPinky2: 'rightLittleIntermediate',
  mixamorigRightHandPinky3: 'rightLittleDistal',
  mixamorigLeftUpLeg: 'leftUpperLeg',
  mixamorigLeftLeg: 'leftLowerLeg',
  mixamorigLeftFoot: 'leftFoot',
  mixamorigLeftToeBase: 'leftToes',
  mixamorigRightUpLeg: 'rightUpperLeg',
  mixamorigRightLeg: 'rightLowerLeg',
  mixamorigRightFoot: 'rightFoot',
  mixamorigRightToeBase: 'rightToes',
};

const colonizedEntries = Object.entries(baseMap).map(([key, value]) => {
  if (!key.startsWith('mixamorig') || key.startsWith('mixamorig:')) {
    return [key, value] as const;
  }
  const suffix = key.slice('mixamorig'.length);
  const colonKey = `mixamorig:${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`;
  return [colonKey, value] as const;
});

export const VRMRigMapMixamo: MixamoMap = {
  ...baseMap,
  ...Object.fromEntries(colonizedEntries),
};

/**
 * Finds a bone on the Mixamo hierarchy by trying multiple naming styles.
 */
export function findMixamoNode(root: THREE.Object3D, name: string): THREE.Object3D | null {
  const candidates = new Set<string>([name]);
  if (name.includes('mixamorig') && !name.includes(':')) {
    const suffix = name.slice('mixamorig'.length);
    candidates.add(`mixamorig:${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`);
  } else if (name.includes('mixamorig:')) {
    const suffix = name.split(':')[1] ?? '';
    candidates.add(`mixamorig${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`);
  }
  let node: THREE.Object3D | null = null;
  for (const candidate of candidates) {
    node = root.getObjectByName(candidate) ?? null;
    if (node) break;
  }
  return node;
}

