import { Center, Scroll, ScrollControls, useGLTF, useScroll } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import carUrl from "./assets/free_1975_porsche_911_930_turbo.glb?url"; // Vite resolves to a real URL
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
  // Far away full reveal
  { p: [0, 3, 12], l: [0, 0, 0], label: "ADNAN KHAYYAT", description: "Timeless design meets modern innovation" },
  
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



function RetroCar() {
  const { scene } = useGLTF(carUrl);
  const gl = useThree((state) => state.gl);
  
  // Load the scene's environment map and apply it to car materials
  useEffect(() => {
    // Create a white environment for reflections
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const renderTarget = pmremGenerator.fromScene(scene);
    
    scene.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.envMap = renderTarget.texture;
          material.envMapIntensity = 1.5;
          material.needsUpdate = true;
        }
      }
    });
    
    return () => {
      pmremGenerator.dispose();
      renderTarget.dispose();
    };
  }, [scene, gl]);
  
  return <Center>
    <primitive object={scene} scale={1.2} position={[0, -1, 0]} />
  </Center>;
}

function Scene() {
  return (
    <>
      {/* Bright white studio lighting - Infinite white world effect */}
      <ambientLight intensity={2.0} color="#ffffff" />
      
      {/* Soft directional lights from all angles for even illumination */}
      <directionalLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-10, 10, 10]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[10, 10, -10]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-10, 10, -10]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[0, 15, 0]} intensity={1.5} color="#ffffff" />
      
      {/* Additional fill lights for brightness */}
      <pointLight position={[20, 10, 20]} intensity={2.0} color="#ffffff" />
      <pointLight position={[-20, 10, 20]} intensity={2.0} color="#ffffff" />
      <pointLight position={[20, 10, -20]} intensity={2.0} color="#ffffff" />
      <pointLight position={[-20, 10, -20]} intensity={2.0} color="#ffffff" />
      
      {/* Seamless infinite white floor - extends far beyond view */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.05} 
          metalness={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <RetroCar />
      <CameraRig/>

    </>
  );
}

function StartupTestScreen() {
  const [text, setText] = useState('');
  const [showMain, setShowMain] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [glitchOffset, setGlitchOffset] = useState(0);
  
  // Cursor blink effect
  useEffect(() => {
    const cursorBlink = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorBlink);
  }, []);
  
  // Subtle glitch effect
  useEffect(() => {
    const glitch = setInterval(() => {
      setGlitchOffset(Math.random() * 4 - 2);
      setTimeout(() => setGlitchOffset(0), 50);
    }, 2000);
    return () => clearInterval(glitch);
  }, []);
  
  useEffect(() => {
    const allChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`ADNAN KHAYYAT ALL RIGHTS RESERVED 2025 2026';
    let index = 0;
    const typingSpeed = 35;
    
    const typing = setInterval(() => {
      if (index < allChars.length) {
        setText(allChars.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typing);
        
        // Pause for 1 second after typing all characters
        setTimeout(() => {
          setShowMain(true);
          setTimeout(() => {
            setVisible(false);
          }, 800);
        }, 800);
      }
    }, typingSpeed);
    
    return () => clearInterval(typing);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div 
      className={`fixed inset-0 z-50 bg-black text-white transition-opacity duration-800 ${showMain ? 'opacity-0' : 'opacity-100'}`}
      style={{ pointerEvents: showMain ? 'none' : 'auto' }}
    >
      <div 
        className="text-9xl font-helvetica tracking-normal break-all p-8 transition-transform duration-50"
        style={{ transform: `translateX(${glitchOffset}px)` }}
      >
        {text}
        {showCursor && <span className="inline-block w-[4px] h-[1em] bg-white ml-2 animate-pulse">▊</span>}
      </div>
      
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="w-full h-[2px] bg-white opacity-20 animate-scan"
          style={{
            animation: 'scan 3s linear infinite',
          }}
        />
      </div>
    </div>
  );
}

// Add scan animation to styles
const scanStyle = document.createElement('style');
scanStyle.textContent = `
  @keyframes scan {
    0% { transform: translateY(0); opacity: 0.2; }
    50% { opacity: 0.4; }
    100% { transform: translateY(100vh); opacity: 0.2; }
  }
`;
document.head.appendChild(scanStyle);

export default function Portfolio3DMVP() {
  return (
    <div className="w-full h-screen overflow-hidden bg-[#f5f5f5] text-black font-helvetica">
      <StartupTestScreen />
      {/* Top overlay header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 md:p-6">

{/* 
<ASCIIText
  text='adnan khayyat'
  enableWaves={true}
  asciiFontSize={16}
/> */}

          <div className="text-sm opacity-60 text-gray-700">Scroll to slide ▶</div>
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
                     <h1 className="text-xl md:text-8xl font-bold mb-3 tracking-tight">
                       {v.label}
                     </h1>
                    <p className="text-base md:text-lg opacity-80 text-gray-800">
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
