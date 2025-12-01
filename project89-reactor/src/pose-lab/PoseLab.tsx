import { useEffect, useRef, useState } from 'react';
import './pose-lab.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { VRMLoaderPlugin, type VRM } from '@pixiv/three-vrm';
import { getMixamoAnimation } from './getMixamoAnimation';
import { poseFromClip } from './poseFromClip';
import { useAvatarSource } from '../state/useAvatarSource';
import type { PoseId } from '../types/reactions';
import type { VRMPose } from '@pixiv/three-vrm';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 1.4, 3);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(640, 640);

const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 1.2);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(0, 3, 2);
scene.add(dir);

const DEFAULT_SCENE_ROTATION = { y: 180 };

const mixamoSources = {
  crouch: new URL('../poses/fbx/Male Crouch Pose.fbx', import.meta.url).href,
  dance: new URL('../poses/fbx/Male Dance Pose.fbx', import.meta.url).href,
  dynamic: new URL('../poses/fbx/Male Dynamic Pose.fbx', import.meta.url).href,
  locomotion: new URL('../poses/fbx/Male Locomotion Pose.fbx', import.meta.url).href,
  sitting: new URL('../poses/fbx/Male Sitting Pose.fbx', import.meta.url).href,
  standing: new URL('../poses/fbx/Male Standing Pose.fbx', import.meta.url).href,
};

type BatchPoseConfig = {
  id: PoseId;
  label: string;
  source: string;
  fileName: string;
  sceneRotation?: { x?: number; y?: number; z?: number };
};

const batchConfigs: BatchPoseConfig[] = [
  { id: 'dawn-runner', label: 'Dawn Runner', source: mixamoSources.dynamic, fileName: 'Male Dynamic Pose.fbx', sceneRotation: { y: 180 } },
  { id: 'green-loom', label: 'Green Loom', source: mixamoSources.dance, fileName: 'Male Dance Pose.fbx', sceneRotation: { y: 180 } },
  { id: 'sunset-call', label: 'Sunset Call', source: mixamoSources.standing, fileName: 'Male Standing Pose.fbx', sceneRotation: { y: 180 } },
  { id: 'cipher-whisper', label: 'Cipher Whisper', source: mixamoSources.sitting, fileName: 'Male Sitting Pose.fbx', sceneRotation: { y: 180 } },
  { id: 'nebula-drift', label: 'Nebula Drift', source: mixamoSources.locomotion, fileName: 'Male Locomotion Pose.fbx', sceneRotation: { y: 180 } },
  { id: 'loom-vanguard', label: 'Loom Vanguard', source: mixamoSources.standing, fileName: 'Male Standing Pose.fbx', sceneRotation: { y: 180 } },
  { id: 'signal-reverie', label: 'Signal Reverie', source: mixamoSources.crouch, fileName: 'Male Crouch Pose.fbx', sceneRotation: { y: 180 } },
  { id: 'protocol-enforcer', label: 'Protocol Enforcer', source: mixamoSources.locomotion, fileName: 'Male Locomotion Pose.fbx', sceneRotation: { y: 180 } },
];

