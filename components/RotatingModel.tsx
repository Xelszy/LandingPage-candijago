'use client';

import React from 'react';
import { useGLTF } from '@react-three/drei';

export function RotatingModel({ 
  url, 
  scale = [7.5, 7.5, 7.5], 
  position = [0, 2, 0] 
}: { 
  url: string; 
  scale?: [number, number, number] | number;
  position?: [number, number, number];
}) {
  const { scene } = useGLTF(url);

  const finalScale = typeof scale === 'number' ? [scale, scale, scale] as [number, number, number] : scale;

  return (
    <group>
      <primitive object={scene} scale={finalScale} position={position} />
    </group>
  );
}

