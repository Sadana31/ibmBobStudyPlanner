"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial, MeshDistortMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";

import { subjects, interests } from "@/lib/data";

// 1. Exact Engineering Subjects & 6 Passions Facts Database
const assistantFacts = {
  // --- CORE SUBJECTS ---
  networks: {
    emoji: "🌐",
    fact: "The internet uses BGP (Border Gateway Protocol) to dynamically map paths across global routers, steering around server blackouts instantly!"
  },
  os: {
    emoji: "💽",
    fact: "Operating Systems use Disk Scheduling Algorithms like SCAN (the Elevator algorithm) to move the disk arm over sectors efficiently without stopping!"
  },
  dbms: {
    emoji: "🗄️",
    fact: "Database Engines use B+ Trees because their wide branching factor dramatically cuts down disk I/O operations for lightning-fast queries!"
  },
  ai: {
    emoji: "🤖",
    fact: "Neural networks process language through Self-Attention matrices, calculating the hidden mathematical context between every single word simultaneously!"
  },

  // --- 6 INTERESTS (Update keys to match your exact interest item IDs) ---
  gaming: {
    emoji: "🕹️",
    fact: "Game engines run on strict 3D Octrees to strip out geometries outside your viewpoint, keeping rendering load low!"
  },
  music: {
    emoji: "🎛️",
    fact: "Digital synthesizers convert audio samples using Fast Fourier Transforms (FFT) to shift temporal waveforms into frequency spectrums!"
  },
  sports: {
    emoji: "📊",
    fact: "Sports tracking tech utilizes computer vision bounding matrices to calculate defensive zone coverage adjustments in real time!"
  },
  cooking: {
    emoji: "🌡️",
    fact: "Matrix culinary arts rely on the Maillard browning reaction, rearranging amino acids to synthesize completely brand-new flavor chains!"
  },
  art: {
    emoji: "🎨",
    fact: "Digital displays translate color palettes into 24-bit matrix maps, stacking red, green, and blue intensities into raw hexadecimal code lines!"
  },
  space: {
    emoji: "🚀",
    fact: "Orbital flight software runs on strict Real-Time Operating Systems (RTOS) to guarantee system tick responses within microseconds!"
  }
};

// 2. Interactive 3D Particles Component with scroll and cursor control
function FloatingParticles(props) {
  const ref = useRef();
  const [sphere] = useState(() => random.inSphere(new Float32Array(3000), { radius: 2.0 }));
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      // Rotate based on cursor position
      ref.current.rotation.x = mousePos.y * 0.3 + scrollY * 0.001;
      ref.current.rotation.y = mousePos.x * 0.3 + scrollY * 0.001;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#22d3ee"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

// 3. Clickable & Hoverable 3D Floating Mesh with improved hover effect
function Interactive3DObject({ position, color, speed, factor }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.x = Math.sin(t / 4) / 2;
      meshRef.current.rotation.y = Math.sin(t / 2) / 2;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={2}>
      <mesh
        ref={meshRef}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          setClicked(!clicked);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        scale={clicked ? 1.3 : hovered ? 1.15 : 1}
      >
        <icosahedronGeometry args={[0.6, 1]} />
        <MeshDistortMaterial
          color={hovered ? "#ff4500" : color}
          roughness={hovered ? 0.05 : 0.1}
          metalness={hovered ? 0.9 : 0.7}
          clearcoat={1}
          clearcoatRoughness={hovered ? 0.05 : 0.1}
          distort={hovered ? 0.6 : 0.4}
          speed={hovered ? factor * 2 : factor}
        />
      </mesh>
    </Float>
  );
}

// 4. Main Scene Setup with cursor tracking
function Scene3D() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-auto h-screen w-screen">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-5, 5, 5]} intensity={1.2} color="#f97316" />
        <directionalLight position={[5, -5, 5]} intensity={1.2} color="#22d3ee" />
        
        <group position={[mousePos.x * 0.5, mousePos.y * 0.5, 0]}>
          <Interactive3DObject position={[-2.4, 0, 0]} color="#0f172a" speed={3} factor={2} />
          <Interactive3DObject position={[2.4, 0, 0]} color="#2e1065" speed={4} factor={1.5} />
        </group>
        
        <FloatingParticles />
      </Canvas>
    </div>
  );
}

// Reduced glow cursor trail
function MouseGlowTrail() {
  const [trail, setTrail] = useState([]);
  const maxPoints = 6;

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newPoint = { x: e.clientX, y: e.clientY, id: `${Date.now()}-${Math.random()}` };
      setTrail((prev) => [...prev.slice(-maxPoints + 1), newPoint]);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {trail.map((point, index) => {
        const ratio = (index + 1) / trail.length;
        return (
          <motion.div
            key={point.id}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0.2 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-0 left-0 rounded-full"
            style={{
              x: point.x - 6 * ratio,
              y: point.y - 6 * ratio,
              width: `${12 * ratio}px`,
              height: `${12 * ratio}px`,
              background: `radial-gradient(circle, #ffffff 0%, #22d3ee 60%, transparent 100%)`,
              boxShadow: "0 0 8px rgba(34, 211, 238, 0.4)",
              mixBlendMode: "screen"
            }}
          />
        );
      })}
    </div>
  );
}

