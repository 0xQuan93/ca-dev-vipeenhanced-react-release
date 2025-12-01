import { useState } from 'react';
import { useReactionStore } from '../state/useReactionStore';
import { sceneManager } from '../three/sceneManager';
import { reactionPresets } from '../data/reactions';

export function ReactionPanel() {
  const { nameInput, setNameInput, applyName, randomize, activePreset, isAvatarReady, setPresetById } =
    useReactionStore();
  const [statusMessage, setStatusMessage] = useState('Upload complete');

  const handleApply = () => {
    const preset = applyName();
    setStatusMessage(`Loaded ${preset.label}`);
  };

  const handleRandomize = () => {
    const preset = randomize();
    setStatusMessage(`Randomized to ${preset.label}`);
  };

  const handleSave = () => {
    const dataUrl = sceneManager.captureSnapshot();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${activePreset.id}.png`;
    link.click();
  };

  const handleShare = async () => {
    const dataUrl = sceneManager.captureSnapshot();
    if (!dataUrl) return;
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `${activePreset.id}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Project 89 Reaction',
        text: 'Check out this Project 89 avatar reaction.',
      });
    } else {
      window.open(dataUrl, '_blank');
    }
  };

  return (
    <section className="panel">
      <header>
        <h1>Project 89 Reaction Forge</h1>
        <p className="muted">Type a holder alias to generate a tailored expression.</p>
      </header>
      <label className="field">
        <span>Avatar name</span>
        <input
          type="text"
          value={nameInput}
          onChange={(event) => setNameInput(event.target.value)}
          placeholder="e.g. Harmon Vox"
        />
      </label>
      <label className="field">
        <span>Reaction preset</span>
        <select
          value={activePreset.id}
          onChange={(event) => {
            const preset = setPresetById(event.target.value);
            if (preset) setStatusMessage(`Selected ${preset.label}`);
          }}
        >
          {reactionPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>
      <div className="actions">
        <button type="button" disabled={!isAvatarReady} onClick={handleApply}>
          Generate reaction
        </button>
        <button type="button" className="secondary" onClick={handleRandomize}>
          Randomize
        </button>
      </div>
      <div className="status-card">
        <span className="status-label">Active reaction</span>
        <h2>{activePreset.label}</h2>
        <p className="muted">{activePreset.description}</p>
        <p className="status-message">{statusMessage}</p>
      </div>
      <div className="actions">
        <button type="button" onClick={handleSave}>
          Save PNG
        </button>
        <button type="button" className="secondary" onClick={handleShare}>
          Share
        </button>
      </div>
    </section>
  );
}

