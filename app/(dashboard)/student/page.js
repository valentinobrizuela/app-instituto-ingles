"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const skillScores = [
    { name: "Speaking", score: 85, color: "bg-emerald-500" },
    { name: "Listening", score: 78, color: "bg-blue-500" },
    { name: "Writing", score: 92, color: "bg-amber-500" },
    { name: "Reading", score: 88, color: "bg-purple-500" },
    { name: "Grammar", score: 80, color: "bg-rose-500" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header & Gamification */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">¡Hola, Valentín! 👋</h1>
          <p className="text-slate-500">Nivel Actual: <span className="font-bold text-amber-600">B2 Upper Intermediate</span></p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-lg">
              <i className="fa-solid fa-fire"></i>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Racha</p>
              <p className="font-extrabold text-slate-900">12 Días</p>
            </div>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">
              <i className="fa-solid fa-gem"></i>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Experiencia</p>
              <p className="font-extrabold text-slate-900">2,450 XP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <h2 className="text-xl font-bold text-slate-900 mb-6 font-outfit">Tu Progreso Mensual</h2>
            
            <div className="space-y-5">
              {skillScores.map((skill, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-700">{skill.name}</span>
                    <span className="font-bold text-slate-900">{skill.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-2.5 rounded-full ${skill.color}`}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Classes & Assignments */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-amber-500"></i> Próximas Clases
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center group hover:border-amber-200 transition-colors cursor-pointer">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Speaking & Debate</h4>
                    <p className="text-xs text-slate-500 mt-1"><i className="fa-regular fa-clock"></i> Hoy, 18:00 hs</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center group hover:border-amber-200 transition-colors cursor-pointer">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Grammar Workshop</h4>
                    <p className="text-xs text-slate-500 mt-1"><i className="fa-regular fa-clock"></i> Jue, 17:30 hs</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-clipboard-list text-purple-500"></i> Tareas Pendientes
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-100 bg-white flex items-start gap-3 hover:shadow-md transition-shadow">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">Essay: The Future of Tech</h4>
                    <p className="text-xs text-rose-500 font-medium mt-1">Vence hoy</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-white flex items-start gap-3 hover:shadow-md transition-shadow">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500" />
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">Listening Comprehension</h4>
                    <p className="text-xs text-slate-500 mt-1">Vence mañana</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Sidebar (AI Tutor & Quick Actions) */}
        <div className="space-y-6">
          
          {/* AI Tutor Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-amber-400 text-xl border border-white/20 backdrop-blur-md">
                <i className="fa-solid fa-robot"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg">Tutor IA</h3>
                <p className="text-xs text-slate-300">Disponible 24/7</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-5 relative z-10">
              ¿Tenés dudas con el pasado perfecto? Hablemos y practiquemos ahora mismo.
            </p>
            <button className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-colors relative z-10 shadow-lg shadow-amber-500/20">
              Iniciar Conversación
            </button>
          </div>

          {/* Current Level Objective */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60">
            <h3 className="font-bold text-slate-900 mb-2">Objetivo de Nivel</h3>
            <p className="text-xs text-slate-500 mb-4">Te falta un 15% para desbloquear C1 Advanced.</p>
            <div className="flex justify-between text-xs font-bold text-slate-800 mb-2">
              <span>B2</span>
              <span>C1</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full w-[85%]"></div>
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60 flex items-center justify-between group cursor-pointer hover:border-amber-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <i className="fa-solid fa-certificate"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Mis Certificados</h4>
                <p className="text-xs text-slate-500">2 obtenidos</p>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-amber-500 transition-colors"></i>
          </div>

        </div>
      </div>
    </div>
  );
}
