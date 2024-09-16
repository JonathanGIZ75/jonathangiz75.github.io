let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

const loginForm = document.getElementById("login");
const registerForm = document.getElementById("register");
const gameContainer = document.getElementById("game-container");
const authContainer = document.querySelector(".auth-container");
const ticketCountDisplay = document.getElementById("ticket-count");

let tickets = 0;

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
    updateTicketCount();
    authContainer.classList.add("hidden");
    gameContainer.classList.remove("hidden");
}

function logout() {
    localStorage.removeItem("currentUser");
    currentUser = null;
    authContainer.classList.remove("hidden");
    gameContainer.classList.add("hidden");
}

function buyTickets(amount) {
    if (!currentUser) {
        alert("Debes iniciar sesión para comprar tickets.");
        return;
    }

    tickets += amount;
    users[currentUser].tickets = tickets;
    localStorage.setItem("users", JSON.stringify(users));
    updateTicketCount();
}

function updateTicketCount() {
    ticketCountDisplay.textContent = `Tickets disponibles: ${tickets}`;
}

if (currentUser) {
    tickets = users[currentUser].tickets;
    updateTicketCount();
    authContainer.classList.add("hidden");
    gameContainer.classList.remove("hidden");
}

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const prizes = [
    "1000 euros",
    "Coche Fiat nuevo",
    "Premio sorpresa 1",
];

let startAngle = 0;
let spinning = false;
const prizeSlice = 2 * Math.PI / prizes.length;

function drawWheel() {
    for (let i = 0; i < prizes.length; i++) {
        const angle = startAngle + i * prizeSlice;
        ctx.beginPath();
        ctx.moveTo(250, 250);
        ctx.arc(250, 250, 250, angle, angle + prizeSlice);
        ctx.fillStyle = i % 2 === 0 ? "#FFDD57" : "#FF6B6B";
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(angle + prizeSlice / 2);
        ctx.fillStyle = "#333";
        ctx.font = "16px Arial";
        ctx.fillText(prizes[i], 130, 10);
        ctx.restore();
    }
}

function spinWheel() {
    if (!currentUser) {
        alert("Debes iniciar sesión para girar la ruleta.");
        return;
    }

    if (spinning || tickets <= 0) {
        alert("Necesitas al menos un ticket para girar la ruleta.");
        return;
    }

    tickets--;
    users[currentUser].tickets = tickets;
    localStorage.setItem("users", JSON.stringify(users));
    updateTicketCount();

    spinning = true;
    let spinTime = 5000;
    let randomSpin = Math.random() * 360 + 720;

    let endAngle = startAngle + randomSpin * (Math.PI / 180);
    let currentSpin = 0;

    const spinInterval = setInterval(() => {
        currentSpin += 10;
        startAngle += 0.1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawWheel();

        if (currentSpin >= spinTime) {
            clearInterval(spinInterval);
            spinning = false;
            determinePrize();
        }
    }, 10);
}

function determinePrize() {
    const winningAngle = (startAngle % (2 * Math.PI)) + Math.PI / 2;
    const prizeIndex = Math.floor((prizes.length - (winningAngle / prizeSlice)) % prizes.length);
    document.getElementById("result").textContent = `¡Felicidades! Has ganado: ${prizes[prizeIndex]}`;
}

drawWheel();