// Configuración de Tailwind y lógica completa
tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    black: '#111111',
                    dark: '#1a1a1a',
                    bg: '#f4f4ec',
                    accent: '#ff3311',
                    blue: '#1111ff',
                    white: '#ffffff',
                }
            },
            fontFamily: {
                sans: ['Space Grotesk', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'brutal': '4px 4px 0px 0px rgba(17,17,255,1)',
                'brutal-hover': '2px 2px 0px 0px rgba(17,17,255,1)',
                'brutal-card-black': '8px 8px 0px 0px rgba(17,17,17,1)',
            }
        }
    }
}

// 1. AUTOMATIZACIÓN DE ANIMACIÓN DE LETRAS
document.querySelectorAll('.animar-letras').forEach(elemento => {
    const letras = elemento.textContent.trim().split('');
    elemento.innerHTML = letras.map(letra => {
        if (letra === ' ') return '&nbsp;';
        return `<span>${letra}</span>`;
    }).join('');
});

// 2. ANIMACIONES GSAP DE ENTRADA
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

gsap.fromTo(".reveal-up",
    { y: 50, opacity: 0 }, 
    { 
        y: 0, 
        opacity: 1, 
        duration: 1, 
        stagger: 0.2, 
        ease: "power4.out",
        clearProps: "all" // Limpia el CSS al terminar la animación
    }
);

// 3. FONDO ANIMADO CON CANVAS (Palabras flotantes estilo tech)
const bCanvas = document.getElementById('brutalCanvas');
const bCtx = bCanvas ? bCanvas.getContext('2d') : null;

let w, h;
let textParticles = [];

const techWords = [
    'C++', 'Python', 'Node.js', 'Supabase',
    'Linux', 'Ubuntu', 'PHP', 'MySQL', 'Termux',
    '=>', '{...}', '</>', 'sudo apt-get', 'sys.stdout', '0101', '[~]'
];

const brutalColors = ['#FF3E1A', '#2A1AFF', '#141414'];

function resize() {
    if (!bCanvas) return;
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
        this.size = Math.random() * 14 + 10;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.baseColor = '#141414';
        this.highlightColor = brutalColors[Math.floor(Math.random() * 2)];
        this.opacity = Math.random() * 0.1 + 0.05;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > w || this.x < 0) this.speedX *= -1;
        if (this.y > h || this.y < 0) this.speedY *= -1;
    }

    draw() {
        if (!bCtx) return;
        const dx = mousePos.x - this.x;
        const dy = mousePos.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        bCtx.font = `600 ${this.size}px 'Space Grotesk', sans-serif`;
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';

        if (distance < 150) {
            bCtx.fillStyle = this.highlightColor;
            bCtx.globalAlpha = 1;

            bCtx.beginPath();
            bCtx.moveTo(this.x, this.y);
            bCtx.lineTo(mousePos.x, mousePos.y);
            bCtx.strokeStyle = this.highlightColor;
            bCtx.lineWidth = 1;
            bCtx.setLineDash([5, 5]);
            bCtx.stroke();
            bCtx.setLineDash([]);
        } else {
            bCtx.fillStyle = this.baseColor;
            bCtx.globalAlpha = this.opacity;
        }

        bCtx.fillText(this.word, this.x, this.y);
        bCtx.globalAlpha = 1;
    }
}

function initCanvas() {
    textParticles = [];
    for (let i = 0; i < 60; i++) {
        textParticles.push(new TextParticle());
    }
}

function animateCanvas() {
    if (!bCtx) return;
    bCtx.clearRect(0, 0, w, h);
    textParticles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateCanvas);
}

if (bCanvas) {
    initCanvas();
    animateCanvas();
}

// 4. TERMINAL INTERACTIVA (Efecto Typewriter)
const cmdButtons = document.querySelectorAll('.cmd-btn');
const terminalOutput = document.getElementById('terminal-output');

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
    if (!element) return;
    clearTimeout(typeWriterTimeout); 
    
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

cmdButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        cmdButtons.forEach(b => b.classList.remove('bg-[#FF3E1A]', 'text-white'));
        btn.classList.add('bg-[#FF3E1A]', 'text-white');
        
        if (terminalOutput) {
            terminalOutput.innerHTML = `<span class="text-[#2A1AFF]">estudiante@programia</span>:<span class="text-white">~</span>$ ${cmd}<br><br>`;
        }
        
        setTimeout(() => {
            typeWriterEffect(terminalData[cmd], terminalOutput);
        }, 400);
    });
});

// 5. SALTO CUÁNTICO (Navegación fluida segura para links y logo)
const navLinks = document.querySelectorAll('nav a[href^="#"]');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if(targetSection) {
            gsap.killTweensOf("section, header");
            gsap.killTweensOf(window);

            gsap.fromTo("section, header", 
                { filter: "blur(0px) contrast(1)" }, 
                {
                    filter: "blur(3px) contrast(1.1)", 
                    duration: .5, 
                    yoyo: true, 
                    repeat: 1,
                    onComplete: () => gsap.set("section, header", { clearProps: "filter" }) 
                }
            );

            gsap.to(window, {
                duration: 0.8, 
                scrollTo: { 
                    y: targetSection, 
                    offsetY: 80 // Evita que el menú fijo tape el contenido
                },
                ease: "power3.inOut"
            });
        }
    });
});

