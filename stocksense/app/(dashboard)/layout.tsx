"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PackageCheck,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  LogOut,
  Boxes,
  User,
  ChevronRight,
  Menu,
  X,
  Search,
} from "lucide-react";
import { StockProvider } from "@/lib/stock-context";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const mainNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { name: "Products", href: "/products", icon: <Package size={18} /> },
];

const operationsNav: NavItem[] = [
  { name: "Receipts", href: "/operations/receipts", icon: <PackageCheck size={18} /> },
  { name: "Delivery Orders", href: "/operations/deliveries", icon: <Truck size={18} /> },
  { name: "Internal Transfers", href: "/operations/transfers", icon: <ArrowLeftRight size={18} /> },
  { name: "Stock Adjustments", href: "/operations/adjustments", icon: <SlidersHorizontal size={18} /> },
  { name: "Move History", href: "/operations/ledger", icon: <History size={18} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    router.push("/login");
  }

  // Get title from current path
  const getPageTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard";
    if (pathname.includes("/products")) return "Product Master";
    if (pathname.includes("/operations/receipts")) return "Receipts (Stock In)";
    if (pathname.includes("/operations/deliveries")) return "Delivery Orders (Stock Out)";
    if (pathname.includes("/operations/transfers")) return "Internal Transfers";
    if (pathname.includes("/operations/adjustments")) return "Stock Adjustments";
    if (pathname.includes("/operations/ledger")) return "Move History & Audit Ledger";
    return "StockSense";
  };

  return (
    <StockProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900">
        {/* Mobile Topbar */}
        <div className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Boxes size={20} />
            </div>
            <span>StockSense</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 p-1">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 transform lg:static lg:translate-x-0
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div>
            {/* Logo Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-800">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Boxes size={22} />
                </div>
                <div>
                  <span className="font-bold text-lg text-white tracking-tight leading-none block">StockSense</span>
                  <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Inventory v1.0</span>
                </div>
              </Link>
            </div>

            {/* Navigation links */}
            <div className="px-4 py-6 space-y-6 overflow-y-auto">
              <div>
                <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Main</p>
                <nav className="space-y-1">
                  {mainNav.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.name}</span>
                        </div>
                        {isActive && <ChevronRight size={14} className="opacity-70" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div>
                <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Operations</p>
                <nav className="space-y-1">
                  {operationsNav.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.name}</span>
                        </div>
                        {isActive && <ChevronRight size={14} className="opacity-70" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs border border-slate-600">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white leading-tight">Alex Morgan</p>
                  <p className="text-[11px] text-slate-400">Inventory Manager</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-slate-900">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-500 w-64">
                <Search size={14} className="mr-2 text-slate-400" />
                <span>Search products, references...</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Demo State Active
              </span>
            </div>
          </header>

          {/* Children View */}
          <main className="flex-1 bg-slate-50">{children}</main>
        </div>
      </div>
    </StockProvider>
  );
}
