"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats = [
    { value: "+150", label: "Alumnos Activos" },
    { value: "10+", label: "Años de Experiencia" },
    { value: "6", label: "Niveles (A1 a C2)" },
    { value: "98%", label: "De Satisfacción" }
  ];

  const benefits = [
    {
      icon: "fa-solid fa-graduation-cap",
      title: "Profesores Capacitados",
      description: "Docentes nativos y bilingües con amplia experiencia en enseñanza metodológica práctica."
    },
    {
      icon: "fa-solid fa-comments",
      title: "Clases Interactivas",
      description: "Foco en la comunicación oral activa. Hablá inglés con confianza desde el primer día."
    },
    {
      icon: "fa-solid fa-user-check",
      title: "Seguimiento Personalizado",
      description: "Grupos reducidos para garantizar atención individualizada y soporte constante."
    },
    {
      icon: "fa-solid fa-children",
      title: "Todas las Edades",
      description: "Programas diseñados a medida para niños, adolescentes y adultos según sus intereses."
    },
    {
      icon: "fa-solid fa-laptop-code",
      title: "Plataforma Moderna",
      description: "Acceso exclusivo a nuestro campus virtual, con material dinámico y juegos educativos."
    },
    {
      icon: "fa-solid fa-briefcase",
      title: "Inglés para el Futuro",
      description: "Preparación para exámenes internacionales, negocios y oportunidades globales."
    }
  ];

  const testimonials = [
    {
      quote: "Comencé en West House hace un año para mejorar mi inglés para el trabajo. El enfoque práctico y conversacional me dio la confianza que necesitaba para hablar en reuniones con el extranjero. ¡Súper recomendado!",
      author: "Diego Gómez",
      role: "Desarrollador de Software — Adultos"
    },
    {
      quote: "A mis hijos les encanta ir. Las clases son dinámicas, no es solo sentarse con un libro; juegan, interactúan y aprenden de manera natural. Se nota el cariño y profesionalismo de todo el equipo.",
      author: "Catalina Fernández",
      role: "Madre de Sofi (8) y Mateo (11) — Kids"
    },
    {
      quote: "Me preparé para el examen FCE aquí. Los profesores tienen una paciencia increíble y el material es súper moderno. Aprobé con notas excelentes. El ambiente es hermoso.",
      author: "Valentina Rodríguez",
      role: "Estudiante — Adolescentes"
    }
  ];

  const gallery = [
    { title: "Nuestras Clases", desc: "Ambiente cálido y dinámico", bg: "from-amber-100 to-orange-200", icon: "fa-solid fa-users" },
    { title: "Material de Estudio", desc: "Interactividad y juego", bg: "from-amber-200 to-amber-100", icon: "fa-solid fa-book-open" },
    { title: "Eventos Especiales", desc: "Talleres y celebraciones", bg: "from-orange-100 to-amber-200", icon: "fa-solid fa-masks-theater" },
    { title: "Talleres de Habla", desc: "Clases de conversación reales", bg: "from-amber-300 to-orange-100", icon: "fa-solid fa-comments-dollar" },
    { title: "Kids Corner", desc: "Aprendizaje creativo lúdico", bg: "from-orange-200 to-orange-100", icon: "fa-solid fa-shapes" },
    { title: "Certificaciones", desc: "Éxitos compartidos en comunidad", bg: "from-amber-100 to-amber-300", icon: "fa-solid fa-award" }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-[#fffaf5] text-slate-800 selection:bg-amber-100 selection:text-amber-900 min-height-screen">
      
      {/* HEADER / NAVIGATION */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-amber-100/50 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-house-chimney-window text-lg"></i>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-outfit">West House</span>
              <span className="block text-[10px] text-amber-600 font-bold tracking-widest uppercase">English School</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="font-medium text-slate-600 hover:text-amber-600 transition-colors">Quiénes Somos</a>
            <a href="#benefits" className="font-medium text-slate-600 hover:text-amber-600 transition-colors">Beneficios</a>
            <a href="#experience" className="font-medium text-slate-600 hover:text-amber-600 transition-colors">Experiencia</a>
            <a href="#testimonials" className="font-medium text-slate-600 hover:text-amber-600 transition-colors">Testimonios</a>
            <a href="#gallery" className="font-medium text-slate-600 hover:text-amber-600 transition-colors">Galería</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="px-5 py-2.5 rounded-xl font-bold text-slate-700 hover:text-amber-600 transition-colors text-sm">
              Iniciar Sesión
            </a>
            <a href="/app/#/waitlist-join" className="px-5 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-all hover:shadow-lg hover:shadow-orange-500/10 active:scale-95">
              Inscribirme
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-700 hover:text-amber-600 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-amber-100 px-6 py-6 flex flex-col gap-4 shadow-lg"
            >
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-700 hover:text-amber-600">Quiénes Somos</a>
              <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-700 hover:text-amber-600">Beneficios</a>
              <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-700 hover:text-amber-600">Experiencia</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-700 hover:text-amber-600">Testimonios</a>
              <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-700 hover:text-amber-600">Galería</a>
              <hr className="border-amber-100" />
              <div className="flex flex-col gap-3 pt-2">
                <a href="/login" className="text-center py-2.5 font-bold text-slate-700 border border-slate-200 rounded-xl">
                  Iniciar Sesión
                </a>
                <a href="/app/#/waitlist-join" className="text-center py-2.5 bg-amber-600 text-white font-bold rounded-xl shadow-md">
                  Inscribirme
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-100/60 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-orange-100/50 blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="md:col-span-7 flex flex-col items-start text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/60 border border-amber-200/50 rounded-full text-xs font-bold text-amber-800 mb-6 font-outfit">
              <i className="fa-solid fa-location-dot"></i> La Rioja, Argentina
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 font-outfit">
              Abrí puertas al mundo <br />
              <span className="bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                aprendiendo inglés
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl mb-8">
              En West House combinamos una metodología práctica y comunicativa con un ambiente cálido y humano. Diseñamos un espacio donde aprender inglés no es una obligación, sino una experiencia inspiradora y natural.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a href="/app/#/waitlist-join" className="px-8 py-4 bg-amber-600 text-white text-center rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-98 flex items-center justify-center gap-2">
                Comenzar <i className="fa-solid fa-arrow-right"></i>
              </a>
              <a href="#about" className="px-8 py-4 bg-white/70 backdrop-blur-sm border border-slate-200 text-slate-700 text-center rounded-2xl font-bold hover:bg-white hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                Conocer más
              </a>
            </div>

            {/* Floating Tags (Under Text for Mobile) */}
            <div className="flex flex-wrap gap-2.5 mt-10">
              {["Todas las edades", "Clases dinámicas", "Aprendizaje práctico", "Acompañamiento personalizado", "Ambiente cálido"].map((tag, idx) => (
                <span key={idx} className="text-xs font-semibold px-3.5 py-1.5 bg-white/60 backdrop-blur-sm border border-amber-100 rounded-xl text-amber-800/80 shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right Visual (Interactive SVG Illustration representing a Premium classroom) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-5 relative"
          >
            <div className="w-full aspect-square rounded-[3rem] bg-gradient-to-tr from-amber-500/10 to-orange-500/5 border border-amber-200/40 p-6 flex items-center justify-center relative shadow-inner">
              
              {/* Glassmorphic Cards Stack */}
              <div className="w-full max-w-[340px] bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-2xl relative z-10 flex flex-col gap-6">
                
                {/* School Mockup Header */}
                <div className="flex items-center justify-between pb-4 border-b border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white"><i className="fa-solid fa-graduation-cap text-xs"></i></div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Campus West House</h4>
                      <p className="text-[10px] text-slate-500">Clase Activa en Vivo</p>
                    </div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                {/* Lesson Mockup content */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Tema del Día</span>
                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Speaking & Debate</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-snug">"How learning English shapes your global future opportunities"</p>
                  
                  {/* Progress bar mock */}
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Interacción del Grupo</span>
                      <span className="font-bold text-amber-700">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Teacher profile mock */}
                <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-100/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-200 border border-white flex items-center justify-center font-bold text-amber-800">M</div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-950">Prof. Maricel Brizuela</h5>
                    <p className="text-[9px] text-slate-500">Directora del Instituto</p>
                  </div>
                </div>

              </div>

              {/* Decorative floating widgets */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-8 left-[-20px] bg-white/90 backdrop-blur border border-amber-100 rounded-2xl p-3 shadow-lg flex items-center gap-2.5 z-20"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600"><i className="fa-solid fa-fire text-sm"></i></div>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Racha Activa</p>
                  <p className="text-xs font-extrabold text-slate-900">5 Días 🔥</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-8 right-[-10px] bg-white/90 backdrop-blur border border-amber-100 rounded-2xl p-3.5 shadow-lg flex items-center gap-2.5 z-20"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600"><i className="fa-solid fa-star text-sm"></i></div>
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Recompensas</p>
                  <p className="text-xs font-extrabold text-slate-900">+450 XP 💎</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. QUIÉNES SOMOS */}
      <section id="about" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Text */}
            <div className="text-left">
              <span className="text-xs font-extrabold text-amber-600 tracking-widest uppercase block mb-3">Comunidad Humana</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 font-outfit leading-tight">
                No solo enseñamos inglés, <br />
                acompañamos tu crecimiento.
              </h2>
              <div className="space-y-4 text-slate-600">
                <p>
                  En <strong>West House English School</strong>, creemos que aprender un idioma es mucho más que memorizar reglas gramaticales o completar ejercicios en un pizarrón. Consiste en adquirir la confianza para expresarte, conectar con otros y abrirte a nuevas metas en el mundo.
                </p>
                <p>
                  Ubicados en <strong>La Rioja, Argentina</strong>, nos caracterizamos por ofrecer una educación de altísima calidad con un enfoque profundamente humano y cercano. Entendemos que cada estudiante tiene su propio ritmo y estilo de aprendizaje; por eso, brindamos un acompañamiento personalizado que respeta y potencia los talentos de cada alumno.
                </p>
                <p className="font-semibold text-amber-700">
                  Queremos que te sientas como en casa, en un ambiente cómodo, moderno y estimulante.
                </p>
              </div>
            </div>

            {/* Right Column: Statistics Grid */}
            <div className="bg-[#fffaf5] border border-amber-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative">
              <div className="absolute top-4 right-4 text-amber-200/40 text-8xl font-black font-outfit select-none pointer-events-none">WH</div>
              <h3 className="text-lg font-bold text-slate-900 mb-8 text-left border-b border-amber-100/70 pb-4 flex items-center gap-2">
                <i className="fa-solid fa-chart-simple text-amber-600"></i> West House en Números
              </h3>
              
              <div className="grid grid-cols-2 gap-6 md:gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-left bg-white border border-amber-100/50 p-5 rounded-2xl shadow-sm">
                    <span className="block text-3xl md:text-4xl font-extrabold text-amber-600 mb-1 font-outfit">{stat.value}</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. BENEFICIOS */}
      <section id="benefits" className="py-20 bg-[#fffaf5] relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-amber-600 tracking-widest uppercase block mb-3">¿Por qué elegirnos?</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-outfit mb-4">
              La diferencia de estudiar en West House
            </h2>
            <p className="text-slate-600">
              Desarrollamos una propuesta educativa moderna basada en la interacción, la tecnología y el respeto por el aprendizaje humano.
            </p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(217, 119, 6, 0.08)" }}
                className="bg-white border border-amber-100 p-6 rounded-2xl text-left transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100/70 flex items-center justify-center text-amber-600 mb-5">
                  <i className={`${benefit.icon} text-lg`}></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 font-outfit">{benefit.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* 4. EXPERIENCIA WEST HOUSE (STORYTELLING) */}
      <section id="experience" className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-tr from-amber-600 to-amber-800 rounded-[3rem] text-white p-8 md:p-14 lg:p-20 relative overflow-hidden shadow-xl">
            {/* SVG Wave background decorator */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,50 Q25,70 50,50 T100,50 L100,100 L0,100 Z" fill="white"></path>
              </svg>
            </div>
            
            <div className="relative z-10 max-w-3xl text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 px-3.5 py-1.5 rounded-full inline-block mb-6">La Experiencia West House</span>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight font-outfit mb-6">
                “En West House no solo aprendés inglés. Ganás la libertad de comunicarte con el mundo.”
              </h2>
              <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8">
                Diseñamos una experiencia de inmersión lúdica y comunicativa. A través de proyectos prácticos, talleres de conversación mensuales, debates sobre temas de actualidad global y dinámicas grupales estimulantes, hablar inglés se vuelve algo tan espontáneo como tu lengua nativa.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl">
                  <h4 className="font-bold text-lg mb-1 font-outfit"><i className="fa-solid fa-comments text-amber-300 mr-2"></i> Debates Reales</h4>
                  <p className="text-xs text-white/70">Discusiones fluidas sobre temas globales para potenciar la oratoria y fluidez.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl">
                  <h4 className="font-bold text-lg mb-1 font-outfit"><i className="fa-solid fa-gamepad text-amber-300 mr-2"></i> Gamificación</h4>
                  <p className="text-xs text-white/70">Ganá puntos de experiencia (XP) completando retos y canjealos en nuestra tienda.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl">
                  <h4 className="font-bold text-lg mb-1 font-outfit"><i className="fa-solid fa-globe text-amber-300 mr-2"></i> Comunidad Activa</h4>
                  <p className="text-xs text-white/70">Formá parte de un grupo humano cálido donde la colaboración y el apoyo son mutuos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIOS */}
      <section id="testimonials" className="py-20 bg-[#fffaf5] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-amber-600 tracking-widest uppercase block mb-3">Opiniones de la Comunidad</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-outfit">
              Historias reales en West House
            </h2>
          </div>

          {/* Carousel Wrapper */}
          <div className="max-w-3xl mx-auto bg-white border border-amber-100 rounded-[2rem] p-8 md:p-12 shadow-md relative min-h-[280px] flex flex-col justify-between">
            <div className="absolute top-6 left-6 text-amber-100 text-6xl font-serif">“</div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-left relative z-10"
              >
                <p className="text-base md:text-lg text-slate-600 italic leading-relaxed mb-8">
                  {testimonials[activeTestimonial].quote}
                </p>
                <div>
                  <h4 className="font-extrabold text-slate-900 font-outfit">{testimonials[activeTestimonial].author}</h4>
                  <p className="text-xs font-bold text-amber-600 mt-1 uppercase tracking-wider">{testimonials[activeTestimonial].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-amber-50">
              <div className="flex gap-1.5">
                {testimonials.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === activeTestimonial ? "bg-amber-600 w-6" : "bg-amber-200"}`}
                    title={`Ver testimonio ${idx + 1}`}
                  ></button>
                ))}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                  className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <button 
                  onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                  className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. GALERÍA */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold text-amber-600 tracking-widest uppercase block mb-3">La Vida en el Instituto</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-outfit mb-4">
              Nuestra Galería de Experiencias
            </h2>
            <p className="text-slate-600">
              Capturas de clases, talleres dinámicos y momentos memorables compartidos en nuestra escuela de inglés en La Rioja.
            </p>
          </div>

          {/* CSS Grid representations (since we render elegant gradients in place of empty images for safety, looking like premium cards) */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item, idx) => (
              <div 
                key={idx}
                className="group relative h-64 rounded-3xl overflow-hidden bg-slate-100 border border-amber-100 flex flex-col justify-end p-6 shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-md"
              >
                <div className={`absolute inset-0 bg-gradient-to-tr ${item.bg} opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
                
                {/* Background Pattern */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <i className={`${item.icon} text-8xl text-amber-900`}></i>
                </div>

                <div className="relative z-10 text-left">
                  <span className="inline-block p-2 bg-amber-50 border border-amber-200/50 rounded-xl text-amber-700 text-xs mb-3">
                    <i className={item.icon}></i>
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 font-outfit mb-1">{item.title}</h4>
                  <p className="text-xs font-semibold text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className="py-20 bg-[#fffaf5] relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-[-20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-amber-100/50 blur-[90px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-orange-100/40 blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-outfit mb-6">
            Tu futuro puede empezar hoy.
          </h2>
          <p className="text-base md:text-lg text-slate-600 mb-10 max-w-xl mx-auto">
            Sé parte de West House English School. Las inscripciones están abiertas. Completá la solicitud en línea o consultanos de forma directa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/app/#/waitlist-join" 
              className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              Registrarme en el Instituto <i className="fa-solid fa-pencil"></i>
            </a>
            
            <a 
              href="https://wa.me/5493804135270?text=Hola,%20me%20gustaria%20consultar%20sobre%20las%20clases%20de%20ingles%20en%20West%20House."
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
            >
              Consultar por WhatsApp <i className="fa-brands fa-whatsapp text-lg"></i>
            </a>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-white border-t border-amber-100 py-12 text-slate-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-8 items-start mb-8 text-left">
            
            <div className="md:col-span-5 flex flex-col gap-4">
              <a href="#" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white"><i className="fa-solid fa-house-chimney-window text-xs"></i></div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 font-outfit">West House</span>
              </a>
              <p className="text-xs leading-relaxed max-w-sm">
                Instituto privado de inglés en La Rioja, Argentina. Enseñanza comunicativa y práctica enfocada en el crecimiento humano de nuestros alumnos.
              </p>
            </div>

            <div className="md:col-span-3 flex flex-col gap-3">
              <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-1">Contacto</h4>
              <p className="text-xs"><i className="fa-solid fa-envelope mr-2 text-amber-600"></i> westhouse.larioja@gmail.com</p>
              <p className="text-xs"><i className="fa-solid fa-phone mr-2 text-amber-600"></i> +54 9 380 413-5270</p>
              <p className="text-xs"><i className="fa-solid fa-location-dot mr-2 text-amber-600"></i> Av. Juan Facundo Quiroga, La Rioja, Argentina</p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-3">
              <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-1">Enlaces</h4>
              <a href="#about" className="text-xs hover:text-amber-600">Quiénes Somos</a>
              <a href="#benefits" className="text-xs hover:text-amber-600">Beneficios</a>
              <a href="/app/#/login" className="text-xs hover:text-amber-600">Ingresar al Campus</a>
              <a href="/app/#/waitlist-join" className="text-xs hover:text-amber-600">Lista de Espera</a>
            </div>

            <div className="md:col-span-2 flex flex-col gap-3">
              <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-1">Redes Sociales</h4>
              <div className="flex gap-2">
                <a href="https://instagram.com/" target="_blank" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-colors"><i className="fa-brands fa-instagram text-sm"></i></a>
                <a href="https://facebook.com/" target="_blank" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-colors"><i className="fa-brands fa-facebook-f text-sm"></i></a>
                <a href="https://wa.me/5493804135270" target="_blank" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center transition-colors"><i className="fa-brands fa-whatsapp text-sm"></i></a>
              </div>
            </div>

          </div>

          <div className="border-t border-amber-50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>© {new Date().getFullYear()} West House English School. Todos los derechos reservados.</p>
            <p>Diseño cálido y humano • La Rioja, Argentina</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
