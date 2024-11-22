import { apiRequest } from "./apiConfig";

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    const screens = document.querySelectorAll(".screen");

    const showScreen = (id) => {
        screens.forEach((screen) => screen.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    };

    //Menu actions
    document.getElementById("host-game-btn").addEventListener("click", async () => {
        const data = await apiRequest("/games/create", "POST", { hostUsername: "YourHostName" });
        if (data) {
            document.getElementById("game-id-display").textContent = data.gameId;
            showScreen("host-game");
        }
    });

    document.getElementById("join-game-submit-btn").addEventListener("click", async () => {
        const gameId = document.getElementById("join-game-id").value;
        const username = document.getElementById("username").value;

        const success = await apiRequest("/games/${gameId}/join", "POST", { username });
        if (success) {
            showScreen("game-screen");
        } else {
            alert("Failed to join game. Check Game ID.");
        }
    });

    //Start game
    document.getElementById("start-game-btn").addEventListener("click", async () => {
        const gameId = document.getElementById("game-id-display").textContent;
        await apiRequest("/games/${gameId}/start", "POST");
        showScreen("game-screen");
    });

    //Submitting responses
    document.getElementById("submit-response-btn").addEventListener("click", async () => {
        const gameId = document.getElementById("game-id-display").textContent;
        const username = document.getElementById("username").value;
        const response = document.getElementById("response").value;

        await apiRequest("/games/${gameId}/responses", "POST", { username, responses: [response] });
        alert("Response submitted!");
    });

    const endRound = async () => {
        const gameId = document.getElementById("game-id-display").textContent;
        await apiRequest("/games/${gameId}/endRound", "POST");

        const scores = await apiRequest("/games/${gameId}/scores");
        const scoreList = document.getElementById("score-list");
        scoreList.innerHTML = scores.map((s) => "<p>${s.username}: ${s.score}</p>").join("");
        showScreen("scoreboard");
    };

    //Start the timer when the game screen is shown
    showScreen("menu");
});

// Fetch game details, including letter, prompts, and timer
document.addEventListener("DOMContentLoaded", async () => {
    const gameId = sessionStorage.getItem("gameId"); // Retrieve game ID from session
    if (!gameId) {
        alert("No game found! Returning to join page.");
        window.location.href = "join.html";
        return;
    }

    try {
        // Fetch game data from API
        const response = await fetch(`${API_BASE_URL}/game/${gameId}`);
        const gameData = await response.json();

        if (response.ok) {
            const { currentLetter, currentPrompt, timeRemaining } = gameData;

            // Display the letter
            document.getElementById("game-letter").textContent = currentLetter;

            // Display the prompt
            document.getElementById("prompt-display").textContent = currentPrompt;

            // Start the timer
            startTimer(timeRemaining);
        } else {
            console.error("Error fetching game data:", gameData.message);
            alert("Could not load game. Please try again later.");
        }
    } catch (error) {
        console.error("Error connecting to API:", error);
        alert("Could not load game. Please check your internet connection.");
    }
});

// Handle response submission
document.getElementById("response-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const responseInput = document.getElementById("response");
    const response = responseInput.value.trim();
    const gameId = sessionStorage.getItem("gameId");

    if (!response) {
        alert("Please enter a response.");
        return;
    }

    try {
        // Submit the response
        const res = await fetch(`${API_BASE_URL}/game/${gameId}/response`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ response }),
        });

        if (res.ok) {
            alert("Response submitted successfully!");
            responseInput.value = ""; // Clear the input
        } else {
            const errorData = await res.json();
            alert(`Error submitting response: ${errorData.message}`);
        }
    } catch (error) {
        console.error("Error submitting response:", error);
        alert("Could not submit response. Please try again.");
    }
});

// Timer Logic
function startTimer(duration) {
    const timerElement = document.getElementById("timer");
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