// 6. MODAL DE INSCRIPCIÓN PREVIA
const btnAbrirModal = document.getElementById('btn-abrir-modal');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const modalOverlay = document.getElementById('modal-inscripcion');
const modalBg = document.getElementById('modal-bg');
const modalContent = document.getElementById('modal-content');

if (btnAbrirModal) {
    btnAbrirModal.addEventListener('click', () => {
        modalOverlay.classList.remove('hidden');
        modalOverlay.classList.remove('opacity-0');
        
        gsap.fromTo(modalBg, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(modalContent, 
            { y: 50, opacity: 0, scale: 0.9 }, 
            { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
        );
    });
}

const cerrarModal = () => {
    if (!modalOverlay) return;
    gsap.to(modalBg, { opacity: 0, duration: 0.3 });
    gsap.to(modalContent, { 
        y: 20, opacity: 0, scale: 0.95, duration: 0.3, 
        onComplete: () => {
            modalOverlay.classList.add('opacity-0');
            setTimeout(() => modalOverlay.classList.add('hidden'), 300);
        }
    });
};

if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
if (modalBg) modalBg.addEventListener('click', cerrarModal);

const btnEnviarInscripcion = document.getElementById('btn-enviar-inscripcion');
if (btnEnviarInscripcion) {
    btnEnviarInscripcion.addEventListener('click', () => {
        btnEnviarInscripcion.textContent = "¡CUPO ASEGURADO!";
        btnEnviarInscripcion.classList.add('bg-green-500', 'text-white', 'border-green-500');
        setTimeout(() => {
            cerrarModal();
            setTimeout(() => {
                btnEnviarInscripcion.textContent = "Asegurar mi cupo";
                btnEnviarInscripcion.classList.remove('bg-green-500', 'text-white', 'border-green-500');
            }, 500);
        }, 800);
    });
}

// 8. BOOT LOG SEQUENCE (Efecto Arranque del Sistema)
const logLines = gsap.utils.toArray('.log-line');

if (document.getElementById('boot-sequence')) {
    // Creamos una línea de tiempo vinculada al scroll
    let tlBoot = gsap.timeline({
        scrollTrigger: {
            trigger: "#boot-sequence",
            start: "top top", // Inicia cuando la sección toca el tope de la ventana
            end: "+=1500", // Cuántos píxeles de scroll dura el efecto (ajústalo si quieres que dure más o menos)
            pin: true, // Fija la pantalla
            scrub: 1, // Suaviza la animación de las letras al ritmo del scroll
        }
    });

    // Animamos cada línea para que aparezca en cascada
    logLines.forEach((line, i) => {
        tlBoot.to(line, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        }, i * 0.4); // El 0.4 es el retraso entre cada línea (stagger manual)
    });
}

// 7. ACORDEÓN POR SCROLL (Exclusivo para móviles - ajustado al 50% de la pantalla)
let mm = gsap.matchMedia();

mm.add("(max-width: 767px)", () => {
    const panels = document.querySelectorAll('.panel');
    panels.forEach((panel) => {
        ScrollTrigger.create({
            trigger: panel,
            start: "top 50%", // Se abren exactamente en el centro de la pantalla al bajar
            end: "bottom 40%", 
            toggleClass: "active" 
        });
    });
});

// 9. LABORATORIO DE ESTILOS (Selector de Color Interactivo)
const colorPickerInput = document.getElementById('native-color-picker');
const livePreviewBox = document.getElementById('live-preview-box');
const colorHexLabel = document.getElementById('color-hex-label');
const colorPresetButtons = document.querySelectorAll('.color-preset');

function updateSystemColor(hexColor) {
    if (!livePreviewBox) return;
    
    // Cambia el color de fondo de la caja de vista previa
    livePreviewBox.style.backgroundColor = hexColor;
    
    // Actualiza el texto con el código hexadecimal en tiempo real
    if (colorHexLabel) {
        colorHexLabel.textContent = hexColor;
    }
    
    // Si el usuario elige un color muy oscuro, cambiamos el texto a blanco para que se lea bien
    // (Un pequeño toque de lógica de programación aplicada al diseño)
    if (hexColor === '#141414' || hexColor === '#000000') {
        livePreviewBox.style.color = '#F4F1EB';
    } else {
        livePreviewBox.style.color = '#ffffff';
    }
}

// Evento cuando usan la paleta nativa
if (colorPickerInput) {
    colorPickerInput.addEventListener('input', (e) => {
        updateSystemColor(e.target.value);
    });
}

// Evento para los botones rápidos de colores de la marca
colorPresetButtons.forEach(button => {
    button.addEventListener('click', () => {
        const selectedColor = button.getAttribute('data-color');
        if (colorPickerInput) {
            colorPickerInput.value = selectedColor; // Sincroniza el input nativo
        }
        updateSystemColor(selectedColor);
    });
});