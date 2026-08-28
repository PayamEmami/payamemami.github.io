'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  radius: number;
  cluster: number;
  phase: number;
};

function seededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function gaussian(random: () => number) {
  let u = 0;
  let v = 0;

  while (u === 0) u = random();
  while (v === 0) v = random();

  return (
    Math.sqrt(-2 * Math.log(u)) *
    Math.cos(2 * Math.PI * v)
  );
}

export default function ScientificParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    /*
     * ------------------------------------------------------------
     * CANVAS + CONTAINER
     * ------------------------------------------------------------
     */

    const canvasElement = canvasRef.current;

    if (!canvasElement) {
      return;
    }

    /*
     * Important:
     *
     * We check the nullable DOM references first, then assign them
     * to explicitly non-null typed constants.
     *
     * This prevents TypeScript from later complaining inside nested
     * functions such as resize() and animate().
     */

    const parentElement = canvasElement.parentElement;

    if (!parentElement) {
      return;
    }

    const rawContext = canvasElement.getContext('2d');

    if (!rawContext) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasElement;
    const container: HTMLElement = parentElement;
    const context: CanvasRenderingContext2D = rawContext;

    /*
     * ------------------------------------------------------------
     * ACCESSIBILITY
     * ------------------------------------------------------------
     */

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    /*
     * ------------------------------------------------------------
     * STATE
     * ------------------------------------------------------------
     */

    let width = 0;
    let height = 0;
    let dpr = 1;

    let particles: Particle[] = [];

    let animationFrame = 0;
    let lastTime = performance.now();

    const pointer = {
      x: -10000,
      y: -10000,
      active: false,
    };

    /*
     * ------------------------------------------------------------
     * PARTICLE GENERATION
     * ------------------------------------------------------------
     */

    function createParticles() {
      particles = [];

      /*
       * Resetting the seed means resizing the browser recreates
       * exactly the same embedding rather than making a new random
       * pattern every time.
       */
      const random = seededRandom(20260828);

      /*
       * Four deliberately irregular clusters.
       *
       * The goal is for this to resemble PCA/UMAP/omics observations
       * rather than a generic star field.
       */
      const clusters = [
        {
          x: 0.22,
          y: 0.27,
          sx: 0.105,
          sy: 0.075,
          n: 34,
        },
        {
          x: 0.67,
          y: 0.32,
          sx: 0.12,
          sy: 0.09,
          n: 38,
        },
        {
          x: 0.49,
          y: 0.68,
          sx: 0.145,
          sy: 0.09,
          n: 40,
        },
        {
          x: 0.84,
          y: 0.73,
          sx: 0.075,
          sy: 0.065,
          n: 20,
        },
      ];

      clusters.forEach((cluster, clusterIndex) => {
        for (let i = 0; i < cluster.n; i++) {
          const x =
            cluster.x * width +
            gaussian(random) * cluster.sx * width;

          const y =
            cluster.y * height +
            gaussian(random) * cluster.sy * height;

          particles.push({
            x,
            y,
            homeX: x,
            homeY: y,
            vx: 0,
            vy: 0,
            radius: 1.25 + random() * 1.7,
            cluster: clusterIndex,
            phase: random() * Math.PI * 2,
          });
        }
      });
    }

    /*
     * ------------------------------------------------------------
     * RESIZE
     * ------------------------------------------------------------
     */

    function resize() {
      const rect = container.getBoundingClientRect();

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      /*
       * Retina displays remain sharp, but DPR is capped at 2 to keep
       * the canvas relatively inexpensive to render.
       */
      dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      createParticles();
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });

    resizeObserver.observe(container);

    resize();

    /*
     * ------------------------------------------------------------
     * POINTER INTERACTION
     * ------------------------------------------------------------
     */

    function updatePointer(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();

      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        pointer.active = false;
        return;
      }

      pointer.x =
        event.clientX - rect.left;

      pointer.y =
        event.clientY - rect.top;

      pointer.active = true;
    }

    function clearPointer() {
      pointer.active = false;
    }

    window.addEventListener(
      'pointermove',
      updatePointer,
      {
        passive: true,
      }
    );

    window.addEventListener(
      'blur',
      clearPointer
    );

    document.documentElement.addEventListener(
      'pointerleave',
      clearPointer
    );

    /*
     * ------------------------------------------------------------
     * THEME
     * ------------------------------------------------------------
     */

    function isDark() {
      return document.documentElement.classList.contains(
        'dark'
      );
    }

    /*
     * ------------------------------------------------------------
     * CONNECTION LINES
     * ------------------------------------------------------------
     */

    function drawConnection(
      a: Particle,
      b: Particle,
      distance: number
    ) {
      const maxDistance = 92;

      if (distance > maxDistance) {
        return;
      }

      const dark = isDark();

      const alpha =
        (1 - distance / maxDistance) *
        (dark ? 0.105 : 0.085);

      context.beginPath();

      context.moveTo(
        a.x,
        a.y
      );

      context.lineTo(
        b.x,
        b.y
      );

      context.strokeStyle = dark
        ? `rgba(148, 163, 184, ${alpha})`
        : `rgba(71, 85, 105, ${alpha})`;

      context.lineWidth = 0.7;

      context.stroke();
    }

    /*
     * ------------------------------------------------------------
     * ANIMATION LOOP
     * ------------------------------------------------------------
     */

    function animate(time: number) {
      const dt = Math.min(
        (time - lastTime) / 16.667,
        2
      );

      lastTime = time;

      context.clearRect(
        0,
        0,
        width,
        height
      );

      /*
       * ----------------------------------------------------------
       * CONNECT NEARBY POINTS
       * ----------------------------------------------------------
       *
       * Connections are intentionally restricted to points from the
       * same cluster.
       *
       * That makes the structure feel more like biological/network
       * data than a constellation.
       */

      for (
        let i = 0;
        i < particles.length;
        i++
      ) {
        for (
          let j = i + 1;
          j < particles.length;
          j++
        ) {
          const a = particles[i];
          const b = particles[j];

          if (!a || !b) {
            continue;
          }

          if (a.cluster !== b.cluster) {
            continue;
          }

          const dx =
            b.x - a.x;

          const dy =
            b.y - a.y;

          const distance =
            Math.sqrt(
              dx * dx +
              dy * dy
            );

          drawConnection(
            a,
            b,
            distance
          );
        }
      }

      /*
       * ----------------------------------------------------------
       * UPDATE + DRAW PARTICLES
       * ----------------------------------------------------------
       */

      particles.forEach(
        (particle, index) => {
          if (!reducedMotion) {
            /*
             * Slight autonomous drift keeps the embedding alive when
             * nobody is touching the mouse.
             */
            const driftX =
              Math.sin(
                time * 0.00045 +
                particle.phase
              ) * 0.05;

            const driftY =
              Math.cos(
                time * 0.00038 +
                particle.phase
              ) * 0.045;

            /*
             * ------------------------------------------------------
             * CURSOR REPULSION
             * ------------------------------------------------------
             */

            if (pointer.active) {
              const dx =
                particle.x -
                pointer.x;

              const dy =
                particle.y -
                pointer.y;

              const distanceSquared =
                dx * dx +
                dy * dy;

              const influenceRadius = 150;

              const influenceSquared =
                influenceRadius *
                influenceRadius;

              if (
                distanceSquared > 0 &&
                distanceSquared <
                  influenceSquared
              ) {
                const distance =
                  Math.sqrt(
                    distanceSquared
                  );

                /*
                 * Force gets stronger as the pointer approaches.
                 */
                const strength =
                  (
                    1 -
                    distance /
                    influenceRadius
                  ) * 1.9;

                particle.vx +=
                  (
                    dx /
                    distance
                  ) *
                  strength *
                  dt;

                particle.vy +=
                  (
                    dy /
                    distance
                  ) *
                  strength *
                  dt;
              }
            }

            /*
             * ------------------------------------------------------
             * SPRING BACK TO HOME POSITION
             * ------------------------------------------------------
             */

            particle.vx +=
              (
                particle.homeX -
                particle.x
              ) *
              0.012 *
              dt;

            particle.vy +=
              (
                particle.homeY -
                particle.y
              ) *
              0.012 *
              dt;

            /*
             * Velocity damping creates smooth springy motion instead
             * of snapping immediately back into position.
             */

            particle.vx *= Math.pow(
              0.91,
              dt
            );

            particle.vy *= Math.pow(
              0.91,
              dt
            );

            particle.x +=
              (
                particle.vx +
                driftX
              ) *
              dt;

            particle.y +=
              (
                particle.vy +
                driftY
              ) *
              dt;
          }

          /*
           * ------------------------------------------------------
           * DRAW POINT
           * ------------------------------------------------------
           */

          const prominent =
            index % 13 === 0;

          const dark =
            isDark();

          const opacity = prominent
            ? dark
              ? 0.72
              : 0.55
            : dark
              ? 0.42
              : 0.31;

          const radius =
            particle.radius *
            (
              prominent
                ? 1.35
                : 1
            );

          context.beginPath();

          context.arc(
            particle.x,
            particle.y,
            radius,
            0,
            Math.PI * 2
          );

          context.fillStyle = dark
            ? `rgba(148, 163, 184, ${opacity})`
            : `rgba(51, 65, 85, ${opacity})`;

          context.fill();
        }
      );

      /*
       * ----------------------------------------------------------
       * CURSOR HALO
       * ----------------------------------------------------------
       */

      if (
        pointer.active &&
        !reducedMotion
      ) {
        const dark =
          isDark();

        const gradient =
          context.createRadialGradient(
            pointer.x,
            pointer.y,
            0,
            pointer.x,
            pointer.y,
            115
          );

        gradient.addColorStop(
          0,
          dark
            ? 'rgba(99, 102, 241, 0.075)'
            : 'rgba(79, 70, 229, 0.055)'
        );

        gradient.addColorStop(
          0.45,
          dark
            ? 'rgba(99, 102, 241, 0.025)'
            : 'rgba(79, 70, 229, 0.018)'
        );

        gradient.addColorStop(
          1,
          'rgba(0, 0, 0, 0)'
        );

        context.fillStyle =
          gradient;

        context.beginPath();

        context.arc(
          pointer.x,
          pointer.y,
          115,
          0,
          Math.PI * 2
        );

        context.fill();
      }

      animationFrame =
        requestAnimationFrame(
          animate
        );
    }

    /*
     * ------------------------------------------------------------
     * START
     * ------------------------------------------------------------
     */

    animationFrame =
      requestAnimationFrame(
        animate
      );

    /*
     * ------------------------------------------------------------
     * CLEANUP
     * ------------------------------------------------------------
     */

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      resizeObserver.disconnect();

      window.removeEventListener(
        'pointermove',
        updatePointer
      );

      window.removeEventListener(
        'blur',
        clearPointer
      );

      document.documentElement.removeEventListener(
        'pointerleave',
        clearPointer
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        inset-0
        z-0
        opacity-100
      "
    />
  );
}