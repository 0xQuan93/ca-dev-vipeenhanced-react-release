## Pose Assets

### JSON (ready for runtime)
All `*.json` files follow the `PoseDefinition` structure and include a `vrmPose` map so they can be applied directly at runtime.

### FBX source poses
The `fbx/` folder stores the raw Mixamo exports you uploaded:

- `Male Crouch Pose.fbx`
- `Male Dance Pose.fbx`
- `Male Dynamic Pose.fbx`
- `Male Locomotion Pose.fbx`
- `Male Sitting Pose.fbx`
- `Male Standing Pose.fbx`

These are reference/source files only. When you convert one to a VRMPose (e.g. via Blender or a script), drop the resulting JSON next to this README and update `src/poses/index.ts` to register it.

