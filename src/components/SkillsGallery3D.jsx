import { useState, useEffect, useRef, useMemo, useCallback, Suspense, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { SKILL_CATEGORIES } from '../constants/skillsData';
import { createPanelTexture, createNameTexture } from '../lib/createPanelTexture';
import { X, ArrowLeft, ShieldCheck, Compass } from 'lucide-react';

/**
 * ============================================================================
 * TWO-LEVEL LOFT ARCHITECTURE CONSTANTS (Meters)
 * ============================================================================
 */
// 1. Main Hall Dimensions
export const ROOM_WIDTH = 30;       // X: -15 to +15 (West to East)
export const ROOM_DEPTH = 20;       // Z: -10 to +10 (North to South)
export const ROOM_HEIGHT = 9;       // Y: 0 to 9 (Floor to Ceiling)
export const WALL_CLEARANCE = 0.45; // 0.45m clearance from outer walls

// 2. Mezzanine Dimensions (Upper Floor)
export const MEZZANINE_WIDTH = 30;     // X: -15 to +15
export const MEZZANINE_DEPTH = 6;      // Z: -10 to -4 (along North wall)
export const MEZZANINE_HEIGHT = 3.6;   // Top surface Y = 3.6m
export const MEZZANINE_THICKNESS = 0.3;// Slab thickness 0.3m (bottom at Y = 3.3m)
export const MEZZANINE_RAIL_H = 1.1;   // Railing height = 1.1m (Y = 3.6 to 4.7)
export const MEZZANINE_Z_FRONT = -4.0; // Front edge of mezzanine slab
export const MEZZANINE_Z_BACK = -10.0; // Back edge against North wall

// 3. Staircase Dimensions (East Wall)
export const STAIR_WIDTH = 1.6;        // Width across X: 13.2 to 14.8
export const STAIR_RUN = 9.0;          // Run along Z: +5.0 (bottom) to -4.0 (top)
export const STAIR_RISE = 3.6;         // Rise Y: 0 to 3.6m
export const STAIR_STEPS_COUNT = 20;   // 20 steps (0.18m rise, 0.45m run)
export const STAIR_X_MIN = 13.2;
export const STAIR_X_MAX = 14.8;
export const STAIR_Z_START = 5.0;      // Foot of stairs
export const STAIR_Z_END = -4.0;       // Top landing onto mezzanine

// 4. Central Plinth Location (Ground Floor)
export const PLINTH_X = 0;
export const PLINTH_Z = 2.0;

// 5. Player & Movement Constants
export const EYE_HEIGHT_OFFSET = 1.65; // Eye height above floor level (1.65m)
export const WALK_SPEED = 3.2;         // Normal walking speed (m/s)
export const STAIR_SPEED = 1.6;        // Speed on stairs (m/s)
export const SPAWN_POS = [0, EYE_HEIGHT_OFFSET, 7.5]; // Near South entrance facing North

// 6. Preview Camera Constants (Interior Wide Loft Shot)
export const PREVIEW_CAM_POS = [-10.5, EYE_HEIGHT_OFFSET, 7.5];
export const PREVIEW_CAM_TARGET = [3.5, 3.4, -4.0];
export const PREVIEW_DRIFT_AMP = 0.2;
export const PREVIEW_DRIFT_PERIOD = 20;
export const PREVIEW_PARALLAX_MAX_DEG = 2.0;

/**
 * ============================================================================
 * WALKING WITH TWO LEVELS: groundHeightAt & checkCollision
 * ============================================================================
 */

/**
 * Returns ground floor height under player at coordinates (x, z):
 * - 0 on ground floor
 * - linear ramp from 0 to 3.6 along stair run [Z: 5.0 to -4.0, X: 13.1 to 14.9]
 * - 3.6 on mezzanine slab [Z: -10 to -4]
 * - null if outside room bounds
 */
export function groundHeightAt(x, z, currentY = 0) {
  // 1. Outer room bounds with 0.45m clearance
  const minX = -ROOM_WIDTH / 2 + WALL_CLEARANCE;
  const maxX = ROOM_WIDTH / 2 - WALL_CLEARANCE;
  const minZ = -ROOM_DEPTH / 2 + WALL_CLEARANCE;
  const maxZ = ROOM_DEPTH / 2 - WALL_CLEARANCE;

  if (x < minX || x > maxX || z < minZ || z > maxZ) {
    return null; // Out of bounds
  }

  // 2. Stairway flight: X in [13.1, 14.9], Z in [-4.0, 5.0]
  if (x >= STAIR_X_MIN - 0.1 && x <= STAIR_X_MAX + 0.1 && z >= STAIR_Z_END && z <= STAIR_Z_START) {
    const t = (STAIR_Z_START - z) / STAIR_RUN;
    return THREE.MathUtils.clamp(t * STAIR_RISE, 0, STAIR_RISE);
  }

  // 3. Mezzanine slab (North side): Z in [-10, -4.0]
  if (z <= MEZZANINE_Z_FRONT) {
    if (currentY >= 2.0) {
      return MEZZANINE_HEIGHT; // Upper floor
    }
    return 0.0; // Ground floor under mezzanine (ceiling is 3.3m)
  }

  // 4. Ground floor main hall
  return 0.0;
}

/**
 * Two-level collision check with AABB blockers:
 * - Mezzanine front railing (blocks falling off front edge)
 * - Stair stringers & open-side railing (blocks entering/falling from sides)
 * - Mezzanine columns & ground floor plinth
 */
export function checkCollision(x, z, currentY) {
  // Check room bounds and ground height
  const gh = groundHeightAt(x, z, currentY);
  if (gh === null) return true;

  const isUpper = currentY >= 2.0;

  if (isUpper) {
    // On Upper floor:
    // Front railing blocks crossing Z > -4.45 unless inside the stair entrance [13.0, 15.0]
    if (z > MEZZANINE_Z_FRONT - WALL_CLEARANCE && (x < STAIR_X_MIN - 0.2 || x > STAIR_X_MAX + 0.2)) {
      return true; // Blocked by mezzanine railing
    }
  } else {
    // On Ground floor:
    // Cannot walk through side of stairs (open side stringer at X = 13.2, Z from -4.0 to 4.8)
    if (x >= STAIR_X_MIN - WALL_CLEARANCE && x <= STAIR_X_MIN + 0.2 && z >= STAIR_Z_END && z <= STAIR_Z_START - 0.2) {
      return true; // Blocked by stair stringer/railing
    }

    // 3 Mezzanine support columns along front edge (Z = -4.0)
    const columnsX = [-8.0, 0.0, 7.5];
    for (const cx of columnsX) {
      if (Math.hypot(x - cx, z - (-4.0)) < 0.45) {
        return true; // Blocked by column
      }
    }

    // Ground floor central plinth at [0, 2.0]
    if (Math.hypot(x - PLINTH_X, z - PLINTH_Z) < 1.05) {
      return true; // Blocked by central plinth
    }
  }

  return false;
}

/**
 * Original SVG Icon: 4 Arrow Keys outlined cluster
 */
export function ArrowKeysIcon({ className = 'w-10 h-7' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 46 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <rect x="16" y="1" width="14" height="14" rx="1.5" />
      <path d="M23 11V5M20 8l3-3 3 3" />
      <rect x="1" y="17" width="14" height="14" rx="1.5" />
      <path d="M11 24H5M8 21l-3 3 3 3" />
      <rect x="16" y="17" width="14" height="14" rx="1.5" />
      <path d="M23 21v6M20 24l3 3 3-3" />
      <rect x="31" y="17" width="14" height="14" rx="1.5" />
      <path d="M35 24h6M38 21l3 3-3 3" />
    </svg>
  );
}

/**
 * Original SVG Icon: Minimalist Mouse outlined
 */
export function MouseIcon({ className = 'w-6 h-8' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <rect x="3" y="2" width="18" height="28" rx="9" />
      <path d="M12 7v6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Original SVG Icon: Touch drag hand gesture
 */
export function TouchDragIcon({ className = 'w-8 h-8' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 6v10M12 9v7M8 13v4M20 10v6" />
      <path d="M8 17a8 8 0 0 0 16 0v-7a3 3 0 0 0-6 0v7" />
      <path d="M4 16h3M25 16h3M3 16l3-3M29 16l-3-3" />
    </svg>
  );
}

/**
 * Instanced Staircase Steps & Open-Side Railing along East Wall
 */
function Staircase() {
  const stepsMeshRef = useRef();
  const balustersMeshRef = useRef();

  // Create steps using InstancedMesh
  useLayoutEffect(() => {
    if (!stepsMeshRef.current) return;
    const tempMatrix = new THREE.Matrix4();
    const tempPos = new THREE.Vector3();
    const tempRot = new THREE.Euler(0, 0, 0);
    const tempScale = new THREE.Vector3(1, 1, 1);

    for (let i = 0; i < STAIR_STEPS_COUNT; i++) {
      const z = STAIR_Z_START - (i + 0.5) * (STAIR_RUN / STAIR_STEPS_COUNT);
      const y = (i + 1) * (STAIR_RISE / STAIR_STEPS_COUNT);
      const x = (STAIR_X_MIN + STAIR_X_MAX) / 2; // X = 14.0

      tempPos.set(x, y - 0.02, z);
      tempMatrix.compose(tempPos, new THREE.Quaternion().setFromEuler(tempRot), tempScale);
      stepsMeshRef.current.setMatrixAt(i, tempMatrix);
    }
    stepsMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Instanced balusters on the open side of stairs (X = 13.2)
  useLayoutEffect(() => {
    if (!balustersMeshRef.current) return;
    const tempMatrix = new THREE.Matrix4();
    const tempPos = new THREE.Vector3();
    const tempRot = new THREE.Euler(0, 0, 0);
    const tempScale = new THREE.Vector3(1, 1, 1);
    const count = 30;

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const z = THREE.MathUtils.lerp(STAIR_Z_START, STAIR_Z_END, t);
      const baseY = THREE.MathUtils.lerp(0, STAIR_RISE, t);
      const y = baseY + 0.5;

      tempPos.set(STAIR_X_MIN, y, z);
      tempMatrix.compose(tempPos, new THREE.Quaternion().setFromEuler(tempRot), tempScale);
      balustersMeshRef.current.setMatrixAt(i, tempMatrix);
    }
    balustersMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Slope angle for stringers and handrail
  const slopeAngle = useMemo(() => Math.atan2(STAIR_RISE, STAIR_RUN), []);
  const stringerLength = useMemo(() => Math.hypot(STAIR_RISE, STAIR_RUN), []);

  return (
    <group>
      {/* 20 Instanced Steps */}
      <instancedMesh
        ref={stepsMeshRef}
        args={[null, null, STAIR_STEPS_COUNT]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[STAIR_WIDTH, 0.04, 0.48]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.4} />
      </instancedMesh>

      {/* Slim Steel Stringer on Wall Side (X = 14.8) */}
      <mesh
        position={[STAIR_X_MAX, STAIR_RISE / 2, (STAIR_Z_START + STAIR_Z_END) / 2]}
        rotation={[slopeAngle, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.06, 0.22, stringerLength]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Slim Steel Stringer on Open Side (X = 13.2) */}
      <mesh
        position={[STAIR_X_MIN, STAIR_RISE / 2, (STAIR_Z_START + STAIR_Z_END) / 2]}
        rotation={[slopeAngle, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.06, 0.22, stringerLength]} />
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Handrail on Open Side (Height 1.05m above stair slope) */}
      <mesh
        position={[STAIR_X_MIN, STAIR_RISE / 2 + 1.05, (STAIR_Z_START + STAIR_Z_END) / 2]}
        rotation={[slopeAngle, 0, 0]}
      >
        <boxGeometry args={[0.04, 0.04, stringerLength + 0.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Instanced Balusters on Open Side */}
      <instancedMesh ref={balustersMeshRef} args={[null, null, 30]}>
        <cylinderGeometry args={[0.01, 0.01, 0.95, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.5} />
      </instancedMesh>

      {/* Stair Starting Post & Landing Post */}
      <mesh position={[STAIR_X_MIN, 0.55, STAIR_Z_START]}>
        <boxGeometry args={[0.06, 1.1, 0.06]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[STAIR_X_MIN, STAIR_RISE + 0.55, STAIR_Z_END]}>
        <boxGeometry args={[0.06, 1.1, 0.06]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

/**
 * Mezzanine Front Railing with Instanced Balusters (Along Z = -4.0)
 */
function MezzanineRailing() {
  const balustersRef = useRef();
  const railLength = 28.0; // From X = -15.0 to X = 13.0 (leaves stair opening 13.0 to 15.0)
  const railCenterX = -1.0;
  const count = 160;

  useLayoutEffect(() => {
    if (!balustersRef.current) return;
    const tempMatrix = new THREE.Matrix4();
    const tempPos = new THREE.Vector3();
    const tempRot = new THREE.Euler(0, 0, 0);
    const tempScale = new THREE.Vector3(1, 1, 1);

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const x = THREE.MathUtils.lerp(-14.8, 12.8, t);
      tempPos.set(x, MEZZANINE_HEIGHT + 0.55, MEZZANINE_Z_FRONT);
      tempMatrix.compose(tempPos, new THREE.Quaternion().setFromEuler(tempRot), tempScale);
      balustersRef.current.setMatrixAt(i, tempMatrix);
    }
    balustersRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      {/* Top Handrail */}
      <mesh position={[railCenterX, MEZZANINE_HEIGHT + MEZZANINE_RAIL_H - 0.02, MEZZANINE_Z_FRONT]}>
        <boxGeometry args={[railLength, 0.04, 0.04]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Bottom Base Rail */}
      <mesh position={[railCenterX, MEZZANINE_HEIGHT + 0.05, MEZZANINE_Z_FRONT]}>
        <boxGeometry args={[railLength, 0.04, 0.04]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Instanced Balusters */}
      <instancedMesh ref={balustersRef} args={[null, null, count]}>
        <cylinderGeometry args={[0.012, 0.012, 1.0, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.5} />
      </instancedMesh>

      {/* Structural Posts spaced along railing */}
      {[-14.8, -10.0, -5.0, 0.0, 5.0, 10.0, 12.8].map((px) => (
        <mesh key={px} position={[px, MEZZANINE_HEIGHT + 0.55, MEZZANINE_Z_FRONT]}>
          <boxGeometry args={[0.06, 1.1, 0.06]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Exposed Steel Roof Trusses Spanning Hall at Y = 8.4m
 */
function RoofTrusses() {
  const trussZPositions = useMemo(() => [-8.0, -4.5, -1.0, 2.5, 6.0, 9.0], []);

  return (
    <group>
      {/* 6 Steel Trusses */}
      {trussZPositions.map((tz, idx) => (
        <group key={idx} position={[0, 8.4, tz]}>
          {/* Top Chord */}
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[ROOM_WIDTH, 0.1, 0.1]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Bottom Chord */}
          <mesh position={[0, -0.38, 0]}>
            <boxGeometry args={[ROOM_WIDTH, 0.1, 0.1]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* Vertical and Diagonal Struts */}
          {[-12, -9, -6, -3, 0, 3, 6, 9, 12].map((sx) => (
            <group key={sx}>
              {/* Vertical Web */}
              <mesh position={[sx, 0, 0]}>
                <boxGeometry args={[0.06, 0.76, 0.06]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.5} />
              </mesh>
              {/* Diagonal Web */}
              {sx < 12 && (
                <mesh position={[sx + 1.5, 0, 0]} rotation={[0, 0, 0.46]}>
                  <boxGeometry args={[0.05, 0.88, 0.05]} />
                  <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.4} />
                </mesh>
              )}
            </group>
          ))}
        </group>
      ))}

      {/* 3 Longitudinal Steel Cross Beams */}
      {[-7.5, 0, 7.5].map((bx) => (
        <mesh key={bx} position={[bx, 8.0, 0]}>
          <boxGeometry args={[0.1, 0.1, ROOM_DEPTH]} />
          <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Large Industrial Grid Windows with 6x4 Bright Emissive Panes & Thin Mullions
 */
function WindowGrid({ width, height, cols = 6, rows = 4 }) {
  const cellW = width / cols;
  const cellH = height / rows;

  return (
    <group>
      {/* Emissive Daylight Glass Surface */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#ffffff"
          emissiveIntensity={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Outer Window Frame */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.04]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Vertical Mullions */}
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <mesh key={`vm-${i}`} position={[-width / 2 + (i + 1) * cellW, 0, 0.025]}>
          <boxGeometry args={[0.04, height, 0.03]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}

      {/* Horizontal Mullions */}
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <mesh key={`hm-${i}`} position={[0, -height / 2 + (i + 1) * cellH, 0.025]}>
          <boxGeometry args={[width, 0.04, 0.03]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * 3D Two-Level Loft Room Architecture (Ground Floor, Mezzanine, Windows & Decal AO)
 */
function LoftArchitecture({ onWallClick }) {
  return (
    <group>
      {/* 1. Ground Floor (Y = 0): Light concrete-gray floor (#deded9) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow onClick={onWallClick}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#deded9" roughness={0.45} metalness={0.05} />
      </mesh>

      {/* 2. Main Ceiling (Y = 9.0): Crisp matte white (#f8fafc) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* 3. North / Back Wall (Z = -10): White (#f5f5f2) */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]} rotation={[0, 0, 0]} receiveShadow onClick={onWallClick}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f2" roughness={0.85} />
      </mesh>

      {/* 4. South / Front Wall (Z = +10): White (#f5f5f2) */}
      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} rotation={[0, Math.PI, 0]} receiveShadow onClick={onWallClick}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f2" roughness={0.85} />
      </mesh>

      {/* 5. West Wall (X = -15): White (#f5f5f2) */}
      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow onClick={onWallClick}>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f2" roughness={0.85} />
      </mesh>

      {/* 6. East Wall (X = +15): White (#f5f5f2) */}
      <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow onClick={onWallClick}>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#f5f5f2" roughness={0.85} />
      </mesh>

      {/* 7. Perimeter Baseboard Trims (Skirting Boards) */}
      <mesh position={[0, 0.05, -ROOM_DEPTH / 2 + 0.02]}>
        <boxGeometry args={[ROOM_WIDTH, 0.1, 0.02]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.05, ROOM_DEPTH / 2 - 0.02]}>
        <boxGeometry args={[ROOM_WIDTH, 0.1, 0.02]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>
      <mesh position={[-ROOM_WIDTH / 2 + 0.02, 0.05, 0]}>
        <boxGeometry args={[0.02, 0.1, ROOM_DEPTH]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>
      <mesh position={[ROOM_WIDTH / 2 - 0.02, 0.05, 0]}>
        <boxGeometry args={[0.02, 0.1, ROOM_DEPTH]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>

      {/* 8. MEZZANINE SLAB: 30m wide x 6m deep (Top Y = 3.6m, Thickness = 0.3m) */}
      <group position={[0, MEZZANINE_HEIGHT - MEZZANINE_THICKNESS / 2, (MEZZANINE_Z_FRONT + -ROOM_DEPTH / 2) / 2]}>
        {/* Slab Solid Box */}
        <mesh castShadow receiveShadow onClick={onWallClick}>
          <boxGeometry args={[MEZZANINE_WIDTH, MEZZANINE_THICKNESS, MEZZANINE_DEPTH]} />
          <meshStandardMaterial color="#e2e2dd" roughness={0.4} metalness={0.05} />
        </mesh>
        {/* Front Edge Steel Fascia Trim */}
        <mesh position={[0, 0, MEZZANINE_DEPTH / 2 + 0.015]}>
          <boxGeometry args={[MEZZANINE_WIDTH, MEZZANINE_THICKNESS + 0.04, 0.03]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>

      {/* 9. Mezzanine Support Columns (3 square steel columns, 0.35m square, ground floor height = 3.3m) */}
      {[-8.0, 0.0, 7.5].map((cx) => (
        <mesh key={cx} position={[cx, 1.65, MEZZANINE_Z_FRONT]} castShadow receiveShadow>
          <boxGeometry args={[0.35, 3.3, 0.35]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}

      {/* 10. Mezzanine Front Railing */}
      <MezzanineRailing />

      {/* 11. Open Staircase along East Wall */}
      <Staircase />

      {/* 12. Steel Roof Trusses */}
      <RoofTrusses />

      {/* 13. Windows: Two on East Wall (X = 14.96), One on North Wall (Z = -9.96) */}
      {/* East Window 1 (South side) */}
      <group position={[14.96, 6.0, 3.0]} rotation={[0, -Math.PI / 2, 0]}>
        <WindowGrid width={5.4} height={3.2} cols={6} rows={4} />
      </group>
      {/* East Window 2 (North side above stairs) */}
      <group position={[14.96, 6.0, -4.0]} rotation={[0, -Math.PI / 2, 0]}>
        <WindowGrid width={5.4} height={3.2} cols={6} rows={4} />
      </group>
      {/* North Window high above mezzanine */}
      <group position={[0, 7.2, -9.96]} rotation={[0, 0, 0]}>
        <WindowGrid width={10.0} height={2.4} cols={6} rows={4} />
      </group>

      {/* 14. Ceiling Central Skylight Strip */}
      <mesh position={[0, 8.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 16.0]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.6}
          roughness={0.1}
        />
      </mesh>

      {/* 15. Fake Ambient Occlusion Gradient Decals (Soft contact shadow ribbons) */}
      {/* Under Mezzanine front edge */}
      <mesh position={[0, 0.01, -3.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, 0.8]} />
        <meshBasicMaterial color="#000000" opacity={0.12} transparent />
      </mesh>
      {/* Under Stair Stringer */}
      <mesh position={[STAIR_X_MIN, 0.01, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 9.0]} />
        <meshBasicMaterial color="#000000" opacity={0.15} transparent />
      </mesh>
    </group>
  );
}

/**
 * Centerpiece: Museum Pedestal with Slowly Rotating 3D Name "Nikeleshwaran"
 * Positioned in the middle of the ground floor hall: [0, 0, 2.0]
 */
function Centerpiece({ onInspectCenter }) {
  const groupRef = useRef();
  const nameTexture = useMemo(() => createNameTexture('NIKELESHWARAN'), []);

  useEffect(() => {
    return () => {
      if (nameTexture) nameTexture.dispose();
    };
  }, [nameTexture]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group position={[PLINTH_X, 0, PLINTH_Z]}>
      {/* Pedestal Base */}
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.82, 0.76, 36]} />
        <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Pedestal Collar Accent */}
      <mesh position={[0, 0.77, 0]}>
        <cylinderGeometry args={[0.74, 0.74, 0.04, 36]} />
        <meshStandardMaterial
          color="#7c8cff"
          roughness={0.2}
          metalness={0.6}
          emissive="#7c8cff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Rotating 3D Centerpiece Sculpture */}
      <group ref={groupRef} position={[0, 1.15, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.52, 0.08]} />
          <meshStandardMaterial color="#09090b" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.042]}>
          <planeGeometry args={[1.66, 0.48]} />
          <meshBasicMaterial map={nameTexture} />
        </mesh>
        <mesh position={[0, 0, -0.042]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.66, 0.48]} />
          <meshBasicMaterial map={nameTexture} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Individual Framed Exhibit Panel with Label Plaque & Spotlight Accent
 */
function ExhibitPanel({ category, onSelect, isHovered, onHover, onUnhover }) {
  const panelRef = useRef();
  const texture = useMemo(() => createPanelTexture(category), [category]);

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  useFrame(() => {
    if (!panelRef.current) return;
    const targetLift = isHovered ? 0.08 : 0;
    panelRef.current.position.y = THREE.MathUtils.lerp(
      panelRef.current.position.y,
      targetLift,
      0.15
    );
  });

  return (
    <group position={category.position} rotation={category.rotation}>
      <group
        ref={panelRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(category);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(category.id);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onUnhover(category.id);
        }}
      >
        {/* Outer Frame (Box) */}
        <mesh castShadow receiveShadow position={[0, 0, -0.02]}>
          <boxGeometry args={[3.24, 2.04, 0.08]} />
          <meshStandardMaterial
            color="#09090b"
            roughness={0.3}
            metalness={0.4}
            emissive={isHovered ? category.color : '#000000'}
            emissiveIntensity={isHovered ? 0.25 : 0}
          />
        </mesh>

        {/* Canvas Exhibit Print (Surface) */}
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[3.2, 2.0]} />
          <meshBasicMaterial map={texture} />
        </mesh>

        {/* Small Museum Label Plaque Beside Panel */}
        <group position={[1.88, -0.5, 0]}>
          <mesh position={[0, 0, 0.015]}>
            <boxGeometry args={[0.32, 0.45, 0.02]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
          </mesh>
          <mesh position={[-0.12, 0.12, 0.03]}>
            <planeGeometry args={[0.04, 0.12]} />
            <meshBasicMaterial color={category.color} />
          </mesh>
        </group>

        {/* Gallery Focused Spotlight Glow above panel */}
        <pointLight
          position={[0, 1.4, 0.6]}
          color="#ffffff"
          intensity={0.8}
          distance={4.5}
          decay={2}
        />
      </group>
    </group>
  );
}

/**
 * Controller: Handles Preview Parallax, Multi-Waypoint Spline Fly-To, and Walk Physics
 */
function LoftController({
  mode,
  setMode,
  selectedCategory,
  setSelectedCategory,
  onExit,
  onFloorChange
}) {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__threeCamera = camera;
    }
    return () => {
      if (typeof window !== 'undefined' && window.__threeCamera === camera) {
        delete window.__threeCamera;
      }
    };
  }, [camera]);

  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isPointerLocked = useRef(false);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Movement physics state
  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    arrowup: false,
    arrowleft: false,
    arrowdown: false,
    arrowright: false
  });
  const velocity = useRef(new THREE.Vector3());

  // Spline Fly-to animation state
  const flyPathRef = useRef(null);

  // Synchronize camera Euler when entering walk mode
  useEffect(() => {
    if (mode === 'walk') {
      euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
    }
  }, [mode, camera]);

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (keysPressed.current[key] !== undefined) {
        keysPressed.current[key] = true;
      }
      if (e.key === 'Escape') {
        if (selectedCategory) {
          setSelectedCategory(null);
          setMode('walk');
        } else if (mode === 'walk') {
          if (document.pointerLockElement) {
            document.exitPointerLock?.();
          }
          onExit?.();
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keysPressed.current[key] !== undefined) {
        keysPressed.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, selectedCategory, setMode, setSelectedCategory, onExit]);

  // Mouse & Touch Look Listeners
  useEffect(() => {
    const dom = gl?.domElement;
    if (!dom) return;

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === dom;
    };

    const onMouseMove = (e) => {
      if (mode !== 'walk') return;

      if (document.pointerLockElement === dom) {
        const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

        euler.current.y -= movementX * 0.0022;
        euler.current.x -= movementY * 0.0022;
        euler.current.x = Math.max(-1.45, Math.min(1.45, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      } else if (isDragging.current) {
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        euler.current.y -= deltaX * 0.003;
        euler.current.x -= deltaY * 0.003;
        euler.current.x = Math.max(-1.45, Math.min(1.45, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      }
    };

    const onMouseDown = (e) => {
      if (mode !== 'walk') return;
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      if (document.pointerLockElement !== dom) {
        try {
          dom.requestPointerLock?.();
        } catch (err) {}
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    let prevTouch = { x: 0, y: 0 };
    const onTouchStart = (e) => {
      if (mode !== 'walk' || e.touches.length === 0) return;
      prevTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchMove = (e) => {
      if (mode !== 'walk' || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - prevTouch.x;
      const deltaY = e.touches[0].clientY - prevTouch.y;
      prevTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      euler.current.y -= deltaX * 0.004;
      euler.current.x -= deltaY * 0.004;
      euler.current.x = Math.max(-1.45, Math.min(1.45, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);
    window.addEventListener('mousemove', onMouseMove);
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('mousemove', onMouseMove);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
    };
  }, [mode, gl, camera]);

  // Handle panel fly-to setup when selectedCategory changes
  useEffect(() => {
    if (!selectedCategory) {
      flyPathRef.current = null;
      return;
    }

    const startPos = camera.position.clone();
    const targetPos = new THREE.Vector3(...selectedCategory.inspectCam);
    const targetLook = new THREE.Vector3(...selectedCategory.inspectTarget);

    const isCurrentlyGround = startPos.y < 2.5;
    const isTargetUpper = selectedCategory.floor === 1;

    if (isCurrentlyGround && isTargetUpper) {
      // Ascend stairs via CatmullRomCurve3 so camera never cuts through mezzanine slab
      const waypoints = [
        startPos,
        new THREE.Vector3(14.0, 1.65, 6.2),   // Foot of stairs approach
        new THREE.Vector3(14.0, 1.65, 4.8),   // Step onto first tread
        new THREE.Vector3(14.0, 3.45, 0.5),   // Mid-flight
        new THREE.Vector3(14.0, 5.25, -3.8),  // Top stair landing
        new THREE.Vector3(12.0, 5.25, -5.5),  // Mezzanine slab
        targetPos                             // Panel inspect spot
      ];
      flyPathRef.current = {
        curve: new THREE.CatmullRomCurve3(waypoints, false, 'centripetal'),
        targetLook,
        duration: 1800,
        startTime: performance.now(),
        returnPos: startPos
      };
    } else {
      // Direct fly-to
      const waypoints = [startPos, targetPos];
      flyPathRef.current = {
        curve: new THREE.CatmullRomCurve3(waypoints),
        targetLook,
        duration: 900,
        startTime: performance.now(),
        returnPos: startPos
      };
    }
  }, [selectedCategory, camera]);

  // Frame Loop (Preview Parallax, Inspect Spline Fly-To, and Walk Physics)
  useFrame((state, delta) => {
    // 1. INSPECT MODE: Fly along CatmullRomCurve3
    if (mode === 'inspect' && flyPathRef.current) {
      const elapsed = performance.now() - flyPathRef.current.startTime;
      const progress = THREE.MathUtils.clamp(elapsed / flyPathRef.current.duration, 0, 1);
      // Ease-in-out curve
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentPos = flyPathRef.current.curve.getPoint(ease);
      camera.position.copy(currentPos);

      // Smooth look rotation
      const currentDir = new THREE.Vector3();
      camera.getWorldDirection(currentDir);
      const desiredDir = flyPathRef.current.targetLook.clone().sub(camera.position).normalize();
      const nextDir = currentDir.lerp(desiredDir, 0.12);
      camera.lookAt(camera.position.clone().add(nextDir));

      euler.current.setFromQuaternion(camera.quaternion, 'YXZ');

      // Update floor indicator
      onFloorChange?.(camera.position.y >= 3.0 ? 1 : 0);
      return;
    }

    // 2. PREVIEW MODE: Wide architectural loft shot with subtle lateral drift & mouse parallax
    if (mode === 'preview') {
      const time = state.clock.getElapsedTime();
      const drift = Math.sin((time / PREVIEW_DRIFT_PERIOD) * Math.PI * 2) * PREVIEW_DRIFT_AMP;

      const targetX = PREVIEW_CAM_POS[0] + drift;
      const targetY = PREVIEW_CAM_POS[1];
      const targetZ = PREVIEW_CAM_POS[2];
      camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);

      const maxRad = (PREVIEW_PARALLAX_MAX_DEG * Math.PI) / 180;
      const lookX = PREVIEW_CAM_TARGET[0] + (state.pointer?.x || 0) * maxRad * 6.0;
      const lookY = PREVIEW_CAM_TARGET[1] - (state.pointer?.y || 0) * maxRad * 3.5;
      const lookZ = PREVIEW_CAM_TARGET[2];

      const currentLook = new THREE.Vector3();
      camera.getWorldDirection(currentLook);
      const desiredLook = new THREE.Vector3(lookX, lookY, lookZ).sub(camera.position).normalize();
      const nextLook = currentLook.lerp(desiredLook, 0.08);
      camera.lookAt(camera.position.clone().add(nextLook));
      return;
    }

    // 3. WALK MODE: First-person physics with two-level groundHeightAt & sliding collision
    if (mode === 'walk') {
      const yaw = euler.current.y;
      const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

      // Check whether player is currently on stairs
      const onStairs =
        camera.position.x >= STAIR_X_MIN - 0.2 &&
        camera.position.x <= STAIR_X_MAX + 0.2 &&
        camera.position.z >= STAIR_Z_END &&
        camera.position.z <= STAIR_Z_START;

      const currentSpeed = onStairs ? STAIR_SPEED : WALK_SPEED;
      const damping = 8.0;

      // Friction
      velocity.current.x -= velocity.current.x * damping * delta;
      velocity.current.z -= velocity.current.z * damping * delta;

      // Movement keys
      const moveForward = keysPressed.current.w || keysPressed.current.arrowup;
      const moveBackward = keysPressed.current.s || keysPressed.current.arrowdown;
      const moveLeft = keysPressed.current.a || keysPressed.current.arrowleft;
      const moveRight = keysPressed.current.d || keysPressed.current.arrowright;

      const moveDir = new THREE.Vector3();
      if (moveForward) moveDir.add(forward);
      if (moveBackward) moveDir.sub(forward);
      if (moveRight) moveDir.add(right);
      if (moveLeft) moveDir.sub(right);

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        velocity.current.x += moveDir.x * currentSpeed * delta * damping;
        velocity.current.z += moveDir.z * currentSpeed * delta * damping;
      }

      // Candidate new position
      const deltaX = velocity.current.x * delta;
      const deltaZ = velocity.current.z * delta;

      const candidateX = camera.position.x + deltaX;
      const candidateZ = camera.position.z + deltaZ;

      // Two-level collision with sliding:
      if (!checkCollision(candidateX, candidateZ, camera.position.y)) {
        camera.position.x = candidateX;
        camera.position.z = candidateZ;
      } else if (!checkCollision(candidateX, camera.position.z, camera.position.y)) {
        camera.position.x = candidateX; // Slide along X
      } else if (!checkCollision(camera.position.x, candidateZ, camera.position.y)) {
        camera.position.z = candidateZ; // Slide along Z
      }

      // Continuous eye height smoothing across ground, stairs, and mezzanine
      const groundY = groundHeightAt(camera.position.x, camera.position.z, camera.position.y) ?? 0;
      const targetEyeY = groundY + EYE_HEIGHT_OFFSET;
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetEyeY, 0.2);

      // Floor indicator state callback
      onFloorChange?.(camera.position.y >= 3.0 ? 1 : 0);
    }
  });

  return null;
}

/**
 * Main Exported 3D Skills Gallery Component (Two-Level Loft)
 */
export default function SkillsGallery3D({
  isVisible = true,
  isExpanded = false,
  onEnter,
  onExit,
  isTablet = false
}) {
  const [mode, setMode] = useState('preview'); // 'preview' | 'walk' | 'inspect'
  const [isEnteringOrEntered, setIsEnteringOrEntered] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredPanelId, setHoveredPanelId] = useState(null);
  const [currentFloor, setCurrentFloor] = useState(0); // 0 = Ground Floor, 1 = Upper Floor

  const containerRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Sync external expansion prop with internal mode
  useEffect(() => {
    if (!isExpanded && (mode === 'walk' || isEnteringOrEntered)) {
      setMode('preview');
      setIsEnteringOrEntered(false);
      setSelectedCategory(null);
    }
  }, [isExpanded, mode, isEnteringOrEntered]);

  // Auto-focus close button when inspect card opens
  useEffect(() => {
    if (selectedCategory && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [selectedCategory]);

  // Performance auto-tuning safeguard
  const [dpr, setDpr] = useState([1, 1.5]);
  const [enableShadows, setEnableShadows] = useState(true);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(pointer: coarse)')?.matches;

  // Frame rate monitor: Downgrade dpr and shadows if frametime exceeds 20ms for 2s (100 frames)
  useEffect(() => {
    let slowFramesCount = 0;
    let lastTime = performance.now();
    let frameId;

    const checkFPS = (now) => {
      const delta = now - lastTime;
      lastTime = now;

      if (delta > 20) {
        slowFramesCount++;
        if (slowFramesCount > 100) {
          setDpr([1, 1]);
          setEnableShadows(false);
          return;
        }
      } else {
        slowFramesCount = Math.max(0, slowFramesCount - 1);
      }
      frameId = requestAnimationFrame(checkFPS);
    };

    if (isVisible) {
      frameId = requestAnimationFrame(checkFPS);
    }
    return () => cancelAnimationFrame(frameId);
  }, [isVisible]);

  const handleHover = useCallback((id) => {
    setHoveredPanelId(id);
    document.body.style.cursor = 'pointer';
  }, []);

  const handleUnhover = useCallback(() => {
    setHoveredPanelId(null);
    document.body.style.cursor = 'auto';
  }, []);

  const handleSelectPanel = useCallback((category) => {
    setSelectedCategory(category);
    setMode('inspect');
  }, []);

  const handleCloseInspect = useCallback(() => {
    setSelectedCategory(null);
    setMode('walk');
  }, []);

  // Enter gallery transition
  const handleEnterGallery = () => {
    setIsEnteringOrEntered(true);
    setMode('walk');
    onEnter?.();

    try {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas?.requestPointerLock) {
        canvas.requestPointerLock();
      }
    } catch (e) {}

    try {
      const sectionEl = document.getElementById('skills');
      if (sectionEl?.requestFullscreen) {
        sectionEl.requestFullscreen().catch(() => {});
      } else if (sectionEl?.webkitRequestFullscreen) {
        sectionEl.webkitRequestFullscreen().catch?.(() => {});
      }
    } catch (e) {}
  };

  // Exit gallery transition back to 50/50 preview
  const handleExitGallery = () => {
    setMode('preview');
    setIsEnteringOrEntered(false);
    setSelectedCategory(null);
    onExit?.();

    try {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch?.(() => {});
      }
    } catch (e) {}
  };

  // Synchronize fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && mode === 'walk') {
        handleExitGallery();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [mode]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Interactive 3D Virtual Loft Art Gallery displaying skills categories across two floors with walkable WASD navigation and staircase."
      className="absolute inset-0 w-full h-full overflow-hidden m-0 p-0 select-none bg-[#f5f5f2]"
    >
      {/* 1. THREE.JS HIGH-KEY LOFT CANVAS */}
      <Canvas
        shadows={enableShadows}
        dpr={dpr}
        frameloop={isVisible ? 'always' : 'never'}
        camera={{
          fov: 56,
          position: PREVIEW_CAM_POS,
          near: 0.1,
          far: 85
        }}
        className="w-full h-full touch-none pointer-events-auto cursor-crosshair"
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#f5f5f2', 32, 85]} />

          {/* High-Key Bright Loft Lighting */}
          <ambientLight intensity={1.3} />
          <hemisphereLight skyColor="#ffffff" groundColor="#deded9" intensity={1.0} />
          <directionalLight
            position={[12, 10, 6]}
            intensity={1.3}
            castShadow={enableShadows}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
            shadow-camera-near={1}
            shadow-camera-far={45}
            shadow-camera-left={-16}
            shadow-camera-right={16}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
          />
          <pointLight position={[0, 7.5, 0]} intensity={0.5} distance={25} color="#ffffff" />

          {/* Two-Level Loft Room Architecture */}
          <LoftArchitecture
            onWallClick={() => {
              if (selectedCategory) handleCloseInspect();
            }}
          />

          {/* Centerpiece Plinth on Ground Floor [0, 0, 2.0] */}
          <Centerpiece onInspectCenter={() => {}} />

          {/* 6 Skill Panels Spread across Ground Floor and Mezzanine */}
          {SKILL_CATEGORIES.map((category) => (
            <ExhibitPanel
              key={category.id}
              category={category}
              onSelect={handleSelectPanel}
              isHovered={hoveredPanelId === category.id}
              onHover={handleHover}
              onUnhover={handleUnhover}
            />
          ))}

          {/* Controller for Movement, Look, Stair Navigation & Spline Fly-To */}
          <LoftController
            mode={mode}
            setMode={setMode}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onExit={handleExitGallery}
            onFloorChange={setCurrentFloor}
          />
        </Suspense>
      </Canvas>

      {/* 2. OVERLAY: SOLID BLACK ENTRY BAR (Preview state) */}
      <div
        className={`absolute z-20 pointer-events-none transition-all duration-250 ease-out ${
          isEnteringOrEntered || mode === 'walk' || mode === 'inspect'
            ? 'opacity-0 scale-95 pointer-events-none'
            : 'opacity-100 scale-100'
        } ${
          isTablet
            ? 'top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[480px]'
            : 'top-[62%] -translate-y-1/2 left-0 max-w-[66%] w-auto'
        }`}
      >
        <button
          type="button"
          onClick={handleEnterGallery}
          className="pointer-events-auto block w-full text-left bg-black text-white hover:bg-white hover:text-black hover:border-black border border-black rounded-none py-[28px] px-[40px] shadow-2xl transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
          style={{ fontSize: 'clamp(22px, 2.6vw, 52px)', fontWeight: 400 }}
          aria-label="Enter interactive two-level 3D loft gallery"
        >
          <span className="tracking-tight leading-tight block">
            {isTouchDevice ? 'Tap to enter the gallery' : 'Click to enter the gallery'}
          </span>
        </button>
      </div>

      {/* 3. OVERLAY: NAVIGATION HINTS UNDER ENTRY BAR (Preview state) */}
      <div
        className={`absolute z-20 pointer-events-none transition-opacity duration-250 ease-out ${
          isEnteringOrEntered || mode === 'walk' || mode === 'inspect'
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100'
        } ${
          isTablet
            ? 'top-[84%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%]'
            : 'top-[84%] -translate-y-1/2 left-0 pl-[40px] max-w-[85%]'
        }`}
      >
        {!isTouchDevice ? (
          <div
            className="flex items-center gap-6 sm:gap-8 text-neutral-900 font-mono"
            style={{ fontSize: 'clamp(11px, 0.85vw, 14px)' }}
          >
            <div className="flex items-center gap-2.5">
              <ArrowKeysIcon className="w-9 h-6 text-black shrink-0" />
              <span className="leading-snug max-w-[190px] font-medium">
                Use these keys on your keyboard to move around
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <MouseIcon className="w-5 h-7 text-black shrink-0" />
              <span className="leading-snug max-w-[170px] font-medium">
                Move your mouse to look around
              </span>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 text-neutral-900 font-mono"
            style={{ fontSize: 'clamp(11px, 0.85vw, 14px)' }}
          >
            <TouchDragIcon className="w-8 h-8 text-black shrink-0" />
            <span className="leading-snug font-medium">
              Drag to look around · Tap an exhibit to visit it
            </span>
          </div>
        )}
      </div>

      {/* 4. OVERLAY: WALK MODE ACTIVE STATUS PILL WITH DYNAMIC FLOOR LEVEL INDICATOR */}
      {mode === 'walk' && (
        <>
          <div
            className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-full bg-neutral-950/85 backdrop-blur-md border border-white/15 text-white text-xs sm:text-sm font-mono shadow-2xl pointer-events-auto animate-in fade-in duration-200"
            style={{ top: 'calc(clamp(60px, 7.5vh, 80px) + 2vh)' }}
          >
            {/* Dynamic Floor Level Pill */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold tracking-wider text-emerald-300">
                {currentFloor === 1 ? 'UPPER FLOOR' : 'GROUND FLOOR'}
              </span>
            </div>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-300 hidden sm:inline">WASD Move · Drag/Mouse Look</span>
            <button
              type="button"
              onClick={handleExitGallery}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>ESC to leave</span>
            </button>
          </div>

          {/* Thin sightline crosshair dot at screen center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white/80 bg-white/40 pointer-events-none z-20 shadow-xs" />
        </>
      )}

      {/* 5. OVERLAY: INSPECT MODE DETAIL SIDE CARD */}
      {selectedCategory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedCategory.title} Skills Breakdown`}
          className="absolute right-4 z-30 w-[min(380px,calc(100vw-32px))] bg-neutral-950/95 backdrop-blur-xl border border-white/15 rounded-2xl p-6 flex flex-col justify-between shadow-2xl text-white animate-in slide-in-from-right duration-300 pointer-events-auto"
          style={{
            top: 'calc(clamp(60px, 7.5vh, 80px) + 2vh)',
            bottom: 'clamp(16px, 3vh, 32px)'
          }}
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedCategory.color }}
                />
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                  Exhibit // {selectedCategory.id} ({selectedCategory.floor === 1 ? 'Upper Floor' : 'Ground Floor'})
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleCloseInspect}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close skills breakdown"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">
              <h4 className="text-2xl font-black tracking-tight text-white">
                {selectedCategory.title}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 leading-relaxed">
                {selectedCategory.description}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3.5 font-mono">
              {selectedCategory.skills?.map((skill) => (
                <div key={skill.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-200">{skill.name}</span>
                    <span className="text-neutral-400">{skill.level}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${skill.level}%`,
                        backgroundColor: selectedCategory.color || '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCloseInspect}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors font-mono cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to room (ESC)</span>
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Production</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}