import { Center, ContactShadows, Scroll, ScrollControls, useGLTF, useScroll, Environment } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import carUrl from "./assets/lb-works_ferrari_f40_-__free.glb?url"; // Vite resolves to a real URL
import './index.css';
import * as THREE from "three";

/**
 * Minimal 3D scroll-"slides" portfolio using React Three Fiber.
 * - A cube model (primitive Box) sits in the center.
 * - Scrolling snaps the camera to a few predefined viewpoints.
 * - The camera eases/lerps so it feels like a quick slide.
 *
 * How to run locally (Create React App / Vite):
 *   npm i three @react-three/fiber @react-three/drei
 *   // drop this file into your app and render <Portfolio3DMVP />
 */

// Define discrete viewpoints the camera will slide between
const VIEWS = [
  // position, lookAt
  { p: [3.2, 2.2, 4.2], l: [0, 0, 0], label: "Intro – Hello" },
  { p: [-4.0, 1.4, 2.4], l: [0, 0, 0], label: "Work – Selected Projects" },
  { p: [0.2, 5.0, 0.2], l: [0, 0, 0], label: "About – What I do" },
  { p: [2.6, -2.2, -3.8], l: [0, 0, 0], label: "Contact – Let’s talk" },
];

function RetroCar() {
  const { scene } = useGLTF(carUrl);
  
  // Make the car materials more reflective and metallic
  useEffect(() => {
    scene.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        const mesh = child as THREE.Mesh;
        // Enhance material properties for realistic reflections
        if (mesh.material && 'metalness' in mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.metalness = 0.9; // High metalness for reflections
          material.roughness = 0.2; // Low roughness for shiny surface
          material.envMapIntensity = 1.5; // Boost environment reflection
          material.needsUpdate = true;
        }
      }
    });
  }, [scene]);
  
  return <Center>
    <primitive object={scene} scale={1.2} position={[0, -1, 0]} />
  </Center>;
}
function CameraRig() {
  const { camera } = useThree();
  const scroll = useScroll();
  const look = useRef([0, 0, 0]);

  useFrame((_, dt) => {
    // 0..1 scroll offset across all pages
    const t = scroll.offset; // continuous progress
    // Choose nearest slide index from progress
    const idx = Math.round(t * (VIEWS.length - 1));

    // Target position & lookAt
    const target = VIEWS[idx].p;
    const targetLook = VIEWS[idx].l;

    // Lerp camera position for a quick slide (higher factor = faster)
    const lerp = (a: number, b: number, s: number) => a + (b - a) * s;
    const speed = Math.min(1, (dt * 6)); // feel snappy but smooth

    camera.position.set(
      lerp(camera.position.x, target[0], speed),
      lerp(camera.position.y, target[1], speed),
      lerp(camera.position.z, target[2], speed)
    );

    // Ease lookAt too
    look.current = [
      lerp(look.current[0], targetLook[0], speed),
      lerp(look.current[1], targetLook[1], speed),
      lerp(look.current[2], targetLook[2], speed),
    ];
    camera.lookAt(look.current[0], look.current[1], look.current[2]);
    camera.updateProjectionMatrix();
  });

  return null;
}



function Scene() {
  return (
    <>
      {/* Dark ambient light for base visibility */}
      <ambientLight intensity={0.3} />
      
      {/* Environment map for reflections */}
      <Environment preset="night" />
      
      {/* Left spotlight box - Fluorescent Yellow */}
      <group position={[-4, 1, 2]}>
        <mesh>
          <boxGeometry args={[0.6, 0.6, 0.8]} />
          <meshStandardMaterial 
            color="#FFFF00" 
            emissive="#FFFF00" 
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
        <spotLight
          position={[0, 0, 0]}
          target-position={[4, -1, -2]}
          angle={0.6}
          penumbra={0.5}
          intensity={150}
          color="#FFFF00"
          castShadow
          distance={15}
        />
      </group>

      {/* Right spotlight box - Fluorescent Purple */}
      <group position={[4, 1, 2]}>
        <mesh>
          <boxGeometry args={[0.6, 0.6, 0.8]} />
          <meshStandardMaterial 
            color="#DD00FF" 
            emissive="#DD00FF" 
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
        <spotLight
          position={[0, 0, 0]}
          target-position={[-4, -1, -2]}
          angle={0.6}
          penumbra={0.5}
          intensity={150}
          color="#DD00FF"
          castShadow
          distance={15}
        />
      </group>

      {/* Top accent light */}
      <pointLight position={[0, 4, 0]} intensity={30} color="#ffffff" />
      
      <RetroCar />
      <CameraRig/>
      
      <ContactShadows
          position={[0, -1.2, 0]}
          scale={12}
          blur={3}
          opacity={0.4}
          far={8}
        />
    </>
  );
}

export default function Portfolio3DMVP() {
  return (
    <div className="w-full h-screen overflow-hidden bg-black text-white">
      {/* Top overlay header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 md:p-6">
        <div className="font-semibold tracking-tight">Your Name</div>
        <div className="text-sm opacity-70">Scroll to slide ▶</div>
      </div>

      <Canvas shadows camera={{ position: [3.2, 2.2, 4.2], fov: 52 }}>
        {/* ScrollControls: pages === number of slides for full-screen “panels” */}
        <ScrollControls pages={VIEWS.length} damping={0.2}>
          <Scene />

          {/* HTML overlay content that scrolls in sync */}
          <Scroll html>
            <div className="relative w-full">
              {VIEWS.map((v, i) => (
                <section
                  key={i}
                  className="h-screen w-full flex items-center justify-center"
                >
                  <div className="max-w-xl px-6 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-3">
                      {v.label}
                    </h1>
                    <p className="text-base md:text-lg opacity-80">
                      This is slide {i + 1}. Replace with your own copy, links,
                      and CTAs. The camera snaps to a new angle of the cube
                      for each section as you scroll.
                    </p>
                  </div>
                </section>
              ))}
            </div>
          </Scroll>
        </ScrollControls>
      </Canvas>

      {/* Footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Your Name — Built with React & three.js
      </div>
    </div>
  );
}
