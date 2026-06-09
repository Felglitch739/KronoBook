import React, { useEffect, useRef } from 'react';

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particles list configuration
    const isMobile = width < 768;
    const particleCount = isMobile ? 30 : 65;
    const connectionDistance = 110;
    const mouseRadius = 150;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }

    const particles: Particle[] = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35, // slow float speed
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 1.2, // particle size
        alpha: Math.random() * 0.3 + 0.15, // base opacity
      });
    }

    const mouse = {
      x: null as number | null,
      y: null as number | null,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Main draw and update loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw particles & update
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce/Wrap boundaries
        if (p.x < 0 || p.x > width) p.vx = -p.vx;
        if (p.y < 0 || p.y > height) p.vy = -p.vy;

        // Interaction with mouse
        let displayAlpha = p.alpha;
        let currentRadius = p.radius;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius) {
            // Increase visibility and size sutilly when mouse is close
            const factor = 1 - dist / mouseRadius;
            displayAlpha = p.alpha + factor * 0.55;
            currentRadius = p.radius + factor * 1.2;

            // Subtle pull towards mouse
            p.x += dx * factor * 0.012;
            p.y += dy * factor * 0.012;
          }
        }

        // Draw node (Celeste color #38bdf8)
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${displayAlpha * 0.22})`; // Celeste sky-400 theme node
        ctx.fill();
      }

      // 2. Draw connections (lines) between close particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alphaFactor = 1 - dist / connectionDistance;
            
            // Check connection to mouse to boost line opacity if close to mouse
            let mouseInfluence = 1.0;
            if (mouse.x !== null && mouse.y !== null) {
              const mDist1 = Math.sqrt((mouse.x - p1.x) ** 2 + (mouse.y - p1.y) ** 2);
              const mDist2 = Math.sqrt((mouse.x - p2.x) ** 2 + (mouse.y - p2.y) ** 2);
              if (mDist1 < mouseRadius || mDist2 < mouseRadius) {
                mouseInfluence = 1.6;
              }
            }

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alphaFactor * 0.07 * mouseInfluence})`;
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }

        // 3. Draw direct connection to mouse if mouse is close
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p1.x;
          const dy = mouse.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRadius) {
            const alphaFactor = 1 - dist / mouseRadius;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alphaFactor * 0.12})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
      {/* Glow blobs that drift and scale slowly for deep space aesthetics */}
      <div className="absolute top-[-15%] left-[-15%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-br from-sky-500/8 to-indigo-500/0 blur-[130px] mix-blend-screen pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-purple-500/5 to-sky-500/4 blur-[130px] mix-blend-screen pointer-events-none animate-pulse-slow" style={{ animationDelay: '2.5s' }} />
    </div>
  );
};
