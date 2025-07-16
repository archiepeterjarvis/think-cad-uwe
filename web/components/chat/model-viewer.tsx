"use client";

import {Canvas} from "@react-three/fiber";
import {Loader2} from "lucide-react";
import {Suspense, useEffect, useState} from "react";
import {Environment, OrbitControls, useGLTF} from "@react-three/drei";
import * as THREE from "three";

function Model({ url, onLoad }: { url: string; onLoad?: () => void }) {
  const { scene } = useGLTF(url, true);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0x888888,
          metalness: 1,
          roughness: 0.4,
          envMapIntensity: 1,
        });
      }
    });

    onLoad?.(); // call when done
  }, [scene, onLoad]);

  return <primitive object={scene} position={[0, -0.5, 0]} />;
}

export function ModelViewer({url}: { url: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="border rounded-lg w-full h-[500px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500"/>
        </div>
      )}

      <Canvas
        camera={{position: [0, 0, 5], fov: 90}}
        onCreated={() => setIsLoading(false)}
        onError={(error) => {
          console.error("Canvas error:", error);
          setIsLoading(false);
        }}
      >
        <ambientLight intensity={0.5}/>
        <directionalLight position={[10, 10, 5]} intensity={1}/>
        <Suspense fallback={null}>
          <Environment preset="apartment" blur={0.6}/>
          <Model url={url}/>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
}
