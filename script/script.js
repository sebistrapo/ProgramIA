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

gsap.from(".reveal-up", {
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: "power4.out"
});

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

let w, h;
let textParticles = [];

// Palabras y fragmentos que flotarán en el fondo
const techWords = [
    'ECHO', 'C++', 'Python', 'Node.js', 'Supabase',
    'Linux', 'Ubuntu', 'PHP', 'MySQL', 'Termux',
    '=>', '{...}', '</>', 'sudo apt-get', 'sys.stdout', '0101'
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

// Base de datos de respuestas para cada comando
const terminalData = {
    'whoami': `
    Usuario: Admin del Ecosistema
    Estado: Activo
    Permisos: Superusuario [SUDO]
    Especialidad: Desarrollo de aplicaciones y gestión de entornos Linux.
    Ubicación: Operando desde la base central.
    `,
    'cat stack.log': `
    Cargando dependencias tecnológicas...
    [OK] Node.js - Motor backend activado.
    [OK] C++ & Python - Compiladores listos.
    [OK] PHP & MySQL - Bases de datos operativas.
    [OK] Supabase - API conectada con éxito.
    [INFO] Interfaz: UI v8.5 optimizada.
    `,
    'git log --latest': `
    commit 8f9a2b3c (HEAD -> main)
    Author: Echo Dev <echo@system.local>
    Date: Thu Jul 16 2026
    
    feat: Inicializada la Landing Page Brutalista
    - Añadido efecto magnético en Laboratorio.
    - Implementada lluvia de código en fondo Canvas.
    - Optimizada estructura HTML/CSS.
    `,
    './init_inventory.sh': `
    Iniciando script de despliegue de aplicativo...
    > Conectando a Supabase... [Conectado]
    > Verificando tablas de stock... [Verificado]
    > Sincronizando repositorios Git locales con el servidor...
    [SUCCESS] El sistema de inventarios está corriendo en el puerto 3000.
    `
};

let typeWriterTimeout; // Para detener la escritura si se presiona otro botón rápido

function typeWriterEffect(text, element) {
    // Limpiamos el timeout anterior si el usuario hace clic rápido en varios botones
    clearTimeout(typeWriterTimeout); 
    
    // El prefijo estándar de la terminal
    const prefix = '<span class="text-[#2A1AFF]">programia@root</span>:<span class="text-[#FF3E1A]">~</span>$ ';
    element.innerHTML = prefix;
    
    let i = 0;
    // Quitamos los espacios en blanco extra del inicio del texto
    const chars = text.trim().split(''); 

    function type() {
        if (i < chars.length) {
            // Reemplazar saltos de línea por <br> para HTML
            const char = chars[i] === '\n' ? '<br>' : chars[i];
            element.innerHTML += char;
            i++;
            // Velocidad aleatoria de escritura (entre 5ms y 30ms) para que parezca más real
            typeWriterTimeout = setTimeout(type, Math.random() * 25 + 5);
        } else {
            // Cuando termina, añadir el cursor parpadeante
            element.innerHTML += '<span class="animate-pulse bg-white w-2 h-4 inline-block ml-1 align-middle"></span>';
        }
    }
    
    type();
}

// Event Listeners para los botones
cmdButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        
        // Quitar la clase 'activa' visual de todos los botones
        cmdButtons.forEach(b => b.classList.remove('bg-[#FF3E1A]', 'text-white'));
        
        // Añadir color sólido al botón clickeado
        btn.classList.add('bg-[#FF3E1A]', 'text-white');
        
        // Mostrar primero el comando que se "escribió" y luego la respuesta
        terminalOutput.innerHTML = `<span class="text-[#2A1AFF]">programia@root</span>:<span class="text-white">~</span>$ ${cmd}<br><br>`;
        
        // Retraso pequeño antes de escupir la respuesta (simula carga de la red)
        setTimeout(() => {
            typeWriterEffect(terminalData[cmd], terminalOutput);
        }, 400);
    });
});