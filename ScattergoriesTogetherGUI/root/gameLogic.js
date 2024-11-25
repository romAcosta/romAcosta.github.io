import { apiRequest } from "./apiConfig.js";

// Utility function to safely add event listeners
const safeAddEventListener = (id, event, handler) => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    }
};

// Show a specific screen by ID
const showScreen = (id) => {
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => screen.classList.remove("active"));
    const targetScreen = document.getElementById(id);
    if (targetScreen) {
        targetScreen.classList.add("active");
    }
};

// Create Lobby Function
safeAddEventListener("create-lobby-btn", "click", async () => {
    const data = await apiRequest("/games/create", "POST", { hostUsername: "defaultUser" });
    if (data && data.gameId) {
        sessionStorage.setItem("gameId", data.gameId); //Save gameId
        window.location.href = "lobby.html"; // Redirect to lobby
    } else {
        alert("Failed to create lobby.");
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const gameId = sessionStorage.getItem("gameId");
    if (!gameId) {
        alert("No game found. Returning to home.");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("game-id-display").textContent = gameId;

    // Fetch and display players
    const refreshPlayers = async () => {
        const players = await apiRequest('/games/${gameId}/players', "GET");
        const playerList = document.getElementById("player-list");
        playerList.innerHTML = players.map(p => '<li>${p.username}</li>').join("");
    };

    // Refresh every 5 seconds
    setInterval(refreshPlayers, 5000);
    await refreshPlayers();

    // Start game (host only)
    safeAddEventListener("start-game-btn", "click", async () => {
        await apiRequest('/games/${gameId}/start', "POST");
        window.location.href = "game.html"; // Redirect to game page
    });
});

document.addEventListener("DOMContentLoaded", () => {
    safeAddEventListener("join-game-submit-btn", "click", async (event) => {
        event.preventDefault();
        const gameId = document.getElementById(join-game-id).value.trim();
        const username = prompt("Enter your username:");

        const success = await apiRequest('/games/${gameId}/join', "POST", { username });
        if (success) {
            sessionStorage.setItem("gameId", gameId); // Save gameId
            window.location.href = "lobby.html" // Redirect to lobby
        } else {
            alert("Invalid Game ID. Please try again.");
        }
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const gameId = sessionStorage.getItem("gameId");
    if (!gameId) {
        alert("No game found. Returning to home.");
        window.location.href = "index.html";
        return;
    }

    try {
        const gameData = await apiRequest('/games/${gameId}', "GET");
        if (gameData) {
            document.getElementById("game-letter").textContent = 'Letter: ${gameData.currentLetter}';
            document.getElementById("prompt-display").textContent = gameData.prompts.join("<br>");
            startTimer(60, async () => {
                alert("Times's up!");
                window.location.href = "results.html"; // Redirect to results pade
            });
        }
    } catch (error) {
        console.error("Error loading game data:", error);
    }
});

// Timer with callback
function startTimer(duration, callback) {
    const timerElement = document.getElementById("timer");
    let timeRemaining = duration;

    const interval = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(interval);
            timerElement.textContent = "Time's up!";
            if (callback) callback();
        } else {
            timerElement.textContent = 'Time Remaining: ${timeRemaining--}s';
        }
    }, 1000);
}

