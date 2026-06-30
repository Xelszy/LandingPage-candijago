'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ExpandableGallery } from '../components/ui/gallery-animation';
import { ErrorBoundary } from '../components/ErrorBoundary';

import { HalftoneTrail } from '../components/ui/halftone-trail';

const Scene = dynamic(() => import('../components/Scene'), { ssr: false });

// Helpers
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const PORTAL_BG = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779974947/portal_bg_mu60k9.png';
const CURTAIN_LEFT = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975070/curtain_left_cdht6q.png';
const CURTAIN_RIGHT = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975071/curtain_right_a9bn3i.png';
const WORLD_BG = 'https://res.cloudinary.com/dsdhxhhqh/image/upload/v1779975077/world_bg_jzzcn1.jpg';

const CARD_IMAGES = [
  'https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/image/foto_amogaphasa.jpeg',
  'https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/image/foto_raiButo.jpeg',
  'https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/image/foto_tatakan.jpeg',
];

const GALLERY_IMAGES = [
  "https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/image/foto_amogaphasa.jpeg",
  "https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/image/foto_raiButo.jpeg",
  "https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/image/foto_tatakan.jpeg",
];

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Animation Refs
  const worldRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const curtainLeftRef = useRef<HTMLDivElement>(null);
  const curtainRightRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Parallax + State Tracking
  const scrollRef = useRef(0);
  const scrollTargetRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let frame: number;
    let initialDelayPassed = false;
    setTimeout(() => { initialDelayPassed = true; }, 2200);

    let cachedScrollableHeight = 0;

    const updateScrollableHeight = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        cachedScrollableHeight = containerRef.current.parentElement.offsetHeight - window.innerHeight;
      }
    };

    const handleScroll = () => {
      if (cachedScrollableHeight <= 0) {
        updateScrollableHeight();
      }
      const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      if (cachedScrollableHeight > 0) {
        const progress = clamp(scrollTop / cachedScrollableHeight, 0, 1);
        scrollTargetRef.current = progress;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!initialDelayPassed) return;
      const rx = (e.clientX / window.innerWidth) * 2 - 1;
      const ry = (e.clientY / window.innerHeight) * 2 - 1;
      mouseTargetRef.current = { x: rx, y: ry };
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', updateScrollableHeight);

    // Initial measurement
    updateScrollableHeight();

    const tick = () => {
      // Smoothly lerp scroll progress to avoid layout thrashing and make the transition fluid
      scrollRef.current = lerp(scrollRef.current, scrollTargetRef.current, 0.08);

      mouseRef.current.x = lerp(mouseRef.current.x, mouseTargetRef.current.x, 0.07);
      mouseRef.current.y = lerp(mouseRef.current.y, mouseTargetRef.current.y, 0.07);

      const rx = mouseRef.current.x;
      const ry = mouseRef.current.y;

      const progress = scrollRef.current;
      const easedProgress = easeInOut(progress);

      if (worldRef.current) {
        const scale = lerp(1, 1.18, progress);
        worldRef.current.style.transform = `scale(${scale}) translate3d(${rx * 6}px, ${ry * 6}px, 0)`;
      }

      if (portalRef.current) {
        const scale = lerp(1, 7.5, progress);
        portalRef.current.style.transform = `scale(${scale}) translate3d(${rx * 7}px, ${ry * 7}px, 0)`;
        portalRef.current.style.transformOrigin = `52% 38%`;
        portalRef.current.style.opacity = `${clamp(1 - (progress - 0.65) / 0.2, 0, 1)}`;
      }

      if (curtainLeftRef.current) {
        const shiftBase = 62;
        const addShift = easedProgress * (150 - shiftBase);
        const totalShift = shiftBase + addShift;
        const scale = lerp(1, 1.3, progress);
        curtainLeftRef.current.style.transform = `translateX(calc(-${totalShift}% + ${rx * 14}px)) translateY(${ry * 14 * 0.3}px) scale(${scale}) translateZ(0)`;
      }

      if (curtainRightRef.current) {
        const shiftBase = 62;
        const addShift = easedProgress * (150 - shiftBase);
        const totalShift = shiftBase + addShift;
        const scale = lerp(1, 1.3, progress);
        curtainRightRef.current.style.transform = `translateX(calc(${totalShift}% + ${rx * 14}px)) translateY(${ry * 14 * 0.3}px) scale(${scale}) translateZ(0)`;
      }

      if (heroRef.current) {
        const opacity = clamp(1 - progress / 0.22, 0, 1);
        heroRef.current.style.opacity = `${opacity}`;
        heroRef.current.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
      }

      if (ctaRef.current) {
        const opacity = clamp((progress - 0.68) / 0.16, 0, 1);
        ctaRef.current.style.opacity = `${opacity}`;
        ctaRef.current.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';
      }

      frame = requestAnimationFrame(tick);
    };

    handleScroll();
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateScrollableHeight);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <HalftoneTrail 
        className="fixed inset-0 z-[60]"
        cellSize={10}
        color="#ffd700"
        decay={0.96}
        brushSize={0.035}
        hoverBrushSize={0.015}
        opacity={0.7}
        hoverOpacity={0.2}
      />
      <div style={{ height: '550vh', position: 'relative' }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden" ref={containerRef}>

          <div ref={worldRef} className="absolute inset-0 z-0 origin-center will-change-transform">
            <Image src={WORLD_BG} alt="World" fill sizes="100vw" className="object-cover" referrerPolicy="no-referrer" priority />
          </div>

          <div ref={portalRef} className="absolute inset-0 z-10 will-change-transform">
            <Image src={PORTAL_BG} alt="Portal" fill sizes="100vw" className="object-cover" referrerPolicy="no-referrer" priority />
          </div>

          <div
            ref={curtainLeftRef}
            className="absolute top-0 bottom-0 left-0 w-[60%] z-20 origin-left will-change-transform"
            style={{ transition: mounted ? 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none' }}
          >
            <Image src={CURTAIN_LEFT} alt="Curtain" fill sizes="60vw" className="object-cover object-right" referrerPolicy="no-referrer" priority />
          </div>

          <div
            ref={curtainRightRef}
            className="absolute top-0 bottom-0 right-0 w-[60%] z-20 origin-right will-change-transform"
            style={{ transition: mounted ? 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none' }}
          >
            <Image src={CURTAIN_RIGHT} alt="Curtain" fill sizes="60vw" className="object-cover object-left" referrerPolicy="no-referrer" priority />
          </div>

          <nav className="absolute top-0 w-full z-50 flex items-center justify-center pt-8">
            <div className="flex flex-col items-center gap-1.5 pointer-events-auto">
              <StarLogo />
              <span className="font-imprima uppercase tracking-[0.3em] text-[10px] text-white/70">CANDI JAGO</span>
            </div>
          </nav>

          <div
            ref={heroRef}
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s',
            }}
            className="absolute inset-0 z-30 pointer-events-none flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-[60px]"
          >
            {isMobile ? (
              <div className="flex flex-col items-center mt-12 w-full max-w-[280px]">
                <h1 className="font-viaoda text-[#3b1a0a] text-4xl mb-4 tracking-tight text-center">MENGENAL CANDI JAGO</h1>
                <p className="font-imprima text-[#3b1a0a] text-sm text-center mb-10 leading-relaxed">
                  Menelusuri kemegahan Jajaghu, mahakarya arsitektur suci peninggalan Kerajaan Singasari di Malang yang mempersatukan spiritualitas Hindu dan Buddha.
                </p>

                <div className="pointer-events-auto relative rounded-[28px] overflow-hidden w-[240px] h-[240px] shadow-2xl">
                  <Image src={CARD_IMAGES[0]} alt="Card 1" fill sizes="(max-width: 768px) 100vw, 240px" className="object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/80 via-black/30 to-transparent backdrop-blur-[2px]" />
                  <div className="absolute bottom-6 left-6 text-white text-xs font-imprima uppercase tracking-widest flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">▶</div>
                    Jelajah 3D
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="absolute top-[46%] left-[60px] max-w-[440px] -translate-y-1/2">
                  <h1 className="font-viaoda text-white text-6xl lg:text-7xl mb-6 tracking-tight drop-shadow-lg">MENGENAL<br />CANDI JAGO</h1>
                  <p className="font-imprima text-white/90 text-lg leading-relaxed drop-shadow-md">
                    Menelusuri kemegahan Jajaghu, mahakarya arsitektur suci peninggalan Kerajaan Singasari di Malang yang mempersatukan spiritualitas Hindu dan Buddha dalam keheningan relik teras berundak.
                  </p>
                </div>

                <div className="absolute top-[50%] right-[40px] -translate-y-1/2 flex items-center gap-6 pointer-events-auto overflow-x-auto pb-4 max-w-full">
                  <div className="relative rounded-[28px] overflow-hidden min-w-[158px] h-[158px] shadow-2xl shrink-0 group cursor-pointer">
                    <Image src={CARD_IMAGES[0]} alt="Reel" fill sizes="158px" className="object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 via-black/30 to-transparent backdrop-blur-[2px]" />
                    <div className="absolute bottom-4 left-4 text-white text-[10px] uppercase font-imprima tracking-widest flex flex-col gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-md">▶</div>
                      Jelajah 3D
                    </div>
                  </div>

                  <div className="relative rounded-[28px] overflow-hidden min-w-[158px] h-[158px] shadow-2xl shrink-0 group cursor-pointer">
                    <Image src={CARD_IMAGES[1]} alt="Patrons" fill sizes="158px" className="object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 via-black/30 to-transparent backdrop-blur-[2px]" />
                    <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col justify-end">
                      <span className="font-viaoda text-2xl tracking-tight leading-none mb-1">1268</span>
                      <span className="font-imprima text-[10px] uppercase text-white/80 tracking-widest leading-none">Masehi<br />Pembangunan</span>
                    </div>
                  </div>

                  <div className="relative rounded-[28px] overflow-hidden min-w-[158px] h-[158px] shadow-2xl shrink-0 group cursor-pointer">
                    <Image src={CARD_IMAGES[2]} alt="Immersions" fill sizes="158px" className="object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 via-black/30 to-transparent backdrop-blur-[2px]" />
                    <div className="absolute bottom-4 left-4 text-white text-[10px] uppercase font-imprima tracking-widest flex flex-col gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-md">👁</div>
                      Ragam Relief
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="absolute bottom-[60px] left-1/2 md:left-[60px] -translate-x-1/2 md:-translate-x-0 flex gap-2">
              <div className="h-[2px] w-[28px] bg-white rounded-full"></div>
              <div className="h-[2px] w-[14px] bg-white/40 rounded-full"></div>
              <div className="h-[2px] w-[14px] bg-white/40 rounded-full"></div>
              <div className="h-[2px] w-[14px] bg-white/40 rounded-full"></div>
            </div>

            {!isMobile && (
              <div className="absolute bottom-[36px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                <span className="font-imprima uppercase text-[10px] tracking-[0.22em] text-white/60">Descend</span>
                <div className="w-[34px] h-[34px] rounded-full border border-white/20 flex flex-col items-center justify-center animate-bob">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="text-white">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div
            ref={ctaRef}
            className="absolute inset-0 z-40 pointer-events-none flex flex-col items-center justify-center px-6 pt-16 pb-8"
            style={{ opacity: 0 }}
          >
            <h2 className="font-viaoda text-[clamp(32px,5vw,56px)] text-white tracking-[0.03em] leading-[1.05] drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)] text-center mb-3">
              TEMUKAN JAJAGHU
            </h2>
            <p className="font-imprima text-[14px] md:text-[18px] max-w-[260px] md:max-w-[540px] leading-[1.5] text-white/80 text-center mb-4 drop-shadow-md mt-2">
              Gerbang dimensi menuju petualangan masa lalu Kerajaan Singasari. Sebuah representasi suci yang melintasi relung sejarah Malang.
            </p>

            {/* Enhanced Canvas for the GLB model */}
            <div className="pointer-events-auto w-full max-w-[700px] mt-2 relative flex items-center justify-center">
              <div className="h-[300px] md:h-[400px] w-full relative rounded-xl hover:cursor-grab active:cursor-grabbing">
                <ErrorBoundary>
                  {mounted && (
                    <Scene
                      scale={6.30}
                      position={[0, -0.50, 0]}
                      modelPosition={[0, 2.10, 0]}
                      cameraPos={[0, 5.0, 14.0]}
                      enableZoom={false}
                    />
                  )}
                </ErrorBoundary>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Info Section */}
      <div className="relative bg-[#0a0608] z-50 text-white pb-32">
        {/* Decorative transition line */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-5xl mx-auto px-6 pt-24 md:pt-32">
          <div className="flex flex-col md:flex-row gap-16 md:gap-24">
            <div className="flex-1">
              <h2 className="font-viaoda text-[42px] leading-tight mb-8">
                Keagungan Jajaghu
              </h2>
              <div className="font-imprima text-white/80 space-y-6 text-base md:text-lg leading-relaxed">
                <p>
                  Menurut kitab Negarakertagama pupuh 41:4 dan Pararaton, dijelaskan nama Candi Jago adalah Jajaghu. Jajaghu artinya keagungan. Istilah tersebut digunakan untuk menyebut tempat suci. Candi ini pertama kali ditemukan Belanda pada 1834. Pembangunan candi ini telah dilakukan sejak 1268 M hingga 1280 M.
                </p>
                <p>
                  Berdasarkan sumber yang ada, candi ini dibangun Kartanegara sebagai tanda penghormatan bagi Raja Singhasari ke-4, yaitu Sri Jaya Wisnuwardhana, yang merupakan ayahandanya.
                </p>
                <p>
                  Bangunan Candi Jago menghadap ke arah barat, yang berdiri di atas batu setinggi 1 meter dan kaki candi terdiri atas tiga teras bertingkat. Makin ke atas teras kaki candi, maka makin kecil hingga di lantai pertama maupun kedua terdapat selesar yang dapat dilewati untuk mengelilingi candi.
                </p>
              </div>
            </div>

            <div className="w-full md:w-[45%] flex items-center">
              {/* Some decorative graphic or small related image/stat */}
              <div className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm w-full">
                <h3 className="uppercase tracking-[0.2em] text-xs text-white/50 mb-6 font-imprima">Candi Jago (Jajaghu)</h3>
                <div className="space-y-4 font-imprima text-sm text-white/90">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="text-white/60 uppercase text-[10px] tracking-widest">Dibangun</span> <span>1268 - 1280 M</span></div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 pt-1"><span className="text-white/60 uppercase text-[10px] tracking-widest">Penghormatan</span> <span className="text-right">Sri Jaya Wisnuwardhana</span></div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 pt-1"><span className="text-white/60 uppercase text-[10px] tracking-widest">Ditemukan</span> <span>1834</span></div>
                  <div className="flex items-center justify-between pb-1 pt-1"><span className="text-white/60 uppercase text-[10px] tracking-widest">Arah</span> <span>Menghadap Barat</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Beberapa Peninggalan di Candi Jago Section */}
          <div className="mt-32 border-t border-white/5 pt-24">
            <div className="text-center mb-16">
              <span className="font-imprima uppercase tracking-[0.3em] text-[11px] text-zinc-500">Khasanah Arkeologis</span>
              <h2 className="font-viaoda text-[42px] leading-tight mt-2 text-white/95">
                Beberapa Peninggalan di Candi Jago
              </h2>
              <div className="w-12 h-px bg-white/20 mx-auto mt-4" />
            </div>

            {/* Arca Kala & Padmasana Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

              {/* Arca Kala */}
              <div className="flex flex-col rounded-3xl bg-zinc-900/30 border border-white/5 p-6 hover:border-white/10 transition-colors duration-500">
                <h3 className="font-viaoda text-2xl mb-4 text-center text-white/90">Arca Kala</h3>
                <div className="h-[320px] w-full relative rounded-2xl bg-black/20 overflow-hidden hover:cursor-grab active:cursor-grabbing mb-6">
                  <ErrorBoundary fallback={
                    <div className="flex items-center justify-center h-full p-4 bg-black/10 border border-white/5 rounded-xl border-dashed">
                      <p className="text-white/50 font-imprima text-xs tracking-widest text-center">ARCA KALA MODEL UNAVAILABLE</p>
                    </div>
                  }>
                    {mounted && (
                      <Scene
                        url="https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/Meshy_AI_Demon_Guardian_Stone__0609171559_texture-compressed.glb"
                        scale={1.8}
                        position={[0, -0.6, 0]}
                        modelPosition={[0, 0, 0]}
                        cameraPos={[0, 0, 7]}
                        autoRotate={true}
                        autoRotateSpeed={0.4}
                        enableZoom={false}
                      />
                    )}
                  </ErrorBoundary>
                </div>
                <p className="font-imprima text-sm md:text-[15px] text-zinc-300/90 leading-relaxed flex-grow">
                  Arca Kala di Candi Jago (atau Candi Jajaghu di Malang) adalah relief atau arca wajah raksasa khas periode Jawa Timur yang berfungsi sebagai penolak bala dan pelindung spiritual. Karakteristik utamanya meliputi wujud yang menyeramkan dengan taring menyeringai, mata melotot, dan umumnya memiliki rahang bawah.
                </p>
              </div>

              {/* Padmasana */}
              <div className="flex flex-col rounded-3xl bg-zinc-900/30 border border-white/5 p-6 hover:border-white/10 transition-colors duration-500">
                <h3 className="font-viaoda text-2xl mb-4 text-center text-white/90">Padmasana</h3>
                <div className="h-[320px] w-full relative rounded-2xl bg-black/20 overflow-hidden hover:cursor-grab active:cursor-grabbing mb-6">
                  <ErrorBoundary fallback={
                    <div className="flex items-center justify-center h-full p-4 bg-black/10 border border-white/5 rounded-xl border-dashed">
                      <p className="text-white/50 font-imprima text-xs tracking-widest text-center">PADMASANA MODEL UNAVAILABLE</p>
                    </div>
                  }>
                    {mounted && (
                      <Scene
                        url="https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/tatakan%20arca%20dewi%20budha.glb"
                        scale={2.2}
                        position={[0, -0.5, 0]}
                        modelPosition={[0, 0, 0]}
                        cameraPos={[0, 1, 8]}
                        autoRotate={true}
                        autoRotateSpeed={0.4}
                        enableZoom={false}
                      />
                    )}
                  </ErrorBoundary>
                </div>
                <p className="font-imprima text-sm md:text-[15px] text-zinc-300/90 leading-relaxed flex-grow">
                  Di kompleks Candi Jago, Padmasana merujuk pada struktur batu di pelataran depan yang dipahat menyerupai singgasana atau alas duduk tanpa sandaran. Candi peninggalan Kerajaan Singasari abad ke-13 ini memadukan konsep Hindu-Buddha dengan gaya teras punden berundak. Berupa sebuah batu besar yang dipahat khusus, diyakini berfungsi sebagai alas pemujaan atau singgasana suci.
                </p>
              </div>

            </div>

            {/* Amoghapasa (Centerpiece) */}
            <div className="mt-16 w-full rounded-3xl border border-white/5 bg-[#120a0d]/40 p-8 md:p-12 relative overflow-hidden shadow-2xl backdrop-blur-[2px]">
              {/* Top decorative subtle element */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent" />

              <div className="text-center mb-8">
                <span className="font-imprima uppercase tracking-[0.25em] text-[10px] text-zinc-500">Arca Kebajikan Agung</span>
                <h3 className="font-viaoda text-3xl md:text-4xl text-white tracking-[0.03em] mt-2">Amoghapasa</h3>
                <div className="w-8 h-px bg-white/10 mx-auto mt-3" />
              </div>

              {/* Giant Center Model View */}
              <div className="h-[400px] md:h-[500px] w-full max-w-2xl mx-auto relative rounded-2xl bg-black/30 overflow-hidden border border-white/5 hover:cursor-grab active:cursor-grabbing mb-8">
                <ErrorBoundary fallback={
                  <div className="flex items-center justify-center h-full p-4 bg-black/10 border border-white/5 rounded-xl border-dashed">
                    <p className="text-white/50 font-imprima text-xs tracking-widest text-center">AMOGHAPASA MODEL UNAVAILABLE</p>
                  </div>
                }>
                  {mounted && (
                    <Scene
                      url="https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/arca_amoghapasa_candi_jago-compressed.glb"
                      scale={0.45}
                      position={[0, -1.2, 0]}
                      modelPosition={[0, 0, 0]}
                      cameraPos={[0, 1.2, 7]}
                      autoRotate={true}
                      autoRotateSpeed={0.3}
                      enableZoom={false}
                    />
                  )}
                </ErrorBoundary>
              </div>

              {/* Amoghapasa explanation */}
              <div className="max-w-2xl mx-auto text-center">
                <p className="font-imprima text-sm md:text-base text-zinc-300/95 leading-relaxed">
                  Arca Amoghapasa di Candi Jago merupakan perwujudan utama dari Bodhisatwa Awalokiteswara dalam tradisi Buddha Mahayana Tantra, yang melambangkan kasih sayang tanpa batas untuk menuntun dan menyelamatkan seluruh makhluk hidup. Kehadirannya melambangkan kedalaman filosofis spiritual kerajaan Singasari yang melampaui sekat keduniawian.
                </p>
              </div>

              {/* Small credit bottom-right / bottom-mid */}
              <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-imprima text-[10px] text-zinc-600 tracking-wider">REPLIKA DIGITAL 3D</span>
                <p className="text-[10px] text-zinc-500 font-sans text-center sm:text-right leading-relaxed max-w-sm sm:max-w-md">
                  &ldquo;Arca Amoghapasa Candi Jago&rdquo; (<a href="https://skfb.ly/oVpVs" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300 transition-colors">https://skfb.ly/oVpVs</a>) by reovany is licensed under <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300 transition-colors">Creative Commons Attribution</a>.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-32">
            <h3 className="font-viaoda text-3xl mb-12 text-center text-white/90">Galeri Jejak Waktu</h3>
            <ExpandableGallery images={GALLERY_IMAGES} className="w-full" />
          </div>
        </div>
      </div>
    </>
  );
}

function StarLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2L15.9387 10.0613L24 12L15.9387 13.9387L14 22L12.0613 13.9387L4 12L12.0613 10.0613L14 2Z" fill="white" fillOpacity="0.9" />
    </svg>
  );
}
