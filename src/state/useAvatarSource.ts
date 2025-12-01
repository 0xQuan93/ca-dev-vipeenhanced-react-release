import { create } from 'zustand';

export const DEFAULT_VRM_URL =
  'https://beta.project89.org/api/vrm/proxy?url=https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Ddownload%26id%3D1JmsLhn-9lA9JB9fMQ4tnO35htWMP11UW';

type AvatarSourceState = {
  currentUrl: string;
  sourceLabel: string;
  setRemoteUrl: (url: string, label?: string) => void;
  setFileSource: (file: File) => void;
  reset: () => void;
};

let objectUrlHandle: string | null = null;

const revokeObjectUrl = () => {
  if (objectUrlHandle) {
    URL.revokeObjectURL(objectUrlHandle);
    objectUrlHandle = null;
  }
};

export const useAvatarSource = create<AvatarSourceState>((set) => ({
  currentUrl: DEFAULT_VRM_URL,
  sourceLabel: 'Default HarmonVox',
  setRemoteUrl: (url, label = 'Remote VRM') => {
    revokeObjectUrl();
    set({
      currentUrl: url,
      sourceLabel: label,
    });
  },
  setFileSource: (file) => {
    revokeObjectUrl();
    objectUrlHandle = URL.createObjectURL(file);
    set({
      currentUrl: objectUrlHandle,
      sourceLabel: file.name || 'Local VRM',
    });
  },
  reset: () => {
    revokeObjectUrl();
    set({
      currentUrl: DEFAULT_VRM_URL,
      sourceLabel: 'Default HarmonVox',
    });
  },
}));