// MODIFIED COMPONENT: Single-shot initial Firework Sparks
function CardFireworkBurst() {
  // Creating sparkles that only play once upon entering
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-visible flex items-center justify-center">
      {Array.from({ length: 15 }).map((_, sparkIdx) => {
        const angle = (sparkIdx * 2 * Math.PI) / 15 + Math.random() * 0.4;
        const distance = Math.floor(Math.random() * 80) + 120;
        const randomColor = ["#22d3ee", "#f97316", "#a855f7", "#eab308", "#ec4899"][Math.floor(Math.random() * 5)];

        return (
          <motion.div
            key={sparkIdx}
            // Animate from initial state (center)
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            // To animate target (outward and vanishing)
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: [0, 1.8, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.2, // Total time for the explosion
              ease: "easeOut"
              // No repeat parameter
            }}
            style={{ backgroundColor: randomColor }}
            className="absolute w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]"
          />
        );
      })}
    </div>
  );
}

// SUB-COMPONENT: Individual card instance with 3-second auto-dismiss
function CornerPopupCard({ popup, onExpired }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onExpired(popup.id);
    }, 3000); // Auto-dismiss after 3 seconds

    return () => clearTimeout(timer);
  }, [popup.id, onExpired]);

  return (
    <div className={`absolute pointer-events-none overflow-visible ${popup.cornerClass}`}>
      <motion.div
        key={popup.id}
        initial={{ opacity: 0, scale: 0.5, y: 30 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }}
        exit={{ opacity: 0, scale: 0.6, y: -20, transition: { duration: 0.3 } }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`w-[320px] p-6 rounded-3xl border-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex items-start gap-4 text-black relative z-50 overflow-visible
          ${popup.side === "left"
            ? "bg-gradient-to-br from-cyan-300 via-cyan-100 to-purple-300 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.5)]"
            : "bg-gradient-to-br from-orange-300 via-amber-100 to-pink-300 border-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.5)]"
          }
        `}
      >
        {/* MODIFIED: Initial non-looping fireworks */}
        <CardFireworkBurst />

        {/* Small message pointer tail */}
        <div className={`absolute w-0 h-0 border-solid border-t-0 border-b-[16px] border-x-[12px] border-x-transparent -top-3.5 left-12
          ${popup.side === "left" ? "border-b-cyan-400" : "border-b-orange-400"}`}
        />

        <span className="text-4xl shrink-0 select-none z-10">
          {popup.emoji || "✨"}
        </span>

        <p className="text-sm md:text-base font-black text-slate-950 leading-snug tracking-tight pt-0.5 z-10 font-sans">
          {popup.fact}
        </p>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null); // 'learn' or 'quiz'
  const [quizDifficulty, setQuizDifficulty] = useState(null); // 'easy', 'medium', 'hard'
  
  const [activePopups, setActivePopups] = useState([]);
  const [factCache, setFactCache] = useState({}); // Cache for generated facts
  const [loadingFacts, setLoadingFacts] = useState(new Set()); // Track which facts are being loaded

  const router = useRouter();

  // Function to generate fact dynamically
  const generateFact = async (key, type, label) => {
    // Check cache first
    if (factCache[key]) {
      return factCache[key];
    }

    // Check if already loading
    if (loadingFacts.has(key)) {
      return null; // Return null to prevent duplicate popups
    }

    // Mark as loading
    setLoadingFacts(prev => new Set([...prev, key]));

    try {
      const response = await fetch("/api/generate-fact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: label, type })
      });

      const data = await response.json();
      if (data.success) {
        // Cache the fact
        setFactCache(prev => ({ ...prev, [key]: data.fact }));
        // Remove from loading
        setLoadingFacts(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
        return data.fact;
      }
    } catch (error) {
      console.error("Error generating fact:", error);
    }

    // Remove from loading on error
    setLoadingFacts(prev => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });

    // Fallback with actual facts
    const fallbackFacts = {
      linearalgebra: "Vectors can be added by combining their components. For example, (2,3) + (1,4) = (3,7)!",
      chemistry: "Water (H₂O) is made of 2 hydrogen atoms and 1 oxygen atom bonded together!",
      python: "Python lists can hold any type of data: numbers, text, or even other lists!",
      physics: "Newton's First Law: An object in motion stays in motion unless acted upon by a force!",
      biology: "DNA is shaped like a double helix and contains all your genetic information!",
      math: "The Pythagorean theorem: a² + b² = c² works for all right triangles!",
      history: "The Roman Empire lasted over 1000 years, from 27 BC to 476 AD!",
      economics: "Supply and demand determine prices: when demand goes up, prices usually rise!",
      gaming: "Game engines use frame rates (FPS) to create smooth motion - 60 FPS means 60 images per second!",
      music: "Sound waves are measured in Hertz (Hz) - humans can hear from 20 Hz to 20,000 Hz!",
      football: "A regulation soccer ball must be 68-70 cm in circumference and weigh 410-450 grams!",
      cooking: "The Maillard reaction creates brown color and rich flavors when cooking meat at high heat!",
      anime: "Anime is typically animated at 24 frames per second, with key frames drawn by lead animators!",
      movies: "The 180-degree rule in filmmaking keeps characters on consistent sides of the screen!"
    };

    return fallbackFacts[key] || `${label} combines creativity with technical precision in fascinating ways!`;
  };

  const handleStart = () => {
    if (!selectedSubject || !selectedInterest || !selectedMode) return;
    
    localStorage.setItem("interest", selectedInterest);
    
    if (selectedMode === 'learn') {
      router.push(`/learn/${selectedSubject}`);
    } else if (selectedMode === 'quiz' && quizDifficulty) {
      router.push(`/quiz/${selectedSubject}?difficulty=${quizDifficulty}&interest=${selectedInterest}`);
    }
  };

  const handleHoverIn = async (side, key, defaultData) => {
    // Only show popup if not already showing for this key
    if (activePopups.some(p => p.topicKey === key)) return;

    // Limit to maximum 2 popups at a time
    if (activePopups.length >= 2) return;

    // Use top-left and bottom-right corners
    const corners = [
      "top-12 left-12",
      "bottom-12 right-12"
    ];

    const busyCorners = activePopups.map(p => p.cornerClass);
    const freeCorners = corners.filter(c => !busyCorners.includes(c));

    // If no free corners, don't show popup
    if (freeCorners.length === 0) return;

    const targetCorner = freeCorners[0]; // Use first available corner

    // Generate fact dynamically
    const type = side === "left" ? "subject" : "interest";
    const label = defaultData.label || key;
    const fact = await generateFact(key, type, label);

    // If fact is null (already loading), don't show popup
    if (fact === null) return;

    const uniqueId = `${key}-${Date.now()}`;

    const newPopup = {
      id: uniqueId,
      topicKey: key,
      cornerClass: targetCorner,
      side,
      emoji: defaultData.emoji,
      fact
    };

    setActivePopups(prev => [...prev, newPopup]);
  };

  const handleHoverOut = (key) => {
    // Remove popup when hover ends
    setActivePopups(prev => prev.filter(popup => popup.topicKey !== key));
  };

  const clearPopupInstance = (id) => {
    setActivePopups(prev => prev.filter(popup => popup.id !== id));
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-cyan-500/30">
      
      <Scene3D />

      {/* Hardware Accelerated Brighter Neon Trail */}
      <MouseGlowTrail />

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-1">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* MULTI-CORNER INTERACTIVE LAYER */}
      <div className="fixed inset-0 pointer-events-none z-[99999] overflow-visible">
        <AnimatePresence mode="popLayout">
          {activePopups.map((popup) => (
            <CornerPopupCard 
              key={popup.id} 
              popup={popup} 
              onExpired={clearPopupInstance} 
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Primary Interface Content Layer */}
      <div className="relative z-50 w-full mx-0 px-4 py-20 pointer-events-none">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <p className="text-xs tracking-[0.4em] text-white/40 uppercase mb-5">
            Powered by Groq API
          </p>
          <h1 className="text-7xl md:text-8xl font-black leading-none tracking-tight">
            Learn anything.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-cyan-400">
              Your way.
            </span>
          </h1>

          <p className="text-white/50 text-xl mt-8 max-w-2xl mx-auto leading-relaxed">
            AI-powered learning that transforms difficult concepts into stories and analogies you actually care about.
          </p>
        </motion.div>

        {/* Subject Picker */}
        <section className="mb-14 pointer-events-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-6">
            01 — Choose your subject
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            {Object.entries(subjects).map(([key, subject], index) => (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSubject(key)}
                onPointerOver={() => handleHoverIn("left", key, {
                  emoji: subject.emoji,
                  label: subject.label
                })}
                onPointerOut={() => handleHoverOut(key)}
                className={`
                  relative overflow-hidden p-8 rounded-3xl border text-left transition-all duration-300 backdrop-blur-md
                  ${selectedSubject === key
                    ? "border-cyan-500/40 bg-white/10 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
                    : "border-white/10 bg-black/40 hover:bg-white/5"
                  }
                `}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ background: `radial-gradient(circle at top left, ${subject.color}, transparent 70%)` }}
                />
                <div className="relative z-10">
                  <span className="text-6xl mb-5 block" style={{ color: subject.color }}>
                    {subject.emoji}
                  </span>
                  <h3 className="text-2xl font-black mb-3">{subject.label}</h3>
                  <p className="text-white/45 leading-relaxed text-base">{subject.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Interest Picker */}
        <section className="mb-16 pointer-events-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-6">
            02 — What do you love?
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-5 w-full">
            {interests.map((interest, index) => (
              <motion.button
                key={interest.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedInterest(interest.id)}
                onPointerOver={() => handleHoverIn("right", interest.id, {
                  emoji: interest.emoji,
                  label: interest.label
                })}
                onPointerOut={() => handleHoverOut(interest.id)}
                className={`
                  p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md
                  ${selectedInterest === interest.id
                    ? "border-orange-500/40 bg-white/10 shadow-[0_0_30px_rgba(249,115,22,0.15)]"
                    : "border-white/10 bg-black/40 hover:bg-white/5"
                  }
                `}
              >
                <span className="text-4xl block mb-3">{interest.emoji}</span>
                <span className="font-bold text-white/80 text-base">{interest.label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Mode Selection */}
        <section className="mb-14 pointer-events-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-6">
            03 — Choose your mode
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedMode('learn');
                setQuizDifficulty(null);
              }}
              className={`
                relative overflow-hidden p-8 rounded-3xl border text-left transition-all duration-300 backdrop-blur-md
                ${selectedMode === 'learn'
                  ? "border-cyan-500/40 bg-white/10 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
                  : "border-white/10 bg-black/40 hover:bg-white/5"
                }
              `}
            >
              <div className="relative z-10">
                <span className="text-6xl mb-5 block">📚</span>
                <h3 className="text-3xl font-black mb-3">Learn</h3>
                <p className="text-white/45 leading-relaxed text-base">
                  Step-by-step lessons with AI explanations and interactive chatbot
                </p>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode('quiz')}
              className={`
                relative overflow-hidden p-8 rounded-3xl border text-left transition-all duration-300 backdrop-blur-md
                ${selectedMode === 'quiz'
                  ? "border-orange-500/40 bg-white/10 shadow-[0_0_40px_rgba(249,115,22,0.15)]"
                  : "border-white/10 bg-black/40 hover:bg-white/5"
                }
              `}
            >
              <div className="relative z-10">
                <span className="text-6xl mb-5 block">🎯</span>
                <h3 className="text-3xl font-black mb-3">Quiz</h3>
                <p className="text-white/45 leading-relaxed text-base">
                  Test your knowledge with AI-generated questions
                </p>
              </div>
            </motion.button>
          </div>
        </section>

        {/* Quiz Difficulty Selection (only shown when quiz mode is selected) */}
        <AnimatePresence>
          {selectedMode === 'quiz' && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-16 pointer-events-auto overflow-hidden"
            >
              <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-6">
                04 — Select difficulty
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                {[
                  { id: 'easy', label: 'Easy', emoji: '😊', color: 'from-green-500 to-emerald-500' },
                  { id: 'medium', label: 'Medium', emoji: '🤔', color: 'from-yellow-500 to-orange-500' },
                  { id: 'hard', label: 'Hard', emoji: '🔥', color: 'from-red-500 to-pink-500' }
                ].map((difficulty, index) => (
                  <motion.button
                    key={difficulty.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuizDifficulty(difficulty.id)}
                    className={`
                      p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md
                      ${quizDifficulty === difficulty.id
                        ? "border-white/40 bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                        : "border-white/10 bg-black/40 hover:bg-white/5"
                      }
                    `}
                  >
                    <span className="text-4xl block mb-3">{difficulty.emoji}</span>
                    <span className="font-bold text-white/80 text-base">{difficulty.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="w-full">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleStart}
            disabled={!selectedSubject || !selectedInterest || !selectedMode || (selectedMode === 'quiz' && !quizDifficulty)}
            className={`
              relative overflow-hidden w-full py-7 rounded-3xl text-2xl font-black tracking-wide transition-all duration-300 pointer-events-auto
              ${selectedSubject && selectedInterest && selectedMode && (selectedMode === 'learn' || quizDifficulty)
                ? `bg-gradient-to-r from-orange-500 to-cyan-500 hover:shadow-[0_0_50px_rgba(255,107,53,0.4)] text-white`
                : `bg-white/5 text-white/20 cursor-not-allowed border border-white/5`
              }
            `}
          >
            <span className="relative z-10">
              {selectedMode === 'quiz' ? 'Start Quiz →' : 'Start Learning →'}
            </span>
          </motion.button>
        </div>

      </div>
    </main>
  );
}