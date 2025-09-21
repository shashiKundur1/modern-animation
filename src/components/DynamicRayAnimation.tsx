'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Image from 'next/image';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(MotionPathPlugin);
}

interface Ball {
  id: string;
  size: number;
  startPos: number;
}

interface LeftLineData {
  id: string;
  startYPercent: number;
  balls: Ball[];
  length: number;
  angle: number;
  startY: number;
  logoX: number;
  logoY: number;
}

interface RightLineData {
  id: string;
  angle: number;
  balls: Ball[];
  length: number;
  startX: number;
  startY: number;
  logoX: number;
  logoY: number;
  rect: DOMRect | null;
}

const DynamicRayAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cycleTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const logoPosition = { xPercent: 50, yPercent: 70 };

  // Left side configuration - balls ordered from nearest to farthest from center
  const leftLines: LeftLineData[] = [
    {
      id: 'line1',
      startYPercent: 10,
      balls: [
        { id: 'ball-1', size: 24, startPos: 0.2 },
        { id: 'ball-2', size: 24, startPos: 0.45 },
        { id: 'ball-3', size: 24, startPos: 0.7 },
      ],
      length: 0, angle: 0, startY: 0, logoX: 0, logoY: 0,
    },
    {
      id: 'line2',
      startYPercent: 25,
      balls: [{ id: 'ball-4', size: 30, startPos: 0.3 }],
      length: 0, angle: 0, startY: 0, logoX: 0, logoY: 0,
    },
    {
      id: 'line3',
      startYPercent: 40,
      balls: [{ id: 'ball-5', size: 36, startPos: 0.5 }],
      length: 0, angle: 0, startY: 0, logoX: 0, logoY: 0,
    },
  ];

  // Right side configuration
  const rightLines: RightLineData[] = [
    {
      id: 'right-line1',
      angle: -18,
      balls: [
        { id: 'ball-6', size: 30, startPos: 0.3 },
        { id: 'ball-7', size: 36, startPos: 0.5 },
      ],
      length: 0, startX: 0, startY: 0, logoX: 0, logoY: 0, rect: null,
    },
    {
      id: 'right-line2',
      angle: -28,
      balls: [
        { id: 'ball-8', size: 24, startPos: 0.2 },
        { id: 'ball-9', size: 24, startPos: 0.45 },
        { id: 'ball-10', size: 24, startPos: 0.7 },
      ],
      length: 0, startX: 0, startY: 0, logoX: 0, logoY: 0, rect: null,
    },
  ];

  const setupElements = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const logoX = rect.width * (logoPosition.xPercent / 100);
    const logoY = rect.height * (logoPosition.yPercent / 100);

    // Setup logo
    gsap.set('#center-logo', {
      left: `${logoPosition.xPercent}%`,
      top: `${logoPosition.yPercent}%`,
    });

    // Setup left lines and balls
    leftLines.forEach((line, lineIndex) => {
      const startY = rect.height * (line.startYPercent / 100);
      const lineLength = Math.hypot(logoX, logoY - startY);
      const lineAngle = Math.atan2(logoY - startY, logoX) * (180 / Math.PI);

      // Setup visible line
      const lineElement = containerRef.current?.querySelector(`#line-${lineIndex + 1}`);
      if (lineElement) {
        gsap.set(lineElement, {
          top: `${line.startYPercent}%`,
          rotation: lineAngle,
          yPercent: -50,
          width: lineLength,
        });
      }

      // Setup balls
      line.balls.forEach((ball) => {
        const ballDistance = lineLength * ball.startPos;
        const ballX = ballDistance * Math.cos((lineAngle * Math.PI) / 180);
        const ballY = startY + ballDistance * Math.sin((lineAngle * Math.PI) / 180);

        gsap.set(`#${ball.id}`, {
          left: ballX,
          top: ballY,
          width: ball.size,
          height: ball.size,
          scale: 1,
          opacity: 1,
        });
      });

      // Store line data
      line.length = lineLength;
      line.angle = lineAngle;
      line.startY = startY;
      line.logoX = logoX;
      line.logoY = logoY;
    });

    // Setup right lines and balls
    rightLines.forEach((line, lineIndex) => {
      const rayAngles = [-18, -28];
      const rayAngle = rayAngles[lineIndex] * (Math.PI / 180);
      const lineLength = Math.max(rect.width, rect.height) * 0.9;

      line.balls.forEach((ball) => {
        const ballDistance = lineLength * ball.startPos;
        const ballX = logoX + ballDistance * Math.cos(rayAngle);
        const ballY = logoY + ballDistance * Math.sin(rayAngle);

        gsap.set(`#${ball.id}`, {
          left: ballX,
          top: ballY,
          width: ball.size,
          height: ball.size,
          scale: 1,
          opacity: 1,
        });
      });

      // Store line data
      line.length = lineLength;
      line.angle = rayAngles[lineIndex];
      line.startX = logoX;
      line.startY = logoY;
      line.logoX = logoX;
      line.logoY = logoY;
      line.rect = rect;
    });

    // Setup conic rays
    gsap.set('#new-conic-rays', {
      '--x': `${logoPosition.xPercent}%`,
      '--y': `${logoPosition.yPercent}%`,
    });
  };

  // PERFECT ISOLATED MORPH - no other motion during morph
  const addMorphAnimation = (tl: gsap.core.Timeline, ballId: string) => {
    // MORPH PHASE: 1.5s - 2.5s (isolated, no other motion)
    tl.call(() => {
      const morphImg = document.querySelector('#morph-image') as HTMLImageElement;
      if (morphImg) {
        const ballNumber = ballId.split('-')[1];
        morphImg.src = `/images/B${ballNumber}.svg`;
        morphImg.alt = `Ball ${ballNumber}`;
      }
    }, [], 1.5)
      .set('#morph-element', {
        opacity: 1,
        scale: 1.0,
        rotation: 0,
      }, 1.5);

    // Perfect isolated transformation
    tl.to('#morph-element', {
      scale: 1.8,
      rotation: 180,
      duration: 0.3,
      ease: 'power2.inOut',
    }, 1.6)
      .to('#morph-image', {
        scale: 0,
        rotation: 720,
        duration: 0.4,
        ease: 'power2.inOut',
      }, 1.7)
      .call(() => {
        const morphImg = document.querySelector('#morph-image') as HTMLImageElement;
        if (morphImg) {
          morphImg.src = '/images/RL.svg';
          morphImg.alt = 'Right Ball';
        }
      }, [], 2.0)
      .to('#morph-image', {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: 'back.out(1.7)',
      }, 2.0)
      .to('#morph-element', {
        scale: 1,
        rotation: 360,
        duration: 0.2,
        ease: 'power2.out',
      }, 2.3)
      .to('#morph-element', {
        opacity: 0,
        scale: 0,
        rotation: 0,
        duration: 0.1,
        ease: 'power2.in',
      }, 2.5);
  };

  const animateLine = (
    lineData: LeftLineData | RightLineData,
    delay: number,
    isRightSide: boolean = false
  ) => {
    const tl = gsap.timeline({ delay });

    if (lineData.balls.length === 3) {
      // 3 balls chain animation
      const [b1, b2, b3] = lineData.balls;

      // Calculate positions along the line
      const getPositionOnLine = (progress: number) => {
        if (isRightSide) {
          const rightLineData = lineData as RightLineData;
          const distance = rightLineData.length * progress;
          const x = rightLineData.logoX + distance * Math.cos((rightLineData.angle * Math.PI) / 180);
          const y = rightLineData.logoY + distance * Math.sin((rightLineData.angle * Math.PI) / 180);
          return { x, y };
        } else {
          const leftLineData = lineData as LeftLineData;
          const distance = leftLineData.length * progress;
          const x = distance * Math.cos((leftLineData.angle * Math.PI) / 180);
          const y = leftLineData.startY + distance * Math.sin((leftLineData.angle * Math.PI) / 180);
          return { x, y };
        }
      };

      if (isRightSide) {
        // Right side: conveyor belt pattern (outward)
        const b3EndPos = getPositionOnLine(1.4);
        tl.to(`#${b3.id}`, {
          left: b3EndPos.x,
          top: b3EndPos.y,
          scale: 0,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        const b3Pos = getPositionOnLine(b3.startPos);
        tl.to(`#${b2.id}`, {
          left: b3Pos.x,
          top: b3Pos.y,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        const b2Pos = getPositionOnLine(b2.startPos);
        tl.to(`#${b1.id}`, {
          left: b2Pos.x,
          top: b2Pos.y,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        // OUTWARD PHASE: Ball exits logo immediately when morph ends
        const logoPos = getPositionOnLine(0);
        const b1Pos = getPositionOnLine(b1.startPos);
        tl.set(`#${b3.id}`, {
          left: logoPos.x,
          top: logoPos.y,
          scale: 1,
          opacity: 1,
        }, 2.5); // Immediately when morph ends
        tl.to(`#${b3.id}`, {
          left: b1Pos.x,
          top: b1Pos.y,
          duration: 1.0, // Smooth outward movement
          ease: 'power2.out',
        }, 2.5);
      } else {
        // Left side: enhanced morph logic with visible morph element
        const logoPos = getPositionOnLine(1.0);

        // Ball moves to center and disappears
        tl.to(`#${b3.id}`, {
          left: logoPos.x,
          top: logoPos.y,
          scale: 0,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        // Add morph animation
        addMorphAnimation(tl, b3.id);

        // Other balls shift normally
        const b3Pos = getPositionOnLine(b3.startPos);
        tl.to(`#${b2.id}`, {
          left: b3Pos.x,
          top: b3Pos.y,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        const b2Pos = getPositionOnLine(b2.startPos);
        tl.to(`#${b1.id}`, {
          left: b2Pos.x,
          top: b2Pos.y,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        // Reset ball to start position - after outward phase
        const startPos = getPositionOnLine(0);
        const b1Pos = getPositionOnLine(b1.startPos);
        tl.set(`#${b3.id}`, {
          left: startPos.x,
          top: startPos.y,
          scale: 0,
        }, 3.5)
          .to(`#${b3.id}`, {
            left: b1Pos.x,
            top: b1Pos.y,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
          }, 3.5);
      }
    } else if (lineData.balls.length === 2) {
      // 2 balls animation
      const [b1, b2] = lineData.balls;
      const getPositionOnLine = (progress: number) => {
        if (isRightSide) {
          const rightLineData = lineData as RightLineData;
          const distance = rightLineData.length * progress;
          const x = rightLineData.logoX + distance * Math.cos((rightLineData.angle * Math.PI) / 180);
          const y = rightLineData.logoY + distance * Math.sin((rightLineData.angle * Math.PI) / 180);
          return { x, y };
        } else {
          const leftLineData = lineData as LeftLineData;
          const distance = leftLineData.length * progress;
          const x = distance * Math.cos((leftLineData.angle * Math.PI) / 180);
          const y = leftLineData.startY + distance * Math.sin((leftLineData.angle * Math.PI) / 180);
          return { x, y };
        }
      };

      if (isRightSide) {
        // Right side: 2 balls - conveyor belt
        const b2EndPos = getPositionOnLine(1.4);
        tl.to(`#${b2.id}`, {
          left: b2EndPos.x,
          top: b2EndPos.y,
          scale: 0,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        const b2Pos = getPositionOnLine(b2.startPos);
        tl.to(`#${b1.id}`, {
          left: b2Pos.x,
          top: b2Pos.y,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        // OUTWARD PHASE: Ball exits logo immediately when morph ends
        const logoPos = getPositionOnLine(0);
        const b1Pos = getPositionOnLine(b1.startPos);
        tl.set(`#${b2.id}`, {
          left: logoPos.x,
          top: logoPos.y,
          scale: 1,
          opacity: 1,
        }, 2.5); // Immediately when morph ends
        tl.to(`#${b2.id}`, {
          left: b1Pos.x,
          top: b1Pos.y,
          duration: 1.0, // Smooth outward movement
          ease: 'power2.out',
        }, 2.5);
      } else {
        // Left side 2-ball animation with morph
        const logoPos = getPositionOnLine(1.0);

        // Ball moves to center and disappears
        tl.to(`#${b2.id}`, {
          left: logoPos.x,
          top: logoPos.y,
          scale: 0,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        // Add morph animation
        addMorphAnimation(tl, b2.id);

        const b2Pos = getPositionOnLine(b2.startPos);
        tl.to(`#${b1.id}`, {
          left: b2Pos.x,
          top: b2Pos.y,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        const startPos = getPositionOnLine(0);
        const b1Pos = getPositionOnLine(b1.startPos);
        tl.set(`#${b2.id}`, {
          left: startPos.x,
          top: startPos.y,
          scale: 0,
        }, 3.5)
          .to(`#${b2.id}`, {
            left: b1Pos.x,
            top: b1Pos.y,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
          }, 3.5);
      }
    } else {
      // Single ball animation
      const ball = lineData.balls[0];
      const getPositionOnLine = (progress: number) => {
        if (isRightSide) {
          const rightLineData = lineData as RightLineData;
          const distance = rightLineData.length * progress;
          const x = rightLineData.logoX + distance * Math.cos((rightLineData.angle * Math.PI) / 180);
          const y = rightLineData.logoY + distance * Math.sin((rightLineData.angle * Math.PI) / 180);
          return { x, y };
        } else {
          const leftLineData = lineData as LeftLineData;
          const distance = leftLineData.length * progress;
          const x = distance * Math.cos((leftLineData.angle * Math.PI) / 180);
          const y = leftLineData.startY + distance * Math.sin((leftLineData.angle * Math.PI) / 180);
          return { x, y };
        }
      };

      if (isRightSide) {
        // RIGHT SIDE SINGLE BALL: Perfect conveyor belt timing
        const ballEndPos = getPositionOnLine(1.4);

        // PHASE 1: Ball exits outward (0s - 1.5s)
        tl.to(`#${ball.id}`, {
          left: ballEndPos.x,
          top: ballEndPos.y,
          scale: 0,
          opacity: 0,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        // PHASE 3: New ball spawns from logo when morph ends (2.5s - 3.5s)
        const logoPos = getPositionOnLine(0);
        const originalPos = getPositionOnLine(ball.startPos);
        tl.set(`#${ball.id}`, {
          left: logoPos.x,
          top: logoPos.y,
          scale: 1,
          opacity: 1,
        }, 2.5) // Exactly when morph ends
          .to(`#${ball.id}`, {
            left: originalPos.x,
            top: originalPos.y,
            duration: 1.0,
            ease: 'power2.out',
          }, 2.5);
      } else {
        // Left side single ball with morph + SAFEGUARD
        const logoPos = getPositionOnLine(1.0);

        // SAFEGUARD: Force reset ball position at start
        tl.call(() => {
          const ballElement = document.querySelector(`#${ball.id}`) as HTMLElement;
          if (ballElement) {
            const startPos = getPositionOnLine(ball.startPos);
            gsap.set(`#${ball.id}`, {
              left: startPos.x,
              top: startPos.y,
              scale: 1,
              opacity: 1,
              rotation: 0,
            });
          }
        }, [], 0);

        // Ball moves to center and disappears
        tl.to(`#${ball.id}`, {
          left: logoPos.x,
          top: logoPos.y,
          scale: 0,
          duration: 1.5,
          ease: 'power2.inOut',
        }, 0);

        // Add morph animation
        addMorphAnimation(tl, ball.id);

        // SAFEGUARD RESET: Ensure ball 5 always returns to correct position
        const startPos = getPositionOnLine(0);
        const originalPos = getPositionOnLine(ball.startPos);

        // Double safeguard: Force position before reset
        tl.call(() => {
          const ballElement = document.querySelector(`#${ball.id}`) as HTMLElement;
          if (ballElement) {
            gsap.set(`#${ball.id}`, {
              left: startPos.x,
              top: startPos.y,
              scale: 0,
              opacity: 1,
              rotation: 0,
            });
          }
        }, [], 3.4);

        tl.set(`#${ball.id}`, {
          left: startPos.x,
          top: startPos.y,
          scale: 0,
        }, 3.5)
          .to(`#${ball.id}`, {
            left: originalPos.x,
            top: originalPos.y,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
          }, 3.5);
      }
    }

    // Logo scale animation
    tl.to('#center-logo', {
      scale: 0.85,
      duration: 0.3,
      ease: 'power2.inOut',
    }, 0)
      .to('#center-logo', {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      }, 0.3);

    return tl;
  };

  const createAnimation = () => {
    if (!containerRef.current) return;

    const mainTl = gsap.timeline();

    // Initial setup
    mainTl
      .set('.animated-circle, #center-logo', { scale: 0, opacity: 0 })
      .set('#ball-1, #ball-2, #ball-3, #ball-4, #ball-5, #ball-6, #ball-7, #ball-8, #ball-9, #ball-10', { scale: 0, opacity: 0 })
      .set('#morph-element', { scale: 0, opacity: 0 })
      .set('.converging-line', { width: 0 })
      .set('#new-conic-rays', {
        clipPath: 'circle(0% at var(--x) var(--y))',
        '--angle-1': '190.01deg',
        '--angle-2': '201.022deg',
        '--angle-3': '206.727deg',
        '--angle-3a': '209.902deg',
        '--angle-4': '211.818deg',
        '--angle-5': '220.13deg',
      })

      // Lines appear
      .to('#center-logo', { scale: 1, opacity: 1, duration: 0.2, ease: 'back.out(1.7)' }, 0)
      .to('#line-1', { width: () => leftLines[0].length || 400, duration: 1, ease: 'power2.out' }, 0)
      .to('#line-2', { width: () => leftLines[1].length || 400, duration: 1, ease: 'power2.out' }, 0.2)
      .to('#line-3', { width: () => leftLines[2].length || 400, duration: 1, ease: 'power2.out' }, 0.4)

      // Blue rays appear
      .to('#new-conic-rays', {
        clipPath: 'circle(100% at var(--x) var(--y))',
        '--angle-1': '200deg',
        '--angle-2': '205deg',
        '--angle-3': '207deg',
        '--angle-3a': '208deg',
        '--angle-4': '209deg',
        '--angle-5': '212deg',
        duration: 1,
        ease: 'expo.out',
      }, 1)

      // Expand to full pattern
      .to('#new-conic-rays', {
        '--angle-1': '190.01deg',
        '--angle-2': '201.022deg',
        '--angle-3': '206.727deg',
        '--angle-3a': '209.902deg',
        '--angle-4': '211.818deg',
        '--angle-5': '220.13deg',
        duration: 1,
        ease: 'power2.out',
      }, 2)

      // Balls appear
      .to('.animated-circle', {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.05,
      }, 3);

    mainTl.play();

    // Start cycling animation
    mainTl.call(() => {
      cycleTimelineRef.current = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.5,
      });

      let currentTime = 0;
      const cycleDuration = 4.0; // Perfect timing for 3-phase system

      // SEAMLESS SYNCHRONIZED ANIMATIONS
      // L1 + R1 (same time - morph flows to right)
      const l1Animation = animateLine(leftLines[0], currentTime, false);
      const r1Animation = animateLine(rightLines[0], currentTime, true);
      cycleTimelineRef.current!.add(l1Animation, 0);
      cycleTimelineRef.current!.add(r1Animation, 0);
      currentTime += cycleDuration;

      // L2 + R2 (same time - morph flows to right)
      const l2Animation = animateLine(leftLines[1], currentTime, false);
      const r2Animation = animateLine(rightLines[1], currentTime, true);
      cycleTimelineRef.current!.add(l2Animation, 0);
      cycleTimelineRef.current!.add(r2Animation, 0);
      currentTime += cycleDuration;

      // L3 + R1 (same time - morph flows to right)
      const l3Animation = animateLine(leftLines[2], currentTime, false);
      const r1Animation2 = animateLine(rightLines[0], currentTime, true);
      cycleTimelineRef.current!.add(l3Animation, 0);
      cycleTimelineRef.current!.add(r1Animation2, 0);

      cycleTimelineRef.current!.play();
    }, [], 4);
  };

  const restart = useCallback(() => {
    if (cycleTimelineRef.current) cycleTimelineRef.current.kill();
    setupElements();
    createAnimation();
  }, []);

  useEffect(() => {
    restart();
    window.addEventListener('resize', restart);
    return () => {
      window.removeEventListener('resize', restart);
      if (cycleTimelineRef.current) cycleTimelineRef.current.kill();
    };
  }, [restart]);

  return (
    <main ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-[#191919]">
      <div
        id="center-logo"
        className="absolute left-1/2 top-[70%] z-[15] flex h-[clamp(250px,25vw,400px)] w-[clamp(250px,25vw,400px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
      >
        <Image
          src="/images/ML.svg"
          alt="Logo"
          width={400}
          height={400}
          className="relative z-[1] block h-full w-full object-contain"
          priority
        />
      </div>

      {/* Morph Animation Element - Above Logo */}
      <div
        id="morph-element"
        className="absolute left-1/2 top-[70%] z-[25] flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black opacity-0 scale-0"
      >
        <Image
          id="morph-image"
          src="/images/B1.svg"
          alt="Morphing Ball"
          width={48}
          height={48}
          className="h-full w-full rounded-full object-cover"
        />
      </div>

      <div id="line-1" className="converging-line absolute left-0 w-0" style={{
        height: 'clamp(1px, 0.1vh, 2px)',
        background: 'linear-gradient(to right, #9261FF 50%, rgba(146, 97, 255, 0.8) 75%, rgba(246, 79, 75, 0.5) 90%, transparent 100%)',
        transformOrigin: 'left center',
      }}></div>
      <div id="line-2" className="converging-line absolute left-0 w-0" style={{
        height: 'clamp(3px, 0.5vh, 6px)',
        background: 'linear-gradient(to right, #9261FF 50%, rgba(146, 97, 255, 0.8) 75%, rgba(246, 79, 75, 0.5) 90%, transparent 100%)',
        transformOrigin: 'left center',
      }}></div>
      <div id="line-3" className="converging-line absolute left-0 w-0" style={{
        height: 'clamp(8px, 1vh, 12px)',
        background: 'linear-gradient(to right, #9261FF 50%, rgba(146, 97, 255, 0.8) 75%, rgba(246, 79, 75, 0.5) 90%, transparent 100%)',
        transformOrigin: 'left center',
      }}></div>

      <div id="new-conic-rays" className="pointer-events-none absolute left-0 top-0 z-[3] h-full w-full select-none" style={{
        background: 'conic-gradient(from 225.73deg at var(--x) var(--y), rgba(255, 255, 255, 0) -139.87deg, rgba(255, 255, 255, 0) var(--angle-1), #9261FF var(--angle-2), #F64F4B var(--angle-3), #EDD05A var(--angle-3a), #FFF4A2 var(--angle-4), rgba(255, 255, 255, 0) var(--angle-5), rgba(255, 255, 255, 0) 550.13deg)',
        maskImage: 'conic-gradient(from 225.73deg at var(--x) var(--y), rgba(255, 255, 255, 0) -139.87deg, rgba(255, 255, 255, 0) var(--angle-1), rgb(0, 77, 255) var(--angle-2), rgb(255, 255, 255) var(--angle-3), rgb(0, 77, 255) var(--angle-3a), rgb(0, 0, 0) var(--angle-4), rgba(255, 255, 255, 0) var(--angle-5), rgba(255, 255, 255, 0) 550.13deg)',
        clipPath: 'circle(0% at var(--x) var(--y))',
      }}></div>

      {/* Left Side Balls - BIGGER GOAT ICONS 🐐 */}
      <div id="ball-1" className="animated-circle absolute z-[30] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black">
        <Image src="/images/B1.svg" alt="Ball 1" width={48} height={48} className="h-full w-full rounded-full object-cover" />
      </div>
      <div id="ball-2" className="animated-circle absolute z-[30] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black">
        <Image src="/images/B2.svg" alt="Ball 2" width={48} height={48} className="h-full w-full rounded-full object-cover" />
      </div>
      <div id="ball-3" className="animated-circle absolute z-[30] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black">
        <Image src="/images/B3.svg" alt="Ball 3" width={48} height={48} className="h-full w-full rounded-full object-cover" />
      </div>
      <div id="ball-4" className="animated-circle absolute z-[30] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black">
        <Image src="/images/B4.svg" alt="Ball 4" width={52} height={52} className="h-full w-full rounded-full object-cover" />
      </div>
      <div id="ball-5" className="animated-circle absolute z-[30] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black">
        <Image src="/images/B5.svg" alt="Ball 5" width={56} height={56} className="h-full w-full rounded-full object-cover" />
      </div>

      {/* Right Side Balls - BIGGER GOAT ICONS 🐐 */}
      <div id="ball-6" className="animated-circle absolute z-[20] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black">
        <Image src="/images/RL.svg" alt="Right Ball" width={52} height={52} className="h-full w-full rounded-full object-cover" />
      </div>
      <div id="ball-7" className="animated-circle absolute z-[20] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black">
        <Image src="/images/RL.svg" alt="Right Ball" width={56} height={56} className="h-full w-full rounded-full object-cover" />
      </div>
      <div id="ball-8" className="animated-circle absolute z-[20] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black">
        <Image src="/images/RL.svg" alt="Right Ball" width={48} height={48} className="h-full w-full rounded-full object-cover" />
      </div>
      <div id="ball-9" className="animated-circle absolute z-[20] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black">
        <Image src="/images/RL.svg" alt="Right Ball" width={48} height={48} className="h-full w-full rounded-full object-cover" />
      </div>
      <div id="ball-10" className="animated-circle absolute z-[20] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black">
        <Image src="/images/RL.svg" alt="Right Ball" width={48} height={48} className="h-full w-full rounded-full object-cover" />
      </div>
    </main>
  );
};

export default DynamicRayAnimation;