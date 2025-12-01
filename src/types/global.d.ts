export {};

declare global {
  interface Project89ReactorBridge {
    setAvatarUrl: (url: string, label?: string) => void;
    setAvatarFile: (file: File) => void;
    resetAvatar: () => void;
  }

  interface Window {
    project89Reactor?: Project89ReactorBridge;
  }
}

