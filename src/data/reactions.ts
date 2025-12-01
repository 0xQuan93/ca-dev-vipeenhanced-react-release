import type { ReactionPreset } from '../types/reactions';

export const reactionPresets: ReactionPreset[] = [
  {
    id: 'dawn-runner',
    label: 'Dawn Runner',
    description: 'Calm focus for reconnaissance briefs.',
    pose: 'dawn-runner',
    expression: 'calm',
    background: 'midnight',
  },
  {
    id: 'green-loom',
    label: 'Green Loom',
    description: 'Uplifted joy for alliance announcements.',
    pose: 'green-loom',
    expression: 'joy',
    background: 'matrix',
  },
  {
    id: 'sunset-call',
    label: 'Sunset Call',
    description: 'Warm surprise for incoming intel.',
    pose: 'sunset-call',
    expression: 'surprise',
    background: 'sunset',
  },
  {
    id: 'cipher-whisper',
    label: 'Cipher Whisper',
    description: 'Quiet intel relay with a hand-over-comms hush.',
    pose: 'cipher-whisper',
    expression: 'calm',
    background: 'midnight',
  },
  {
    id: 'nebula-drift',
    label: 'Nebula Drift',
    description: 'Zero-G serenity for meditative uplinks.',
    pose: 'nebula-drift',
    expression: 'joy',
    background: 'matrix',
  },
  {
    id: 'loom-vanguard',
    label: 'Loom Vanguard',
    description: 'Hands-on-hips command stance for rally calls.',
    pose: 'loom-vanguard',
    expression: 'calm',
    background: 'sunset',
  },
  {
    id: 'signal-reverie',
    label: 'Signal Reverie',
    description: 'Introverted kinetic energy, eyes toward the floor.',
    pose: 'signal-reverie',
    expression: 'surprise',
    background: 'midnight',
  },
  {
    id: 'protocol-enforcer',
    label: 'Protocol Enforcer',
    description: 'Squared shoulders, ready stance for field ops.',
    pose: 'protocol-enforcer',
    expression: 'calm',
    background: 'matrix',
  },
];

const defaultPreset = reactionPresets[0];

export function pickPresetForName(name: string): ReactionPreset {
  if (!name) return defaultPreset;
  const normalized = name.trim().toLowerCase();
  const hit = reactionPresets.find((preset) => normalized.includes(preset.id.replace('-', ' ')));
  if (hit) return hit;
  const hash = normalized
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return reactionPresets[hash % reactionPresets.length];
}

export function randomPreset(): ReactionPreset {
  const index = Math.floor(Math.random() * reactionPresets.length);
  return reactionPresets[index];
}

export function findPresetById(id: string): ReactionPreset | undefined {
  return reactionPresets.find((preset) => preset.id === id);
}

export { defaultPreset };

