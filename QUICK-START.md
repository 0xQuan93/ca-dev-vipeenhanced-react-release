# Project 89 Reaction Forge - Quick Start

**Version 1.0.0** | **Status: Production Ready** ✅

---

## ⚡ Quick Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run dev -- --host # Start with network access

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Quality
npm run lint         # Check code quality
```

---

## 🎯 Key URLs

- **Main App**: `http://localhost:5173/`
- **Pose Lab**: `http://localhost:5173/?mode=pose-lab`

---

## 📂 Important Files

### Configuration
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript settings
- `.gitignore` - Proprietary asset protection

### Documentation
- `README.md` - Full documentation
- `CHANGELOG.md` - Version history
- `CLEANUP-SUMMARY.md` - Cleanup details
- `scripts/README.md` - Tooling guide

### Core Code
- `src/App.tsx` - Main application
- `src/main.tsx` - Entry point
- `src/three/avatarManager.ts` - VRM handling
- `src/three/sceneManager.ts` - 3D scene
- `src/poses/index.ts` - Pose registry

---

## 🎨 Adding Content

### New Pose
1. Open Pose Lab: `http://localhost:5173/?mode=pose-lab`
2. Upload VRM avatar
3. Upload Mixamo FBX
4. Export JSON to `src/poses/`
5. Update `src/types/reactions.ts` (add PoseId)
6. Import in `src/poses/index.ts`
7. Add preset in `src/data/reactions.ts`

### New Background
1. Edit `src/three/backgrounds.ts`
2. Add to `BackgroundId` in `src/types/reactions.ts`
3. Update `src/data/reactions.ts`

### New Expression
1. Implement in `src/three/avatarManager.ts`
2. Add to `ExpressionId` in `src/types/reactions.ts`
3. Update `src/data/reactions.ts`

---

## 🔧 Troubleshooting

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Poses Not Changing
1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache
3. Check console for errors
4. Verify pose JSON format

### Avatar Not Loading
1. Check VRM file path in `public/vrm/`
2. Verify VRM 1.0 format
3. Check browser console for errors
4. Test with default avatar first

---

## 📦 Deployment

### Build
```bash
npm run build
```

### Output
- Location: `dist/` folder
- Entry: `dist/index.html`
- Assets: `dist/assets/`

### Deploy
1. Upload entire `dist/` folder to web server
2. Configure server for SPA routing
3. Set environment variables if needed
4. Test in production environment

---

## 🔐 Security Notes

### Protected Assets (in .gitignore)
- `src/poses/fbx/*.fbx` - Mixamo source files
- `src/poses/fbx/*.json` - Mixamo metadata
- `*-backup-*/` - Backup folders
- `*.zip`, `*.rar` - Archives

### Optional Protection
- Uncomment `public/vrm/*.vrm` in `.gitignore` to protect custom avatars

---

## 🐛 Known Issues

- VRMUtils deprecation warning (cosmetic only)
- Large bundle size warning (expected for 3D app)

---

## 📞 Support

- **Documentation**: `README.md`
- **Scripts**: `scripts/README.md`
- **Cleanup**: `CLEANUP-SUMMARY.md`
- **Changes**: `CHANGELOG.md`

---

## 🎯 Next Phase: Branding & Polish

- [ ] Custom Project 89 backgrounds
- [ ] Logo overlays and watermarking
- [ ] Facial expression system
- [ ] UI/UX improvements

---

**Built with 💜 for Project 89**

*Last Updated: December 1, 2025*

