import { Center, Scroll, ScrollControls, useGLTF, useScroll, Grid } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import carUrl from "./assets/free_1975_porsche_911_930_turbo.glb?url";
import './index.css';
import * as THREE from "three";
import { Header } from "./Header";

// Data derived from CV with Bold Colors
const VIEWS = [
  { 
    p: [0, 2, 14], 
    l: [0, 0, 0], 
    title: "ENGINEER", 
    subtitle: "FULL_STACK",
    price: "2025.00",
    code: "01-MAIN",
    align: "left",
    color: "#FF3300" // International Orange
  },
  { 
    p: [8, 1.5, 6], 
    l: [0, 0, 0], 
    title: "EXPERIENCE", 
    subtitle: "REMI_LABS_FOUNDING",
    price: "2000.00",
    code: "02-EXP",
    align: "right",
    color: "#CCFF00", // Volt Green
    details: [
      "MANAGED 27K+ PROJECTS",
      "$2M MRR SYSTEM",
      "REDUCED DUPLICATION 93%"
    ]
  },
  { 
    p: [-4, 1, 8], 
    l: [0, 0, 0], 
    title: "STARTUP", 
    subtitle: "BRIDGE_CO-FOUNDER",
    price: "0001.00",
    code: "03-WORK",
    align: "left",
    color: "#0066FF", // Electric Blue
    details: [
      "REAL-TIME TRANSCRIPTION",
      "73% ACCURACY MVP",
      "WON 1ST PLACE"
    ]
  },
  { 
    p: [-7, 4, -7], 
    l: [0, 0, 0], 
    title: "NEIGHBOR", 
    subtitle: "MARKETPLACE_SCALE",
    price: "3000.00",
    code: "04-SCALE",
    align: "right",
    color: "#FF0080", // Magenta
    details: [
      "3TB+ DATA GRAPH",
      "25+ FEATURES SHIPPED",
      "RUBY ON RAILS"
    ]
  },
  { 
    p: [0, 10, 0], 
    l: [0, 0, 0], 
    title: "RESEARCH", 
    subtitle: "TRAFFIC_AI_MODEL",
    price: "0000.00",
    code: "05-RSRCH",
    align: "left",
    color: "#00FF99", // Spring Green
    details: [
      "LSTM TRAFFIC PREDICTION",
      "2TB+ DATA PROCESSING",
      "PUBLISHED AUTHOR"
    ]
  },
  { 
    p: [5, 2, 8], 
    l: [0, 0, 0], 
    title: "CONTACT", 
    subtitle: "HIRE_IMMEDIATELY",
    price: "TOTAL",
    code: "06-END",
    align: "center",
    color: "#000000" // Back to Black/Final
  },
];

function CameraRig() {
  const { camera } = useThree();
  const scroll = useScroll();
  const look = useRef([0, 0, 0]);

  useFrame((_, dt) => {
    const t = scroll.offset;
    const idx = Math.round(t * (VIEWS.length - 1));
    
    const target = VIEWS[idx].p;
    const targetLook = VIEWS[idx].l;

    const lerp = (a: number, b: number, s: number) => a + (b - a) * s;
    const speed = Math.min(1, (dt * 4)); 

    camera.position.set(
      lerp(camera.position.x, target[0], speed),
      lerp(camera.position.y, target[1], speed),
      lerp(camera.position.z, target[2], speed)
    );

    look.current = [
      lerp(look.current[0], targetLook[0], speed),
      lerp(look.current[1], targetLook[1], speed),
      lerp(look.current[2], targetLook[2], speed),
    ];
    camera.lookAt(look.current[0], look.current[1], look.current[2]);
  });

  return null;
}

function BackgroundRig() {
  const { scene } = useThree();
  const scroll = useScroll();
  
  useFrame(() => {
    const t = scroll.offset;
    const floatIdx = t * (VIEWS.length - 1);
    const currentIdx = Math.floor(floatIdx);
    const nextIdx = Math.min(currentIdx + 1, VIEWS.length - 1);
    const progress = floatIdx - currentIdx;

    const currentColor = new THREE.Color(VIEWS[currentIdx].color);
    const nextColor = new THREE.Color(VIEWS[nextIdx].color);
    const activeColor = currentColor.lerp(nextColor, progress);
    
    // Background is a very light tint of the active color (90% white mix)
    const bgColor = activeColor.clone().lerp(new THREE.Color('#ffffff'), 0.9);
    
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(bgColor.getHexString(), 0.02);
  });
  return null;
}

function RetroCar() {
  const { scene } = useGLTF(carUrl);
  const gl = useThree((state) => state.gl);
  const scroll = useScroll();
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xffffff);
    const renderTarget = pmremGenerator.fromScene(envScene);
    
    materialsRef.current = [];

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.envMap = renderTarget.texture;
          material.envMapIntensity = 1.0;
          material.roughness = 0.2;
          material.metalness = 0.8;
          material.needsUpdate = true;
          materialsRef.current.push(material);
        }
      }
    });
    
    return () => {
      pmremGenerator.dispose();
      renderTarget.dispose();
    };
  }, [scene, gl]);
  
  useFrame(() => {
    const t = scroll.offset;
    const floatIdx = t * (VIEWS.length - 1);
    const currentIdx = Math.floor(floatIdx);
    const nextIdx = Math.min(currentIdx + 1, VIEWS.length - 1);
    const progress = floatIdx - currentIdx;

    const currentColor = new THREE.Color(VIEWS[currentIdx].color);
    const nextColor = new THREE.Color(VIEWS[nextIdx].color);
    const finalColor = currentColor.lerp(nextColor, progress);

    materialsRef.current.forEach(mat => {
      mat.color.copy(finalColor);
    });
  });

  return <Center>
    <primitive object={scene} scale={1.0} position={[0, -1.1, 0]} rotation={[0, Math.PI / 5, 0]} />
  </Center>;
}

