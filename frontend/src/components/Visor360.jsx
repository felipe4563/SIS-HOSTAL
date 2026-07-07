import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Visor de imagen equirectangular 360° usando Three.js puro.
 * Props:
 *   src      — URL de la imagen panorámica
 *   onReady  — callback cuando la textura cargó y el visor está listo
 *   onError  — callback si la textura falla
 */
const Visor360 = ({ src, onReady, onError }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el || !src) return;

    // ── Renderer ─────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    // ── Escena y cámara ──────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      el.clientWidth / el.clientHeight,
      0.1,
      1100
    );

    // ── Esfera (normales invertidas → textura visible desde adentro) ──
    const geo = new THREE.SphereGeometry(500, 64, 32);
    geo.scale(-1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // ── Cargar textura ───────────────────────────────────────
    const loader = new THREE.TextureLoader();
    loader.load(
      src,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        mat.map = tex;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;
        onReady?.();
      },
      undefined,
      () => onError?.()
    );

    // ── Estado de cámara ─────────────────────────────────────
    let lon = 0;   // ángulo horizontal (azimut)
    let lat = 0;   // ángulo vertical (elevación)
    let fov = 75;
    let autoRotate = true;
    let autoRotateTimer = null;

    const clampLat = (v) => Math.max(-85, Math.min(85, v));

    const applyCamera = () => {
      camera.fov = fov;
      camera.updateProjectionMatrix();
      const phi   = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      camera.lookAt(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );
    };

    const pauseAutoRotate = () => {
      autoRotate = false;
      clearTimeout(autoRotateTimer);
      autoRotateTimer = setTimeout(() => { autoRotate = true; }, 3500);
    };

    // ── Mouse drag ───────────────────────────────────────────
    let isDragging = false;
    let lastX = 0, lastY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      pauseAutoRotate();
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      lon  -= (e.clientX - lastX) * 0.18;
      lat  += (e.clientY - lastY) * 0.18;
      lat   = clampLat(lat);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    // ── Scroll: zoom con FOV ─────────────────────────────────
    const onWheel = (e) => {
      e.preventDefault();
      fov = Math.max(30, Math.min(100, fov + e.deltaY * 0.04));
      pauseAutoRotate();
    };

    // ── Touch: arrastrar + pinch-to-zoom ────────────────────
    let prevTouchX = 0, prevTouchY = 0;
    let prevPinchDist = 0;

    const onTouchStart = (e) => {
      pauseAutoRotate();
      if (e.touches.length === 1) {
        prevTouchX = e.touches[0].clientX;
        prevTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        prevPinchDist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
      }
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        lon -= (e.touches[0].clientX - prevTouchX) * 0.18;
        lat += (e.touches[0].clientY - prevTouchY) * 0.18;
        lat  = clampLat(lat);
        prevTouchX = e.touches[0].clientX;
        prevTouchY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        fov = Math.max(30, Math.min(100, fov - (dist - prevPinchDist) * 0.12));
        prevPinchDist = dist;
      }
    };

    // ── Giroscopio (Android / iOS con permiso previo) ────────
    let alpha0 = null; // primer alpha para hacer la rotación relativa
    const onDeviceOrientation = (e) => {
      if (isDragging || e.alpha == null) return;
      if (alpha0 === null) alpha0 = e.alpha;

      // Rotación relativa para evitar dependencia del norte magnético
      const relAlpha = ((e.alpha - alpha0) % 360 + 360) % 360;
      // beta: 0=upright, 90=face-up → queremos lat=0 cuando upright
      const rawLat = -(e.beta - 90);

      lon = relAlpha > 180 ? relAlpha - 360 : relAlpha;  // −180…+180
      lat = clampLat(rawLat);
    };
    window.addEventListener('deviceorientation', onDeviceOrientation);

    // ── Resize ───────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    // ── Registrar eventos ────────────────────────────────────
    const canvas = renderer.domElement;
    canvas.style.cursor = 'grab';
    canvas.addEventListener('mousedown',  onMouseDown);
    canvas.addEventListener('wheel',      onWheel,      { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true  });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseup',    onMouseUp);

    // ── Render loop ──────────────────────────────────────────
    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (autoRotate) lon += 0.025;
      applyCamera();
      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ──────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(autoRotateTimer);
      ro.disconnect();
      canvas.removeEventListener('mousedown',  onMouseDown);
      canvas.removeEventListener('wheel',      onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseup',    onMouseUp);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (el.contains(canvas)) el.removeChild(canvas);
    };
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', display: 'block', overflow: 'hidden' }}
    />
  );
};

export default Visor360;
