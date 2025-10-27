import { Center, Scroll, ScrollControls, useGLTF, useScroll } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import ASCIIText from "./ASCIIText";
import carUrl from "./assets/free_1975_porsche_911_930_turbo.glb?url"; // Vite resolves to a real URL
import './index.css';

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
  // Far away full reveal
  { p: [0, 3, 12], l: [0, 0, 0], label: "The Icon Reborn", description: "Timeless design meets modern innovation" },
  
  // Perfect side shot
  { p: [8, 0.8, 0], l: [0, 0, 0], label: "Pure Profile", description: "Classic lines, legendary performance" },
  
  // Close-up front
  { p: [0, 1.2, -3], l: [0, 1.5, 0], label: "First Impressions", description: "Where craftsmanship meets passion" },
  
  // Low angle hero shot
  { p: [2, 0.3, 4], l: [0, 1, 0], label: "Road Dominance", description: "Power unleashed, control refined" },
  
  // Rear three-quarter
  { p: [-6, 1.5, -4], l: [0, 0, 0], label: "Departure", description: "Leaving excellence in the distance" },
  
  // Extreme close-up detail
  { p: [-0.8, 0.9, -2.5], l: [-0.8, 0.9, -2.5], label: "Detail Obsessed", description: "Perfection in every curve" },
  
  // High angle from roof
  { p: [0, 5, 6], l: [0, -1, -6], label: "Aerial Perspective", description: "Admired from above, driven from within" },
  
  // Dynamic diagonal
  { p: [5, 2.5, 6], l: [-5, -1, -6], label: "Dynamic Motion", description: "Always moving forward" },
];

function RetroCar() {
  const { scene } = useGLTF(carUrl);
  
  // No material modifications - use default materials
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
      {/* Ambient light for base visibility */}
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index / 12) * Math.PI * 2; // Divide circle into 12 lights
        const radius = 8; // Distance from car center
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const hue = (index / 12) * 360; // Rainbow effect
        
        return (
          <pointLight 
            key={index} 
            position={[x, 2, z]} 
            intensity={50} 
            color={`hsl(${hue}, 100%, 50%)`}
          />
        );
      })}
      

      
      
      
      
      {/* Simple floor without reflectors */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#202020" />
      </mesh>
      
      <RetroCar />
      <CameraRig/>

    </>
  );
}

export default function Portfolio3DMVP() {
  return (
    <div className="w-full h-screen overflow-hidden bg-black text-white font-helvetica">
      {/* Top overlay header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 md:p-6">

{/* 
<ASCIIText
  text='adnan khayyat'
  enableWaves={true}
  asciiFontSize={16}
/> */}

        <div className="text-sm opacity-70">Scroll to slide ▶</div>
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
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
                      {v.description || `View ${i + 1} of ${VIEWS.length}`}
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
