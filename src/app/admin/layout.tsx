"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Globe,
  Stamp,
  FileStack,
  Link2,
  CreditCard,
  Mail,
  Users,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/authStore";
import { adminAuthService } from "@/services/adminAuthService";
import { useTranslations } from "@/stores/languageStore";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
  permission: string;
}

const navItemsConfig: NavItem[] = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard, permission: "dashboard" },
  { key: "applications", href: "/admin/applications", icon: FileText, permission: "applications" },
  { key: "countries", href: "/admin/countries", icon: Globe, permission: "countries" },
  { key: "visaTypes", href: "/admin/visa-types", icon: Stamp, permission: "visa_types" },
  { key: "templates", href: "/admin/templates", icon: FileStack, permission: "templates" },
  { key: "templateBindings", href: "/admin/template-bindings", icon: Link2, permission: "bindings" },
  { key: "paymentPage", href: "/admin/payment-page-builder", icon: CreditCard, permission: "payment_page" },
  { key: "emailTemplates", href: "/admin/email-templates", icon: Mail, permission: "email_templates" },
  { key: "users", href: "/admin/users", icon: Users, permission: "users" },
  { key: "settings", href: "/admin/settings", icon: Settings, permission: "settings" },
];

function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminSession, hasPermission, setAdminSession } = useAuthStore();
  const t = useTranslations();

  const handleLogout = () => {
    adminAuthService.logout();
    setAdminSession(null);
    router.push("/admin/login");
  };

  const filteredNavItems = navItemsConfig.filter((item) => hasPermission(item.permission));

  return (
    <div className={cn("flex flex-col h-full bg-slate-900 text-white", className)}>
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">E-Visa Admin</h1>
        {adminSession && (
          <p className="text-sm text-slate-400 mt-1">{adminSession.name}</p>
        )}
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const title = t.nav[item.key as keyof typeof t.nav] || item.key;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <item.icon className="h-5 w-5" />
                {title}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          {t.nav.logout}
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { adminSession, setAdminSession } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check session on mount
    const session = adminAuthService.getCurrentSession();
    if (session) {
      setAdminSession(session);
    }
  }, [setAdminSession]);

  useEffect(() => {
    if (mounted && !adminSession && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [mounted, adminSession, pathname, router]);

  // Don't render layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!mounted) {
    return null;
  }

  if (!adminSession) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex w-64 flex-shrink-0" />
      
      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="font-semibold">E-Visa Admin</h1>
          </div>
          <LanguageSwitcher />
        </header>
        
        {/* Desktop Language Switcher */}
        <div className="hidden md:flex absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
