import { Center, Scroll, ScrollControls, useGLTF, useScroll, Grid } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import carUrl from "./assets/free_1975_porsche_911_930_turbo.glb?url";
import './index.css';
import * as THREE from "three";
import { Header } from "./Header";
import { Blog } from "./Blog";
import { SlopIntro } from "./SlopIntro";

// One work experience per scroll section, from the CV
const VIEWS = [
  {
    p: [0, 2, 14],
    l: [0, 0, 0],
    title: "AMBROOK",
    subtitle: "Software Engineer II · New York, NY · Jul 2025 – Present. Building financial infrastructure for agriculture.",
    price: "2025.00",
    code: "01-AMBROOK",
    align: "left",
    color: "#FF3B30", // Vivid red-orange
    details: [
      "CUT GCP COSTS BY $193K/YR",
      "AI-POWERED WALLET FRAUD DETECTION",
      "SYNCED 6M+ RESOURCES FOR 8,500 CUSTOMERS",
      "SHIPPED QUICKBOOKS IMPORTS: 62K+ ITEMS, 200 INTEGRATIONS",
      "CD DEPLOY TIME: 2 HRS → 30 MIN",
    ]
  },
  {
    p: [8, 1.5, 6],
    l: [0, 0, 0],
    title: "REMI LABS",
    subtitle: "Founding Software Engineer · YC W22 · Lehi, UT · Aug 2023 – Jul 2025. Built the web platform managing 57,000+ roofing projects amounting to $10M ARR.",
    price: "2023.00",
    code: "02-REMI",
    align: "right",
    color: "#00C853", // Deep neon green (higher contrast)
    details: [
      "LED FASTPAY: PROJECTED $2–5M ARR",
      "RESOLVED 500+ BUGS",
      "REDUCED CODE DUPLICATION BY 93%",
      "SELF-HEALING SALESFORCE SYNC ENGINE",
    ]
  },
  {
    p: [-4, 1, 8],
    l: [0, 0, 0],
    title: "BRIDGE",
    subtitle: "Technical Co-founder · Provo, UT · Aug 2022 – Jul 2023. Co-founded a virtual interpreter for deaf communities, converting conversations into real-time group chat.",
    price: "2022.00",
    code: "03-BRIDGE",
    align: "left",
    color: "#2962FF", // Electric blue (slightly deeper)
    details: [
      "73% TRANSCRIPTION ACCURACY MVP",
      "1ST PLACE AT HACKATHON",
      "8 BUSINESS PARTNERS, 1000+ DAILY CONVERSATIONS",
    ]
  },
  {
    p: [-7, 4, -7],
    l: [0, 0, 0],
    title: "DRAGN LABS",
    price: "2022.00",
    code: "04-RESEARCH",
    align: "right",
    color: "#D500F9", // Deep magenta/violet
    subtitle: "Student Researcher & Co-author · BYU · Jan 2022 – Jun 2022. Built an LSTM model predicting traffic flow on 2K+ Utah roads from 2TB+ of intersection data. Published in Transportation Research Record, Oct 2023.",
    details: [
      "97% FASTER TRAINING VIA MODEL PARALLELISM",
      "K-FOLD CROSS-VALIDATION",
    ]
  },
  {
    p: [0, 10, 0],
    l: [0, 0, 0],
    title: "UDEMY",
    price: "2021.00",
    code: "05-UDEMY",
    align: "left",
    color: "#00B8D4", // Cyan/teal (more readable on light bg)
    subtitle: "Software Engineering Intern · San Francisco, CA · Jun 2021 – Aug 2021. Migrated the front-end from React to Next.js with hybrid rendering.",
    details: [
      "40% FASTER PAGE LOADS FOR 1M+ USERS",
      "UNIT, INTEGRATION & E2E TESTS IN CI/CD",
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
    color: "#111827" // Soft black (charcoal)
  },
];

const BODY_TEXT_BASE = new THREE.Color("#111827"); // charcoal
function getBodyTextColor(accentHex: string) {
  // Dark, readable text that still carries the accent tint.
  const c = new THREE.Color(accentHex).lerp(BODY_TEXT_BASE, 0.72);
  return `#${c.getHexString()}`;
}

function getCarPaintColor(accent: THREE.Color) {
  // Secondary palette color: small hue shift + a touch more saturation/lightness.
  // Keeps it "matching" without being identical to the text accent.
  return accent.clone().offsetHSL(0.04, 0.06, 0.02);
}

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
      const carColor = getCarPaintColor(finalColor);
      mat.color.copy(carColor);
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
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const selectedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

            let iterations = 0;
            const interval = setInterval(() => {
              setDisplayText(
                text
                  .split("")
                  .map((letter, index) => {
                    if (index < iterations) {
                      return letter;
                    }
                    return selectedChars[Math.floor(Math.random() * selectedChars.length)];
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
    <div
      ref={elementRef}
      className="relative inline-block"
      style={{
        // Liquid glass glyphs: tinted translucent gradient clipped to the
        // letters, with a specular white streak, glass-edge stroke, and depth.
        backgroundImage: `linear-gradient(135deg, ${color}E6 0%, ${color}59 38%, rgba(255,255,255,0.9) 50%, ${color}4D 58%, ${color}CC 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextStroke: "1px rgba(255,255,255,0.55)",
        filter:
          "drop-shadow(0 4px 8px rgba(0,0,0,0.18)) drop-shadow(0 1px 0 rgba(255,255,255,0.65))",
      }}
    >
      {displayText}
    </div>
  );
};

export default function Portfolio3DMVP() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isBlogPage = pathname === "/blog";
  const isBlogTempPage = pathname === "/blog-temp";

  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (isBlogPage || isBlogTempPage) return;
    if (introDone) return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventDefault as EventListener);
      window.removeEventListener("touchmove", preventDefault as EventListener);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isBlogPage, introDone]);

  if (isBlogPage) return <Blog />;

  if (isBlogTempPage)
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white text-black font-mono">
        <div className="text-xs mb-4 border border-current inline-block px-2 py-1 rounded-full">
          07-BLOG
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6">
          Coming Soon
        </h1>
        <a
          href="/"
          className="text-sm font-bold underline decoration-2 underline-offset-4 hover:opacity-50"
        >
          ← BACK HOME
        </a>
      </div>
    );

  return (
    <div className="w-full h-screen overflow-hidden bg-transparent text-black font-mono transition-colors duration-500">
      <Header />

      {!introDone && <SlopIntro onDone={() => setIntroDone(true)} />}
      
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
                          <p
                            className="text-left text-base md:text-lg font-bold tracking-widest uppercase"
                            style={{ color: getBodyTextColor(view.color) }}
                          >
                            {view.subtitle}
                          </p>
                          {view.details && (
                             <ul
                               className="mt-8 text-sm font-mono space-y-1 border-l-2 pl-4"
                               style={{ color: getBodyTextColor(view.color), borderColor: view.color }}
                             >
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
                          <p
                            className="text-left text-base md:text-lg font-bold tracking-widest uppercase"
                            style={{ color: getBodyTextColor(view.color) }}
                          >
                            {view.subtitle}
                          </p>
                          {view.details && (
                             <ul
                               className="mt-8 text-sm font-mono space-y-1 border-r-2 pr-4"
                               style={{ color: getBodyTextColor(view.color), borderColor: view.color }}
                             >
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
                          <a href="https://www.linkedin.com/in/adnankhayyat/" className="text-2xl md:text-4xl underline decoration-4 underline-offset-8 hover:opacity-50 transition-opacity px-4 py-2 pointer-events-auto text-current">
                            LINKEDIN
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
