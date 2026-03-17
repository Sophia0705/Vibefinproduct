"use client";

import Image from "next/image";
import { useState } from "react";

export default function BankLogo(props: {
  bankName: string;
  src: string | null;
  width?: number;
  height?: number;
}) {
  const width = props.width ?? 90;
  const height = props.height ?? 30;
  const [failed, setFailed] = useState(false);

  if (!props.src || failed) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-md bg-sky-50 text-xs font-semibold text-sky-700 ring-1 ring-sky-100"
        style={{ width, height }}
        aria-label={`${props.bankName} 로고`}
      >
        {props.bankName.slice(0, 1)}
      </span>
    );
  }

  const safeSrc = encodeURI(props.src);

  return (
    <span
      className="relative inline-flex overflow-hidden rounded-md bg-white ring-1 ring-sky-100"
      style={{ width, height }}
      aria-label={`${props.bankName} 로고`}
    >
      <Image
        src={safeSrc}
        alt={`${props.bankName} 로고`}
        fill
        sizes={`${width}px`}
        style={{ objectFit: "contain" }}
        onError={() => setFailed(true)}
        priority={false}
      />
    </span>
  );
}