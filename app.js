let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");
let spinCounts = JSON.parse(localStorage.getItem("spinCounts")) || {};

const loginForm = document.getElementById("login");
const registerForm = document.getElementById("register");
const gameContainer = document.getElementById("game-container");
const authContainer = document.querySelector(".auth-container");
const profileContainer = document.getElementById("profile-container");
const ticketCountDisplay = document.getElementById("ticket-count");
const spinCountDisplay = document.getElementById("spin-count");

let tickets = 0;
let spins = 0;
let isSpinning = false;
let wheelAngle = 0;
let spinSpeed = 0;

// Crear usuario admin si no existe
if (!users['jonathan']) {
    users['jonathan'] = { password: 'jjjjjj', tickets: 0 };
    localStorage.setItem("users", JSON.stringify(users));
}

function showLogin() {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
}

function showRegister() {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
}

function register() {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const errorDisplay = document.getElementById("register-error");

    if (!username || !password) {
        errorDisplay.textContent = "Todos los campos son obligatorios.";
        return;
    }

    if (users[username]) {
        errorDisplay.textContent = "El usuario ya existe.";
        return;
    }

    users[username] = { password: password, tickets: 0 };
    localStorage.setItem("users", JSON.stringify(users));
    errorDisplay.textContent = "";
    alert("Usuario registrado exitosamente. Por favor, inicia sesión.");
    showLogin();
}

function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const errorDisplay = document.getElementById("login-error");

    if (!username || !password) {
        errorDisplay.textContent = "Todos los campos son obligatorios.";
        return;
    }

    if (!users[username] || users[username].password !== password) {
        errorDisplay.textContent = "Usuario o contraseña incorrectos.";
        return;
    }

    currentUser = username;
    localStorage.setItem("currentUser", currentUser);
    tickets = users[currentUser].tickets;
    spins = spinCounts[currentUser] || 0;
    updateTicketCount();
    updateSpinCount();

    const profileName = document.getElementById("profile-name");
    profileName.textContent = currentUser;

    // Si el usuario es Jonathan, darle estilo rojo
    if (currentUser === 'jonathan') {
        profileName.classList.add("admin");
    } else {
        profileName.classList.remove("admin");
    }

    document.getElementById("profile-id").textContent = currentUser;
    authContainer.classList.add("hidden");
    profileContainer.classList.remove("hidden");
    gameContainer.classList.remove("hidden");

    drawWheel();
}

function logout() {
    localStorage.removeItem("currentUser");
    currentUser = null;
    authContainer.classList.remove("hidden");
    profileContainer.classList.add("hidden");
    gameContainer.classList.add("hidden");
}

function updateTicketCount() {
    ticketCountDisplay.textContent = `Tickets disponibles: ${tickets}`;
}

function updateSpinCount() {
    spinCountDisplay.textContent = spins;
}

function buyTickets(amount) {
    if (!currentUser) {
        alert("Debes iniciar sesión para comprar tickets.");
        return;
    }

    // Aquí deberíamos añadir una validación para el dinero
    tickets += amount;
    users[currentUser].tickets = tickets;
    localStorage.setItem("users", JSON.stringify(users));
    updateTicketCount();
}

// Función para girar la ruleta con animación
function spinWheel() {
    if (tickets <= 0 || isSpinning) {
        alert("No tienes tickets suficientes o la ruleta está girando.");
        return;
    }

    tickets--;
    spins++;
    users[currentUser].tickets = tickets;
    spinCounts[currentUser] = spins;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("spinCounts", JSON.stringify(spinCounts));

    updateTicketCount();
    updateSpinCount();

    // Configurar la velocidad inicial de giro y activar el giro
    spinSpeed = Math.random() * 10 + 10;
    isSpinning = true;
    animateWheel();
}

function animateWheel() {
    const canvas = document.getElementById("wheel");
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;
    const segments = ["Premio 1", "Premio 2", "Premio 3", "Premio 4", "Premio 5", "Premio 6", "Premio 7", "Premio 8"];
    const totalSegments = segments.length;
    const anglePerSegment = (2 * Math.PI) / totalSegments;

    // Girar la ruleta
    wheelAngle += spinSpeed;
    spinSpeed *= 0.97; // Desacelerar gradualmente

    if (spinSpeed < 0.1) {
        spinSpeed = 0;
        isSpinning = false;
        const selectedSegment = Math.floor((wheelAngle / anglePerSegment) % totalSegments);
        document.getElementById("result").textContent = `Resultado: ${segments[selectedSegment]}`;
    }

    // Dibujar la ruleta
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas

    for (let i = 0; i < totalSegments; i++) {
        const startAngle = i * anglePerSegment + wheelAngle;
        const endAngle = startAngle + anglePerSegment;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        // Alternar colores entre amarillo claro y oscuro
        ctx.fillStyle = i % 2 === 0 ? '#ffcc00' : '#ff9900';
        ctx.fill();

        // Dibujar el texto del segmento
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((startAngle + endAngle) / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = "bold 16px Arial";
        ctx.fillText(segments[i], radius - 10, 10);
        ctx.restore();
    }

    // Continuar animando mientras esté girando
    if (isSpinning) {
        requestAnimationFrame(animateWheel);
    }
}

// Dibuja la ruleta al cargar
function drawWheel() {
    animateWheel();
}
