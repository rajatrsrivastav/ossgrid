"use client";

import { useEffect, useRef } from "react";

interface GlobeCanvasProps {
  className?: string;
}

export default function GlobeCanvas({ className = "" }: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let rotation = 0;

    // Target rotation speed
    const rotationSpeed = prefersReducedMotion ? 0 : 0.0035;

    // Generate points on sphere surface (Fibonacci sphere distribution)
    const POINT_COUNT = 320;
    const points: { x: number; y: number; z: number; size: number; alpha: number }[] = [];

    for (let i = 0; i < POINT_COUNT; i++) {
      const y = 1 - (i / (POINT_COUNT - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = 0.1 * i * Math.PI * 2; // Golden ratio spiral

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Randomize particle size & brightness slightly
      points.push({
        x,
        y,
        z,
        size: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.4 + 0.6,
      });
    }

    // Interactive mouse tilt
    let targetTiltX = 0.25; // default slight tilt
    let targetTiltY = 0;
    let currentTiltX = targetTiltX;
    let currentTiltY = targetTiltY;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetTiltY = nx * 0.4;
      targetTiltX = 0.25 + ny * 0.3;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const sphereRadius = Math.min(width, height) * 0.40;

      // Smooth tilt easing
      currentTiltX += (targetTiltX - currentTiltX) * 0.05;
      currentTiltY += (targetTiltY - currentTiltY) * 0.05;

      rotation += rotationSpeed;

      const isLight = document.documentElement.getAttribute("data-theme") === "light";

      // 1. Atmospheric Outer Glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        sphereRadius * 0.7,
        centerX,
        centerY,
        sphereRadius * 1.4
      );
      if (isLight) {
        glowGrad.addColorStop(0, "rgba(59, 130, 246, 0.12)");
        glowGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.05)");
        glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      } else {
        glowGrad.addColorStop(0, "rgba(59, 130, 246, 0.18)");
        glowGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.08)");
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      }

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // 2. Planet Silhouette with Inner Radial Gradient
      const planetGrad = ctx.createRadialGradient(
        centerX - sphereRadius * 0.35,
        centerY - sphereRadius * 0.35,
        sphereRadius * 0.1,
        centerX,
        centerY,
        sphereRadius
      );
      if (isLight) {
        // Luminous frosted optical glass sphere with volume & depth
        planetGrad.addColorStop(0, "#ffffff");
        planetGrad.addColorStop(0.45, "#f1f6fd");
        planetGrad.addColorStop(0.8, "#dbeafe");
        planetGrad.addColorStop(1, "#bfdbfe");
      } else {
        // Deep obsidian midnight sphere
        planetGrad.addColorStop(0, "#121b33");
        planetGrad.addColorStop(0.6, "#0c1326");
        planetGrad.addColorStop(1, "#070b16");
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius, 0, Math.PI * 2);
      ctx.fillStyle = planetGrad;
      ctx.fill();

      // Atmospheric rim light
      ctx.lineWidth = isLight ? 1.5 : 2;
      ctx.strokeStyle = isLight ? "rgba(37, 99, 235, 0.35)" : "rgba(96, 165, 250, 0.5)";
      ctx.stroke();

      // Clip inside sphere for longitude & latitude lines
      ctx.clip();

      // 3. Draw Longitude & Latitude Arcs
      const latCount = 6;
      ctx.lineWidth = 1;
      const arcStroke = isLight ? "rgba(37, 99, 235, 0.2)" : "rgba(79, 142, 255, 0.12)";
      ctx.strokeStyle = arcStroke;

      for (let i = 1; i < latCount; i++) {
        const phi = (i / latCount) * Math.PI - Math.PI / 2;
        const latY = Math.sin(phi) * sphereRadius;
        const latRadius = Math.cos(phi) * sphereRadius;

        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY + latY,
          latRadius,
          latRadius * 0.28,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Longitude meridians for richer 3D sphere volume
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, sphereRadius * 0.4, sphereRadius, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, sphereRadius * 0.75, sphereRadius, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Transform and draw 3D Points
      const cosR = Math.cos(rotation + currentTiltY);
      const sinR = Math.sin(rotation + currentTiltY);
      const cosX = Math.cos(currentTiltX);
      const sinX = Math.sin(currentTiltX);

      // Sort points by depth (Z) for correct rendering
      const transformedPoints = points.map((p) => {
        // Rotate around Y axis
        const x1 = p.x * cosR - p.z * sinR;
        const z1 = p.x * sinR + p.z * cosR;

        // Rotate around X axis (tilt)
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        return {
          px: centerX + x1 * sphereRadius,
          py: centerY + y2 * sphereRadius,
          z: z2,
          size: p.size,
          alpha: p.alpha,
        };
      });

      transformedPoints.sort((a, b) => a.z - b.z);

      for (const p of transformedPoints) {
        // Only draw points on the visible or slightly back-lit hemisphere
        const depthNorm = (p.z + 1) / 2; // 0 (back) to 1 (front)
        if (depthNorm < 0.15) continue;

        const alpha = Math.max(0, depthNorm * p.alpha);
        const radius = p.size * (0.6 + depthNorm * 0.8);

        if (isLight) {
          // Vibrant cobalt / sapphire nodes in light mode
          ctx.fillStyle = `rgba(29, 78, 216, ${Math.max(0.2, alpha * 0.85)})`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
          ctx.fill();

          if (depthNorm > 0.75) {
            ctx.fillStyle = `rgba(37, 99, 235, ${alpha * 0.95})`;
            ctx.beginPath();
            ctx.arc(p.px, p.py, radius * 0.65, 0, Math.PI * 2);
            ctx.fill();
            // Tiny bright specular highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.beginPath();
            ctx.arc(p.px, p.py, radius * 0.25, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Luminous cyan / light blue nodes in dark mode
          ctx.fillStyle = `rgba(147, 197, 253, ${alpha * 0.85})`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
          ctx.fill();

          if (depthNorm > 0.75) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(p.px, p.py, radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore(); // Exit sphere clipping

      // 5. Orbital Outer Trajectory Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.35 + currentTiltY * 0.3);
      ctx.scale(1, 0.35);

      ctx.lineWidth = 1.5;
      const ringGrad = ctx.createLinearGradient(
        -sphereRadius * 1.5,
        0,
        sphereRadius * 1.5,
        0
      );
      if (isLight) {
        ringGrad.addColorStop(0, "rgba(37, 99, 235, 0)");
        ringGrad.addColorStop(0.3, "rgba(37, 99, 235, 0.45)");
        ringGrad.addColorStop(0.7, "rgba(124, 58, 237, 0.5)");
        ringGrad.addColorStop(1, "rgba(37, 99, 235, 0)");
      } else {
        ringGrad.addColorStop(0, "rgba(59, 130, 246, 0)");
        ringGrad.addColorStop(0.3, "rgba(96, 165, 250, 0.4)");
        ringGrad.addColorStop(0.7, "rgba(167, 139, 250, 0.5)");
        ringGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
      }

      ctx.strokeStyle = ringGrad;
      ctx.beginPath();
      ctx.arc(0, 0, sphereRadius * 1.35, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting particle on the trajectory ring
      const orbitAngle = rotation * 2.5;
      const orbitX = Math.cos(orbitAngle) * sphereRadius * 1.35;
      const orbitY = Math.sin(orbitAngle) * sphereRadius * 1.35;

      if (isLight) {
        ctx.fillStyle = "#1d4ed8";
        ctx.shadowColor = "rgba(37, 99, 235, 0.6)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#60a5fa";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
}
