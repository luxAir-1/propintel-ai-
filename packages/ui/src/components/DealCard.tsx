import React from "react";
import { ScoreBadge } from "./ScoreBadge";

export interface DealCardProps {
  address: string;
  city: string;
  state: string;
  price: number;
  roi: number;
  capRate: number;
  score: number;
  imageUrl?: string;
}

export function DealCard({
  address,
  city,
  state,
  price,
  roi,
  capRate,
  score,
  imageUrl,
}: DealCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="glass-effect rounded-xl overflow-hidden hover:border-teal-500/50 transition-all group cursor-pointer">
      {/* Image Container */}
      {imageUrl && (
        <div className="relative h-48 bg-slate-800 overflow-hidden">
          <img
            src={imageUrl}
            alt={address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-6 relative">
        {/* Score Badge - Positioned Absolutely */}
        <div className="absolute -top-8 right-6">
          <ScoreBadge score={score} />
        </div>

        {/* Property Info */}
        <div className="mb-4 pr-20">
          <h3 className="font-display text-lg font-bold text-white mb-1">
            {address}
          </h3>
          <p className="text-sm text-slate-400">
            {city}, {state}
          </p>
        </div>

        {/* Price */}
        <div className="mb-6 pb-6 border-b border-slate-700">
          <p className="text-3xl font-bold text-white">
            {formatPrice(price)}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
              Est. ROI
            </p>
            <p className="text-xl font-bold text-teal-400">{roi.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
              Cap Rate
            </p>
            <p className="text-xl font-bold text-amber-400">{capRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full mt-6 py-2 rounded-lg font-medium text-sm bg-slate-800 hover:bg-slate-700 text-white transition-colors">
          View Full Analysis
        </button>
      </div>
    </div>
  );
}
