import { apiRequest } from "./apiConfig.js";

// Utility function to safely add event listeners
const safeAddEventListener = (id, event, handler) => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    }
};

// Show a specific screen by ID
// const showScreen = (id) => {
//     const screens = document.querySelectorAll(".screen");
//     screens.forEach((screen) => screen.classList.remove("active"));
//     const targetScreen = document.getElementById(id);
//     if (targetScreen) {
//         targetScreen.classList.add("active");
//     }
// };

// Host Game Logic
safeAddEventListener("host-game-btn", "click", async () => {
    const data = await apiRequest("/games/create", "POST", { hostUsername: "defaultUser" });

    if (data && data.gameId) {
        const gameIdDisplay = document.getElementById("game-id-display");
        if (gameIdDisplay) {
            gameIdDisplay.textContent = data.gameId; // Display the generated game ID
            showScreen("host-game"); // Show the host game screen with the game code
        }
    } else {
        alert("Error: Game ID could not be created.");
    }
});

// Join Game Logic
safeAddEventListener("join-game-submit-btn", "click", async () => {
    const gameIdInput = document.getElementById("join-game-id");
    const usernameInput = document.getElementById("username");
    if (gameIdInput && usernameInput) {
        const gameId = gameIdInput.value;
        const username = usernameInput.value;

        const success = await apiRequest(`/games/${gameId}/join`, "POST", { username });
        if (success) {
            showScreen("game-screen");
        } else {
            alert("Failed to join game. Check Game ID.");
        }
    }
});

// Start Game Logic
safeAddEventListener("start-game-btn", "click", async () => {
    const gameIdDisplay = document.getElementById("game-id-display");
    if (gameIdDisplay) {
        const gameId = gameIdDisplay.textContent;
        await apiRequest(`/games/${gameId}/start`, "POST");
        showScreen("game-screen");
    }
});

// Timer Logic
function startTimer(duration) {
    const timerElement = document.getElementById("timer");
    if (timerElement) {
        let timeRemaining = duration;
        const interval = setInterval(() => {
            if (timeRemaining <= 0) {
                clearInterval(interval);
                timerElement.textContent = "Time's up!";
            } else {
                timerElement.textContent = `Time Remaining: ${timeRemaining--}s`;
            }
        }, 1000);
    }
}

// Example: Fetch Game Data on a Specific Page
const gameId = sessionStorage.getItem("gameId");
if (gameId) {
    fetch(`${API_BASE_URL}/game/${gameId}`)
        .then((response) => response.json())
        .then((gameData) => {
            if (response.ok) {
                document.getElementById("game-letter").textContent = gameData.currentLetter;
                document.getElementById("prompt-display").textContent = gameData.currentPrompt;
                startTimer(gameData.timeRemaining);
            }
        })
        .catch((error) => {
            console.error("Error fetching game data:", error);
        });
}
