"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const Animation = () => {
  const container = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  const linesConfig = [
    { startYPercent: 10, height: "2px", selector: ".line-1" },
    { startYPercent: 25, height: "6px", selector: ".line-2" },
    { startYPercent: 40, height: "12px", selector: ".line-3" },
  ];

  useGSAP(
    () => {
      const createAnimation = () => {
        if (!container.current || !logoRef.current) return;

        if (timeline.current) {
          timeline.current.kill();
        }

        const containerRect = container.current.getBoundingClientRect();
        const logoRect = logoRef.current.getBoundingClientRect();

        // **FIXED CALCULATION**: Target the center of the leftmost hexagon.
        // Assuming the logo is roughly centered in its div and the leftmost
        // hexagon's center is approximately 20-25% from the logo's left edge
        // and vertically centered within the logo.
        const logoAbsoluteLeft = logoRect.left - containerRect.left;
        const logoAbsoluteTop = logoRect.top - containerRect.top;

        // Adjust these percentages/values based on the exact structure of your ML.svg
        // A value of ~0.2 (20%) for X and 0.5 (50%) for Y should hit the center of the leftmost hexagon.
        const targetX = logoAbsoluteLeft + logoRect.width * 0.2; // ~20% into the logo's width
        const targetY = logoAbsoluteTop + logoRect.height / 2; // Vertically centered in the logo

        gsap.set(".line", { width: 0 });

        linesConfig.forEach((config) => {
          const startX = 0; // Lines originate from the very left edge of the container
          const startY = containerRect.height * (config.startYPercent / 100);

          const deltaX = targetX - startX;
          const deltaY = targetY - startY;

          const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
          const length = Math.hypot(deltaX, deltaY);

          gsap.set(config.selector, {
            top: startY,
            left: startX,
            rotation: angle,
            width: length,
            transformOrigin: "0% center", // Origin is at the very left edge of the div
          });
        });

        timeline.current = gsap.timeline({ delay: 0.5 });
        timeline.current.from(".line", {
          width: 0,
          duration: 1.5,
          ease: "expo.out",
          stagger: 0.2,
        });
      };

      createAnimation();
      window.addEventListener("resize", createAnimation);

      return () => {
        window.removeEventListener("resize", createAnimation);
        if (timeline.current) {
          timeline.current.kill();
        }
      };
    },
    { scope: container }
  );

  return (
    <main
      ref={container}
      className="relative flex min-h-screen w-full items-end justify-center overflow-hidden bg-[#191919] pb-20"
    >
      {linesConfig.map((line, index) => (
        <div
          key={index}
          className={`line line-${index + 1} absolute w-0`}
          style={{
            height: line.height,
            background:
              "linear-gradient(to right, #9261FF 50%, rgba(146, 97, 255, 0.8) 75%, rgba(246, 79, 75, 0.5) 90%, transparent 100%)",
          }}
        />
      ))}

      <div ref={logoRef} className="relative z-10">
        <Image
          src="/images/ML.svg"
          alt="Middle Logo"
          width={350}
          height={350}
          priority
        />
      </div>
    </main>
  );
};

export default Animation;
