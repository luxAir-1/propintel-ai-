"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    name: "Investor",
    price: 79,
    description: "Perfect for individual investors",
    features: [
      "Unlimited property analysis",
      "10 saved searches",
      "Basic alerts",
      "Monthly reports",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 199,
    description: "For serious deal hunters",
    features: [
      "Everything in Investor +",
      "Unlimited searches",
      "Advanced alerts with SMS",
      "Weekly reports",
      "Portfolio tracking",
      "Priority support",
      "API access",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Group",
    price: 999,
    description: "For investment groups & teams",
    features: [
      "Everything in Pro +",
      "Unlimited team members",
      "Custom workflows",
      "Advanced analytics",
      "Dedicated account manager",
      "White-label option",
      "24/7 phone support",
    ],
    cta: "Schedule Demo",
    highlighted: false,
  },
];

export function Pricing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
      id="pricing"
      className="py-20 md:py-32 bg-gradient-to-b from-slate-950 to-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-amber-400 font-semibold mb-4">
            Transparent Pricing
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Start free. Scale as you grow. Cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6"
        >
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className={`relative rounded-2xl overflow-hidden transition-all ${
                plan.highlighted
                  ? "ring-2 ring-teal-500 transform md:scale-105"
                  : "border border-slate-800"
              } ${plan.highlighted ? "bg-slate-900" : "bg-slate-900/50 glass-effect"}`}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-1 text-xs font-bold text-white rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8 md:p-10">
                {/* Plan Name */}
                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-slate-400">/month</span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/signup?plan=${plan.name.toLowerCase()}`}
                  className={`w-full block text-center py-3 rounded-lg font-medium transition-all mb-8 ${
                    plan.highlighted
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <div className="space-y-4">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-3">
                      <span className="text-teal-400 mt-1">✓</span>
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-slate-400">
            Questions?{" "}
            <Link href="#" className="text-teal-400 hover:text-teal-300 font-medium">
              Check our FAQ
            </Link>
            {" "}or{" "}
            <Link href="#" className="text-teal-400 hover:text-teal-300 font-medium">
              contact sales
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
