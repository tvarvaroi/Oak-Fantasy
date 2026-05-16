'use client';

import { useRef, useEffect, Suspense, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/* ──────────────────────────────────────────────────────────────────
   OAK TEXTURE — high-res 1024×1024 canvas procedural
   Mimics Romanian white oak: warm honey-blonde ground, parallel long
   grain lines with subtle undulation, ray flecks, small knot.
   Returns { map, normalMap } — caller must dispose both.
────────────────────────────────────────────────────────────────── */

async function buildOakTextures(): Promise<{
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
}> {
  const S = 1024;

  /* ── Colour / albedo map ─────────────────────────────────── */
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const ctx = c.getContext('2d')!;

  /* base — warm oiled-oak honey tone */
  ctx.fillStyle = '#C8955A';
  ctx.fillRect(0, 0, S, S);

  /* lighten upper area (light source from top-left in product photo) */
  const topGrad = ctx.createLinearGradient(0, 0, S * 0.5, S);
  topGrad.addColorStop(0, 'rgba(255,220,160,0.28)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, S, S);

  /* ── Long grain lines ─────────────────────────────────────
     Oak grain runs across the long axis (horizontal on the board).
     We draw ~140 lines with varied spacing and small per-pixel noise.
  ─────────────────────────────────────────────────────────── */
  const grainPalette = [
    'rgba(140,80,30,0.22)',
    'rgba(120,70,25,0.18)',
    'rgba(160,100,45,0.20)',
    'rgba(100,58,20,0.25)',
    'rgba(180,120,60,0.14)',
    'rgba(90,50,15,0.28)',
    'rgba(200,140,70,0.12)',
  ];

  for (let i = 0; i < 160; i++) {
    const y0 = (i / 160) * S;
    const palette = grainPalette[i % grainPalette.length];
    const lw = 0.6 + Math.random() * 2.8;

    ctx.beginPath();
    ctx.strokeStyle = palette;
    ctx.lineWidth = lw;
    ctx.globalAlpha = 0.5 + Math.random() * 0.5;

    /* each grain line is a multi-segment path with small y-offsets */
    let py = y0 + (Math.random() - 0.5) * 6;
    ctx.moveTo(0, py);
    for (let x = 0; x <= S; x += 4) {
      py += (Math.random() - 0.5) * 1.1;
      /* slight macro wave across the board */
      const wave = Math.sin(x * 0.007 + i * 0.35) * 4;
      ctx.lineTo(x, y0 + wave + (py - y0) * 0.3);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  /* ── Ray flecks (medullary rays) — short vertical dashes ── */
  ctx.globalAlpha = 0.12;
  for (let n = 0; n < 60; n++) {
    const fx = Math.random() * S;
    const fy = Math.random() * S;
    const fh = 14 + Math.random() * 32;
    const fw = 2 + Math.random() * 4;
    ctx.fillStyle = 'rgba(255,200,120,0.6)';
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate((Math.random() - 0.5) * 0.12);
    ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  /* ── Two small knots ────────────────────────────────────── */
  const knots = [
    { x: S * 0.72, y: S * 0.28, r: 9 },
    { x: S * 0.68, y: S * 0.71, r: 7 },
  ];
  for (const k of knots) {
    const kg = ctx.createRadialGradient(k.x, k.y, 0, k.x, k.y, k.r * 3.5);
    kg.addColorStop(0,   'rgba(55,28,8,0.85)');
    kg.addColorStop(0.18,'rgba(80,40,15,0.7)');
    kg.addColorStop(0.5, 'rgba(120,65,25,0.35)');
    kg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = kg;
    ctx.beginPath();
    ctx.ellipse(k.x, k.y, k.r * 3.5, k.r * 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── Routed channel groove on main face ────────────────────
     The product has a shallow routed border groove ~6mm from edge.
     On the texture we fake it with a thin darker rectangle.
  ─────────────────────────────────────────────────────────── */
  const gInset = S * 0.06; /* ~6% inset = ~60px on 1024 */
  ctx.strokeStyle = 'rgba(80,42,15,0.45)';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.7;
  ctx.strokeRect(gInset, gInset, S - gInset * 2, S - gInset * 2);
  ctx.globalAlpha = 1;

  /* ── Logo engraving — pyrography burn of the Oak Fantasy badge ──
     Load the logo JPEG, desaturate it, then composite with
     'multiply' blending so only the dark parts burn into the wood.
     Positioned centre-right of the board face.
  ─────────────────────────────────────────────────────────── */
  await new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const logoSize = S * 0.56;
      const logoX = S * 0.54 - logoSize / 2;
      const logoY = S * 0.50 - logoSize / 2;

      /* offscreen canvas to desaturate + invert-burn the logo */
      const lc = document.createElement('canvas');
      lc.width = logoSize; lc.height = logoSize;
      const lctx = lc.getContext('2d')!;

      /* draw logo scaled into offscreen canvas */
      lctx.drawImage(img, 0, 0, logoSize, logoSize);

      /* desaturate to grayscale */
      const id = lctx.getImageData(0, 0, logoSize, logoSize);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
        /* remap: light areas → transparent (wood shows), dark areas → burn brown */
        const burn = 1 - gray / 255;
        d[i]   = Math.round(40  + burn * 30);   /* R — dark warm brown */
        d[i+1] = Math.round(20  + burn * 10);   /* G */
        d[i+2] = Math.round(5   + burn * 5);    /* B */
        d[i+3] = Math.round(burn * burn * 230); /* alpha: only dark areas visible */
      }
      lctx.putImageData(id, 0, 0);

      /* stamp onto main texture with multiply-like compositing */
      ctx.save();
      ctx.globalAlpha = 0.82;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(lc, logoX, logoY, logoSize, logoSize);
      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      resolve();
    };
    img.onerror = () => resolve(); /* graceful fallback if image unavailable */
    img.src = '/WhatsApp_Image_2026-05-14_at_20.59.06.jpeg';
  });

  /* ── Subtle vignette ───────────────────────────────────── */
  const vig = ctx.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S * 0.8);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(30,15,5,0.22)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, S, S);

  const map = new THREE.CanvasTexture(c);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 16;

  /* ── Normal map ──────────────────────────────────────────
     Encode grain direction as surface normals:
     - horizontal grain → tilt normal slightly left/right
     - knots → circular dimple
     - groove → normal dip at groove edges
  ─────────────────────────────────────────────────────────── */
  const nc = document.createElement('canvas');
  nc.width = S; nc.height = S;
  const nctx = nc.getContext('2d')!;

  /* flat neutral normal = (128, 128, 255) */
  nctx.fillStyle = `rgb(128,128,255)`;
  nctx.fillRect(0, 0, S, S);

  const ndata = nctx.getImageData(0, 0, S, S);
  const px = ndata.data;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const idx = (y * S + x) * 4;

      /* grain ridges: horizontal wave → R channel (x-normal) */
      const grainPhase = Math.sin(y * 0.065 + Math.sin(y * 0.004) * 12) * 14;
      const grainSlope = Math.cos(y * 0.065 + Math.sin(y * 0.004) * 12) * 0.9;
      const rVal = 128 + grainSlope * 18;

      /* add fine micro-grain noise to B (z height) */
      const noise = (Math.sin(x * 0.8 + y * 1.1) * 0.5 + Math.sin(x * 2.3 - y * 0.7) * 0.3) * 6;
      const bVal = 220 + noise;

      /* groove indentation — darken B near groove rectangle */
      const gi = S * 0.06;
      const nearGroove =
        (Math.abs(x - gi) < 5 || Math.abs(x - (S - gi)) < 5 ||
         Math.abs(y - gi) < 5 || Math.abs(y - (S - gi)) < 5)
          ? 1 : 0;
      const grooveBump = nearGroove * 14;

      /* knot dimples */
      let kDip = 0;
      for (const k of knots) {
        const dx = x - k.x, dy = y - k.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < k.r * 3) {
          kDip = Math.max(kDip, ((k.r * 3 - dist) / (k.r * 3)) * 18);
        }
      }

      px[idx]     = Math.min(255, Math.max(0, rVal));           /* R — x-normal */
      px[idx + 1] = 128;                                         /* G — y-normal flat */
      px[idx + 2] = Math.min(255, Math.max(180, bVal + grooveBump - kDip)); /* B — z-normal */
      px[idx + 3] = 255;
    }
  }

  nctx.putImageData(ndata, 0, 0);
  const normalMap = new THREE.CanvasTexture(nc);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

  return { map, normalMap };
}

