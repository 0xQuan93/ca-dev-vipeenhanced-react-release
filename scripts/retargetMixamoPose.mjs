import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../project89-reactor');
const modulePath = (rel) => pathToFileURL(path.resolve(projectRoot, 'node_modules', rel)).href;

const THREE = await import(modulePath('three/build/three.module.js'));
const { GLTFLoader } = await import(modulePath('three/examples/jsm/loaders/GLTFLoader.js'));
const { FBXLoader } = await import(modulePath('three/examples/jsm/loaders/FBXLoader.js'));
const { SkeletonUtils } = await import(modulePath('three/examples/jsm/utils/SkeletonUtils.js'));
const { VRMLoaderPlugin } = await import(modulePath('@pixiv/three-vrm/lib/three-vrm.module.js'));

globalThis.window = globalThis.window || { devicePixelRatio: 1 };
globalThis.document = globalThis.document || {
  createElement: () => ({
    getContext: () => ({}),
  }),
};
globalThis.self = globalThis.self || globalThis.window;

const toArrayBuffer = (buffer) => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node scripts/retargetMixamoPose.mjs <path/to/avatar.vrm> <path/to/mixamo.(fbx|gltf|glb)> <pose-name>');
  process.exit(1);
}

const [vrmPath, mixamoPath, poseName] = args;
const outputPath = path.resolve(__dirname, `../project89-reactor/src/poses/${poseName}.json`);

const loadVRM = async () => {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const arrayBuffer = toArrayBuffer(await fs.promises.readFile(vrmPath));
  const gltf = await loader.parseAsync(arrayBuffer, path.dirname(vrmPath) + path.sep);
  const vrm = gltf.userData.vrm;
  return vrm;
};

const loadMixamo = async () => {
  const ext = path.extname(mixamoPath).toLowerCase();
  if (ext === '.fbx') {
    const loader = new FBXLoader();
    const arrayBuffer = toArrayBuffer(await fs.promises.readFile(mixamoPath));
    return loader.parse(arrayBuffer, path.dirname(mixamoPath) + path.sep);
  }
  const loader = new GLTFLoader();
  const arrayBuffer = toArrayBuffer(await fs.promises.readFile(mixamoPath));
  const gltf = await loader.parseAsync(arrayBuffer, path.dirname(mixamoPath) + path.sep);
  return gltf.scene || gltf;
};

const mixamoToHumanoidMap = {
  hips: 'mixamorig:Hips',
  spine: 'mixamorig:Spine',
  chest: 'mixamorig:Spine1',
  upperChest: 'mixamorig:Spine2',
  neck: 'mixamorig:Neck',
  head: 'mixamorig:Head',
  leftShoulder: 'mixamorig:LeftShoulder',
  leftUpperArm: 'mixamorig:LeftArm',
  leftLowerArm: 'mixamorig:LeftForeArm',
  leftHand: 'mixamorig:LeftHand',
  rightShoulder: 'mixamorig:RightShoulder',
  rightUpperArm: 'mixamorig:RightArm',
  rightLowerArm: 'mixamorig:RightForeArm',
  rightHand: 'mixamorig:RightHand',
  leftUpperLeg: 'mixamorig:LeftUpLeg',
  leftLowerLeg: 'mixamorig:LeftLeg',
  leftFoot: 'mixamorig:LeftFoot',
  leftToes: 'mixamorig:LeftToeBase',
  rightUpperLeg: 'mixamorig:RightUpLeg',
  rightLowerLeg: 'mixamorig:RightLeg',
  rightFoot: 'mixamorig:RightFoot',
  rightToes: 'mixamorig:RightToeBase',
};

const buildNameMap = (vrm) => {
  const names = {};
  Object.values(vrm.humanoid.humanBones).forEach((bone) => {
    const vrmName = bone.node?.name;
    const humanoidName = bone.bone;
    if (!vrmName || !humanoidName) return;
    const mixamoName = mixamoToHumanoidMap[humanoidName];
    if (mixamoName) {
      names[vrmName] = mixamoName;
    }
  });
  return names;
};

const exportPose = (vrm) => {
  vrm.update(0);
  const pose = vrm.humanoid?.getNormalizedPose?.();
  if (!pose) throw new Error('Failed to extract pose');
  const payload = {
    sceneRotation: { y: 180 },
    vrmPose: pose,
  };
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  console.log(`Pose saved to ${outputPath}`);
};

const main = async () => {
  const vrm = await loadVRM();
  const mixamo = await loadMixamo();

  const vrmRoot = vrm.scene;
  const mixamoRoot = mixamo;

  const options = {
    hip: mixamoToHumanoidMap.hips,
    names: buildNameMap(vrm),
    useTargetMatrix: true,
    preserveMatrix: false,
  };

  SkeletonUtils.retarget(vrmRoot, mixamoRoot, options);
  exportPose(vrm);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

