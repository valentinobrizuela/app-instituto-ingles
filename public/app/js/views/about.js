window.Views = window.Views || {};

Views.About = {
    render() {
        const viewContainer = document.getElementById('router-view');
        
        viewContainer.innerHTML = `
            <div class="header-section mb-5 fade-in-up">
                <h1 class="hero-title" style="color:var(--primary)">Nuestra Historia</h1>
                <p class="text-muted">Descubre cómo crecimos juntos y nuestro compromiso con el futuro.</p>
            </div>

            <div class="fade-in-up" style="animation-delay: 0.1s">
                <div class="card p-0 overflow-hidden mb-5" style="border:none; background: #fffaf5">
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); align-items:center;">
                        <div style="padding: 3rem;">
                            <h2 style="color:var(--primary); margin-bottom:1.5rem">El Corazón de West House</h2>
                            <p style="line-height:1.8; color:var(--text-main); font-size:1.05rem">
                                West House English School no es solo un edificio; es una comunidad que nació de un sueño compartido. 
                                Desde el primer día, supimos que <strong>el motor de nuestro crecimiento serían nuestros alumnos</strong>. 
                                <br><br>
                                Cada paso que dimos, cada aula nueva y cada tecnología incorporada fue posible gracias a la confianza y el esfuerzo de cada estudiante. 
                                Ustedes no solo vienen a aprender; ustedes han construido los cimientos de lo que somos hoy.
                            </p>
                        </div>
                        <div style="height:100%; min-height:300px; background: url('img/school_spirit.png') center/cover no-repeat;">
                        </div>
                    </div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
                <div class="card eco-card fade-in-up" style="animation-delay: 0.2s">
                    <h3 style="color:#c2410c; margin-bottom:1rem">
                        <i class="fa-solid fa-seedling"></i> Nuestra Visión Verde
                    </h3>
                    <p style="line-height:1.6; color:#9a3412">
                        En West House, creemos que hablar inglés es una herramienta para cambiar el mundo. 
                        Pero no podemos ignorar el mundo que nos rodea. Por eso, integramos el <strong>cuidado del medio ambiente</strong> en nuestro ADN.
                    </p>
                </div>

                <div class="card eco-card fade-in-up" style="animation-delay: 0.3s">
                    <h3 style="color:#c2410c; margin-bottom:1rem">
                        <i class="fa-solid fa-microchip"></i> Tecnología y Pasión
                    </h3>
                    <p style="line-height:1.6; color:#9a3412">
                        Combinamos métodos tradicionales con las mejores herramientas digitales, 
                        siempre buscando que tu aprendizaje sea dinámico, humano y consciente.
                    </p>
                </div>
            </div>

            <div class="card fade-in-up" style="animation-delay: 0.4s; background: #fef8f3; border: 1px dashed var(--primary)">
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:2rem; align-items:center">
                    <div style="border-radius:15px; overflow:hidden; box-shadow: var(--shadow-sm)">
                        <img src="img/eco_bench.png" alt="Eco Banco" style="width:100%; display:block">
                    </div>
                    <div>
                        <h2 style="color:var(--primary); margin-bottom:1rem">El Proyecto "Eco-Banco"</h2>
                        <p style="line-height:1.7; color:var(--text-main)">
                            Estamos orgullosos de nuestras iniciativas sustentables. Recientemente, junto a la comunidad, 
                            creamos un <strong>banco artístico hecho totalmente con botellas de plástico recicladas</strong> (eco-ladrillos). 
                            <br><br>
                            Este banco no es solo un lugar para sentarse; es un recordatorio de que con pequeñas acciones colectivas, 
                            podemos transformar residuos en algo útil y hermoso para nuestra escuela.
                        </p>
                        <div class="badge mt-3" style="background:#fb923c; color:white">#WestHouseEco</div>
                        <div class="badge mt-3" style="background:#fb923c; color:white">#RecycleAndLearn</div>
                    </div>
                </div>
            </div>

            <div style="text-align:center; padding: 4rem 1rem;" class="fade-in-up" style="animation-delay: 0.5s">
                <h2 style="font-family:'Outfit'; color:var(--text-muted); font-weight:300">"Learning English, Protecting our Future"</h2>
            </div>
        `;
    }
};
