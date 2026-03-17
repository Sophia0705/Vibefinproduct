"use client";

import { useState } from "react";

export default function BankLogo(props: {
  bankName: string;
  src: string | null;
  size?: number;
}) {
  const size = props.size ?? 28;
  const [failed, setFailed] = useState(false);

  if (!props.src || failed) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-md bg-sky-50 text-xs font-semibold text-sky-700 ring-1 ring-sky-100"
        style={{ width: size, height: size }}
        aria-label={`${props.bankName} 로고`}
      >
        {props.bankName.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      src={props.src}
      alt={`${props.bankName} 로고`}
      width={size}
      height={size}
      className="rounded-md bg-white ring-1 ring-sky-100"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

