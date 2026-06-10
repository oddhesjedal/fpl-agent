"use client";

import { useState } from "react";

// Club badge from the FPL image CDN, addressed by the team's `code`.
export function TeamBadge({
  code,
  size = 20,
  className = "",
}: {
  code: number;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!code || failed) {
    return (
      <span
        className={`inline-block rounded-full bg-slate-200 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://resources.premierleague.com/premierleague/badges/50/t${code}.png`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`inline-block object-contain ${className}`}
    />
  );
}

// Player headshot from the FPL CDN, falling back to the club badge on error
// (handles new signings whose photo isn't published yet).
export function PlayerPhoto({
  photoId,
  teamCode,
  size = 56,
}: {
  photoId: string;
  teamCode: number;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (!photoId || failed) {
    return (
      <div
        className="grid place-items-center rounded-full bg-fpl-purple/5"
        style={{ width: size, height: size }}
      >
        <TeamBadge code={teamCode} size={Math.round(size * 0.6)} />
      </div>
    );
  }
  return (
    <div
      className="overflow-hidden rounded-full bg-fpl-purple/5"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${photoId}.png`}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover object-top"
      />
    </div>
  );
}
