import Image from "next/image";
import type { Placement } from "@/types/domain";

// AI-generated illustrations supplied by the owner (public/images/formats). They show how a
// placement could look; they are not photographs of real BlinkMyAd installations, and are labelled.
const photos: Partial<Record<Placement, { src: string; alt: string }>> = {
  auto_rear: {
    src: "/images/blinkmyad/auto.webp",
    alt: "Illustration of a digital ad screen on the back of an auto rickshaw in city traffic",
  },
  bike_rear: {
    src: "/images/blinkmyad/bike.webp",
    alt: "Illustration of a digital ad screen on a delivery box behind a scooter rider",
  },
  helmet: {
    src: "/images/blinkmyad/helmet.webp",
    alt: "3D illustration of a printed advertising wrap on a helmet",
  },
  auto_side: {
    src: "/images/blinkmyad/auto-side.webp",
    alt: "Illustration of a digital ad screen on the side of an auto rickshaw",
  },
  car_rear: {
    src: "/images/blinkmyad/car-rear.webp",
    alt: "Illustration of a digital ad screen in the rear window of a car",
  },
  car_interior: {
    src: "/images/blinkmyad/interior.webp",
    alt: "Illustration of a seat-back ad screen seen by a passenger inside a car",
  },
};

const labels: Record<Placement, string> = {
  bike_rear: "Illustration of a screen mounted behind a motorbike rider",
  auto_rear: "Illustration of a screen on the back of an auto rickshaw",
  auto_side: "Illustration of a screen on the side of an auto rickshaw",
  car_rear: "Illustration of a screen in a car's rear window",
  car_interior: "Illustration of a screen on the back of a car seat",
  helmet: "Illustration of a printed helmet wrap",
};

const INK = "#041b3d";
const LINE = "#9fb0cc";

/**
 * Schematic line drawing of an ad placement. It is an illustration, not a
 * photograph of real hardware or live inventory, and says so on the artwork.
 */
export function FormatPreviewArt({ type }: { type: Placement }) {
  const photo = photos[type];
  if (photo) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-surface-sunken">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={type === "bike_rear" ? "object-contain" : "object-cover"}
        />
        <span className="absolute right-2 bottom-2 rounded bg-ink/80 px-2 py-0.5 text-xs text-white">
          Illustration
        </span>
      </div>
    );
  }
  return <FormatDrawing type={type} />;
}

/** Line drawing, kept as a fallback for any placement without an illustration image. */
function FormatDrawing({ type }: { type: Placement }) {
  return (
    <svg
      viewBox="0 0 420 240"
      role="img"
      aria-label={labels[type]}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="420" height="240" fill="#eef2f8" />
      <line x1="0" y1="206" x2="420" y2="206" stroke={LINE} strokeWidth="2" />
      <g fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        {type === "bike_rear" ? (
          <>
            <ellipse cx="210" cy="186" rx="16" ry="20" />
            <path d="M184 150h52l-8 22h-36z" />
            <circle cx="210" cy="46" r="16" />
            <path d="M188 66h44l8 52h-60z" />
          </>
        ) : null}
        {type === "auto_rear" ? (
          <>
            <path d="M120 176V96q0-40 40-44h100q40 4 40 44v80z" />
            <circle cx="140" cy="190" r="16" />
            <circle cx="280" cy="190" r="16" />
            <path d="M120 176h180" />
          </>
        ) : null}
        {type === "auto_side" ? (
          <>
            <path d="M90 176V104q4-46 56-50h96q30 2 44 40l44 18v64z" />
            <circle cx="130" cy="190" r="16" />
            <circle cx="300" cy="190" r="16" />
          </>
        ) : null}
        {type === "car_rear" ? (
          <>
            <path d="M96 180v-62l30-56h168l30 56v62z" />
            <path d="M96 140h228" />
            <rect x="104" y="180" width="34" height="18" rx="4" />
            <rect x="282" y="180" width="34" height="18" rx="4" />
          </>
        ) : null}
        {type === "car_interior" ? (
          <>
            <rect x="166" y="22" width="88" height="36" rx="12" />
            <path d="M136 206V84q0-22 22-22h104q22 0 22 22v122" />
          </>
        ) : null}
        {type === "helmet" ? (
          <>
            <path d="M120 160q0-104 100-104 90 0 96 92l-36 12H120z" />
            <path d="M280 120h40" />
          </>
        ) : null}
      </g>
      {type === "helmet" ? (
        <g>
          <path d="M126 128q10-50 94-56 50 0 74 32l-174 24z" fill="#0866ff" />
          <text x="206" y="121" fill="#fff" fontSize="13" fontWeight="600" textAnchor="middle">
            Your design
          </text>
        </g>
      ) : (
        <AdScreen type={type} />
      )}
      <text x="408" y="230" fill="#4a5b78" fontSize="12" textAnchor="end">
        Illustration
      </text>
    </svg>
  );
}

const screens: Record<
  Exclude<Placement, "helmet">,
  { x: number; y: number; w: number; h: number }
> = {
  bike_rear: { x: 160, y: 84, w: 100, h: 62 },
  auto_rear: { x: 158, y: 74, w: 104, h: 70 },
  auto_side: { x: 150, y: 76, w: 100, h: 64 },
  car_rear: { x: 150, y: 74, w: 120, h: 58 },
  car_interior: { x: 160, y: 86, w: 100, h: 66 },
};

function AdScreen({ type }: { type: Exclude<Placement, "helmet"> }) {
  const s = screens[type];
  return (
    <g>
      <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="6" fill={INK} />
      <rect x={s.x + 5} y={s.y + 5} width={s.w - 10} height={s.h - 10} rx="3" fill="#0866ff" />
      <text
        x={s.x + s.w / 2}
        y={s.y + s.h / 2 + 5}
        fill="#fff"
        fontSize="15"
        fontWeight="600"
        textAnchor="middle"
      >
        Your ad
      </text>
    </g>
  );
}
