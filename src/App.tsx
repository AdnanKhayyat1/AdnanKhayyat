import { Center, Scroll, ScrollControls, useGLTF, useScroll, Grid } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import carUrl from "./assets/free_1975_porsche_911_930_turbo.glb?url";
import './index.css';
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Header } from "./Header";
import { Blog } from "./Blog";
import { SlopIntro } from "./SlopIntro";

// Every shot shares the same side-on viewing direction; only framing changes.
function sideCameraAt(target: [number, number, number], distance: number): [number, number, number] {
  return [
    target[0] + distance * Math.cos(Math.PI / 5),
    target[1],
    target[2] - distance * Math.sin(Math.PI / 5),
  ];
}

const SIDE_CAMERA_POSITION = sideCameraAt([0, 0, 0], 8);
const HEADLIGHT_TARGET: [number, number, number] = [1.81, -0.05, 1.27];
// Frame slightly above the front wheel to retain open space around the detail.
const FRONT_WHEEL_TARGET: [number, number, number] = [1.35, -0.15, 0.65];
const CABIN_TARGET: [number, number, number] = [0.5, 0.05, -0.6];
const REAR_WHEEL_TARGET: [number, number, number] = [-0.25, -0.15, -1.65];
const REAR_QUARTER_TARGET: [number, number, number] = [-0.7, 0.1, -1.95];

// One work experience per scroll section, from the CV
const VIEWS = [
  {
    p: SIDE_CAMERA_POSITION,
    l: [0, 0, 0],
    title: "How do you curate craft?",
    subtitle: "In the age of AI, generation is exponentially hire than what our eyes can handle. How do you gate a bar of quality in an otherwise sea of patternless generation. How do you defy slop?",
    price: "2025.00",
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
    // Zoom into the front fender/headlight while keeping the side profile.
    p: sideCameraAt(HEADLIGHT_TARGET, 1.5),
    l: HEADLIGHT_TARGET,
    title: "Craft, before.",
    subtitle: "This is a 1993 Porsche GT3. Personally, it is the epitome of craft. I'm not a car guy and never will be, but there's something so human yet deweaning about a machine like this. It is craft.",
    price: "2023.00",
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
    p: sideCameraAt(FRONT_WHEEL_TARGET, 3.5),
    l: FRONT_WHEEL_TARGET,
    title: "BRIDGE",
    subtitle: "Technical Co-founder · Provo, UT · Aug 2022 – Jul 2023. Co-founded a virtual interpreter for deaf communities, converting conversations into real-time group chat.",
    price: "2022.00",
    align: "left",
    color: "#2962FF", // Electric blue (slightly deeper)
    details: [
      "73% TRANSCRIPTION ACCURACY MVP",
      "1ST PLACE AT HACKATHON",
      "8 BUSINESS PARTNERS, 1000+ DAILY CONVERSATIONS",
    ]
  },
  {
    p: sideCameraAt(CABIN_TARGET, 4.2),
    l: CABIN_TARGET,
    title: "DRAGN LABS",
    price: "2022.00",
    align: "right",
    color: "#D500F9", // Deep magenta/violet
    subtitle: "Student Researcher & Co-author · BYU · Jan 2022 – Jun 2022. Built an LSTM model predicting traffic flow on 2K+ Utah roads from 2TB+ of intersection data. Published in Transportation Research Record, Oct 2023.",
    details: [
      "97% FASTER TRAINING VIA MODEL PARALLELISM",
      "K-FOLD CROSS-VALIDATION",
    ]
  },
  {
    p: sideCameraAt(REAR_WHEEL_TARGET, 3.7),
    l: REAR_WHEEL_TARGET,
    title: "UDEMY",
    price: "2021.00",
    align: "left",
    color: "#00B8D4", // Cyan/teal (more readable on light bg)
    subtitle: "Software Engineering Intern · San Francisco, CA · Jun 2021 – Aug 2021. Migrated the front-end from React to Next.js with hybrid rendering.",
    details: [
      "40% FASTER PAGE LOADS FOR 1M+ USERS",
      "UNIT, INTEGRATION & E2E TESTS IN CI/CD",
    ]
  },
  {
    p: sideCameraAt(REAR_QUARTER_TARGET, 4.8),
    l: REAR_QUARTER_TARGET,
    title: "CONTACT",
    subtitle: "HIRE_IMMEDIATELY",
    price: "TOTAL",
    align: "center",
    color: "#111827" // Soft black (charcoal)
  },
];

function CameraRig() {
  const { camera } = useThree();
  const scroll = useScroll();
  const look = useRef(new THREE.Vector3());

  useFrame(() => {
    // ScrollControls already damps the input. Blend adjacent shots continuously,
    // easing to rest at each composition instead of switching at a threshold.
    const progress = THREE.MathUtils.clamp(scroll.offset, 0, 1) * (VIEWS.length - 1);
    const index = Math.min(Math.floor(progress), VIEWS.length - 2);
    const blend = THREE.MathUtils.smootherstep(progress - index, 0, 1);
    const from = VIEWS[index];
    const to = VIEWS[index + 1];
    const lerp = THREE.MathUtils.lerp;
    camera.position.set(
      lerp(from.p[0], to.p[0], blend),
      lerp(from.p[1], to.p[1], blend),
      lerp(from.p[2], to.p[2], blend)
    );
    look.current.set(
      lerp(from.l[0], to.l[0], blend),
      lerp(from.l[1], to.l[1], blend),
      lerp(from.l[2], to.l[2], blend)
    );
    camera.lookAt(look.current);
  });

  return null;
}

function RetroCar() {
  const { scene } = useGLTF(carUrl);
  const gl = useThree((state) => state.gl);
  const world = useThree((state) => state.scene);

  useEffect(() => {
    // Bake studio reflections once, preserving the model's authored materials.
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const renderTarget = pmremGenerator.fromScene(room);
    const previousEnvironment = world.environment;
    world.environment = renderTarget.texture;
    room.dispose();
    pmremGenerator.dispose();
    
    return () => {
      world.environment = previousEnvironment;
      renderTarget.dispose();
    };
  }, [gl, world]);

  return <Center>
    <primitive object={scene} scale={1.0} position={[0, -1.1, 0]} rotation={[0, Math.PI / 5, 0]} />
  </Center>;
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      <fogExp2 attach="fog" args={["#ffffff", 0.02]} />
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
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white text-black font-sans">
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
    <div className="w-full h-screen overflow-hidden bg-transparent text-black font-sans transition-colors duration-500">
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

      <Canvas shadows camera={{ position: SIDE_CAMERA_POSITION, fov: 45 }}>
        <ScrollControls pages={VIEWS.length} damping={0.3} maxSpeed={0.6}>
          <Scene />
          
          <Scroll html style={{ width: "100%" }}>
            <div className="w-full">
              {VIEWS.map((view, i) => (
                <section key={i} className={`experience-section${i === 1 ? " experience-section--detail" : ""}`}>
                  <div className="scene-heading">
                    <div className="scene-rule" />
                    <h2 className="scene-title">
                      {view.title}
                    </h2>
                    {view.details && (
                      <p className="scene-summary">{view.subtitle}</p>
                    )}
                  </div>

                  {view.details ? (
                    <ul className="scene-details">
                      {view.details.map((detail) => <li key={detail}>{detail}</li>)}
                    </ul>
                  ) : (
                    <div className="scene-contact">
                      <a href="https://www.linkedin.com/in/adnankhayyat/">
                        LINKEDIN ↗
                      </a>
                    </div>
                  )}

                  <div className="scene-number" aria-hidden="true">
                    0{i + 1}
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
