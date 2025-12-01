# Project 89 Reactor - Custom Scripts

**PROPRIETARY - Project 89 Internal Tools**

This directory contains custom Node.js scripts developed for the Project 89 Reaction Forge. These tools are used for pose processing and animation retargeting.

## Scripts Overview

### 1. `convertPoses.mjs`
**Purpose**: Converts legacy Euler-degree-based pose JSON files to native VRM quaternion format.

**Usage**:
```bash
node scripts/convertPoses.mjs
```

**What it does**:
- Reads pose JSON files with Euler angle rotations (degrees)
- Converts them to VRM-native quaternion format
- Outputs clean, production-ready pose files

**Note**: This script was used during initial development. All current poses are already in quaternion format.

---

### 2. `importMixamoPose.mjs`
**Purpose**: (DEPRECATED) Initial attempt to import Mixamo FBX/GLTF poses using Node.js.

**Status**: Abandoned in favor of browser-based Pose Lab tool.

**Why deprecated**: 
- Missing `VRMAnimationImporter` API in published packages
- Node.js environment limitations with Three.js loaders
- Browser-based solution proved more robust

**Replaced by**: `src/pose-lab/PoseLab.tsx` (in-browser pose retargeting tool)

---

### 3. `retargetMixamoPose.mjs`
**Purpose**: (DEPRECATED) Attempted to retarget Mixamo animations to VRM skeletons in Node.js.

**Status**: Abandoned in favor of browser-based Pose Lab tool.

**Why deprecated**:
- Complex Node.js polyfills required for Three.js
- Texture loading and WebGL context issues
- Browser environment provides native support

**Replaced by**: `src/pose-lab/PoseLab.tsx` (in-browser pose retargeting tool)

---

## Current Workflow

### For Adding New Poses:

1. **Use the Pose Lab** (browser-based):
   ```
   http://localhost:5175/?mode=pose-lab
   ```

2. **Upload your VRM avatar**

3. **Batch process Mixamo FBX files**:
   - Configure pose mappings in `src/pose-lab/PoseLab.tsx`
   - Upload Mixamo FBX files
   - Preview and adjust poses
   - Export as JSON to `src/poses/`

4. **Update pose registry**:
   - Add new pose IDs to `src/types/reactions.ts`
   - Import in `src/poses/index.ts`
   - Add reaction presets in `src/data/reactions.ts`

---

## Technical Details

### Pose File Format

All poses use the VRM-native quaternion format:

```json
{
  "sceneRotation": {
    "y": 180
  },
  "vrmPose": {
    "hips": {
      "rotation": [x, y, z, w]
    },
    "spine": {
      "rotation": [x, y, z, w]
    }
    // ... other bones
  }
}
```

**Important**: 
- Poses contain ONLY rotation data (no position/translation)
- `sceneRotation.y: 180` ensures avatars face the camera
- All rotations are quaternions [x, y, z, w]

---

## Development Notes

### Why Browser-Based Pose Lab?

1. **Native Three.js support**: No polyfills needed
2. **Real-time preview**: See poses instantly
3. **VRM compatibility**: Direct access to VRM humanoid API
4. **Batch processing**: Process multiple poses in one session
5. **Export automation**: Direct file system access via Vite middleware

### Retargeting Process

The Pose Lab uses:
- `three-stdlib`'s `SkeletonUtils.retarget()` for bone mapping
- Custom `VRMRigMapMixamo.ts` for Mixamo → VRM bone name mapping
- `poseFromClip.ts` to extract static poses from animation clips
- `getMixamoAnimation.ts` to convert Mixamo clips to VRM-compatible format

---

## Proprietary Assets

The following are proprietary to Project 89:

- All pose JSON files in `src/poses/`
- Mixamo FBX source files in `src/poses/fbx/`
- Custom VRM avatars in `public/vrm/`
- Pose Lab retargeting logic
- Reaction preset configurations

**Do not distribute or use outside of Project 89 without authorization.**

---

## Future Enhancements

Potential improvements for the pose pipeline:

1. **Facial expression support**: Add VRM expression presets
2. **Custom backgrounds**: Branded Project 89 backgrounds
3. **Logo overlays**: Watermarking system
4. **Animation support**: Multi-frame animations (not just static poses)
5. **Pose blending**: Smooth transitions between poses
6. **Hand pose library**: Detailed finger articulation presets

---

## Support

For questions or issues with these scripts, contact the Project 89 development team.

**Last Updated**: December 2025
**Version**: 1.0.0

