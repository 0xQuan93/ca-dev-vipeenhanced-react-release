import dawnRunner from './dawn-runner.json';
import greenLoom from './green-loom.json';
import sunsetCall from './sunset-call.json';
import cipherWhisper from './cipher-whisper.json';
import nebulaDrift from './nebula-drift.json';
import loomVanguard from './loom-vanguard.json';
import signalReverie from './signal-reverie.json';
import protocolEnforcer from './protocol-enforcer.json';
import type { PoseId } from '../types/reactions';
import type { VRMPose } from '@pixiv/three-vrm';

type EulerDegrees = {
  x?: number;
  y?: number;
  z?: number;
};

export type PoseDefinition = {
  sceneRotation?: EulerDegrees;
  vrmPose?: VRMPose;
  boneRotations?: Record<string, EulerDegrees>;
};

const poseLibrary: Record<PoseId, PoseDefinition> = {
  'dawn-runner': dawnRunner as PoseDefinition,
  'green-loom': greenLoom as PoseDefinition,
  'sunset-call': sunsetCall as PoseDefinition,
  'cipher-whisper': cipherWhisper as PoseDefinition,
  'nebula-drift': nebulaDrift as PoseDefinition,
  'loom-vanguard': loomVanguard as PoseDefinition,
  'signal-reverie': signalReverie as PoseDefinition,
  'protocol-enforcer': protocolEnforcer as PoseDefinition,
};

export function getPoseDefinition(id: PoseId): PoseDefinition | undefined {
  return poseLibrary[id];
}

