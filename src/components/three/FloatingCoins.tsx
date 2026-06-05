'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { Suspense, useEffect, useRef, ReactNode } from 'react';
import * as THREE from 'three';

/* --------------------------------- palette -------------------------------- */
const SKIN = '#eab189';
const SKIN_DARK = '#d99a6c';
const HAIR = '#4a2f1d';
const SHIRT = '#37a06b';
const SHIRT_DARK = '#2b8156';
const PANTS = '#3f5d8a';
const PANTS_DARK = '#344e74';
const SHOE = '#23232e';

/**
 * A limb segment that extends from its group origin (the joint) along +Y.
 * Children are placed at the far tip so segments chain naturally with correct
 * anchoring (this is what fixes the previous "detached limbs" look).
 */
function Bone({
  length,
  radius,
  color,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  children,
}: {
  length: number;
  radius: number;
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  children?: ReactNode;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, length / 2, 0]} castShadow>
        <capsuleGeometry args={[radius, length, 8, 20]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.03} />
      </mesh>
      <group position={[0, length, 0]}>{children}</group>
    </group>
  );
}

/* ----------------------------- held pie chart ----------------------------- */
function HeldPie() {
  const slices = [
    { frac: 0.4, color: '#14a085' },
    { frac: 0.28, color: '#f4715f' },
    { frac: 0.2, color: '#f59e0b' },
    { frac: 0.12, color: '#6366f1' },
  ];
  let acc = 0;
  return (
    <group rotation={[Math.PI / 2.2, 0, 0]} scale={0.5}>
      {slices.map((s, i) => {
        const start = acc * Math.PI * 2;
        const angle = s.frac * Math.PI * 2;
        acc += s.frac;
        return (
          <mesh key={i}>
            <cylinderGeometry args={[1, 1, 0.4, 40, 1, false, start, angle]} />
            <meshStandardMaterial color={s.color} roughness={0.35} emissive={s.color} emissiveIntensity={0.18} />
          </mesh>
        );
      })}
    </group>
  );
}

/* -------------------------------- gold coin ------------------------------- */
function HeldCoin() {
  return (
    <group rotation={[Math.PI / 2, 0, 0.3]} scale={0.4}>
      <mesh>
        <cylinderGeometry args={[1, 1, 0.24, 36]} />
        <meshStandardMaterial color="#f4cf6a" metalness={1} roughness={0.2} emissive="#7a5a10" emissiveIntensity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.1, 16, 36]} />
        <meshStandardMaterial color="#fce29a" metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Hand() {
  return (
    <mesh>
      <sphereGeometry args={[0.16, 20, 20]} />
      <meshStandardMaterial color={SKIN} roughness={0.55} />
    </mesh>
  );
}

