"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor completá todos los campos.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        setError("Email o contraseña incorrectos. Verificá tus datos.");
        setLoading(false);
        return;
      }

      const user = data.user;

      // Consultar el rol del usuario en la base de datos
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("auth_id", user.id)
        .single();

      let role = "student"; // fallback

      if (!profileError && profileData) {
        role = profileData.role;
      } else {
        // Si no hay perfil en users, intentar con email como referencia de rol
        const emailLower = user.email?.toLowerCase() || "";
        if (emailLower.includes("director") || emailLower.includes("admin")) {
          role = "director";
        } else if (emailLower.includes("prof") || emailLower.includes("teacher")) {
          role = "teacher";
        }
      }

      // Redirigir según el rol
      if (role === "director" || role === "admin") {
        router.push("/director");
      } else if (role === "teacher" || role === "profesor") {
        router.push("/teacher");
      } else {
        router.push("/student");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
      setLoading(false);
    }
  }

  // Demo rápida sin Supabase
  async function handleDemoLogin(roleType) {
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 800));
    if (roleType === "director") router.push("/director");
    else if (roleType === "teacher") router.push("/teacher");
    else router.push("/student");
  }

  const floatingOrbs = [
    { size: 300, x: "-10%", y: "-5%", color: "from-amber-200/30 to-orange-200/20", delay: 0 },
    { size: 200, x: "70%", y: "60%", color: "from-amber-300/20 to-yellow-200/10", delay: 0.5 },
    { size: 150, x: "80%", y: "10%", color: "from-orange-200/25 to-amber-100/15", delay: 1 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfaf5] via-[#fff8ec] to-[#fef3e2] flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Orbs */}
      {mounted && floatingOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full bg-gradient-to-br ${orb.color} blur-3xl pointer-events-none`}
          style={{ width: orb.size, height: orb.size, left: orb.x, top: orb.y }}
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
        />
      ))}

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(180,120,0,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(180,120,0,0.6) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <motion.a
            href="/"
            className="inline-flex items-center gap-3 mb-4 group"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-xl shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
              <i className="fa-solid fa-house-chimney-window text-2xl"></i>
            </div>
            <div className="text-left">
              <p className="font-extrabold text-2xl tracking-tight text-slate-900 font-outfit">West House</p>
              <p className="text-xs font-bold text-amber-600 tracking-widest uppercase">English School</p>
            </div>
          </motion.a>
          <h1 className="text-2xl font-extrabold text-slate-900 font-outfit mt-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-slate-500 text-sm mt-1">Ingresá a tu portal personal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-amber-100/60 rounded-3xl shadow-2xl shadow-amber-900/5 p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <i className="fa-solid fa-envelope text-amber-500 mr-2"></i>
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <i className="fa-solid fa-lock text-amber-500 mr-2"></i>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors"
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                >
                  <i className="fa-solid fa-circle-exclamation flex-shrink-0"></i>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:from-amber-700 hover:to-amber-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Ingresando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  Iniciar Sesión
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400 font-semibold">o acceder como demo</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Demo Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: "student", label: "Alumno", icon: "fa-solid fa-graduation-cap", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
              { role: "teacher", label: "Profesor", icon: "fa-solid fa-chalkboard-user", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
              { role: "director", label: "Director", icon: "fa-solid fa-building-columns", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
            ].map(({ role, label, icon, color }) => (
              <motion.button
                key={role}
                onClick={() => handleDemoLogin(role)}
                disabled={loading}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 ${color}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <i className={`${icon} text-base`}></i>
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          <a href="/" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
            ← Volver al sitio
          </a>
          {" · "}
          © 2025 West House English School
        </p>
      </motion.div>
    </div>
  );
}
