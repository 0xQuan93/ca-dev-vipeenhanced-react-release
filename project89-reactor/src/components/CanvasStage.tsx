import { useEffect, useRef } from 'react';
import { sceneManager } from '../three/sceneManager';
import { avatarManager } from '../three/avatarManager';
import { useReactionStore } from '../state/useReactionStore';
import type { ReactionPreset } from '../types/reactions';
import { useAvatarSource } from '../state/useAvatarSource';

export function CanvasStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const preset = useReactionStore((state) => state.activePreset);
  const avatarReady = useReactionStore((state) => state.isAvatarReady);
  const setAvatarReady = useReactionStore((state) => state.setAvatarReady);
  const sourceUrl = useAvatarSource((state) => state.currentUrl);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sceneManager.init(canvas);
    return () => sceneManager.dispose();
  }, []);

  useEffect(() => {
    if (!sourceUrl) return;
    let cancelled = false;
    setAvatarReady(false);
    avatarManager
      .load(sourceUrl)
      .then(() => {
        if (cancelled) return;
        setAvatarReady(true);
        const currentPreset = useReactionStore.getState().activePreset;
        applyPreset(currentPreset);
      })
      .catch((error) => {
        console.error('Failed to load VRM', error);
      });
    return () => {
      cancelled = true;
    };
  }, [sourceUrl, setAvatarReady]);

  useEffect(() => {
    if (!avatarReady) return;
    applyPreset(preset);
  }, [preset, avatarReady]);

  const applyPreset = (currentPreset: ReactionPreset) => {
    avatarManager.applyPose(currentPreset.pose);
    avatarManager.applyExpression(currentPreset.expression);
    sceneManager.setBackground(currentPreset.background);
  };

  return <canvas ref={canvasRef} className="canvas-stage" />;
}

