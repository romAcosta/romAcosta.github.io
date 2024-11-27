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
document.addEventListener("DOMContentLoaded", () => {
    safeAddEventListener("create-lobby-btn", "click", async () => {
        const username = prompt("Enter your username:");
        if (!username){
            alert("Username is required to create a lobby.");
            return;
        }
        const data = await apiRequest("/games/create", "POST", { hostUsername: username });
        if (data && data.gameId){
            sessionStorage.setItem("gameId", data.gameId);
            sessionStorage.setItem("username", username);
            window.location.href = "lobby.html";
        } else {
            alert("Failed to create lobby.");
        }
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const gameId = sessionStorage.getItem("gameId");

    // Check if the current page is the lobby page
    if (window.location.pathname.includes("lobby.html")) {
        if (!gameId) {
            alert("No game found. Returning to home.");
            window.location.href = "index.html";  // Redirect if gameId is not found
            return;
        }
    
        // Display game ID in the lobby page
        document.getElementById("game-id-display").textContent = gameId;
    
        // Function to fetch and display the list of players
        const refreshPlayers = async () => {
            try {
                const players = await apiRequest(`/games/${gameId}/players`, "GET");
                const playerList = document.getElementById("player-list");
                playerList.innerHTML = players.map(player => `<li>${player}</li>`).join(""); // Corrected string interpolation
            } catch (error) {
                console.error("Error fetching players:", error);
                alert("Could not load player list. Please try again.");
            }
        };
    
        // Refresh the player list every 5 seconds
        setInterval(refreshPlayers, 5000);
        await refreshPlayers(); // Load players when page loads
    
        // Event listener for starting the game (host only)
        safeAddEventListener("start-game-btn", "click", async () => {
            try {
                const response = await apiRequest(`/games/${gameId}/start`, "POST");
                if (response && response.success) {
                    window.location.href = "game.html";  // Redirect to game page if success
                } else {
                    alert("Failed to start the game. Please try again.");
                }
            } catch (error) {
                console.error("Error while starting the game:", error);
                alert("There was an issue starting the game. Please try again later.");
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    safeAddEventListener("join-game-submit-btn", "click", async (event) => {
        event.preventDefault();
        const gameId = document.getElementById("join-game-id").value.trim();
        const username = prompt("Enter your username:");

        if (!gameId || !username){
            alert("Both Game ID and Username are required to join a game.");
            return;
        }

        try {
            const success = await apiRequest(`/games/${gameId}/join`, "POST", { username });
            if (success) {
                sessionStorage.setItem("gameId", gameId); // Save gameId
                window.location.href = "lobby.html" // Redirect to lobby
            } else {
                alert("Invalid Game ID or Game is not joinable. Please try again.");
            }
        } catch (error) {
            console.error("Error while joining game:", error);
            alert("There was an issue join the game. Please try again later.")
        }
        
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const pageId = document.body.id; // Use the body's ID to identify the page
    if (pageId == "game-page"){
        const gameId = sessionStorage.getItem("gameId");
        if (!gameId) {
            alert("No game found. Returning to home.");
            window.location.href = "index.html";
            return;
        }
    
        try {
            const gameRound= await apiRequest(`/games/${gameId}/startRound`, "POST")
            const gameData = await apiRequest(`/games/${gameId}`, "GET");
            if (gameData) {
                document.getElementById("game-letter").textContent = `Letter: ${gameData.currentLetter || "N/A"}`;

                const prompts = gameData.prompts
                var list = document.getElementById("prompt-list");
                list.innerHTML = ""
                for(var prompt of prompts){
                    var html = "<li>" + prompt +"</li>";
                    list.innerHTML = list.innerHTML + html;
                }
                //document.getElementById("prompt-display").innerHTML = prompts;


                startTimer(60, async () => {
                    alert("Times up!");
                })
            } else {
                alert("Failed to load game data. Please try again");
            }
        } catch (error) {
            console.error("Error loading game data:", error);
            alert("Could not load game details. Please try again later.")
        }
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
            timerElement.textContent = `Time Remaining: ${timeRemaining--}s`;
        }
    }, 1000);
}

