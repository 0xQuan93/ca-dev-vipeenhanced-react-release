import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const threeModulePath = path.resolve(
  __dirname,
  '../project89-reactor/node_modules/three/build/three.module.js',
);
const THREE = await import(pathToFileURL(threeModulePath));
const posesDir = path.resolve(__dirname, '../project89-reactor/src/poses');

const poseFiles = fs
  .readdirSync(posesDir)
  .filter((file) => file.endsWith('.json'));

poseFiles.forEach((file) => {
  const filePath = path.join(posesDir, file);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  if (!data.boneRotations) {
    console.log(`[skip] ${file} already converted`);
    return;
  }

  const vrmPose = {};
  for (const [boneName, rotation] of Object.entries(data.boneRotations)) {
    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(rotation.x ?? 0),
      THREE.MathUtils.degToRad(rotation.y ?? 0),
      THREE.MathUtils.degToRad(rotation.z ?? 0),
      'XYZ',
    );
    const quaternion = new THREE.Quaternion().setFromEuler(euler);
    vrmPose[boneName] = {
      rotation: [quaternion.x, quaternion.y, quaternion.z, quaternion.w],
    };
  }

  delete data.boneRotations;
  data.vrmPose = vrmPose;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`[convert] ${file}`);
});

