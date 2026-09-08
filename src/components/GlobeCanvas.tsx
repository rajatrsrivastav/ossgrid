"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface GlobeCanvasProps {
  className?: string;
}

export default function GlobeCanvas({ className = "" }: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme, theme } = useTheme();
  const themeRef = useRef<string>(resolvedTheme || theme || "dark");

  // Keep themeRef immediately in sync with React state
  useEffect(() => {
    themeRef.current = resolvedTheme || theme || "dark";
  }, [resolvedTheme, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let rotation = 0;

    // Smooth, noticeable rotation speed (~19s per full revolution)
    const rotationSpeed = 0.0055;

    // Generate points on sphere surface (Fibonacci sphere distribution)
    const POINT_COUNT = 320;
    const points: { x: number; y: number; z: number; size: number; alpha: number }[] = [];

    for (let i = 0; i < POINT_COUNT; i++) {
      const y = 1 - (i / (POINT_COUNT - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = 0.1 * i * Math.PI * 2; // Golden ratio spiral

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Particle size & brightness
      points.push({
        x,
        y,
        z,
        size: Math.random() * 1.6 + 0.9,
        alpha: Math.random() * 0.4 + 0.6,
      });
    }

    // Interactive mouse tilt
    let targetTiltX = 0.25;
    let targetTiltY = 0;
    let currentTiltX = targetTiltX;
    let currentTiltY = targetTiltY;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetTiltY = nx * 0.4;
      targetTiltX = 0.25 + ny * 0.3;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Resize handler using devicePixelRatio for sharp Retina rendering
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    // Use ResizeObserver to ensure canvas updates whenever layout calculates
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(canvas);

    // Watch DOM for data-theme changes as secondary instant trigger
    const mutationObserver = new MutationObserver(() => {
      const current = document.documentElement.getAttribute("data-theme");
      if (current) {
        themeRef.current = current;
      }
    });
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });

    // Main render loop
    const render = () => {
      if (width > 0 && height > 0) {
        ctx.clearRect(0, 0, width, height);

        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const sphereRadius = Math.min(width, height) * 0.40;

        // Smooth tilt easing
        currentTiltX += (targetTiltX - currentTiltX) * 0.05;
        currentTiltY += (targetTiltY - currentTiltY) * 0.05;

        // Continuous rotation
        rotation += rotationSpeed;

        // Determine theme dynamically on every frame
        const currentAttr = document.documentElement.getAttribute("data-theme");
        const isLight =
          currentAttr === "light" ||
          themeRef.current === "light" ||
          document.documentElement.style.colorScheme === "light";

        // 1. Atmospheric Outer Glow
        const glowGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          sphereRadius * 0.65,
          centerX,
          centerY,
          sphereRadius * 1.45
        );
        if (isLight) {
          glowGrad.addColorStop(0, "rgba(37, 99, 235, 0.18)");
          glowGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.08)");
          glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        } else {
          glowGrad.addColorStop(0, "rgba(59, 130, 246, 0.22)");
          glowGrad.addColorStop(0.5, "rgba(99, 102, 241, 0.09)");
          glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        }

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, sphereRadius * 1.45, 0, Math.PI * 2);
        ctx.fill();

        // 2. Planet Silhouette with Inner Radial Gradient
        const planetGrad = ctx.createRadialGradient(
          centerX - sphereRadius * 0.35,
          centerY - sphereRadius * 0.35,
          sphereRadius * 0.08,
          centerX,
          centerY,
          sphereRadius
        );
        if (isLight) {
          // Luminous frosted azure glass with distinct contrast against white cards
          planetGrad.addColorStop(0, "#f8faff");
          planetGrad.addColorStop(0.4, "#e0edff");
          planetGrad.addColorStop(0.75, "#bdd8fd");
          planetGrad.addColorStop(1, "#93c5fd");
        } else {
          // Deep obsidian midnight sphere
          planetGrad.addColorStop(0, "#162038");
          planetGrad.addColorStop(0.55, "#0d1527");
          planetGrad.addColorStop(1, "#070b14");
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, sphereRadius, 0, Math.PI * 2);
        ctx.fillStyle = planetGrad;
        ctx.fill();

        // Atmospheric rim light
        ctx.lineWidth = isLight ? 2 : 1.75;
        ctx.strokeStyle = isLight ? "rgba(37, 99, 235, 0.65)" : "rgba(96, 165, 250, 0.6)";
        ctx.stroke();

        // Clip inside sphere for longitude & latitude lines
        ctx.clip();

        // 3. Draw Longitude & Latitude Arcs
        const latCount = 6;
        ctx.lineWidth = 1;
        const arcStroke = isLight ? "rgba(37, 99, 235, 0.32)" : "rgba(96, 165, 250, 0.16)";
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
          // Draw points on visible hemisphere
          const depthNorm = (p.z + 1) / 2; // 0 (back) to 1 (front)
          if (depthNorm < 0.15) continue;

          const alpha = Math.max(0, depthNorm * p.alpha);
          const radius = p.size * (0.65 + depthNorm * 0.85);

          if (isLight) {
            // Vibrant cobalt / sapphire nodes in light mode
            ctx.fillStyle = `rgba(29, 78, 216, ${Math.max(0.25, alpha * 0.95)})`;
            ctx.beginPath();
            ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
            ctx.fill();

            if (depthNorm > 0.72) {
              ctx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
              ctx.beginPath();
              ctx.arc(p.px, p.py, radius * 0.7, 0, Math.PI * 2);
              ctx.fill();
              // Bright specular core
              ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
              ctx.beginPath();
              ctx.arc(p.px, p.py, radius * 0.3, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // Luminous cyan / light blue nodes in dark mode
            ctx.fillStyle = `rgba(147, 197, 253, ${alpha * 0.9})`;
            ctx.beginPath();
            ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
            ctx.fill();

            if (depthNorm > 0.72) {
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
              ctx.beginPath();
              ctx.arc(p.px, p.py, radius * 0.55, 0, Math.PI * 2);
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

        ctx.lineWidth = 1.75;
        const ringGrad = ctx.createLinearGradient(
          -sphereRadius * 1.5,
          0,
          sphereRadius * 1.5,
          0
        );
        if (isLight) {
          ringGrad.addColorStop(0, "rgba(37, 99, 235, 0)");
          ringGrad.addColorStop(0.3, "rgba(37, 99, 235, 0.65)");
          ringGrad.addColorStop(0.7, "rgba(124, 58, 237, 0.7)");
          ringGrad.addColorStop(1, "rgba(37, 99, 235, 0)");
        } else {
          ringGrad.addColorStop(0, "rgba(59, 130, 246, 0)");
          ringGrad.addColorStop(0.3, "rgba(96, 165, 250, 0.55)");
          ringGrad.addColorStop(0.7, "rgba(167, 139, 250, 0.65)");
          ringGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
        }

        ctx.strokeStyle = ringGrad;
        ctx.beginPath();
        ctx.arc(0, 0, sphereRadius * 1.35, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting satellite particle on trajectory ring
        const orbitAngle = rotation * 2.2;
        const orbitX = Math.cos(orbitAngle) * sphereRadius * 1.35;
        const orbitY = Math.sin(orbitAngle) * sphereRadius * 1.35;

        if (isLight) {
          ctx.fillStyle = "#1d4ed8";
          ctx.shadowColor = "rgba(37, 99, 235, 0.7)";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(orbitX, orbitY, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(orbitX, orbitY, 1.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#60a5fa";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(orbitX, orbitY, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Always continue animation loop unconditionally
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
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

