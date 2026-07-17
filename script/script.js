// 1. AUTOMATIZACIÓN DE ANIMACIÓN DE LETRAS
document.querySelectorAll('.animar-letras').forEach(elemento => {
    const letras = elemento.textContent.trim().split('');
    elemento.innerHTML = letras.map(letra => {
        if (letra === ' ') return '&nbsp;';
        return `<span>${letra}</span>`;
    }).join('');
});

// 2. ANIMACIONES GSAP DE ENTRADA
gsap.registerPlugin(ScrollTrigger);

gsap.fromTo(".reveal-up",
    { y: 50, opacity: 0 }, 
    { 
        y: 0, 
        opacity: 1, 
        duration: 1, 
        stagger: 0.2, 
        ease: "power4.out",
        clearProps: "all" /* ESTO ES LA CLAVE: Limpia el CSS al terminar */
    }
);

// 3. LA MAGIA DEL PLAYGROUND (FÍSICA DE REPULSIÓN DEL RATÓN)
const playground = document.getElementById('playground');
const magneticItems = document.querySelectorAll('.magnetic-item');
playground.addEventListener('mousemove', (e) => {
    // Obtener coordenadas del ratón relativas a la ventana
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    magneticItems.forEach(item => {
        // Obtener posición central de cada elemento
        const rect = item.getBoundingClientRect();
        const itemX = rect.left + rect.width / 2;
        const itemY = rect.top + rect.height / 2;

        // Calcular la distancia entre el ratón y el elemento
        const distX = mouseX - itemX;
        const distY = mouseY - itemY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        // Si el ratón está a menos de 250px del elemento, lo repele
        if (distance < 250) {
            // Calculamos el ángulo de escape
            const angle = Math.atan2(distY, distX);

            // Invertimos la fuerza (entre más cerca, más fuerte lo empuja)
            const force = (250 - distance) / 2;

            const pushX = Math.cos(angle) * -force;
            const pushY = Math.sin(angle) * -force;

            // Aplicamos el movimiento y cambiamos el color a rojo
            item.style.transform = `translate(${pushX}px, ${pushY}px) scale(1.1) rotate(${pushX / 5}deg)`;
            item.style.backgroundColor = 'var(--accent-red)';
            item.style.color = '#fff';
            item.style.zIndex = 10;
        } else {
            // Si el ratón se aleja, el elemento regresa a su estado natural suavemente
            item.style.transform = 'translate(0px, 0px) scale(1) rotate(0deg)';
            item.style.backgroundColor = 'var(--text-main)';
            item.style.color = 'var(--bg-color)';
            item.style.zIndex = 1;
        }
    });
});

// Para evitar que los elementos se queden pegados si sacas el ratón rápido de la sección
playground.addEventListener('mouseleave', () => {
    magneticItems.forEach(item => {
        item.style.transform = 'translate(0px, 0px) scale(1) rotate(0deg)';
        item.style.backgroundColor = 'var(--text-main)';
    });
});

// Fondo animado

const bCanvas = document.getElementById('brutalCanvas');
const bCtx = bCanvas.getContext('2d');

let h, w;
let textParticles = [];

// Palabras y fragmentos que flotarán en el fondo
const techWords = [
    'ECHO', 'C++', 'Python', 'Node.js', 'Supabase',
    'Linux', 'Ubuntu', 'PHP', 'MySQL', 'Termux',
    '=>', '{...}', '</>', 'sudo apt-get', 'sys.stdout', '0101', '[~]'
];

// Colores de la paleta Neo-Brutalista
const brutalColors = ['#FF3E1A', '#2A1AFF', '#141414'];

function resize() {
    w = bCanvas.width = window.innerWidth;
    h = bCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let mousePos = { x: -1000, y: -1000 };
window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
});

