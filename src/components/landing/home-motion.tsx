"use client";

import * as React from "react";
import Image, { getImageProps } from "next/image";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ClipboardCheck, MonitorPlay, UploadCloud, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Motion is progressive enhancement. The content is never conditional on animations. */
export function ScrollReveal({ children, className = "", delay = 0, direction = "up" }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const reduced = useReducedMotion();
  const x = direction === "left" ? -26 : direction === "right" ? 26 : 0;
  const y = direction === "up" ? 26 : 0;
  return (
    <motion.div
      className={className}
      data-scroll-reveal
      initial={reduced ? false : { opacity: 1, x, y }}
      whileInView={reduced ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.13, margin: "0px 0px -42px 0px" }}
      transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// One responsive image selection avoids preloading both desktop and mobile artwork.
const heroImage = getImageProps({ src: "/images/hero/hero-city.webp", alt: "", fill: true, sizes: "100vw", loading: "eager", fetchPriority: "high" }).props;
const stillImage = getImageProps({ src: "/images/hero/hero-static.webp", alt: "", fill: true, sizes: "100vw" }).props;

/** Layered vehicle motion with a static mobile/reduced-motion image. */
export function CinematicHeroArt() {
  const reduced = useReducedMotion();
  const first = (x: number, delay: number) => ({
    initial: reduced ? false : { opacity: 0, x, y: 18 },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { duration: 1.15, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  });
  return (
    <div className="av-hero-media absolute inset-0 overflow-hidden" aria-hidden="true">
      <picture className="av-hero-still absolute inset-0">
        <source media="(max-width: 1023px), (prefers-reduced-motion: reduce)" srcSet={stillImage.srcSet} sizes="100vw" />
        {/* Next getImageProps supplies the optimized responsive sources for this picture. */}
        <img {...heroImage} alt="" className="object-cover object-center" />
      </picture>
      <div className="av-hero-moving absolute inset-0">
        <motion.div className="av-vehicle av-vehicle-car" {...first(68, 0.25)}>
          <Image src="/images/hero/hero-car.png" alt="" fill sizes="360px" className="object-contain object-bottom" />
        </motion.div>
        <motion.div className="av-vehicle av-vehicle-bike" {...first(-70, 0.48)}>
          <Image src="/images/hero/hero-bike.png" alt="" fill sizes="260px" className="object-contain object-bottom" />
        </motion.div>
        <motion.div className="av-vehicle av-vehicle-auto" {...first(110, 0.78)}>
          <Image src="/images/hero/hero-auto.png" alt="" fill sizes="440px" className="object-contain object-bottom" />
        </motion.div>
        <svg className="av-hero-trail absolute inset-0 size-full" viewBox="0 0 1440 780" preserveAspectRatio="none" aria-hidden="true">
          <motion.path d="M690 708 C875 654 970 740 1135 680 S1340 684 1470 633" fill="none" stroke="#FF6A00" strokeWidth="7" strokeLinecap="round" opacity="0.25" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.78, ease: "easeOut" }} />
          <motion.path d="M690 708 C875 654 970 740 1135 680 S1340 684 1470 633" fill="none" stroke="#FF8A37" strokeWidth="2" strokeLinecap="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.78, ease: "easeOut" }} />
        </svg>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,21,44,.99)_0%,rgba(3,21,44,.94)_23%,rgba(3,21,44,.67)_43%,rgba(3,21,44,.12)_79%),linear-gradient(0deg,rgba(3,21,44,.80)_0%,transparent_35%)]" />
    </div>
  );
}

const steps: { title: string; text: string; icon: LucideIcon }[] = [
  { title: "Advertiser", text: "Uploads a creative and builds a campaign draft", icon: UploadCloud },
  { title: "Review", text: "A BlinkMyAd admin reviews the creative and campaign", icon: ClipboardCheck },
  { title: "Vehicle screen", text: "Approved ads play on assigned screens", icon: MonitorPlay },
  { title: "Driver partner", text: "Earnings are recorded for the driver carrying the screen", icon: UserRound },
];