/* ------------------------------- character -------------------------------- */
function Character() {
  const rig = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    if (!rig.current) return;
    const targetY = mouse.current.x * 0.6;
    const targetX = mouse.current.y * 0.3;
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, targetY, 5, delta);
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, targetX, 5, delta);
  });

  return (
    <group ref={rig} position={[0, 0.05, 0]} scale={1.0}>
      {/* ----------------------------- Head ----------------------------- */}
      <group position={[0, 1.42, 0]}>
        {/* hair back */}
        <mesh position={[0, 0.08, -0.06]} scale={[1.04, 1.06, 1.04]}>
          <sphereGeometry args={[0.46, 32, 32]} />
          <meshStandardMaterial color={HAIR} roughness={0.75} />
        </mesh>
        {/* top knot */}
        <mesh position={[0, 0.52, -0.04]}>
          <sphereGeometry args={[0.17, 24, 24]} />
          <meshStandardMaterial color={HAIR} roughness={0.75} />
        </mesh>
        {/* face */}
        <mesh>
          <sphereGeometry args={[0.44, 32, 32]} />
          <meshStandardMaterial color={SKIN} roughness={0.5} />
        </mesh>
        {/* beard ring (lower face) */}
        <mesh position={[0, -0.12, 0.02]} scale={[1.02, 0.98, 0.92]}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial color={HAIR} roughness={0.8} />
        </mesh>
        {/* face skin patch on top of beard (forehead → upper lip) */}
        <mesh position={[0, 0.08, 0.16]} scale={[0.92, 0.78, 0.78]}>
          <sphereGeometry args={[0.4, 28, 28]} />
          <meshStandardMaterial color={SKIN} roughness={0.5} />
        </mesh>
        {/* nose */}
        <mesh position={[0, 0.0, 0.42]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={SKIN_DARK} roughness={0.5} />
        </mesh>
        {/* eyes */}
        <mesh position={[-0.15, 0.12, 0.38]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#241c18" roughness={0.3} />
        </mesh>
        <mesh position={[0.15, 0.12, 0.38]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#241c18" roughness={0.3} />
        </mesh>
        {/* eyebrows */}
        <mesh position={[-0.15, 0.23, 0.39]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.15, 0.035, 0.04]} />
          <meshStandardMaterial color={HAIR} />
        </mesh>
        <mesh position={[0.15, 0.23, 0.39]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.15, 0.035, 0.04]} />
          <meshStandardMaterial color={HAIR} />
        </mesh>
      </group>

      {/* neck */}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.18, 16]} />
        <meshStandardMaterial color={SKIN_DARK} roughness={0.55} />
      </mesh>

      {/* --------------------------- Torso --------------------------- */}
      <mesh position={[0, 0.6, 0]}>
        <capsuleGeometry args={[0.4, 0.5, 10, 24]} />
        <meshStandardMaterial color={SHIRT} roughness={0.5} />
      </mesh>
      {/* collar */}
      <mesh position={[0, 0.92, 0.02]} scale={[1, 0.45, 1]}>
        <sphereGeometry args={[0.26, 20, 20]} />
        <meshStandardMaterial color={SHIRT_DARK} roughness={0.5} />
      </mesh>
      {/* simple shirt fold line */}
      <mesh position={[0, 0.5, 0.36]} scale={[0.5, 1, 0.3]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={SHIRT_DARK} roughness={0.6} />
      </mesh>

      {/* --------------------- Arms raised (holding) --------------------- */}
      {/* Figure's right arm (screen left) — pie chart */}
      <Bone position={[-0.42, 0.82, 0.04]} rotation={[0.1, 0, 0.75]} length={0.5} radius={0.13} color={SHIRT}>
        <Bone rotation={[0, 0, 0.5]} length={0.46} radius={0.11} color={SKIN}>
          <Hand />
          <group position={[0, 0.24, 0]}>
            <HeldPie />
          </group>
        </Bone>
      </Bone>

      {/* Figure's left arm (screen right) — coin */}
      <Bone position={[0.42, 0.82, 0.04]} rotation={[0.1, 0, -0.75]} length={0.5} radius={0.13} color={SHIRT}>
        <Bone rotation={[0, 0, -0.5]} length={0.46} radius={0.11} color={SKIN}>
          <Hand />
          <group position={[0, 0.22, 0]}>
            <HeldCoin />
          </group>
        </Bone>
      </Bone>

      {/* ---------------------------- Hips ---------------------------- */}
      <mesh position={[0, 0.24, 0]}>
        <capsuleGeometry args={[0.36, 0.12, 8, 20]} />
        <meshStandardMaterial color={PANTS} roughness={0.55} />
      </mesh>

      {/* ----------------------- Legs (relaxed float) ----------------------- */}
      {/* Bones extend +Y, so rotate the hip ~PI to point the leg DOWN, then add
          a gentle knee bend. Legs dangle slightly forward like the reference. */}
      {/* Right leg (a touch more bent + forward) */}
      <Bone position={[-0.18, 0.1, 0.02]} rotation={[Math.PI - 0.28, 0, 0.04]} length={0.6} radius={0.16} color={PANTS}>
        <Bone rotation={[0.5, 0, 0]} length={0.54} radius={0.13} color={PANTS_DARK}>
          {/* shoe pointing forward */}
          <group position={[0, 0.02, 0]} rotation={[-1.25, 0, 0]}>
            <mesh position={[0, 0.04, 0.06]}>
              <capsuleGeometry args={[0.13, 0.18, 6, 16]} />
              <meshStandardMaterial color={SHOE} roughness={0.5} />
            </mesh>
          </group>
        </Bone>
      </Bone>
      {/* Left leg (straighter, trailing) */}
      <Bone position={[0.18, 0.1, 0.02]} rotation={[Math.PI + 0.05, 0, -0.04]} length={0.64} radius={0.16} color={PANTS}>
        <Bone rotation={[0.32, 0, 0]} length={0.58} radius={0.13} color={PANTS_DARK}>
          <group position={[0, 0.02, 0]} rotation={[-1.25, 0, 0]}>
            <mesh position={[0, 0.04, 0.06]}>
              <capsuleGeometry args={[0.13, 0.18, 6, 16]} />
              <meshStandardMaterial color={SHOE} roughness={0.5} />
            </mesh>
          </group>
        </Bone>
      </Bone>
    </group>
  );
}

export default function FloatingCoins() {
  return (
    <Canvas camera={{ position: [0, 0.3, 7], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      {/* Self-contained lighting (no network HDR) so it renders fully offline. */}
      <ambientLight intensity={0.95} />
      <directionalLight position={[4, 6, 6]} intensity={2.3} />
      <directionalLight position={[-5, 3, -2]} intensity={1.1} color="#cdf2e6" />
      <pointLight position={[-5, -2, 4]} intensity={30} color="#1bb898" />
      <pointLight position={[4, 4, 5]} intensity={22} color="#ffffff" />
      <Suspense fallback={null}>
        <Float speed={1.5} rotationIntensity={0.12} floatIntensity={1.1}>
          <Character />
        </Float>
      </Suspense>
    </Canvas>
  );
}
