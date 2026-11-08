import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { brand } from "@/config/brand";

type BrandLogoProps = {
  href?: string;
  className?: string;
  width?: number;
  priority?: boolean;
  inverse?: boolean;
};

export function BrandLogo({
  href = "/",
  className,
  width = 185,
  priority = false,
  inverse = false,
}: BrandLogoProps) {
  const logo = (
    <Image
      src={brand.assets.public.src}
      alt={brand.assets.public.alt}
      width={width}
      height={Math.round((width * brand.assets.public.height) / brand.assets.public.width)}
      priority={priority}
      className={cn("block h-auto max-w-full object-contain", inverse && "brightness-0 invert", className)}
    />
  );
  return href ? (
    <Link
      prefetch={false}
      href={href}
      className="inline-flex shrink-0 items-center rounded focus-visible:outline-offset-4"
    >
      {logo}
    </Link>
  ) : (
    logo
  );
}
