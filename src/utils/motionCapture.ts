import { Holistic, type Results } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import * as Kalidokit from 'kalidokit';
import * as THREE from 'three';

interface FaceRig {
    head?: { x: number, y: number, z: number, w: number };
    eye?: { l: number, r: number };
    brow?: number;
    mouth?: {
        shape: { A: number, E: number, I: number, O: number, U: number };
        open: number;
    };
}

interface PoseRig {
    [key: string]: { 
        rotation?: { x: number, y: number, z: number, w?: number }; 
        position?: { x: number, y: number, z: number }; 
    } | undefined;
}

interface RecordedFrame {
    time: number;
    bones: Record<string, { rotation: THREE.Quaternion, position?: THREE.Vector3 }>;
}

export class MotionCaptureManager {
  private holistic: Holistic;
  private camera?: Camera;
  private vrm?: VRM;
  private videoElement: HTMLVideoElement;
  private isTracking = false;
  
  // Recording State
  private isRecording = false;
  private recordedFrames: RecordedFrame[] = [];
  private recordingStartTime = 0;

  // Calibration State
  private calibrationOffsets: Record<string, THREE.Quaternion> = {};

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    
    this.holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      }
    });

    this.holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
      refineFaceLandmarks: true
    });

    this.holistic.onResults(this.handleResults);
  }

  setVRM(vrm: VRM) {
    this.vrm = vrm;
  }

  async start() {
    if (this.isTracking) return;
    
    try {
        this.camera = new Camera(this.videoElement, {
            onFrame: async () => {
                await this.holistic.send({ image: this.videoElement });
            },
            width: 640,
            height: 480
        });

        await this.camera.start();
        this.isTracking = true;
    } catch (e) {
        console.error('Failed to start camera:', e);
        throw e;
    }
  }

  stop() {
    if (this.camera) {
        const stream = this.videoElement.srcObject as MediaStream;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        this.camera = undefined;
    }
    this.isTracking = false;
  }

  startRecording() {
    this.isRecording = true;
    this.recordedFrames = [];
    this.recordingStartTime = performance.now();
    console.log('[MotionCaptureManager] Started recording');
  }

  stopRecording(): THREE.AnimationClip | null {
    this.isRecording = false;
    console.log('[MotionCaptureManager] Stopped recording. Frames:', this.recordedFrames.length);
    if (this.recordedFrames.length === 0) return null;
    return this.createAnimationClip();
  }

  private createAnimationClip(): THREE.AnimationClip {
      const tracks: THREE.KeyframeTrack[] = [];
      const duration = this.recordedFrames[this.recordedFrames.length - 1].time;
      
      // Group data by bone
      const boneTracks: Record<string, { times: number[], values: number[], type: 'quaternion' | 'vector' }> = {};

      this.recordedFrames.forEach(frame => {
          Object.entries(frame.bones).forEach(([boneName, data]) => {
             // Rotation
             if (!boneTracks[`${boneName}.quaternion`]) {
                 boneTracks[`${boneName}.quaternion`] = { times: [], values: [], type: 'quaternion' };
             }
             boneTracks[`${boneName}.quaternion`].times.push(frame.time);
             boneTracks[`${boneName}.quaternion`].values.push(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);

             // Position (Hips only usually)
             if (data.position) {
                 if (!boneTracks[`${boneName}.position`]) {
                     boneTracks[`${boneName}.position`] = { times: [], values: [], type: 'vector' };
                 }
                 boneTracks[`${boneName}.position`].times.push(frame.time);
                 boneTracks[`${boneName}.position`].values.push(data.position.x, data.position.y, data.position.z);
             }
          });
      });

      // Create tracks
      Object.entries(boneTracks).forEach(([name, data]) => {
          if (data.type === 'quaternion') {
              tracks.push(new THREE.QuaternionKeyframeTrack(name, data.times, data.values));
          } else {
              tracks.push(new THREE.VectorKeyframeTrack(name, data.times, data.values));
          }
      });

      return new THREE.AnimationClip(`Mocap_Take_${Date.now()}`, duration, tracks);
  }

  private handleResults = (results: Results) => {
    if (!this.vrm) return;

    // 1. Capture Frame (if recording)
    // We do this regardless of tracking status to ensure we capture the avatar's state (even if static/T-pose)
    // and to prevent "No motion data" errors if tracking is intermittent.
    if (this.isRecording) {
        this.captureFrame();
    }
    
    // 2. Check for Landmarks
    if (!results.poseLandmarks && !results.faceLandmarks) return;
    
    if (this.onLandmarks) {
        this.onLandmarks(results.poseLandmarks);
    }

    // 3. Solve Pose using Kalidokit
    // NOTE: Kalidokit expects poseWorldLandmarks but MediaPipe Holistic output calls it ea (in minified form) 
    // or sometimes it's missing. We can try using poseLandmarks for both if world is missing, 
    // but world landmarks are better for 3D rotation.
    // The @mediapipe/holistic types might differ slightly from actual runtime object or Kalidokit expectation.
    // We cast to any to bypass strict type checking on the results object for now.
    const poseWorldLandmarks = (results as any).poseWorldLandmarks || (results as any).ea;
    
    // Safety check for landmarks array to prevent "Cannot read properties of undefined (reading '23')"
    if (results.poseLandmarks && results.poseLandmarks.length >= 33) {
        try {
            const poseRig = Kalidokit.Pose.solve(results.poseLandmarks, poseWorldLandmarks, {
                runtime: 'mediapipe',
                video: this.videoElement
            });
            if (poseRig) {
                this.applyPoseRig(poseRig);
            }
        } catch (error) {
            console.warn("[MotionCapture] Pose solver error:", error);
        }
    }

    // Solve Face using Kalidokit
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        try {
            const faceRig = Kalidokit.Face.solve(results.faceLandmarks, {
                runtime: 'mediapipe',
                video: this.videoElement
            });
            if (faceRig) {
                this.applyFaceRig(faceRig);
            }
        } catch (error) {
            console.warn("[MotionCapture] Face solver error:", error);
        }
    }
  };

  calibrate() {
    if (!this.vrm?.humanoid) return;
    console.log('[MotionCaptureManager] Calibrating T-Pose...');
    
    // Clear previous offsets
    this.calibrationOffsets = {};
    
    // We capture the current rotation of bones AS APPLIED by the rig currently
    // Actually, we need to capture the *incoming* rig data, not the bone's current rotation (which might be mixed/slerped).
    // But since we don't store the raw rig data persistently, we can't easily snap it here unless we are in the loop.
    
    // Alternative: We set a flag to calibrate on next frame
    this.shouldCalibrateNextFrame = true;
  }
  
  private shouldCalibrateNextFrame = false;

  private applyPoseRig(rig: any) {
    if (!this.vrm?.humanoid) return;

    // Helper to get bone name
    const getVRMBoneName = (key: string): string => {
        if (key === 'Hips') return 'hips';
        return key.charAt(0).toLowerCase() + key.slice(1);
    };

    // Calibration Step: Capture offsets if requested
    if (this.shouldCalibrateNextFrame) {
        const rigKeys = Object.keys(rig);
        rigKeys.forEach(key => {
            const boneData = rig[key];
            if (boneData?.rotation) {
                const q = new THREE.Quaternion(boneData.rotation.x, boneData.rotation.y, boneData.rotation.z, boneData.rotation.w);
                this.calibrationOffsets[key] = q.clone();
            }
        });
        console.log('[MotionCaptureManager] Calibration complete. Offsets:', Object.keys(this.calibrationOffsets).length);
        this.shouldCalibrateNextFrame = false;
    }

    const rotateBone = (key: string, rotation: { x: number, y: number, z: number, w?: number }) => {
        const boneName = getVRMBoneName(key);
        // @ts-ignore
        const node = this.vrm!.humanoid!.getNormalizedBoneNode(boneName);
        if (node) {
            if (rotation.w !== undefined) {
                // Create target quaternion from rig
                const targetQ = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
                
                // Apply Calibration Offset: Target = Measured * Inverse(Calibration)
                if (this.calibrationOffsets[key]) {
                    const invCalibration = this.calibrationOffsets[key].clone().invert();
                    targetQ.multiply(invCalibration);
                }
                
                // Slerp for smooth transition
                node.quaternion.slerp(targetQ, 0.3);
            }
        }
    };

    const rigKeys = Object.keys(rig);
    
    rigKeys.forEach(key => {
        const boneData = rig[key];
        if (key === 'Hips') {
            rotateBone('Hips', boneData.rotation!);
            
            // Apply Hips Position (Scaled down a bit to fit VRM world scale)
            const node = this.vrm!.humanoid!.getNormalizedBoneNode('hips');
            if (boneData.position && node) {
                 // ... position logic ...
            }
        } else {
            if (boneData.rotation) {
                rotateBone(key, boneData.rotation);
            }
        }
    });
    
    this.vrm.humanoid.update();
  }

  private captureFrame() {
      if (!this.vrm?.humanoid) return;

      const time = (performance.now() - this.recordingStartTime) / 1000;
      const bones: Record<string, { rotation: THREE.Quaternion, position?: THREE.Vector3 }> = {};
      
      const boneNames = Object.values(VRMHumanBoneName);
      
      boneNames.forEach((boneName) => {
          const node = this.vrm!.humanoid!.getNormalizedBoneNode(boneName);
          if (node) {
              bones[boneName] = {
                  rotation: node.quaternion.clone()
              };
              if (boneName === 'hips') {
                  bones[boneName].position = node.position.clone();
              }
          }
      });

      this.recordedFrames.push({ time, bones });
  }

  private applyFaceRig(rig: any) {
      if (!this.vrm?.expressionManager) return;

      // 1. Head Rotation
      if (rig.head) {
          const headBone = this.vrm.humanoid?.getNormalizedBoneNode('head');
          if (headBone) {
              const q = rig.head;
              // Mix head rotation from pose and face for stability?
              // Face mesh is usually more accurate for head orientation
              headBone.quaternion.slerp(new THREE.Quaternion(q.x, q.y, q.z, q.w), 0.5);
          }
      }

      // 2. Expressions / Blendshapes
      // Kalidokit Face outputs: eye: {l, r}, mouth: {shape: {A, E, I, O, U}, open}
      
      const em = this.vrm.expressionManager;

      // Blinking
      if (rig.eye) {
          const blinkL = 1 - rig.eye.l;
          const blinkR = 1 - rig.eye.r;
          em.setValue('BlinkLeft', blinkL);
          em.setValue('BlinkRight', blinkR);
          // Fallback for simple Blink
          if (blinkL > 0.5 && blinkR > 0.5) {
              em.setValue('Blink', (blinkL + blinkR) / 2);
          } else {
              em.setValue('Blink', 0);
          }
      }

      // Mouth
      if (rig.mouth) {
          const shape = rig.mouth.shape; // { A: 0-1, E: 0-1 ... }
          em.setValue('Aa', shape.A);
          em.setValue('Ee', shape.E);
          em.setValue('Ih', shape.I);
          em.setValue('Oh', shape.O);
          em.setValue('Ou', shape.U);
      }
      
      // Simple Emotion Mapping
      // Brow raise -> Surprise? 
      if (rig.brow) {
          // If brows are high, maybe surprise
          // Not strictly standard in Kalidokit Face rig output structure directly like this?
          // Kalidokit Face solver output structure:
          // { eye: {l, r}, mouth: {shape, open}, head: {x,y,z,w}, brow: 0-1, pupil: {x,y} }
      }

      em.update();
  }
}
