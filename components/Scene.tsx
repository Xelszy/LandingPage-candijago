'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useProgress } from '@react-three/drei';
import { RotatingModel } from './RotatingModel';
import * as THREE from 'three';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md min-w-[150px] text-center select-none">
        {/* Beautiful Animated Spinner with embedded percentage */}
        <div className="relative w-14 h-14 flex items-center justify-center mb-3">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="24"
              className="text-white/5"
              strokeWidth="3"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              className="text-amber-500 transition-all duration-300"
              strokeWidth="3"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={2 * Math.PI * 24 * (1 - progress / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <span className="absolute font-mono text-xs text-amber-200 font-bold">
            {Math.round(progress)}%
          </span>
        </div>
        <p className="font-imprima text-[11px] text-white/60 tracking-widest uppercase font-medium">
          MEMUAT REPLIKA...
        </p>
      </div>
    </Html>
  );
}

function CameraUpdater({ zoomLevel }: { zoomLevel: number }) {
  const { camera } = useThree();
  
  useFrame(() => {
    // Smoothly interpolate FOV for zoom effect
    const targetFov = 45 - (zoomLevel * 3); 
    const clampedFov = Math.max(15, Math.min(75, targetFov));
    
    if (camera instanceof THREE.PerspectiveCamera) {
      const diff = clampedFov - camera.fov;
      if (Math.abs(diff) > 0.05) {
        camera.fov += diff * 0.1;
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}

export default function Scene({
  url = "https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/candijago1.glb",
  scale = [7.5, 7.5, 7.5],
  position = [0, -0.5, 0],
  modelPosition = [0, 2, 0],
  cameraPos = [0, 5, 14],
  autoRotate = true,
  autoRotateSpeed = 0.5,
  enableZoom = true
}: {
  url?: string;
  scale?: [number, number, number] | number;
  position?: [number, number, number];
  modelPosition?: [number, number, number];
  cameraPos?: [number, number, number];
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
}) {
  const [zoomLevel, setZoomLevel] = useState(0);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const proxiedUrl = url;

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const hasWebGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setWebGlSupported(hasWebGL);
    } catch (e) {
      setWebGlSupported(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setHasEnteredView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
        }
      },
      {
        rootMargin: '250px', // start rendering when it's within 250px of entering viewport
        threshold: 0.01,
      }
    );

    const el = containerRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) {
        observer.unobserve(el);
      }
    };
  }, []);

  if (!webGlSupported) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 bg-[#0c080a]/60 backdrop-blur-md rounded-2xl border border-white/10 text-center">
        <p className="font-viaoda text-xl text-white/90 mb-2">Replika Digital Jajaghu</p>
        <p className="font-imprima text-sm text-white/50 max-w-[320px]">
          WebGL tidak didukung atau sedang error di peramban Anda. Silakan muat ulang halaman.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full group bg-transparent">
      {hasEnteredView ? (
        <>
          <Canvas 
            camera={{ position: cameraPos, fov: 45 }}
            style={{ touchAction: 'pan-y', background: 'transparent' }} // Allows vertical page scroll on mobile and is fully transparent
            gl={{ 
              antialias: true, 
              alpha: true, 
              powerPreference: "high-performance",
              failIfMajorPerformanceCaveat: true
            }}
            dpr={[1, 1.5]} // Limit pixel ratio to 1.5 max for stellar performance
          >
            <ambientLight intensity={1.5} />
            {/* Multidirectional light rig to simulate beautiful direct sunshine and temple glow without heavy environments */}
            <directionalLight position={[10, 10, 5]} intensity={2.2} castShadow />
            <directionalLight position={[-10, 8, -5]} intensity={0.8} color="#4f6e80" />
            <pointLight position={[0, -2, 6]} intensity={1.5} color="#d4af37" />
            
            {/* enableZoom/enablePan/minDistance/maxDistance configuration decides if mouse scroll wheel handles zooming in/out and prevents canvas clipping/breaking */}
            <OrbitControls 
              autoRotate={autoRotate} 
              autoRotateSpeed={autoRotateSpeed} 
              enableZoom={enableZoom} 
              enablePan={false} 
              minDistance={2} 
              maxDistance={15} 
            />
            <CameraUpdater zoomLevel={zoomLevel} />
            <Suspense fallback={<Loader />}>
              <group position={position}>
                <RotatingModel url={proxiedUrl} scale={scale} position={modelPosition} />
              </group>
            </Suspense>
          </Canvas>

          {/* Manual Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex bg-black/50 backdrop-blur-md rounded-full border border-white/10 overflow-hidden shadow-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); setZoomLevel(z => Math.min(z + 1, 8)); }}
              className="w-10 h-10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Zoom In"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <div className="w-[1px] bg-white/10" />
            <button 
              onClick={(e) => { e.stopPropagation(); setZoomLevel(z => Math.max(z - 1, -4)); }}
              className="w-10 h-10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Zoom Out"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-zinc-950/20 border border-white/5 rounded-2xl shadow-sm backdrop-blur-[2px] text-center select-none">
          <div className="w-10 h-10 border-2 border-white/10 border-t-amber-500 rounded-full animate-spin mb-3" />
          <p className="font-imprima text-[10px] text-white/40 tracking-widest uppercase font-medium">
            MENYIAPKAN 3D...
          </p>
        </div>
      )}
    </div>
  );
}