function TimelineStep({ step, index, progress }: {
  step: (typeof steps)[number]; index: number; progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const reduced = useReducedMotion();
  const scale = useTransform(progress, [index * .23, index * .23 + .13], [.985, 1]);
  const Icon = step.icon;
  return (
    <motion.li style={reduced ? { scale: 1 } : { scale }} className="relative z-10 flex min-h-64 flex-col items-start rounded-2xl border border-[#27517f] bg-[#09284c]/95 p-7 shadow-[0_20px_50px_rgba(0,0,0,.14)] sm:min-h-60">
      <span className="absolute -top-4 left-7 flex size-9 items-center justify-center rounded-full bg-[#FF6A00] font-heading font-extrabold text-[#041B3D] shadow-[0_4px_20px_rgba(255,106,0,.2)]">{index + 1}</span>
      <span className="mb-6 inline-flex size-15 items-center justify-center rounded-xl border border-[#4b7298] bg-[#143e68] text-[#cbe5ff]"><Icon className="size-8" aria-hidden="true" /></span>
      <h3 className="font-heading text-xl font-bold text-white">{step.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#c3d0e4]">{step.text}</p>
    </motion.li>
  );
}

export function CampaignTimeline() {
  const ref = React.useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "end 36%"] });
  return (
    <div className="relative mt-18">
    <ol ref={ref} className="relative z-10 grid gap-9 md:grid-cols-4 md:gap-5" aria-label="Campaign review and playback process">
      {steps.map((step, index) => <TimelineStep key={step.title} step={step} index={index} progress={scrollYProgress} />)}
    </ol>
    <div className="pointer-events-none absolute bottom-20 left-[31px] top-8 w-[2px] bg-[#365779] md:bottom-auto md:left-10 md:right-10 md:top-24 md:h-[2px] md:w-auto" aria-hidden="true" />
    <motion.div style={reduced ? undefined : { scaleY: scrollYProgress }} className="pointer-events-none absolute bottom-20 left-[31px] top-8 w-[2px] origin-top bg-[#FF6A00] md:hidden" aria-hidden="true" />
    <motion.div style={reduced ? undefined : { scaleX: scrollYProgress }} className="pointer-events-none absolute left-10 right-10 top-24 hidden h-[2px] origin-left bg-[#FF6A00] md:block" aria-hidden="true" />
    </div>
  );
}

// The geographical outline below comes from public/images/coverage/india-map.svg.
const INDIA_OUTLINE = "M563.2,227.0 L564.3,232.4 L559.3,235.0 L560.5,243.8 L550.3,241.2 L531.8,251.1 L532.2,259.3 L524.3,271.3 L523.6,278.2 L517.2,290.0 L506.1,286.7 L505.5,301.5 L502.3,306.4 L503.8,312.5 L496.8,315.8 L489.2,293.2 L485.3,293.2 L482.9,302.4 L475.1,294.9 L479.5,286.8 L485.9,286.0 L492.5,273.9 L484.3,271.5 L471.0,271.7 L457.4,269.7 L456.2,259.8 L449.4,259.1 L438.0,252.9 L433.0,262.6 L443.3,270.2 L434.4,275.5 L431.2,280.7 L440.0,284.5 L437.6,293.1 L442.5,303.9 L444.7,315.6 L442.7,320.8 L433.0,320.7 L415.4,323.6 L416.2,334.4 L408.6,342.8 L388.0,352.4 L372.0,369.3 L361.3,378.3 L347.0,387.6 L347.0,394.2 L339.9,397.7 L327.0,402.8 L320.4,403.6 L316.1,414.5 L319.0,433.1 L319.8,444.9 L313.8,458.5 L313.7,482.8 L306.3,483.4 L299.8,494.3 L304.1,499.0 L291.1,503.1 L286.3,512.8 L280.6,516.9 L267.0,503.6 L260.4,483.6 L254.9,469.2 L249.9,462.4 L242.4,448.7 L238.8,430.8 L236.3,421.9 L223.3,402.3 L217.4,374.6 L213.2,356.3 L213.2,339.0 L210.4,325.6 L189.6,334.2 L179.6,332.5 L160.9,315.2 L167.8,310.0 L163.6,304.4 L146.8,292.3 L156.3,282.7 L187.8,282.8 L184.9,270.5 L176.9,263.3 L175.3,252.3 L165.9,245.8 L181.7,230.9 L198.3,232.0 L213.2,217.0 L222.2,202.5 L236.0,188.1 L235.8,178.0 L248.0,169.7 L236.5,162.6 L231.5,153.0 L226.4,140.5 L233.4,134.3 L255.1,137.8 L271.0,135.7 L284.8,123.7 L300.2,140.4 L298.7,152.1 L304.4,159.4 L303.9,166.7 L293.7,164.7 L297.7,180.5 L311.7,189.5 L331.6,199.5 L322.5,206.0 L317.0,219.4 L330.8,224.8 L344.3,231.8 L362.9,239.8 L382.5,241.6 L390.7,248.9 L401.8,250.3 L419.0,253.6 L430.9,253.4 L432.5,247.7 L430.6,238.6 L431.7,232.5 L440.4,229.5 L441.6,240.7 L441.9,243.6 L454.9,249.0 L463.9,246.8 L476.0,247.7 L487.6,247.3 L488.6,238.5 L482.8,234.0 L494.3,232.2 L507.3,221.6 L523.8,212.5 L535.8,216.0 L546.0,210.0 L552.7,218.8 L547.8,224.8 L563.2,227.0 Z";

