"use client";

import React from "react";

export default function DirectorDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Panel Ejecutivo 📈</h1>
          <p className="text-slate-500">Resumen financiero y académico de <span className="font-bold text-slate-900">West House</span>.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <i className="fa-solid fa-file-export"></i> Exportar PDF
          </button>
          <button className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2">
            <i className="fa-solid fa-plus"></i> Nueva Campaña
          </button>
        </div>
      </div>

      {/* Main KPIs (Stripe-like) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ingresos (Mes)", value: "$4.2M", trend: "+12%", up: true },
          { label: "Alumnos Activos", value: "350", trend: "+5%", up: true },
          { label: "Nuevas Inscripciones", value: "28", trend: "-2%", up: false },
          { label: "Tasa de Retención", value: "96%", trend: "+1%", up: true },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 flex flex-col">
            <p className="text-xs text-slate-500 font-bold uppercase mb-2">{stat.label}</p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</span>
              <span className={`text-xs font-bold mb-1 px-1.5 py-0.5 rounded ${stat.up ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {stat.trend} <i className={`fa-solid ${stat.up ? "fa-arrow-trend-up" : "fa-arrow-trend-down"}`}></i>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Charts & CRM) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Revenue Chart Mock */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 font-outfit">Evolución Financiera</h2>
              <select className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <option>Últimos 6 meses</option>
                <option>Este año</option>
              </select>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2 border-b border-slate-100 pb-2 relative">
              {/* Background grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-t border-slate-400 w-full"></div>
                <div className="border-t border-slate-400 w-full"></div>
                <div className="border-t border-slate-400 w-full"></div>
                <div className="border-t border-slate-400 w-full"></div>
              </div>

              {[60, 40, 70, 85, 65, 95].map((height, i) => (
                <div key={i} className="w-full flex justify-center relative group">
                  <div 
                    className="w-full max-w-[3rem] bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-xl group-hover:opacity-80 transition-opacity" 
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="absolute -bottom-8 text-xs text-slate-400 font-bold">Mes {i+1}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-6 text-sm">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Ingresos Recurrentes</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Nuevas Inscripciones</div>
            </div>
          </div>

          {/* Educational CRM (Embudo) */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 font-outfit">Embudo de Admisiones (CRM)</h2>
              <button className="text-sm text-blue-600 font-bold hover:underline">Ir al CRM Completo</button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Leads</p>
                <p className="text-2xl font-black text-slate-800">120</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Contactados</p>
                <p className="text-2xl font-black text-blue-900">85</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
                <p className="text-xs text-amber-600 font-bold uppercase mb-1">Entrevistas</p>
                <p className="text-2xl font-black text-amber-900">42</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Inscritos</p>
                <p className="text-2xl font-black text-emerald-900">28</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (AI Predictions & Control) */}
        <div className="space-y-6">
          
          {/* AI Predictions */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-[-20%] left-[-20%] w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
            <h3 className="font-bold text-lg flex items-center gap-2 mb-6 relative z-10">
              <i className="fa-solid fa-brain text-emerald-400"></i> Inteligencia de Negocio
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase mb-1">Predicción de Ingresos</h4>
                <p className="text-lg font-bold text-emerald-300">+15% para el próximo mes según tendencia actual de inscripciones.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase mb-1">Riesgo Financiero</h4>
                <p className="text-sm font-semibold text-rose-300"><i className="fa-solid fa-circle-exclamation text-xs mr-1"></i> 12 cuotas pendientes superan los 30 días de mora.</p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Approvals */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60">
            <h3 className="font-bold text-slate-900 mb-4">Acciones Pendientes</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-800">Aprobar Beca (50%)</p>
                  <p className="text-xs text-slate-500">Solicitado por: Prof. Martínez</p>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200"><i className="fa-solid fa-check text-xs"></i></button>
                  <button className="w-8 h-8 rounded bg-rose-100 text-rose-700 flex items-center justify-center hover:bg-rose-200"><i className="fa-solid fa-xmark text-xs"></i></button>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-800">Pago Rechazado</p>
                  <p className="text-xs text-slate-500">Familia Gómez (B1)</p>
                </div>
                <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">Reenviar Link</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
