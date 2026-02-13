"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "⚡",
    title: "AI Deal Scoring",
    description: "Get scores 0-100 in seconds using proprietary ML models trained on 2M+ properties.",
  },
  {
    icon: "💰",
    title: "Financial Analysis",
    description: "Instant mortgage, expense, and cash flow projections with 5-year ROI forecasts.",
  },
  {
    icon: "🔔",
    title: "Smart Alerts",
    description: "Get notified when deals match your criteria. Never miss an opportunity again.",
  },
  {
    icon: "📊",
    title: "Portfolio Dashboard",
    description: "Track all your properties, metrics, and performance in one intelligent dashboard.",
  },
  {
    icon: "📄",
    title: "PDF Reports",
    description: "Generate professional investment reports for partners, banks, and due diligence.",
  },
  {
    icon: "🌍",
    title: "Multi-Market",
    description: "Analyze properties across the US with localized comps, taxes, and regulations.",
  },
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      id="features"
      className="py-20 md:py-32 bg-slate-950 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-0 w-1 h-64 bg-gradient-to-b from-teal-500 to-transparent" />
        <div className="absolute top-1/4 right-0 w-1 h-96 bg-gradient-to-b from-amber-500 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-teal-400 font-semibold mb-4">
            Capabilities
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            Everything You Need to Win
          </h2>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group data-card hover:bg-slate-900/60 cursor-pointer"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