class TextParticle {
    constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.word = techWords[Math.floor(Math.random() * techWords.length)];
        this.size = Math.random() * 14 + 10; // Tamaño de fuente entre 10px y 24px
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.baseColor = '#141414';
        this.highlightColor = brutalColors[Math.floor(Math.random() * 2)]; // Rojo o Azul
        this.opacity = Math.random() * 0.1 + 0.05; // Muy sutil (5% a 15% de opacidad)
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebotar en los bordes
        if (this.x > w || this.x < 0) this.speedX *= -1;
        if (this.y > h || this.y < 0) this.speedY *= -1;
    }

    draw() {
        // Calcular distancia al ratón para interacciones
        const dx = mousePos.x - this.x;
        const dy = mousePos.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        bCtx.font = `600 ${this.size}px 'Space Grotesk', sans-serif`;
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';

        // Si el ratón está cerca, la palabra se vuelve 100% opaca y cambia a un color vibrante
        if (distance < 150) {
            bCtx.fillStyle = this.highlightColor;
            bCtx.globalAlpha = 1; // Opacidad total

            // Dibuja una línea brutalista conectando el ratón con la palabra
            bCtx.beginPath();
            bCtx.moveTo(this.x, this.y);
            bCtx.lineTo(mousePos.x, mousePos.y);
            bCtx.strokeStyle = this.highlightColor;
            bCtx.lineWidth = 1;
            bCtx.setLineDash([5, 5]); // Línea punteada
            bCtx.stroke();
            bCtx.setLineDash([]); // Reset
        } else {
            bCtx.fillStyle = this.baseColor;
            bCtx.globalAlpha = this.opacity;
        }

        bCtx.fillText(this.word, this.x, this.y);
        bCtx.globalAlpha = 1; // Restaurar opacidad global
    }
}

function initCanvas() {
    textParticles = [];
    // Crear 60 palabras flotantes
    for (let i = 0; i < 60; i++) {
        textParticles.push(new TextParticle());
    }
}

function animateCanvas() {
    // Limpiar el frame anterior
    bCtx.clearRect(0, 0, w, h);

    textParticles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateCanvas);
}

initCanvas();
animateCanvas();

const cards = document.querySelectorAll('.brutal-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        // Obtener dimensiones y posición de la tarjeta
        const rect = card.getBoundingClientRect();

        // Coordenadas del ratón relativas a la tarjeta
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Encontrar el centro de la tarjeta
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calcular la rotación en base a qué tan lejos está el ratón del centro
        // Dividimos por un valor para suavizar el ángulo (máximo unos 10-15 grados)
        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        // Aplicamos el levantamiento (-10px) y la rotación 3D
        card.style.transform = `translate(-10px, -10px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    // Cuando el ratón sale de la tarjeta, vuelve a su estado original
    card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s ease-out, box-shadow 0.3s ease';
        card.style.transform = `translate(0px, 0px) perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });

    // Al volver a entrar, quitamos la transición de 0.5s para que siga el ratón instantáneamente
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.2s ease';
    });
});

const cmdButtons = document.querySelectorAll('.cmd-btn');
const terminalOutput = document.getElementById('terminal-output');

// Base de datos de respuestas adaptada para principiantes (Sin indentación)
const terminalData = {
    'sobre_nosotros': `Hola, somos ProgramIA.
Nuestra misión es demostrarte que programar no es solo para genios de las matemáticas. 
Si sabes seguir instrucciones paso a paso, puedes aprender a crear tecnología increíble. 
Te acompañaremos desde tu primera línea de código hasta tu primer proyecto real.`,

    'por_que_ia': `¿Por qué combinamos programación con Inteligencia Artificial?
[1] Porque la IA es como un profesor particular disponible 24/7.
[2] Te ayuda a encontrar errores en tu trabajo más rápido.
[3] Te explicamos cómo usar herramientas de IA para que programes el doble de rápido.
¡El futuro ya está aquí, no te quedes atrás!`,

    'requisitos': `Verificando requisitos de tu sistema...
[OK] Ganas de aprender.
[OK] Una computadora con conexión a internet.
[INFO] ¿Necesito saber matemáticas complejas? -> FALSO.
[INFO] ¿Necesito un equipo ultra potente? -> FALSO.
Estás 100% listo para comenzar.`,

    './empezar_curso.sh': `Iniciando proceso de inscripción...
> Cargando tu perfil de estudiante... [Completado]
> Preparando primer módulo interactivo... [Completado]
> Desbloqueando acceso a la comunidad... [Completado]

[ÉXITO] ¡Bienvenido a ProgramIA! Haz clic en el botón de arriba para ver los cursos.`
};

let typeWriterTimeout; 

function typeWriterEffect(text, element) {
    clearTimeout(typeWriterTimeout); 
    
    // Cambié el nombre del usuario de la consola a algo más inmersivo
    const prefix = '<span class="text-[#2A1AFF]">estudiante@programia</span>:<span class="text-[#FF3E1A]">~</span>$ ';
    element.innerHTML = prefix;
    
    let i = 0;
    const chars = text.split('\n').map(line => line.trim()).join('\n').trim().split('');
    
    function type() {
        if (i < chars.length) {
            const char = chars[i] === '\n' ? '<br>' : chars[i];
            element.innerHTML += char;
            i++;
            typeWriterTimeout = setTimeout(type, Math.random() * 25 + 5);
        } else {
            element.innerHTML += '<span class="animate-pulse bg-white w-2 h-4 inline-block ml-1 align-middle"></span>';
        }
    }
    
    type();
}

