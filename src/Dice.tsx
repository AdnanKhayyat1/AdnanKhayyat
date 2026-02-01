import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox, useScroll } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';

export function Dice({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [rolling, setRolling] = useState(false);
  const [value, setValue] = useState<number | null>(null);
  const scroll = useScroll();

  // This dice's pip layout (based on how the dots are placed below):
  // - Front (+Z): 1
  // - Back  (-Z): 6
  // - Top   (+Y): 2
  // - Bottom(-Y): 5
  // - Right (+X): 3
  // - Left  (-X): 4
  const faceToRotation = useMemo(() => {
    return new Map<number, THREE.Euler>([
      // Put the chosen face on +Y (top).
      [2, new THREE.Euler(0, 0, 0)],
      [5, new THREE.Euler(Math.PI, 0, 0)],
      [1, new THREE.Euler(-Math.PI / 2, 0, 0)],
      [6, new THREE.Euler(Math.PI / 2, 0, 0)],
      [3, new THREE.Euler(0, 0, Math.PI / 2)],
      [4, new THREE.Euler(0, 0, -Math.PI / 2)],
    ]);
  }, []);

  const rollDice = () => {
    if (rolling || !meshRef.current) return;
    
    setRolling(true);

    const nextValue = 1 + Math.floor(Math.random() * 6);
    const base = faceToRotation.get(nextValue) ?? new THREE.Euler(0, 0, 0);

    // Random yaw (keeps the same face on top but changes orientation).
    const yaw = (Math.PI / 2) * Math.floor(Math.random() * 4);

    const r = meshRef.current.rotation;
    const TWO_PI = Math.PI * 2;
    const spinTurns = () => 2 + Math.floor(Math.random() * 3); // 2..4
    const withExtraTurns = (target: number, current: number, turns: number) => {
      let t = target + TWO_PI * turns;
      // Force "forward" rotation so it visibly spins.
      while (t < current + TWO_PI) t += TWO_PI;
      return t;
    };

    const targetRotation = {
      x: withExtraTurns(base.x, r.x, spinTurns()),
      y: withExtraTurns(base.y + yaw, r.y, spinTurns()),
      z: withExtraTurns(base.z, r.z, spinTurns()),
    };

    const tl = gsap.timeline({
      defaults: { overwrite: true },
      onComplete: () => {
        setRolling(false);
        setValue(nextValue);
        if (meshRef.current) {
          // Snap to exact face alignment (prevents float drift).
          meshRef.current.rotation.set(base.x, base.y + yaw, base.z);
          meshRef.current.position.set(position[0], position[1], position[2]);
        }
      },
    });

    tl.to(meshRef.current.position, {
      y: position[1] + 2,
      duration: 0.35,
      ease: 'power2.out',
    });

    tl.to(
      meshRef.current.rotation,
      {
        x: targetRotation.x,
        y: targetRotation.y,
        z: targetRotation.z,
        duration: 1.1,
        ease: 'power3.out',
      },
      0
    );

    tl.to(meshRef.current.position, {
      y: position[1],
      duration: 0.45,
      ease: 'bounce.out',
    }, 0.35);
  };

  useFrame(() => {
    if (!groupRef.current || !labelRef.current) return;
    
    // Check scroll position
    const t = scroll.offset;
    // Show when near the end (approx last view)
    const targetScale = t > 0.9 ? 1 : 0;
    
    // Smoothly interpolate scale of the whole group
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
    
    groupRef.current.scale.setScalar(newScale);
    
    // Fade label
    labelRef.current.style.opacity = t > 0.9 ? "0.8" : "0";
    labelRef.current.style.pointerEvents = t > 0.9 ? "auto" : "none";
  });

  return (
    <group position={position} ref={groupRef} scale={0}>
        <RoundedBox 
            ref={meshRef} 
            args={[1, 1, 1]} 
            radius={0.15} 
            smoothness={8} 
            onClick={(e) => {
                e.stopPropagation();
                rollDice();
            }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            {/* Realistic Plastic Material */}
            <meshPhysicalMaterial 
                color="#eeeeee"
                roughness={0.1}
                metalness={0.0}
                clearcoat={1}
                clearcoatRoughness={0.1}
                transmission={0}
                thickness={0}
                ior={1.5}
            />
            
            {/* Face 1 (Front) */}
            <Dot position={[0, 0, 0.51]} />
            
            {/* Face 6 (Back) */}
            <Dot position={[-0.2, -0.2, -0.51]} />
            <Dot position={[-0.2, 0.2, -0.51]} />
            <Dot position={[0.2, -0.2, -0.51]} />
            <Dot position={[0.2, 0.2, -0.51]} />
            <Dot position={[-0.2, 0, -0.51]} />
            <Dot position={[0.2, 0, -0.51]} />

            {/* Face 2 (Top) */}
            <Dot position={[-0.2, 0.51, -0.2]} />
            <Dot position={[0.2, 0.51, 0.2]} />
            
            {/* Face 5 (Bottom) */}
            <Dot position={[-0.2, -0.51, -0.2]} />
            <Dot position={[0.2, -0.51, 0.2]} />
            <Dot position={[-0.2, -0.51, 0.2]} />
            <Dot position={[0.2, -0.51, -0.2]} />
            <Dot position={[0, -0.51, 0]} />

            {/* Face 3 (Right) */}
            <Dot position={[0.51, 0, 0]} />
            <Dot position={[0.51, 0.2, 0.2]} />
            <Dot position={[0.51, -0.2, -0.2]} />

            {/* Face 4 (Left) */}
            <Dot position={[-0.51, 0.2, 0.2]} />
            <Dot position={[-0.51, 0.2, -0.2]} />
            <Dot position={[-0.51, -0.2, 0.2]} />
            <Dot position={[-0.51, -0.2, -0.2]} />
        </RoundedBox>
        
        <Html position={[0, -1.2, 0]} center transform sprite distanceFactor={10} style={{ transition: 'opacity 0.5s' }}>
            <div ref={labelRef} className="text-xs font-bold bg-black text-white px-2 py-1 rounded opacity-0 whitespace-nowrap pointer-events-none select-none">
                {rolling ? 'ROLLING…' : (value ? `ROLL: ${value} (click)` : 'CLICK TO ROLL')}
            </div>
        </Html>
    </group>
  );
}

function Dot({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.06, 32, 32]} />
      <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.5} />
    </mesh>
  );
}
