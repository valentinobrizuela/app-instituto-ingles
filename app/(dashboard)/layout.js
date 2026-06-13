"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determinar rol basado en la ruta (simulado para frontend)
  const isStudent = pathname.includes("/student");
  const isTeacher = pathname.includes("/teacher");
  const isDirector = pathname.includes("/director");

  let navItems = [];
  let roleTitle = "";

  if (isStudent) {
    roleTitle = "Portal Alumno";
    navItems = [
      { name: "Dashboard", icon: "fa-solid fa-house", href: "/student" },
      { name: "Mi Rendimiento", icon: "fa-solid fa-chart-line", href: "/student/performance" },
      { name: "Tutor IA", icon: "fa-solid fa-robot", href: "/student/ai-tutor" },
      { name: "Recursos", icon: "fa-solid fa-book", href: "/student/resources" },
    ];
  } else if (isTeacher) {
    roleTitle = "Centro Docente";
    navItems = [
      { name: "Mis Clases", icon: "fa-solid fa-chalkboard-user", href: "/teacher" },
      { name: "Corrección IA", icon: "fa-solid fa-check-double", href: "/teacher/ai-grader" },
      { name: "Alumnos", icon: "fa-solid fa-users", href: "/teacher/students" },
      { name: "Mensajes", icon: "fa-solid fa-envelope", href: "/teacher/messages" },
    ];
  } else if (isDirector) {
    roleTitle = "Panel Ejecutivo";
    navItems = [
      { name: "Dashboard", icon: "fa-solid fa-chart-pie", href: "/director" },
      { name: "CRM Leads", icon: "fa-solid fa-funnel-dollar", href: "/director/crm" },
      { name: "Finanzas", icon: "fa-solid fa-file-invoice-dollar", href: "/director/finance" },
      { name: "Reportes IA", icon: "fa-solid fa-wand-magic-sparkles", href: "/director/reports" },
    ];
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-outfit">
      {/* Sidebar Mobile Toggle */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-700"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <i className="fa-solid fa-house-chimney-window text-lg"></i>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-outfit">West House</span>
              <span className="block text-[10px] text-amber-600 font-bold tracking-widest uppercase">{roleTitle}</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-700">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {navItems.map((item, idx) => {
            const active = pathname === item.href;
            return (
              <Link 
                key={idx} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? "bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-amber-100/50 text-amber-600" : "text-slate-400"}`}>
                  <i className={item.icon}></i>
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col h-screen overflow-y-auto relative">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-8 py-4 flex items-center justify-end">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-amber-600 transition-colors">
              <i className="fa-solid fa-bell"></i>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-200 to-amber-400 border-2 border-white shadow-sm flex items-center justify-center font-bold text-amber-800">
              U
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
