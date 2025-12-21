import { create } from 'zustand';

export type AppMode = 'reactions' | 'poselab';
export type ReactionTab = 'presets' | 'pose' | 'scene' | 'export';
export type PoseLabTab = 'animations' | 'poses' | 'ai' | 'mocap' | 'timeline' | 'export';

interface UIState {
  mode: AppMode;
  reactionTab: ReactionTab;
  poseLabTab: PoseLabTab;
  mobileDrawerOpen: boolean;
  
  // Tutorial State
  isTutorialActive: boolean;
  currentTutorialStep: number;

  // Global UI State
  activeCssOverlay: string | null;
  
  setMode: (mode: AppMode) => void;
  setReactionTab: (tab: ReactionTab) => void;
  setPoseLabTab: (tab: PoseLabTab) => void;
  setMobileDrawerOpen: (open: boolean) => void;
  
  startTutorial: () => void;
  endTutorial: () => void;
  nextTutorialStep: () => void;
  setTutorialStep: (step: number) => void;
  
  setActiveCssOverlay: (overlay: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mode: 'reactions',
  reactionTab: 'presets',
  poseLabTab: 'animations', // Default will be changed to 'timeline' via logic or init
  mobileDrawerOpen: false,
  
  isTutorialActive: false,
  currentTutorialStep: 0,
  
  activeCssOverlay: null,

  setMode: (mode) => set({ mode }),
  setReactionTab: (tab) => set({ reactionTab: tab }),
  setPoseLabTab: (tab) => set({ poseLabTab: tab }),
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
  
  startTutorial: () => set({ isTutorialActive: true, currentTutorialStep: 0 }),
  endTutorial: () => set({ isTutorialActive: false, currentTutorialStep: 0 }),
  nextTutorialStep: () => set((state) => ({ currentTutorialStep: state.currentTutorialStep + 1 })),
  setTutorialStep: (step) => set({ currentTutorialStep: step }),
  
  setActiveCssOverlay: (overlay) => set({ activeCssOverlay: overlay }),
}));

