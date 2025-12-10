import type { Action } from "kbar";
import { useToast } from "./Toast";
import { sceneManager } from "../three/sceneManager";
import { avatarManager } from "../three/avatarManager";
import { animationManager } from "../three/animationManager";
import { interactionManager } from "../three/interactionManager";
import { projectManager } from "../persistence/projectManager";

// Helper to access store outside of component
const getToast = () => useToast.getState();

export const commands: Action[] = [
  {
    id: "project-save",
    name: "Project: Save (.pose)",
    shortcut: ["ctrl+s"],
    keywords: "save export project",
    section: "Project",
    perform: () => {
        projectManager.downloadProject("My Project");
        getToast().addToast("Project saved", "success");
    }
  },
  {
    id: "project-load",
    name: "Project: Load (.pose)",
    shortcut: ["ctrl+o"],
    keywords: "load open import project",
    section: "Project",
    perform: () => {
        // Create a hidden file input to trigger upload
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pose,.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const success = await projectManager.loadFromFile(file);
                if (success) {
                    getToast().addToast("Project loaded", "success");
                } else {
                    getToast().addToast("Failed to load project", "error");
                }
            }
        };
        input.click();
    }
  },
  { 
      id: "export-png", 
      name: "Export PNG", 
      shortcut: ["p"], 
      keywords: "save image screenshot",
      perform: () => {
          const link = document.createElement('a');
          link.href = sceneManager.getCanvas()?.toDataURL('image/png') || '';
          link.download = `PoseLab_Capture_${Date.now()}.png`;
          link.click();
          getToast().addToast('📸 PNG Saved', 'success');
      } 
  },
  { 
      id: "camera-front", 
      name: "Camera: Front", 
      shortcut: ["1"], 
      keywords: "view front",
      perform: () => {
          sceneManager.setCameraPreset('front');
          getToast().addToast('Camera: Front', 'info');
      } 
  },
  { 
      id: "gizmo-rotate", 
      name: "Gizmo: Rotate", 
      shortcut: ["2"], 
      keywords: "rotate tool",
      perform: () => {
         if (interactionManager.enabled) {
             interactionManager.toggle(false);
             getToast().addToast('Tool: Rotate Off', 'info');
         } else {
             interactionManager.toggle(true);
             interactionManager.setGizmoMode('rotate');
             getToast().addToast('Tool: Rotate On', 'info');
         }
      } 
  },
  {
      id: "reset-pose",
      name: "Reset Pose",
      shortcut: ["r"],
      keywords: "tpose clear",
      perform: () => {
          avatarManager.resetPose();
          getToast().addToast('Pose Reset', 'info');
      }
  },
  {
      id: "stop-anim",
      name: "Stop Animation",
      shortcut: ["space"],
      keywords: "pause halt",
      perform: () => {
          animationManager.stopAnimation();
          getToast().addToast('Animation Stopped', 'info');
      }
  }
];
