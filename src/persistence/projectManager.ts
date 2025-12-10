import { useReactionStore } from '../state/useReactionStore';
import { useTimelineStore } from '../state/useTimelineStore';
import { sceneManager } from '../three/sceneManager';
import { avatarManager } from '../three/avatarManager';
import { PROJECT_VERSION, type ProjectState } from '../types/project';
import { defaultPreset } from '../data/reactions';

export class ProjectManager {
  /**
   * Serialize the current application state into a Project object
   */
  serializeProject(name: string = 'Untitled Project'): ProjectState {
    const reactionState = useReactionStore.getState();
    const timelineState = useTimelineStore.getState();
    
    const camera = sceneManager.getCamera();
    const controls = sceneManager.getControls();
    
    // Get background ID - this might need better access if stored in SceneManager private
    // We can assume it's tracked or just use a default for now if not exposed
    // Ideally SceneManager should expose getCurrentBackgroundId()
    // For now, let's assume 'midnight' if we can't find it, or check reaction store if it tracks it?
    // ReactionStore tracks activePreset which has backgroundId.
    const backgroundId = reactionState.activePreset.backgroundId || 'midnight';

    // Get Avatar Metadata
    // Note: We cannot save the BLOB itself efficiently in JSON. 
    // We save the URL if it's remote, otherwise just metadata.
    // AvatarManager doesn't expose currentUrl publicly in the interface I saw, 
    // but we can add a getter or access it if we refactored.
    // Let's assume for now we save what we can.
    
    return {
      version: PROJECT_VERSION,
      date: Date.now(),
      metadata: {
        name,
      },
      scene: {
        backgroundId,
        camera: {
          position: camera ? { x: camera.position.x, y: camera.position.y, z: camera.position.z } : { x: 0, y: 1.4, z: 1.6 },
          target: controls ? { x: controls.target.x, y: controls.target.y, z: controls.target.z } : { x: 0, y: 1.4, z: 0 },
        },
      },
      timeline: {
        sequence: timelineState.sequence,
        duration: timelineState.sequence.duration,
      },
      reaction: {
        animationMode: reactionState.animationMode,
        activePresetId: reactionState.activePreset.id,
      },
      avatar: {
        // We might need to ask AvatarManager for this info
        name: 'Current Avatar', 
        url: avatarManager.getCurrentUrl()
      }
    };
  }

  /**
   * Restore a project from a ProjectState object
   */
  async loadProject(project: ProjectState) {
    console.log('[ProjectManager] Loading project:', project.metadata.name);

    if (project.version > PROJECT_VERSION) {
      console.warn('[ProjectManager] Project version is newer than supported. Some features may break.');
    }

    // 1. Restore Scene
    // Set Background
    await sceneManager.setBackground(project.scene.backgroundId);
    
    // Set Camera
    const camera = sceneManager.getCamera();
    const controls = sceneManager.getControls();
    if (camera && controls) {
      camera.position.set(
        project.scene.camera.position.x,
        project.scene.camera.position.y,
        project.scene.camera.position.z
      );
      controls.target.set(
        project.scene.camera.target.x,
        project.scene.camera.target.y,
        project.scene.camera.target.z
      );
      controls.update();
    }

    // 2. Restore Timeline
    const timelineStore = useTimelineStore.getState();
    timelineStore.clearTimeline();
    // We need to construct the state update carefully
    // Since clearTimeline resets everything, we manually set properties
    useTimelineStore.setState({
      sequence: project.timeline.sequence,
    });
    timelineStore.setDuration(project.timeline.duration);

    // 3. Restore Reaction State
    const reactionStore = useReactionStore.getState();
    reactionStore.setAnimationMode(project.reaction.animationMode);
    reactionStore.setPresetById(project.reaction.activePresetId);

    // 4. Avatar
    // We can't auto-load local avatars. 
    // If we had a remote URL, we could try: avatarManager.load(project.avatar.url)
    console.log('[ProjectManager] Project loaded. Avatar must be loaded manually if not consistent.');
  }

  /**
   * Export project to JSON file
   */
  downloadProject(name: string) {
    const project = this.serializeProject(name);
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_').toLowerCase()}.pose`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Parse a file input and load the project
   */
  async loadFromFile(file: File) {
    try {
      const text = await file.text();
      const project = JSON.parse(text) as ProjectState;
      await this.loadProject(project);
      return true;
    } catch (e) {
      console.error('[ProjectManager] Failed to load project file:', e);
      return false;
    }
  }
}

export const projectManager = new ProjectManager();

