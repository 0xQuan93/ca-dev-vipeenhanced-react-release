import * as THREE from 'three';
import type { BackgroundId } from '../types/reactions';

type BackgroundDefinition = {
  id: BackgroundId;
  label: string;
  color: THREE.ColorRepresentation;
};

const backgroundDefinitions: BackgroundDefinition[] = [
  {
    id: 'midnight',
    label: 'Midnight Circuit',
    color: '#05060c',
  },
  {
    id: 'sunset',
    label: 'Protocol Sunset',
    color: '#ff6f61',
  },
  {
    id: 'matrix',
    label: 'Green Loom',
    color: '#0b3d2e',
  },
];

export function getBackgroundDefinition(id: BackgroundId): BackgroundDefinition {
  return backgroundDefinitions.find((entry) => entry.id === id) ?? backgroundDefinitions[0];
}

export function applyBackground(scene: THREE.Scene, id: BackgroundId) {
  const { color } = getBackgroundDefinition(id);
  scene.background = new THREE.Color(color);
}

export const backgroundOptions = backgroundDefinitions;

