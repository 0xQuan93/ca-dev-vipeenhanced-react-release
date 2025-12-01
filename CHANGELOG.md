# Changelog

All notable changes to the Project 89 Reaction Forge will be documented in this file.

## [1.0.0] - 2025-12-01

### 🎉 Initial Release

#### ✨ Features
- **VRM Avatar Support**: Full VRoid/VRM 1.0 compatibility with `@pixiv/three-vrm`
- **8 Custom Poses**: Project 89-themed poses retargeted from Mixamo
  - Dawn Runner, Green Loom, Sunset Call, Cipher Whisper
  - Nebula Drift, Loom Vanguard, Signal Reverie, Protocol Enforcer
- **Fixed Camera System**: Consistent framing with zero drift
- **Randomize Function**: Generate random reaction combinations
- **PNG Export**: Save reactions as images
- **Pose Lab Tool**: In-browser Mixamo → VRM pose retargeting
- **Portal Bridge**: Integration API for beta.project89.org

#### 🏗️ Architecture
- React 18 + TypeScript 5
- Three.js WebGL rendering
- Zustand state management
- Vite build system
- Custom VRM pose pipeline

#### 🛠️ Technical Highlights
- **Rotation-Only Poses**: Pure quaternion data, no position drift
- **Scene Rotation System**: Automatic camera-facing orientation
- **VRM Humanoid API**: Native pose application via `setNormalizedPose()`
- **Custom Retargeting**: Mixamo → VRM bone mapping system
- **Batch Processing**: Multi-pose export workflow

#### 📁 Project Structure
- Organized component architecture
- Centralized state management
- Modular Three.js managers
- Documented custom scripts
- Proprietary asset protection

#### 🔐 Security
- `.gitignore` configured for proprietary assets
- Mixamo FBX files excluded from version control
- Custom scripts documented and organized

### 🐛 Bug Fixes
- Fixed avatar drift issue by removing position data from poses
- Fixed pose not changing visually by adding `vrm.update(0)` call
- Fixed inconsistent facing direction with scene rotation system
- Fixed camera framing drift by switching to fixed camera position

### 📚 Documentation
- Comprehensive README with quick start guide
- Scripts documentation in `scripts/README.md`
- Pose format documentation in `src/poses/README.md`
- Inline TypeScript documentation
- Architecture diagrams and technical details

### 🚀 Deployment
- Production build optimized
- Asset bundling configured
- Development and production environments
- Pose Lab accessible via query parameter

---

## [Unreleased]

### 🗺️ Planned Features
- Custom Project 89 backgrounds
- Logo overlays and watermarking
- Facial expression system
- UI/UX polish and branding
- Wallet-gated avatar fetching
- Social sharing integration
- Reaction history/gallery
- Animation support (multi-frame)
- Pose blending and transitions
- Custom hand pose library
- Video export capability

---

## Version History

- **1.0.0** (2025-12-01): Initial production release
- **0.1.0** (2025-11-30): Development prototype with basic pose system
- **0.0.1** (2025-11-29): Project scaffolding and architecture setup

---

**Maintained by**: Project 89 Development Team  
**License**: Proprietary