/* ──────────────────────────────────────────────────────────────────
   BOARD GEOMETRY — matches product photo:
   - Main rectangle with large rounded corners
   - Left side: carved semi-circle + slot handle cutout
   We approximate with Three.js primitives layered together.
────────────────────────────────────────────────────────────────── */

function Board({ mouseRef }: { mouseRef: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef   = useRef<THREE.MeshStandardMaterial | null>(null);
  const matEdge  = useRef<THREE.MeshStandardMaterial | null>(null);

  const [textures, setTextures] = useState<{ map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    buildOakTextures().then((t) => {
      if (!cancelled) setTextures(t);
    });
    return () => {
      cancelled = true;
      textures?.map.dispose();
      textures?.normalMap.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    /* slow auto-rotate + mouse influence */
    const autoY   = t * (Math.PI * 2 / 22);
    const targetX = -mouseRef.current.y * (Math.PI / 10);
    const targetY =  mouseRef.current.x * (Math.PI / 10);

    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.055;
    groupRef.current.rotation.y += (autoY + targetY - groupRef.current.rotation.y) * 0.028;
    groupRef.current.position.y  = Math.sin(t * 0.8) * 0.07;
  });

  /* shared PBR wood material */
  const woodMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color:      new THREE.Color('#C8955A'),
      roughness:  0.85,
      metalness:  0.0,
      map:        textures?.map ?? null,
      normalMap:  textures?.normalMap ?? null,
      normalScale: new THREE.Vector2(0.55, 0.55),
    });
    return m;
  }, [textures]);

  /* edge material — same wood, slightly darker (side grain) */
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:     new THREE.Color('#9A6A38'),
    roughness: 0.88,
    metalness: 0.0,
  }), []);

  /* The board is 3.6 wide × 2.0 tall × 0.17 thick in scene units.
     The handle/C-shape is on the LEFT side in the photo but we orient
     the board so the main face faces the camera. */
  const W = 3.6, H = 2.0, D = 0.17;

  /* Left C-cutout: we subtract a cylinder from the left edge using a
     dark cylinder positioned to peek through and a matching dark back-cap. */
  const cR  = 0.58; /* radius of the rounded C cutout */
  const cX  = -W / 2 + cR * 0.65; /* centre — slightly left of edge */

  /* Slot handle: narrow oval punched near the left edge top */
  const slotW = 0.18, slotH = 0.48;

  return (
    <group ref={groupRef}>
      {/* ── Main board face ──────────────────────────────── */}
      <RoundedBox
        args={[W, H, D]}
        radius={0.12}
        smoothness={5}
        castShadow
        receiveShadow
      >
        <primitive object={woodMat} attach="material" />
      </RoundedBox>

      {/* ── Left C-cutout visual: dark interior cylinder ─── */}
      {/* We can't boolean-subtract in R3F without CSG, so we fake it:
          Place a dark rounded disc at the C position to simulate the
          routed-away hollow, slightly proud of the board face */}
      <mesh position={[cX, 0.18, D / 2 + 0.001]} castShadow>
        <circleGeometry args={[cR, 40]} />
        <meshStandardMaterial color="#4a2c0e" roughness={0.92} metalness={0} />
      </mesh>
      {/* back face of hole */}
      <mesh position={[cX, 0.18, -D / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[cR, 40]} />
        <meshStandardMaterial color="#3a2008" roughness={0.95} metalness={0} />
      </mesh>
      {/* cylinder interior wall */}
      <mesh position={[cX, 0.18, 0]}>
        <cylinderGeometry args={[cR, cR, D + 0.01, 40, 1, true]} />
        <meshStandardMaterial color="#3a2008" roughness={0.95} metalness={0} side={THREE.BackSide} />
      </mesh>

      {/* ── Slot handle: dark oval pill ─────────────────── */}
      <mesh position={[cX, 0.18, D / 2 + 0.002]} castShadow>
        <capsuleGeometry args={[slotW / 2, slotH - slotW, 8, 16]} />
        <meshStandardMaterial color="#2c1506" roughness={0.95} metalness={0} />
      </mesh>
      {/* slot back */}
      <mesh position={[cX, 0.18, -D / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
        <capsuleGeometry args={[slotW / 2, slotH - slotW, 8, 16]} />
        <meshStandardMaterial color="#2c1506" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Routed border groove ─────────────────────────
          Thin, darker recessed rectangle just inside the board edge.
          We fake it with a slightly inset plane + dark ring. */}
      <mesh position={[0, 0, D / 2 + 0.002]}>
        <ringGeometry args={[
          Math.min(W, H) / 2 - 0.23,
          Math.min(W, H) / 2 - 0.07,
          4,   /* segments per side — square ring */
          1,
        ]} />
        <meshStandardMaterial color="#7a4820" roughness={0.9} metalness={0} transparent opacity={0.55} />
      </mesh>

      {/* ── Copper highlight sheen ───────────────────────
          Very subtle oiled-wood sheen layer */}
      <mesh position={[0.05, 0.05, D / 2 + 0.003]}>
        <planeGeometry args={[W * 0.9, H * 0.9]} />
        <meshStandardMaterial
          color="#E8B060"
          transparent
          opacity={0.045}
          roughness={0.3}
          metalness={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function ShadowPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]} receiveShadow>
      <planeGeometry args={[14, 14]} />
      <shadowMaterial transparent opacity={0.22} />
    </mesh>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div style={{ width: 200, height: 120, backgroundColor: '#C8955A', borderRadius: 12, opacity: 0.3 }} />
    </div>
  );
}

export default function CuttingBoard3D() {
  const mouseRef    = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = {
        x: (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2),
        y: (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2),
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0.3, 5.2], fov: 36 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          {/* warm ambient — golden hour */}
          <ambientLight color="#FFD899" intensity={1.1} />

          {/* key light — top-left (matches product photo sun position) */}
          <directionalLight
            color="#FFF5E0"
            intensity={2.2}
            position={[-4, 5, 3]}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />

          {/* fill light — right side, cooler */}
          <directionalLight color="#C8E0FF" intensity={0.5} position={[4, 2, 2]} />

          {/* warm under-bounce */}
          <pointLight color="#B87333" intensity={0.6} position={[1, -2, 2]} />

          {/* rim light from behind — separates board from background */}
          <pointLight color="#FFE0A0" intensity={0.35} position={[-1, 1, -4]} />

          <ShadowPlane />
          <Board mouseRef={mouseRef} />
        </Canvas>
      </Suspense>
    </div>
  );
}
