import { create } from 'zustand';
import * as THREE from 'three';

interface RecordedAnimation {
  id: string;
  name: string;
  date: number;
  duration: number;
  clip: THREE.AnimationClip;
}

interface AnimationState {
  animations: RecordedAnimation[];
  addAnimation: (clip: THREE.AnimationClip, name: string) => void;
  removeAnimation: (id: string) => void;
  clearAnimations: () => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  animations: [],
  addAnimation: (clip, name) => set((state) => ({
    animations: [...state.animations, {
      id: crypto.randomUUID(),
      name,
      date: Date.now(),
      duration: clip.duration,
      clip
    }]
  })),
  removeAnimation: (id) => set((state) => ({
    animations: state.animations.filter(a => a.id !== id)
  })),
  clearAnimations: () => set({ animations: [] })
}));

