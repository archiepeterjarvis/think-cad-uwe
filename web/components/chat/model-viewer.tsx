"use client";

import {Canvas} from "@react-three/fiber";
import {Loader2} from "lucide-react";
import {Suspense, useState} from "react";
import {OrbitControls, useGLTF} from "@react-three/drei";

function Model({url}: { url: string }) {
  const {scene} = useGLTF(url);

  return <primitive object={scene} position={[0, -0.5, 0]}/>;
}

export function ModelViewer({url}: { url: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="border rounded-lg h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500"/>
        </div>
      )}

      <Canvas
        camera={{position: [0, 0, 5], fov: 50}}
        onCreated={() => setIsLoading(false)}
      >
        <ambientLight intensity={0.5}/>
        <directionalLight position={[10, 10, 5]} intensity={1}/>
        <Suspense fallback={null}>
          <Model url={url}/>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={1}/>
      </Canvas>
    </div>
  );
}
