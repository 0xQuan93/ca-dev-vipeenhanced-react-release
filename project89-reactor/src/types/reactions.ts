export type PoseId =
  | 'dawn-runner'
  | 'green-loom'
  | 'sunset-call'
  | 'cipher-whisper'
  | 'nebula-drift'
  | 'loom-vanguard'
  | 'signal-reverie'
  | 'protocol-enforcer';

export type ExpressionId = 'calm' | 'joy' | 'surprise';

export type BackgroundId = 'midnight' | 'sunset' | 'matrix';

export type ReactionPreset = {
  id: string;
  label: string;
  description: string;
  pose: PoseId;
  expression: ExpressionId;
  background: BackgroundId;
};

