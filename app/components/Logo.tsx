"use client";
import Image from "next/image";
import React from "react";

type Props = {
  src?: string;
  alt?: string;
  size?: number; // px
};

const Logo: React.FC<Props> = ({ src = "/images/logo-electoral.png", alt = "Logo", size = 64 }) => {
  const w = Math.round(size / 4) * 4; // keep multiples of 4
  const cls = `rounded-full border-2 border-white object-cover w-${w} h-${w}`;

  // Note: Tailwind doesn't support arbitrary w-N classes generated like this at runtime.
  // We'll use inline style for exact size and keep tailwind classes for shape.
  return (
    <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border-2 border-white">
      <Image src={src} alt={alt} width={size} height={size} className="object-cover" />
    </div>
  );
};

export default Logo;