const futureConnections = [
  { d: "M342.1 267.3 Q301 212 283 166", x: 283, y: 166 },
  { d: "M342.1 267.3 Q254 261 205 327", x: 205, y: 327 },
  { d: "M342.1 267.3 Q316 346 311 431", x: 311, y: 431 },
  { d: "M342.1 267.3 Q401 241 446 268", x: 446, y: 268 },
];

export function IndiaNetworkMap() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: .33 });
  const reduced = useReducedMotion();
  const on = reduced || inView;
  return (
    <div ref={ref} className="relative overflow-hidden rounded-[28px] border border-[#d9e6f6] bg-[#f3f8ff]" aria-label="Illustrative India expansion map with Prayagraj marked as the starting location">
      <svg className="w-full" viewBox="118 91 490 470" role="img" aria-labelledby="av-india-map-title av-india-map-desc">
        <title id="av-india-map-title">Initial BlinkMyAd launch in Prayagraj</title>
        <desc id="av-india-map-desc">Geographical outline of India, with Prayagraj highlighted and four illustrative future network lines that do not indicate available services.</desc>
        <defs>
          <linearGradient id="av-map-fill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e1eeff" /><stop offset="1" stopColor="#b4d1f8" /></linearGradient>
        </defs>
        <motion.path d={INDIA_OUTLINE} fill="url(#av-map-fill)" stroke="#5b98db" strokeWidth="2" strokeLinejoin="round" initial={reduced ? false : { opacity: 0, pathLength: 0 }} animate={on ? { opacity: 1, pathLength: 1 } : { opacity: 0, pathLength: 0 }} transition={{ duration: 1.4, ease: "easeOut" }} />
        {futureConnections.map((connection, index) => (
          <g key={connection.d}>
            <motion.path d={connection.d} fill="none" stroke="#FF6A00" strokeWidth="2.7" strokeLinecap="round" strokeDasharray="5 5" initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={on ? { pathLength: 1, opacity: .8 } : { pathLength: 0, opacity: 0 }} transition={{ duration: .85, delay: reduced ? 0 : .65 + index * .2 }} />
            <motion.circle cx={connection.x} cy={connection.y} r="4.5" fill="#FF6A00" initial={reduced ? false : { opacity: 0, scale: 0 }} animate={on ? { opacity: .8, scale: 1 } : { opacity: 0, scale: 0 }} transition={{ delay: reduced ? 0 : 1.15 + index * .2, duration: .3 }} />
          </g>
        ))}
        <motion.circle cx="342.1" cy="267.3" r="20" fill="#FF6A00" opacity=".12" initial={reduced ? false : { scale: .5, opacity: 0 }} animate={on ? { scale: 1.25, opacity: .18 } : { scale: .5, opacity: 0 }} transition={{ duration: 1.3, delay: .4 }} style={{ transformOrigin: "342.1px 267.3px" }} />
        <circle cx="342.1" cy="267.3" r="7" fill="#FF6A00" stroke="#fff" strokeWidth="2.5" />
        <g>
          <rect x="354" y="237" width="118" height="30" rx="9" fill="#0866FF" />
          <text x="365" y="257" fill="white" fontSize="15" fontWeight="700">Prayagraj</text>
        </g>
      </svg>
      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-[#dce4f0] bg-white/95 px-4 py-3 text-xs leading-5 text-[#4a5b78] shadow-sm sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[280px]">
        <span className="font-bold text-[#041b3d]">Prayagraj: initial launch</span>
        <span className="mt-1 block">Orange connections illustrate potential expansion, not live service coverage.</span>
      </div>
    </div>
  );
}