function Scene() {
  return (
    <>
      <BackgroundRig />
      <ambientLight intensity={2.0} color="#ffffff" />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1} />
      
      {/* Infinite Retro Grid */}
      <Grid
        position={[0, -1.15, 0]}
        args={[100, 100]}
        cellColor="#cccccc"
        sectionColor="#ffffff"
        sectionSize={10}
        cellSize={1}
        fadeDistance={30}
        fadeStrength={1.5}
        infiniteGrid
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.1} />
      </mesh>
      
      <RetroCar />
      <CameraRig/>
    </>
  );
}

const GlitchText = ({ text, color }: { text: string, color: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let iterations = 0;
            const interval = setInterval(() => {
              setDisplayText(
                text
                  .split("")
                  .map((letter, index) => {
                    if (index < iterations) {
                      return letter;
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                  })
                  .join("")
              );
              
              if (iterations >= text.length) {
                clearInterval(interval);
              }
              
              iterations += 1/3;
            }, 30);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [text]);

  return (
    <div ref={elementRef} className="relative inline-block transition-colors duration-300" style={{ color }}>
      {displayText}
    </div>
  );
};

export default function Portfolio3DMVP() {
  return (
    <div className="w-full h-screen overflow-hidden bg-transparent text-black font-mono transition-colors duration-500">
      <Header />
      
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.04] mix-blend-multiply"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      <div className="fixed inset-0 pointer-events-none z-10 border-[20px] border-white hidden md:block"></div>
      
      <div className="fixed bottom-8 left-8 z-20 hidden md:block">
        <div className="text-[10px] uppercase tracking-widest mb-2">System Status</div>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-black animate-pulse"></div>
          <div className="w-2 h-2 bg-black animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-black animate-pulse delay-150"></div>
        </div>
      </div>

      <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
        <ScrollControls pages={VIEWS.length} damping={0.2}>
          <Scene />
          
          <Scroll html>
            <div className="w-full">
              {VIEWS.map((view, i) => (
                <section key={i} className="h-screen w-full relative flex items-center px-4 md:px-20">
                  <div 
                    className={`w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 pointer-events-none`}
                    style={{ color: view.color }}
                  >
                    
                    {view.align === 'left' && (
                      <div className="md:col-span-5 flex flex-col justify-center h-full py-12">
                        <div className="border-t-2 border-current pt-4 w-12 mb-8"></div>
                        <div>
                          <div className="text-xs mb-2 border border-current inline-block px-2 py-1 rounded-full">{view.code}</div>
                          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-4 uppercase whitespace-nowrap">
                            <GlitchText text={view.title} color={view.color} />
                          </h2>
                          <p className="text-lg md:text-xl font-bold opacity-60 tracking-widest uppercase">
                            {view.subtitle}
                          </p>
                          {view.details && (
                             <ul className="mt-8 text-sm font-mono opacity-80 space-y-1 border-l-2 border-current pl-4">
                               {view.details.map((d, idx) => <li key={idx}>{d}</li>)}
                             </ul>
                          )}
                        </div>
                      </div>
                    )}

                    {view.align === 'right' && (
                      <>
                        <div className="hidden md:block md:col-span-7"></div>
                        <div className="md:col-span-5 flex flex-col justify-center items-end text-right h-full py-12">
                          <div className="border-t-2 border-current pt-4 w-12 mb-8"></div>
                          <div className="text-xs mb-2 border border-current inline-block px-2 py-1 rounded-full">{view.code}</div>
                          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-4 uppercase whitespace-nowrap">
                            <GlitchText text={view.title} color={view.color} />
                          </h2>
                          <p className="text-lg md:text-xl font-bold opacity-60 tracking-widest uppercase">
                            {view.subtitle}
                          </p>
                          {view.details && (
                             <ul className="mt-8 text-sm font-mono opacity-80 space-y-1 border-r-2 border-current pr-4">
                               {view.details.map((d, idx) => <li key={idx}>{d}</li>)}
                             </ul>
                          )}
                        </div>
                      </>
                    )}

                    {view.align === 'center' && (
                       <div className="md:col-span-12 flex flex-col justify-center items-center text-center h-full py-12">
                         <div className="border-t-2 border-current pt-4 w-12 mb-8"></div>
                         <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-[0.8] mb-4 uppercase whitespace-nowrap">
                           <GlitchText text={view.title} color={view.color} />
                         </h2>
                          <a href="mailto:adnankhayyat@gmail.com" className="text-2xl md:text-4xl underline decoration-4 underline-offset-8 hover:opacity-50 transition-opacity px-4 py-2 pointer-events-auto text-current">
                            adnankhayyat@gmail.com
                          </a>
                       </div>
                    )}
                    
                  </div>
                  
                  <div className="absolute bottom-0 right-0 text-[20vw] leading-none font-black opacity-[0.03] pointer-events-none select-none" style={{ color: view.color }}>
                    0{i+1}
                  </div>
                </section>
              ))}
            </div>
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
