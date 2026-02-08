"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { useTranslations } from "@/stores/languageStore";

export function PublicFooter() {
  const t = useTranslations();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-8 w-8" />
              <span className="font-bold text-xl">E-Visa Portal</span>
            </div>
            <p className="text-slate-400 text-sm">
              {t.public.footer.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.nav.home}</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t.public.home.startApplication}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  {t.nav.track}
                </Link>
              </li>
              <li>
                <Link href="/me" className="hover:text-white transition-colors">
                  {t.nav.myApplications}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  {t.nav.faq}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t.nav.about}</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {t.nav.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t.nav.terms}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t.nav.contact}</h4>
            <ul className="space-y-2 text-slate-400">
              <li>support@evisa.example.com</li>
              <li>+1 (555) 123-4567</li>
              <li>Mon - Fri: 9am - 6pm</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} E-Visa Portal. {t.public.footer.rights}.</p>
          <p className="mt-2">This is a demo application for demonstration purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
