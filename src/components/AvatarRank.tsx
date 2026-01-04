import React from "react";
import clsx from "clsx";

interface AvatarRankProps {
  name?: string;
  image?: string;
  rank?: string;
  size?: "normal" | "large";
}

type RankStyle = {
  border: string;     // classe tailwind para a borda
  text: string;       // classe tailwind para o texto
  bg: string;         // classe tailwind para o background (badge)
  glowColor: string;  // cor em hex/rgba para o box-shadow
};

const rankStyles: Record<string, RankStyle> = {
  iniciante: {
    border: "border-green-500",
    text: "text-green-500",
    bg: "bg-green-500/10",
    glowColor: "rgba(34, 197, 94, 0.8)",
  },
  regular: {
    border: "border-blue-500",
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    glowColor: "rgba(59, 130, 246, 0.8)",
  },
  promissor: {
    border: "border-cyan-400",
    text: "text-cyan-400",
    bg: "bg-cyan-400/10",
    glowColor: "rgba(34, 211, 238, 0.8)",
  },
  epico: {
    border: "border-purple-500",
    text: "text-purple-500",
    bg: "bg-purple-500/10",
    glowColor: "rgba(168, 85, 247, 0.8)",
  },
  lenda: {
    border: "border-yellow-400",
    text: "text-yellow-400",
    bg: "bg-yellow-400/10",
    glowColor: "rgba(250, 204, 21, 0.8)",
  },
  icone: {
    border: "border-orange-500",
    text: "text-orange-500",
    bg: "bg-orange-500/10",
    glowColor: "rgba(249, 115, 22, 0.8)",
  },
  fabula: {
    border: "border-rose-600",
    text: "text-rose-600",
    bg: "bg-rose-600/10",
    glowColor: "rgba(225, 29, 72, 0.8)",
  },
};

export function AvatarRank({ name, image, rank, size = "normal" }: AvatarRankProps) {
  const normalizedRank =
    rank?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || "";

  const styles = rankStyles[normalizedRank] ?? {
    border: "border-slate-500",
    text: "text-slate-400",
    bg: "bg-slate-500/10",
    glowColor: "rgba(148, 163, 184, 0.3)", // slate 400
  };

  const avatarSize = size === "large" ? "w-40 h-40" : "w-32 h-32";

  return (
    <div className="relative z-10 flex flex-col items-center">
      {/* Avatar com borda e glow */}
      <div
        className={clsx(
          avatarSize,
          "rounded-full border-4 overflow-hidden mb-4 bg-space-900 transition-all duration-300",
          styles.border
        )}
        style={{ boxShadow: `0 0 20px ${styles.glowColor}` }}
      >
        {image ? (
          <img src={image} alt={name || "Player"} className="w-full h-full object-cover" />
        ) : (
          <div className={clsx("w-full h-full flex items-center justify-center text-4xl font-bold", styles.text)}>
            {name?.charAt(0) || "?"}
          </div>
        )}
      </div>

      {/* Nome */}
      <h2 className="text-2xl font-bold tracking-wide text-white">{name || "Desconhecido"}</h2>

      {/* Badge de rank */}
      <div
        className={clsx(
          "px-3 py-1 text-xs font-bold rounded-full mt-2 border uppercase tracking-wider",
          styles.bg,
          styles.text,
          // borda do badge com mesma cor, mais suave (opacity /30)
          `${styles.border}/30`
        )}
      >
        {rank || "Sem Rank"}
      </div>
    </div>
  );
}
