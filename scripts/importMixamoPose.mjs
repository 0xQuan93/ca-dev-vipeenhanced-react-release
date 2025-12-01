import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node scripts/importMixamoPose.mjs <path/to/avatar.vrm> <path/to/mixamo.(fbx|gltf|glb)> <pose-name>');
  process.exit(1);
}

const [vrmPath, mixamoPath, poseName] = args;
const outputPath = path.resolve(__dirname, `../project89-reactor/src/poses/${poseName}.json`);

const projectRoot = path.resolve(__dirname, '../project89-reactor');
const modulePath = (rel) => pathToFileURL(path.resolve(projectRoot, 'node_modules', rel)).href;

const THREE = await import(modulePath('three/build/three.module.js'));

// Minimal DOM shims required by loaders
globalThis.window = globalThis.window || { devicePixelRatio: 1 };
globalThis.document = globalThis.document || {
  createElement: () => ({
    getContext: () => ({ }),
  }),
};
globalThis.self = globalThis.self || globalThis.window;
const { GLTFLoader } = await import(modulePath('three/examples/jsm/loaders/GLTFLoader.js'));
const { FBXLoader } = await import(modulePath('three/examples/jsm/loaders/FBXLoader.js'));
const { VRM, VRMLoaderPlugin } = await import(modulePath('@pixiv/three-vrm/lib/three-vrm.module.js'));
const { VRMAnimationImporter } = await import(modulePath('@pixiv/three-vrm-animation/lib/three-vrm-animation.module.js'));

const manager = new THREE.LoadingManager();

const fbxLoader = new FBXLoader(manager);
const gltfLoader = new GLTFLoader(manager);

const toArrayBuffer = (buffer) =>
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const loadVRM = async () => {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const data = await fs.promises.readFile(vrmPath);
  const gltf = await loader.parseAsync(toArrayBuffer(data), path.dirname(vrmPath) + path.sep);
  const vrm = gltf.userData.vrm;
  const scene = new THREE.Scene();
  scene.add(vrm.scene);
  return vrm;
};

const loadMixamo = async () => {
  const ext = path.extname(mixamoPath).toLowerCase();
  if (ext === '.fbx') {
    const data = await fs.promises.readFile(mixamoPath);
    return fbxLoader.parse(toArrayBuffer(data), path.dirname(mixamoPath) + path.sep);
  }
  const data = await fs.promises.readFile(mixamoPath);
  const gltf = await gltfLoader.parseAsync(toArrayBuffer(data), path.dirname(mixamoPath) + path.sep);
  return gltf.scene || gltf;
};

const exportPose = (vrm) => {
  vrm.update(0);
  const pose = vrm.humanoid?.getNormalizedPose?.();
  if (!pose) throw new Error('VRM pose extraction failed');
  const payload = {
    sceneRotation: { y: 180 },
    vrmPose: pose,
  };
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
  console.log(`Pose saved to ${outputPath}`);
};

const main = async () => {
  const vrm = await loadVRM();
  const mixamoScene = await loadMixamo();

  const importer = new VRMAnimationImporter();
  const clip = await importer.import(mixamoScene);

  // Force single-frame sample at t=0
  clip.tracks.forEach((track) => {
    track.times = Float32Array.from([0]);
  });

  const mixer = new THREE.AnimationMixer(vrm.scene);
  mixer.clipAction(clip).play();
  mixer.update(0);

  exportPose(vrm);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