// Event Listeners (Se mantiene igual)
cmdButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        cmdButtons.forEach(b => b.classList.remove('bg-[#FF3E1A]', 'text-white'));
        btn.classList.add('bg-[#FF3E1A]', 'text-white');
        
        // Mostrar el comando clickeado con el nuevo usuario
        terminalOutput.innerHTML = `<span class="text-[#2A1AFF]">estudiante@programia</span>:<span class="text-white">~</span>$ ${cmd}<br><br>`;
        
        setTimeout(() => {
            typeWriterEffect(terminalData[cmd], terminalOutput);
        }, 400);
    });
});

const navLinks = document.querySelectorAll('nav a[href^="#"]');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if(targetSection) {
            // BUENA PRÁCTICA 1: Matar animaciones previas para evitar que se amontonen si el usuario hace doble clic rápido
            gsap.killTweensOf("section");
            gsap.killTweensOf(window);

            // BUENA PRÁCTICA 2: Usar fromTo para obligar al navegador a iniciar desde 0 siempre
            gsap.fromTo("section", 
                { filter: "blur(0px) contrast(1)" }, // Estado seguro de inicio
                {
                    filter: "blur(5px) contrast(1.2)", 
                    duration: 0.3, // Un poco más rápido para mayor fluidez
                    yoyo: true, 
                    repeat: 1,
                    // BUENA PRÁCTICA 3: Limpiar el CSS inline al terminar para evitar bugs de renderizado
                    onComplete: () => gsap.set("section", { clearProps: "filter" }) 
                }
            );

            // Animamos el scroll hacia la sección
            gsap.to(window, {
                duration: 0.8, // Sincronizamos la duración para que se sienta conectado
                scrollTo: {
                    y: targetSection, 
                },
                ease: "power3.inOut"
            });
        }
    });
});

const btnAbrirModal = document.getElementById('btn-abrir-modal');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const modalOverlay = document.getElementById('modal-inscripcion');
const modalBg = document.getElementById('modal-bg');
const modalContent = document.getElementById('modal-content');

// Función para abrir
btnAbrirModal.addEventListener('click', () => {
    modalOverlay.classList.remove('hidden');
    modalOverlay.classList.remove('opacity-0'); // Añadir esto
    
    // Animación de entrada
    gsap.fromTo(modalBg, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(modalContent, 
        { y: 50, opacity: 0, scale: 0.9 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
    );
});

// Función para cerrar
const cerrarModal = () => {
    // Animación de salida
    gsap.to(modalBg, { opacity: 0, duration: 0.3 });
    gsap.to(modalContent, { 
        y: 20, opacity: 0, scale: 0.95, duration: 0.3, 
        onComplete: () => {
            modalOverlay.classList.add('opacity-0'); // Añadir esto
            setTimeout(() => modalOverlay.classList.add('hidden'), 300); // Añadir retraso
        }
    });
};

// Eventos de cierre
btnCerrarModal.addEventListener('click', cerrarModal);
modalBg.addEventListener('click', cerrarModal); // Cierra si haces clic en el fondo borroso

const btnEnviarInscripcion = document.getElementById('btn-enviar-inscripcion');

// Evento al dar clic en "Asegurar mi cupo"
btnEnviarInscripcion.addEventListener('click', () => {
    btnEnviarInscripcion.textContent = "¡CUPO ASEGURADO!";
    btnEnviarInscripcion.classList.add('bg-green-500', 'text-white', 'border-green-500');
    setTimeout(() => {
        cerrarModal();

        // 3. Restauramos el botón a la normalidad en caso de que vuelvan a abrir el modal después
        setTimeout(() => {
            btnEnviarInscripcion.textContent = "Asegurar mi cupo";
            btnEnviarInscripcion.classList.remove('bg-green-500', 'text-white', 'border-green-500');
        }, 500);
    }, 800);
});

let mm = gsap.matchMedia();

// Esta regla indica que el código solo se ejecutará en pantallas menores a 768px (móviles)
mm.add("(max-width: 767px)", () => {
    
    const panels = document.querySelectorAll('.panel');
    
    panels.forEach((panel) => {
        ScrollTrigger.create({
            trigger: panel,
            // Empieza cuando la parte superior de la tarjeta llega al 60% de la pantalla (casi al centro)
            start: "top 60%", 
            // Termina cuando la parte inferior de la tarjeta sube más allá del 40% de la pantalla
            end: "bottom 40%", 
            // GSAP le pone y le quita la clase "active" automáticamente de forma perfecta
            toggleClass: "active" 
        });
    });

});