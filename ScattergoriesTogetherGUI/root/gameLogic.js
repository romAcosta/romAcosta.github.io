import { apiRequest } from "./apiConfig.js";
import "./stomp.umd.min.js"

let websocket = null;

function connectToWebSocket(gameId) {
    if (!gameId) {
        console.error("No gameId provided. Cannot connect to Websocket.")
        return;
    }

    const websocket = new WebSocket('https://scattergoriestogetherapi.onrender.com/scattergories-websocket');

    websocket.onopen = () => {
        console.log("Websocket connection established.");

        const connectMessage = JSON.stringify({ action: "connect", gameId });
        websocket.send(connectMessage);
        console.log("Sent connection message:", connectMessage);
    };

    websocket.onmessage = (event) => {
        console.log("WebSocket message recieved:", event.data);
        const message = JSON.parse(event.data);

        if (message.gameId === gameId) {
            if (message.action === "start-game") {
                window.location.href = "game.html";
            }
        }
    };

    websocket.onerror = (error) => {
        console.error("Websocket error occurred:", error);
        alert("An error occurred with the WebSocket connection. Please try again later.");
    };

    websocket.onclose = (event) => {
        console.log("Websocket connection closed:", event);
        alert("Disconnected from the server. Please refresh the page.");
    }
    

}

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
        const username = sessionStorage.getItem("username");
        if (!username){
            alert("You need to log in to create a lobby");
            window.location.href = "login.html";
            return;
        }
        const data = await apiRequest("/games/create", "POST", { hostUsername: username });
        if (data && data.gameId){
            sessionStorage.setItem("gameId", data.gameId);
            window.location.href = "lobby.html";
        } else {
            alert("Failed to create lobby.");
        }
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const gameId = sessionStorage.getItem("gameId");

    connectToWebSocket(gameId);

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
        const username = sessionStorage.getItem("username");
        if (!username) {
            alert("You need to log in to access this page.");
            window.location.href = "login.html";
            return;
        }
        event.preventDefault();
        const gameId = document.getElementById("join-game-id").value.trim();

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

        connectToWebSocket(gameId);
    
        try {
            const gameRound= await apiRequest(`/games/${gameId}/startRound`, "POST")
            const gameData = await apiRequest(`/games/${gameId}`, "GET");
            const username = sessionStorage.getItem("username");
            if (gameData) {
                document.getElementById("game-letter").textContent = `Letter: ${gameData.currentLetter || "N/A"}`;

                const prompts = gameData.currentPrompts;
                const promptContainer = document.getElementById("prompt-container");

                promptContainer.innerHTML = ""; // Clear any existing content

                prompts.forEach((prompt, index) => {
                    // Create label and input for each prompt
                    const label = document.createElement("label");
                    label.setAttribute("for", `response-${index}`);
                    label.textContent = prompt;

                    const input = document.createElement("input");
                    input.type = "text";
                    input.id = `response-${index}`;
                    input.name = `response-${index}`;
                    input.placeholder = `Enter response for "${prompt}"`;

                    // Append the label and input to the container
                    const div = document.createElement("div");
                    div.classList.add("prompt-item");
                    div.appendChild(label);
                    div.appendChild(input);

                    promptContainer.appendChild(div);
                });

                startTimer(60, async () => {
                    alert("Times up!");
                })

                document.getElementById("response-form").addEventListener("submit", async (event) => {
                    event.preventDefault(); // Prevent form from refreshing the page

                    const responses = prompts.map((promt, index) => {
                        const input = document.getElementById(`response-${index}`);
                        const answer = input ? input.value.trim() : null; // Allow empty responses
                        return { 
                            gameId,
                            username,
                            promptText: prompt,
                            answer,
                            round: gameRound,
                         };
                    });
                    
                    console.log("Submitting responses:", responses);
                    

                    // Send each response to the server
                    try {
                        await Promise.all(
                            responses.map(async (response) => {

                                console.log("Payload for submission:", response); // Log individual payload
                                await apiRequest(`/games/${gameId}/submitResponse`, "POST", response);
                            })
                        );
                        alert("Responses submitted successfully!");
                    } catch (error) {
                        console.error("Error submitting responses:", error);
                        alert("An error occurred while submitting your responses. Please try again.");
                    }

                    console.log("Responses submitted:", responses);
                });
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

