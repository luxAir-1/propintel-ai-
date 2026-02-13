"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-20 md:py-32 bg-slate-950 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-amber-500/10" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your <span className="text-teal-400">Deal Pipeline</span>?
          </h2>

          <p className="text-xl text-slate-300 mb-12 leading-relaxed">
            Join thousands of investors who've already found better deals faster
            with PropIntel AI. Start your free trial today—no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg">
              Start Free Trial →
            </Link>
            <Link
              href="/demo"
              className="btn-secondary text-lg"
            >
              Schedule Demo
            </Link>
          </div>

          <p className="mt-8 text-slate-500 text-sm">
            30-day free trial • Full access to all features • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
