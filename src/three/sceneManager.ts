import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { applyBackground } from './backgrounds';
import type { BackgroundId } from '../types/reactions';

type TickHandler = (delta: number) => void;

class SceneManager {
  private renderer?: THREE.WebGLRenderer;
  private camera?: THREE.PerspectiveCamera;
  private scene?: THREE.Scene;
  private controls?: OrbitControls;
  private animationFrameId?: number;
  private readonly tickHandlers = new Set<TickHandler>();
  private readonly clock = new THREE.Clock();
  private canvas?: HTMLCanvasElement;
  private readonly box = new THREE.Box3();
  private readonly size = new THREE.Vector3();
  private readonly center = new THREE.Vector3();

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    this.camera.position.set(0, 1.4, 2.3);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // required for downloads
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const hemisphere = new THREE.HemisphereLight(0xffffff, 0x080820, 1.2);
    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(0, 4, 2);
    this.scene.add(hemisphere);
    this.scene.add(directional);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1.4, 0);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 3;

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
    this.startLoop();

    applyBackground(this.scene, 'midnight');
  }

  private startLoop() {
    const loop = () => {
      const delta = this.clock.getDelta();
      this.controls?.update();
      this.tickHandlers.forEach((handler) => handler(delta));
      this.renderer?.render(this.scene!, this.camera!);
      this.animationFrameId = window.requestAnimationFrame(loop);
    };
    this.animationFrameId = window.requestAnimationFrame(loop);
  }

  private handleResize() {
    if (!this.renderer || !this.camera || !this.canvas) return;
    const { clientWidth, clientHeight } = this.canvas;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  }

  registerTick(handler: TickHandler) {
    this.tickHandlers.add(handler);
    return () => this.tickHandlers.delete(handler);
  }

  getScene() {
    return this.scene;
  }

  frameObject(object: THREE.Object3D, padding = 1.2) {
    if (!this.camera || !this.controls) return;
    this.box.setFromObject(object);
    if (!isFinite(this.box.min.lengthSq()) || !isFinite(this.box.max.lengthSq())) return;

    this.box.getCenter(this.center);
    this.box.getSize(this.size);

    const height = this.size.y || 1;
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const distance = (height * padding) / (2 * Math.tan(fov / 2));

    const dir = new THREE.Vector3(0, 0, 1);
    this.camera.position.copy(this.center).addScaledVector(dir, distance);

    this.camera.near = distance / 10;
    this.camera.far = distance * 10;
    this.camera.updateProjectionMatrix();

    this.controls.target.copy(this.center);
    this.controls.update();
  }

  setBackground(id: BackgroundId) {
    if (!this.scene) return;
    applyBackground(this.scene, id);
  }

  captureSnapshot(): string | null {
    if (!this.renderer) return null;
    this.renderer.render(this.scene!, this.camera!);
    return this.renderer.domElement.toDataURL('image/png');
  }

  dispose() {
    if (this.animationFrameId) window.cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.handleResize);
    this.tickHandlers.clear();
    this.controls?.dispose();
    this.renderer?.dispose();
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.controls = undefined;
    this.canvas = undefined;
  }
}

export const sceneManager = new SceneManager();

