# Project 89 Reaction Forge

**A WebGL-powered VRM avatar reaction generator for Project 89**

![Project 89](https://img.shields.io/badge/Project-89-purple)
![React](https://img.shields.io/badge/React-18-blue)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## 🎭 Overview

The **Project 89 Reaction Forge** is a browser-based tool that allows Proxim8 agents to generate branded reaction images using their VRM avatars. Users can create custom poses, expressions, and backgrounds, then save and share their reactions on social media.

### Key Features

- ✨ **VRM Avatar Support**: Full VRoid/VRM 1.0 compatibility
- 🎨 **Custom Poses**: 8 unique Project 89-themed poses
- 🎭 **Expressions**: Multiple facial expressions (coming soon)
- 🖼️ **Branded Backgrounds**: Project 89 themed backgrounds (coming soon)
- 💾 **Export**: Save reactions as PNG images
- 🔗 **Portal Integration**: Seamless integration with beta.project89.org
- 🎯 **Fixed Camera**: Consistent framing with no drift
- 🔄 **Randomize**: Generate random reaction combinations

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern browser with WebGL support

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development URLs

- **Main App**: `http://localhost:5173/`
- **Pose Lab**: `http://localhost:5173/?mode=pose-lab`

---

## 📁 Project Structure

```
project89-reactor/
├── src/
│   ├── components/          # React components
│   │   ├── CanvasStage.tsx  # WebGL canvas renderer
│   │   └── ReactionPanel.tsx # Control panel UI
│   ├── three/               # Three.js managers
│   │   ├── sceneManager.ts  # Scene, camera, lights
│   │   ├── avatarManager.ts # VRM loading & posing
│   │   └── backgrounds.ts   # Background system
│   ├── state/               # Zustand stores
│   │   ├── useReactionStore.ts  # Reaction state
│   │   └── useAvatarSource.ts   # Avatar source management
│   ├── poses/               # Pose definitions (JSON)
│   │   ├── *.json           # VRM pose files (quaternions)
│   │   ├── fbx/             # Mixamo source files
│   │   └── index.ts         # Pose registry
│   ├── pose-lab/            # In-browser pose retargeting tool
│   │   ├── PoseLab.tsx      # Pose Lab UI
│   │   ├── getMixamoAnimation.ts
│   │   ├── poseFromClip.ts
│   │   └── VRMRigMapMixamo.ts
│   ├── data/                # Static data
│   │   └── reactions.ts     # Reaction presets
│   ├── types/               # TypeScript types
│   │   ├── reactions.ts     # Pose/Expression/Background types
│   │   └── global.d.ts      # Global type declarations
│   ├── bridge/              # External integration
│   │   └── avatarBridge.ts  # Portal communication bridge
│   ├── App.tsx              # Main app component
│   └── main.tsx             # App entry point
├── public/
│   └── vrm/                 # VRM avatar files
├── scripts/                 # Custom Node.js scripts
│   ├── convertPoses.mjs     # Pose format converter
│   ├── importMixamoPose.mjs # (Deprecated)
│   ├── retargetMixamoPose.mjs # (Deprecated)
│   └── README.md            # Scripts documentation
├── dist/                    # Production build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎨 Current Poses

All poses are Project 89-themed and optimized for avatar presentation:

1. **Dawn Runner** - Dynamic sprint pose for reconnaissance briefs
2. **Green Loom** - Celebratory dance for timeline victories
3. **Sunset Call** - Relaxed sitting for casual intel drops
4. **Cipher Whisper** - Meditative cross-legged for encrypted comms
5. **Nebula Drift** - Contemplative standing for deep analysis
6. **Loom Vanguard** - Heroic stance for mission declarations
7. **Signal Reverie** - Thoughtful pose for signal interpretation
8. **Protocol Enforcer** - Authoritative crouch for enforcement ops

---

## 🛠️ Technical Architecture

### Core Technologies

- **React 18**: UI framework
- **TypeScript 5**: Type-safe development
- **Three.js**: 3D rendering engine
- **@pixiv/three-vrm**: VRM model support
- **Zustand**: Lightweight state management
- **Vite**: Fast build tool and dev server

### Key Systems

#### 1. Scene Management (`sceneManager.ts`)
- Fixed camera positioning (no drift)
- Directional + ambient lighting
- OrbitControls for user interaction
- Render loop management

#### 2. Avatar Management (`avatarManager.ts`)
- VRM loading via GLTFLoader
- Pose application using VRM Humanoid API
- Scene rotation for camera-facing
- Expression system (ready for implementation)

#### 3. Pose System
- **Format**: VRM-native quaternions (rotation-only)
- **Storage**: JSON files in `src/poses/`
- **Application**: Via `VRMHumanoid.setNormalizedPose()`
- **Retargeting**: In-browser Pose Lab tool

#### 4. Portal Integration
- Global `window.project89Reactor` bridge
- Avatar source management via Zustand
- Supports both URL and File sources

---

## 🎯 Adding New Poses

### Using the Pose Lab

1. **Start the Pose Lab**:
   ```
   http://localhost:5173/?mode=pose-lab
   ```

2. **Upload your VRM avatar**

3. **Configure batch poses** in `src/pose-lab/PoseLab.tsx`:
   ```typescript
   const batchConfigs: BatchPoseConfig[] = [
     {
       id: 'my-new-pose',
       label: 'My New Pose',
       source: mixamoSources.dynamic,
       fileName: 'My Mixamo Pose.fbx',
       sceneRotation: { y: 180 }
     }
   ];
   ```

4. **Upload Mixamo FBX file** and click "Apply & Preview"

5. **Export pose** - saves to `src/poses/my-new-pose.json`

6. **Register the pose**:
   - Add to `PoseId` type in `src/types/reactions.ts`
   - Import in `src/poses/index.ts`
   - Add reaction preset in `src/data/reactions.ts`

---

## 🔧 Configuration

### Camera Settings

Fixed camera for consistent framing (no drift):

```typescript
// In sceneManager.ts
camera.position.set(0, 1.4, 2.3);
controls.target.set(0, 1.4, 0);
```

### Pose Format

All poses use rotation-only data:

```json
{
  "sceneRotation": {
    "y": 180  // Face camera
  },
  "vrmPose": {
    "hips": {
      "rotation": [x, y, z, w]  // Quaternion
    }
    // ... other bones (rotation only, no position)
  }
}
```

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` folder ready for deployment

### Environment Variables

Create `.env` for custom configuration:

```env
VITE_DEFAULT_AVATAR_URL=https://your-cdn.com/avatar.vrm
VITE_API_ENDPOINT=https://api.project89.org
```

---

## 🔐 Proprietary Assets

The following are proprietary to Project 89:

- ✅ All pose JSON files (`src/poses/*.json`)
- ✅ Mixamo FBX source files (`src/poses/fbx/`)
- ✅ Custom VRM avatars (`public/vrm/`)
- ✅ Pose Lab retargeting logic
- ✅ Reaction preset configurations
- ✅ Project 89 branding and themes

**Do not distribute or use outside of Project 89 without authorization.**

---

## 🐛 Known Issues

- ⚠️ VRMUtils deprecation warning (cosmetic, no impact)
- ⚠️ Expressions not yet implemented (coming soon)
- ⚠️ Backgrounds not yet implemented (coming soon)

---

## 🗺️ Roadmap

### Phase 1: Core Functionality ✅
- [x] VRM avatar loading
- [x] Pose system with 8 poses
- [x] Fixed camera (no drift)
- [x] Randomize functionality
- [x] PNG export
- [x] Pose Lab tool

### Phase 2: Branding & Polish (Current)
- [ ] Custom Project 89 backgrounds
- [ ] Logo overlays and watermarking
- [ ] Facial expressions
- [ ] UI/UX polish

### Phase 3: Portal Integration
- [ ] Wallet-gated avatar fetching
- [ ] Social sharing integration
- [ ] Reaction history/gallery
- [ ] Community reaction feed

### Phase 4: Advanced Features
- [ ] Animation support (not just static poses)
- [ ] Pose blending and transitions
- [ ] Custom hand poses
- [ ] Video export (animated reactions)

---

## 📚 Documentation

- **Scripts**: See `scripts/README.md` for custom tooling
- **Poses**: See `src/poses/README.md` for pose format details
- **API**: TypeScript types provide inline documentation

---

## 🤝 Contributing

This is a proprietary Project 89 tool. For internal development:

1. Create a feature branch
2. Make changes with clear commit messages
3. Test thoroughly (especially pose anchoring)
4. Submit for review

---

## 📄 License

**Proprietary - Project 89**

All rights reserved. This software and associated assets are the property of Project 89 and may not be used, copied, or distributed without explicit authorization.

---

## 🆘 Support

For questions or issues:
- Internal Project 89 development team
- Check `scripts/README.md` for tooling help
- Review console logs for debugging

---

**Built with 💜 for Project 89**

*Weaving the optimal timeline, one reaction at a time.*