function PoseLab() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const [status, setStatus] = useState('Drop a VRM and Mixamo pose to begin');
  const avatarSourceUrl = useAvatarSource((state) => state.currentUrl);
  const avatarSourceLabel = useAvatarSource((state) => state.sourceLabel);
  const lastLoadedSource = useRef<string | null>(null);
  const [isBatchExporting, setIsBatchExporting] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(renderer.domElement);
  }, []);

  const loadVRM = async (file: File, options?: { syncSource?: boolean }) => {
    setStatus('Loading VRM…');
    const arrayBuffer = await file.arrayBuffer();
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    const gltf = await loader.parseAsync(arrayBuffer, '');
    const vrm = gltf.userData.vrm as VRM;
    vrmRef.current = vrm;
    scene.add(vrm.scene);
    if (options?.syncSource) {
      useAvatarSource.getState().setFileSource(file);
      lastLoadedSource.current = useAvatarSource.getState().currentUrl;
    }
    setStatus('VRM loaded. Now drop a Mixamo FBX/GLTF pose.');
    renderer.render(scene, camera);
  };

  useEffect(() => {
    if (!avatarSourceUrl) return;
    if (lastLoadedSource.current === avatarSourceUrl) return;
    let cancelled = false;
    const fetchAndLoad = async () => {
      try {
        setStatus(`Fetching avatar: ${avatarSourceLabel}`);
        const response = await fetch(avatarSourceUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch VRM (${response.status})`);
        }
        const blob = await response.blob();
        if (cancelled) return;
        const filename = `${avatarSourceLabel || 'remote-avatar'}.vrm`;
        const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
        await loadVRM(file);
        lastLoadedSource.current = avatarSourceUrl;
        setStatus('VRM loaded. Now drop a Mixamo FBX/GLTF pose.');
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to auto-load avatar source', error);
          setStatus('Could not auto-load assigned VRM. Load manually?');
        }
      }
    };
    fetchAndLoad();
    return () => {
      cancelled = true;
    };
  }, [avatarSourceUrl, avatarSourceLabel]);

  const retarget = async (file: File) => {
    if (!vrmRef.current) {
      setStatus('Load a VRM first.');
      return;
    }

    setStatus('Loading Mixamo pose…');
    try {
      await applyMixamoBuffer(await file.arrayBuffer(), file.name);
      setStatus('Pose applied. Click "Export Pose" to download JSON.');
    } catch (error) {
      console.error('Retarget error:', error);
      setStatus(`Retarget failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const loadMixamoFromBuffer = async (arrayBuffer: ArrayBuffer, fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    let mixamoRoot: THREE.Object3D;
    let animations: THREE.AnimationClip[] = [];

    if (ext === 'fbx') {
      const loader = new FBXLoader();
      const group = loader.parse(arrayBuffer, '');
      mixamoRoot = group;
      animations = group.animations;
    } else {
      const loader = new GLTFLoader();
      const gltf = await loader.parseAsync(arrayBuffer, '');
      mixamoRoot = gltf.scene || gltf;
      animations = gltf.animations;
    }

    return { mixamoRoot, animations };
  };

  const applyMixamoBuffer = async (arrayBuffer: ArrayBuffer, fileName: string) => {
    const vrm = vrmRef.current;
    if (!vrm) throw new Error('Load a VRM first.');

    const { mixamoRoot, animations } = await loadMixamoFromBuffer(arrayBuffer, fileName);

    const vrmClip = getMixamoAnimation(animations, mixamoRoot, vrm);
    if (!vrmClip) {
      throw new Error('Failed to convert Mixamo data for this VRM.');
    }

      const pose = poseFromClip(vrmClip);
    if (!pose || !Object.keys(pose).length) {
      throw new Error('Mixamo clip did not contain pose data.');
    }

    vrm.humanoid?.setNormalizedPose(pose);
    vrm.update(0);

      // Reframe Pose Lab camera so avatar stays centered per pose
      const box = new THREE.Box3().setFromObject(vrm.scene);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const height = size.y || 1;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const distance = (height * 1.2) / (2 * Math.tan(fov / 2));
      camera.position.set(center.x, center.y, center.z + distance);
      camera.lookAt(center);

    renderer.render(scene, camera);

    return pose;
  };

  const exportPose = () => {
    const vrm = vrmRef.current;
    if (!vrm) {
      setStatus('Load a VRM before exporting.');
      return;
    }
    vrm.update(0);
    const pose = vrm.humanoid?.getNormalizedPose?.();
    if (!pose) {
      setStatus('Failed to extract pose.');
      return;
    }
    const payload = {
      sceneRotation: { y: 180 },
      vrmPose: pose,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'pose.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const savePoseToDisk = async (poseId: PoseId, payload: { sceneRotation?: { x?: number; y?: number; z?: number }; vrmPose: VRMPose }) => {
    const response = await fetch('/__pose-export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ poseId, data: payload }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to save pose');
    }
  };

  const batchExport = async () => {
    if (!vrmRef.current) {
      setStatus('Load a VRM before running batch export.');
      return;
    }
    setIsBatchExporting(true);
    try {
      for (const config of batchConfigs) {
        setStatus(`Exporting ${config.label}…`);
        const response = await fetch(config.source);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${config.label} (${response.status})`);
        }
        const buffer = await response.arrayBuffer();
        const pose = await applyMixamoBuffer(buffer, config.fileName);
        await savePoseToDisk(config.id, {
          sceneRotation: config.sceneRotation ?? DEFAULT_SCENE_ROTATION,
          vrmPose: pose,
        });
      }
      setStatus('Batch export complete! Updated files in src/poses.');
    } catch (error) {
      console.error('Batch export failed', error);
      setStatus(`Batch export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsBatchExporting(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (file.name.toLowerCase().endsWith('.vrm')) {
      await loadVRM(file, { syncSource: true });
    } else if (/\.(fbx|gltf|glb)$/i.test(file.name)) {
      await retarget(file);
    } else {
      setStatus('Unsupported file type. Drop VRM or FBX/GLTF.');
    }
  };

  const runTest = async () => {
    try {
      setStatus('Running test: Fetching default VRM...');
      const vrmRes = await fetch('/vrm/HarmonVox_519.vrm');
      const vrmBlob = await vrmRes.blob();
      const vrmFile = new File([vrmBlob], 'HarmonVox_519.vrm');
      await loadVRM(vrmFile);

      setStatus('Running test: Fetching test pose...');
      const poseRes = await fetch('/test-pose.fbx');
      const poseBlob = await poseRes.blob();
      const poseFile = new File([poseBlob], 'test-pose.fbx');
      await retarget(poseFile);
    } catch (err) {
      console.error(err);
      setStatus('Test failed: ' + err);
    }
  };

  return (
    <div className="pose-lab" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <h1>Pose Lab</h1>
      <p>{status}</p>
      <div ref={canvasRef} className="pose-lab__canvas" />
      <div className="pose-lab__actions">
        <button type="button" onClick={runTest} style={{ background: '#ff00ff' }}>
          Run Diagnostics
        </button>
        <label className="pose-lab__button">
          Load VRM
          <input
            type="file"
            accept=".vrm"
            hidden
            onChange={(e) => e.target.files && loadVRM(e.target.files[0], { syncSource: true })}
          />
        </label>
        <label className="pose-lab__button">
          Load Mixamo Pose
          <input
            type="file"
            accept=".fbx,.gltf,.glb"
            hidden
            onChange={(e) => e.target.files && retarget(e.target.files[0])}
          />
        </label>
        <button type="button" onClick={exportPose}>
          Export Pose
        </button>
        <button type="button" onClick={batchExport} disabled={isBatchExporting}>
          {isBatchExporting ? 'Exporting…' : 'Batch Export Poses'}
        </button>
      </div>
    </div>
  );
}

export default PoseLab;

