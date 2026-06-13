/**
 * main.js - Lógica principal de la Landing Page
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Sticky
  const header = document.getElementById('header');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Init

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav');
  
  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
      });
    });
  }

  // 3. Animaciones al hacer scroll (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Animar solo una vez
      }
    });
  }, {
    root: null,
    threshold: 0.1, // Se activa cuando el 10% del elemento es visible
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 4. Animación de contadores (Estadísticas)
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetNumber = parseInt(entry.target.getAttribute('data-target').replace('+', ''));
        animateValue(entry.target, 0, targetNumber, 2000);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => counterObserver.observe(num));

  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const isPlus = obj.getAttribute('data-target').includes('+');
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing out quad
      const easeOut = progress * (2 - progress);
      const currentVal = Math.floor(easeOut * (end - start) + start);
      
      obj.innerHTML = isPlus ? `+${currentVal}` : currentVal;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerHTML = isPlus ? `+${end}` : end;
      }
    };
    window.requestAnimationFrame(step);
  }

  // 5. Manejo del Formulario (Redirección a WhatsApp)
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const nombre = formData.get('nombre');
      const apellido = formData.get('apellido');
      const email = formData.get('email');
      const telefono = formData.get('telefono');
      const edad = formData.get('edad');
      const curso = formData.get('curso');
      const consulta = formData.get('consulta');

      // Número de teléfono del instituto (formato internacional sin el +)
      const whaPhoneNumber = "5493804135270"; // Número real de West House La Rioja
      
      const message = `Hola West House! Soy ${nombre} ${apellido}.
Me gustaría solicitar información.

*Mis datos:*
Email: ${email}
Teléfono: ${telefono}
Edad del alumno: ${edad}
Curso de interés: ${curso}

*Consulta:*
${consulta}`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whaPhoneNumber}?text=${encodedMessage}`;
      
      // Abrir en nueva pestaña
      window.open(whatsappUrl, '_blank');
      
      // Limpiar formulario
      contactForm.reset();
    });
  }
});
