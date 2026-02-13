import React from "react";

export interface ScoreBadgeProps {
  score: number; // 0-100
  animated?: boolean;
  className?: string;
}

export function ScoreBadge({ score, animated = true, className = "" }: ScoreBadgeProps) {
  const getColor = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-emerald-600";
    if (score >= 65) return "from-teal-500 to-teal-600";
    if (score >= 50) return "from-amber-500 to-amber-600";
    if (score >= 35) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  const getLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 65) return "Good";
    if (score >= 50) return "Fair";
    if (score >= 35) return "Weak";
    return "Poor";
  };

  return (
    <div
      className={`
        relative w-24 h-24 rounded-full flex items-center justify-center
        bg-gradient-to-br ${getColor(score)}
        shadow-lg ${animated ? "animate-pulse-soft" : ""}
        ${className}
      `}
    >
      <div className="text-center">
        <div className="text-2xl font-bold text-white">{Math.round(score)}</div>
        <div className="text-xs font-semibold text-white opacity-90">{getLabel(score)}</div>
      </div>
    </div>
  );
}
