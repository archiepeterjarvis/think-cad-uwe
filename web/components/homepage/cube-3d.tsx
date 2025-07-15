"use client";

import { useEffect, useRef } from "react";

export function Cube3D() {
  const cubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;

    const rotationX = -30;
    let rotationY = 45;
    let animationId: number;

    const animate = () => {
      rotationY += 0.2;
      if (cube) {
        cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="cube-3d" ref={cubeRef}>
      <div className="cube-face front"></div>
      <div className="cube-face back"></div>
      <div className="cube-face right"></div>
      <div className="cube-face left"></div>
      <div className="cube-face top"></div>
      <div className="cube-face bottom"></div>
    </div>
  );
}
