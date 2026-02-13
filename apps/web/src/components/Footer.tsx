import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <span className="font-display text-white font-bold">P</span>
              </div>
              <span className="font-display text-lg font-bold text-white">
                PropIntel
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              AI-powered real estate investment intelligence
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="text-slate-400 hover:text-teal-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-slate-400 hover:text-teal-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-slate-400 hover:text-teal-400">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-teal-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-teal-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-slate-400 hover:text-teal-400">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-teal-400">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-teal-400">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-teal-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm">
            © 2024 PropIntel AI. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="text-slate-500 hover:text-teal-400">
              Twitter
            </Link>
            <Link href="#" className="text-slate-500 hover:text-teal-400">
              LinkedIn
            </Link>
            <Link href="#" className="text-slate-500 hover:text-teal-400">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
