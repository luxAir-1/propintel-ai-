"use client";

import { motion } from "framer-motion";
import { DealCard } from "@propintel/ui";

// Sample data
const sampleDeals = [
  {
    address: "1234 Oak Street",
    city: "Austin",
    state: "TX",
    price: 425000,
    roi: 22.5,
    capRate: 6.8,
    score: 87,
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=400",
  },
  {
    address: "5678 Elm Avenue",
    city: "Austin",
    state: "TX",
    price: 380000,
    roi: 18.3,
    capRate: 5.9,
    score: 72,
    imageUrl: "https://images.unsplash.com/photo-1554995207-c18231b6ce48?w=400",
  },
  {
    address: "9012 Pine Road",
    city: "Austin",
    state: "TX",
    price: 550000,
    roi: 26.1,
    capRate: 7.4,
    score: 94,
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
  },
];

const stats = [
  { label: "Properties Analyzed", value: "24", change: "+3 this week" },
  { label: "Avg Deal Score", value: "81.2", change: "+2.4 points" },
  { label: "Portfolio Value", value: "$1.2M", change: "+$145K" },
  { label: "Avg Monthly Income", value: "$8,420", change: "+$1,240" },
];

export default function DashboardPage() {
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
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="glass-effect border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
          <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors">
            Account Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="data-card"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                    {stat.label}
                  </p>
                  <p className="font-display text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
                <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Deals */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-white">
                Top Opportunities
              </h2>
              <a href="#" className="text-teal-400 hover:text-teal-300 text-sm font-medium">
                View All →
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleDeals.map((deal, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <DealCard {...deal} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mt-12 data-card"
        >
          <h3 className="font-display text-xl font-bold text-white mb-6">
            Portfolio Performance
          </h3>
          <div className="h-64 bg-slate-900/50 rounded-lg flex items-center justify-center text-slate-500">
            {/* Chart placeholder */}
            <span className="text-sm">Chart Component (Recharts integration)</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
