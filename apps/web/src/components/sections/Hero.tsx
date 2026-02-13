"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const metrics = [
  { label: "Properties Analyzed", value: "2.4M+", delay: 0.1 },
  { label: "Avg Deal ROI", value: "24.3%", delay: 0.2 },
  { label: "Active Investors", value: "8.2K", delay: 0.3 },
];

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="luxury-gradient relative overflow-hidden min-h-[90vh] flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Headline */}
          <motion.div variants={itemVariants}>
            <p className="text-sm uppercase tracking-widest text-teal-400 font-semibold mb-6">
              AI-Powered Investment Intelligence
            </p>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 text-white"
          >
            Score Deals <span className="text-teal-400">Faster</span>.
            <br />
            Invest <span className="text-amber-500">Smarter</span>.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Real estate investing intelligence platform that scores properties in
            seconds, analyzes financials instantly, and alerts you to deals before
            they're gone.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/signup" className="btn-primary">
              Start Free Trial
            </Link>
            <Link href="#features" className="btn-secondary">
              See How It Works
            </Link>
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            variants={itemVariants}
            className="text-sm text-slate-400 mb-20"
          >
            <p>Trusted by investors managing $2.4B+ in real estate</p>
          </motion.div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
        >
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              variants={itemVariants}
              className="data-card"
            >
              <div className="metric">
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
