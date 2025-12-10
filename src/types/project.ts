import type { BackgroundId } from '../types/reactions';
import type { TimelineSequence } from '../types/timeline';
import type { AnimationMode } from '../types/reactions';

export interface ProjectState {
  version: number;
  date: number;
  metadata: {
    name: string;
    description?: string;
  };
  scene: {
    backgroundId: BackgroundId | string;
    camera: {
      position: { x: number; y: number; z: number };
      target: { x: number; y: number; z: number };
    };
  };
  timeline: {
    sequence: TimelineSequence;
    duration: number;
  };
  reaction: {
    animationMode: AnimationMode;
    activePresetId: string;
  };
  avatar: {
    url?: string;
    name?: string; // For display if URL is blob/missing
  };
}

// Current version of the project file format
export const PROJECT_VERSION = 1;

