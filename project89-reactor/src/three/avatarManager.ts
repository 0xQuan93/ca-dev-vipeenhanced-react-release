import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import type { VRMHumanBoneName, VRMPose } from '@pixiv/three-vrm';
import type { ExpressionId, PoseId } from '../types/reactions';
import { sceneManager } from './sceneManager';
import { getPoseDefinition, type PoseDefinition } from '../poses';

type ExpressionMutator = (vrm: VRM) => void;

const expressionMutators: Record<ExpressionId, ExpressionMutator> = {
  calm: (vrm) => {
    vrm.expressionManager?.setValue('Joy', 0);
    vrm.expressionManager?.setValue('Surprised', 0);
    vrm.expressionManager?.setValue('Angry', 0);
  },
  joy: (vrm) => {
    vrm.expressionManager?.setValue('Joy', 0.8);
    vrm.expressionManager?.setValue('Surprised', 0);
    vrm.expressionManager?.setValue('Angry', 0);
  },
  surprise: (vrm) => {
    vrm.expressionManager?.setValue('Joy', 0);
    vrm.expressionManager?.setValue('Surprised', 0.9);
    vrm.expressionManager?.setValue('Angry', 0);
  },
};

class AvatarManager {
  private loader = new GLTFLoader();
  private vrm?: VRM;
  private currentUrl?: string;
  private tickDispose?: () => void;

  constructor() {
    this.loader.register((parser) => new VRMLoaderPlugin(parser));
  }

  async load(url: string) {
    if (this.currentUrl === url && this.vrm) return this.vrm;
    const scene = sceneManager.getScene();
    if (!scene) throw new Error('Scene not initialized');

    const gltf = await this.loader.loadAsync(url);
    const vrm = gltf.userData.vrm as VRM | undefined;
    if (!vrm) throw new Error('VRM payload missing');
    VRMUtils.removeUnnecessaryVertices(vrm.scene);
    VRMUtils.removeUnnecessaryJoints(vrm.scene);

    if (this.vrm) {
      scene.remove(this.vrm.scene);
      this.tickDispose?.();
    }
    this.vrm = vrm;
    this.currentUrl = url;

    vrm.scene.position.set(0, 0, 0);
    scene.add(vrm.scene);

    this.tickDispose = sceneManager.registerTick((delta) => {
      vrm.update(delta);
    });

    return vrm;
  }

  applyPose(pose: PoseId) {
    if (!this.vrm) return;
    const definition = getPoseDefinition(pose);
    if (!definition) return;
    const vrmPose = buildVRMPose(definition);
    
    if (this.vrm.humanoid?.resetNormalizedPose) {
      this.vrm.humanoid.resetNormalizedPose();
      this.vrm.humanoid.setNormalizedPose(vrmPose);
    } else {
      this.vrm.humanoid?.resetPose();
      this.vrm.humanoid?.setPose(vrmPose);
    }
    
    // Force immediate updates to propagate bone transforms
    this.vrm.humanoid?.update();
    this.vrm.update(0);
    this.vrm.scene.updateMatrixWorld(true);

    // Apply scene rotation to face camera
    this.applySceneRotation(definition);
  }

  applyExpression(expression: ExpressionId) {
    if (!this.vrm) return;
    this.vrm.expressionManager?.setValue('Joy', 0);
    this.vrm.expressionManager?.setValue('Surprised', 0);
    this.vrm.expressionManager?.setValue('Angry', 0);
    expressionMutators[expression]?.(this.vrm);
  }

  private applySceneRotation(definition: PoseDefinition) {
    const rotation = definition.sceneRotation ?? { x: 0, y: 0, z: 0 };
    this.vrm?.scene.rotation.set(
      THREE.MathUtils.degToRad(rotation.x ?? 0),
      THREE.MathUtils.degToRad(rotation.y ?? 0),
      THREE.MathUtils.degToRad(rotation.z ?? 0),
    );
  }
}

function buildVRMPose(definition: PoseDefinition): VRMPose {
  if (definition.vrmPose) {
    // Deep clone and return as-is (position data already stripped during export)
    return JSON.parse(JSON.stringify(definition.vrmPose));
  }

  const pose: VRMPose = {};
  if (!definition.boneRotations) return pose;

  Object.entries(definition.boneRotations).forEach(([boneName, rotation]) => {
    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(rotation.x ?? 0),
      THREE.MathUtils.degToRad(rotation.y ?? 0),
      THREE.MathUtils.degToRad(rotation.z ?? 0),
      'XYZ',
    );
    const quaternion = new THREE.Quaternion().setFromEuler(euler);
    pose[boneName as VRMHumanBoneName] = {
      rotation: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
    };
  });

  return pose;
}

export const avatarManager = new AvatarManager();

