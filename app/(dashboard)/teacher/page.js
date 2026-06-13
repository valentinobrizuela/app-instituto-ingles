"use client";

import React from "react";
import { motion } from "framer-motion";

export default function TeacherDashboard() {
  const courses = [
    { name: "B2 Upper - Adults", time: "18:00", students: 12, attendance: 95 },
    { name: "B1 Intermediate", time: "19:30", students: 15, attendance: 88 },
  ];

  const pendingTasks = [
    { title: "Corregir Essays B2", count: 12, due: "Hoy", urgent: true },
    { title: "Preparar quiz Vocabulary", count: 1, due: "Mañana", urgent: false },
    { title: "Revisar grabaciones A2", count: 8, due: "Viernes", urgent: false },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Hola, Maricel 📚</h1>
          <p className="text-slate-500">Tenés <span className="font-bold text-amber-600">2 clases</span> hoy y 12 tareas por corregir.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2.5 bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-amber-700 transition-all flex items-center gap-2">
            <i className="fa-solid fa-plus"></i> Nueva Tarea
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Cursos Asignados", value: "4", icon: "fa-solid fa-chalkboard-user", color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Alumnos Activos", value: "48", icon: "fa-solid fa-users", color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Asistencia Promedio", value: "92%", icon: "fa-solid fa-calendar-check", color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Tareas sin corregir", value: "12", icon: "fa-solid fa-file-signature", color: "text-rose-500", bg: "bg-rose-50" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.color} text-xl`}>
              <i className={stat.icon}></i>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">{stat.label}</p>
              <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Schedule Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Classes */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 font-outfit">Clases de Hoy</h2>
              <button className="text-sm font-bold text-amber-600 hover:text-amber-700">Ver Agenda</button>
            </div>
            
            <div className="space-y-4">
              {courses.map((course, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:border-amber-100 transition-all flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-700 font-bold">
                      <span className="text-sm">{course.time}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{course.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5"><i className="fa-solid fa-users mr-1"></i> {course.students} alumnos • {course.attendance}% asistencia</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Kanban Board Teaser (Tareas) */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-outfit mb-4">Gestión de Tareas</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 border-dashed">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex justify-between">Por Hacer <span className="bg-slate-200 text-slate-600 px-2 rounded-full">1</span></h4>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-sm font-semibold text-slate-700">
                  Subir material Reading B1
                </div>
              </div>
              <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 border-dashed">
                <h4 className="text-xs font-bold text-amber-700 uppercase mb-3 flex justify-between">Por Corregir <span className="bg-amber-200 text-amber-800 px-2 rounded-full">12</span></h4>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-sm font-semibold text-slate-700 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                  Essays B2 - "Future Tech"
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Prioridad Alta</span>
                    <button className="text-[10px] bg-slate-100 hover:bg-amber-500 hover:text-white px-2 py-1 rounded transition-colors">Corregir con IA</button>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 border-dashed">
                <h4 className="text-xs font-bold text-emerald-700 uppercase mb-3 flex justify-between">Completado <span className="bg-emerald-200 text-emerald-800 px-2 rounded-full">24</span></h4>
                <div className="opacity-60 bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-sm font-semibold text-slate-700">
                  <strike>Corregir Quizzes A2</strike>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Sidebar (AI Grader & Alerts) */}
        <div className="space-y-6">
          
          {/* AI Automations */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles text-indigo-300"></i> Asistente IA
              </h3>
            </div>
            <p className="text-sm text-indigo-200 mb-5 relative z-10 leading-relaxed">
              La IA puede pre-evaluar los 12 ensayos pendientes, destacando errores comunes de gramática.
            </p>
            <button className="w-full py-3 bg-white hover:bg-indigo-50 text-indigo-900 font-bold rounded-xl transition-colors relative z-10">
              Auto-Corregir Tareas
            </button>
          </div>

          {/* Academic Alerts */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-rose-500"></i> Alertas Tempranas
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-xs font-bold text-rose-800">Pedro G. (B1)</p>
                <p className="text-[11px] text-rose-600 mt-1">Faltó a las últimas 3 clases. Riesgo de abandono alto.</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-800">Sofía M. (B2)</p>
                <p className="text-[11px] text-amber-700 mt-1">Bajo rendimiento en el último test de Speaking (60%).</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Inbox <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 rounded-full ml-1">2</span></h3>
              <a href="#" className="text-xs text-amber-600 font-semibold hover:underline">Ver todo</a>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-none">Mamá de Sofía</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">Profe, Sofi está enferma hoy no...</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-none">Dirección</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">Reunión de profes este viernes...</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
