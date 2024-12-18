import { apiRequest } from "./apiConfig.js";

sessionStorage.setItem("currentPromptIndex", 0);

const gameId = sessionStorage.getItem("gameId");
let round = parseInt(sessionStorage.getItem("currentRound"), 10) || 1;
let currentPromptIndex = parseInt(sessionStorage.getItem("currentPromptIndex"), 10) || 0;
const prompts = JSON.parse(sessionStorage.getItem("currentPrompts")) || [];

function initializePage() {
    console.log("Initializing the page...");

    if (gameId === null || currentPromptIndex === null) {
        console.error("Critical session storage values missing:", { gameId, currentPromptIndex });
        const promptTextElement = document.getElementById("prompt-text");
        if (promptTextElement) {
            promptTextElement.textContent = "Error: required game information is missing.";
        }
        return;
    }

    if (!Array.isArray(prompts) || prompts.length === 0) {
        console.error("Prompts data is missing or invalid:", prompts);
        const promptTextElement = document.getElementById("prompt-text");
        if (promptTextElement) {
            promptTextElement.textContent = "Error: No prompts available.";
        }
        return;
    }

    loadPrompt();
}

// Constants
const TOTAL_PROMPTS_PER_ROUND = 12;
const TOTAL_ROUNDS = 3;

async function fetchResponses(prompt) {
    try {
        console.log("Fetching responses for prompt:", prompt);
        const response = await apiRequest(`/games/${gameId}/round/${round}/prompt/${prompt}/responses`, "GET");
        console.log("Raw API response:", response);
        return Array.isArray(response) ? response : response?.data || [];
        console.error("Error fetching responses:", error);
    } catch (error) {
        console.error("Error fetching responses:", error);
        return [];
    }
}

function displayResponses(responses) {
    const responseList = document.getElementById("responses-list");
    const promptText = document.getElementById("prompt-text");
    const scoresSection = document.getElementById("scores-section");

    responseList.innerHTML = ""; // Clear previous responses
    scoresSection.innerHTML = ""; // Clear previous scores

    // Display the prompt text
    const currentPrompt = prompts.at(currentPromptIndex);
    promptText.textContent = `Prompt: ${currentPrompt}`;

    // Iterate over responses and display each user's answer
    responses.forEach(res => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="response-item">
                <h3>${res.username}</h3>
                <p>${res.answer}</p>
            </div>
        `;
        if (!res.valid) {
            li.style.textDecoration = "line through";
        }
        responseList.appendChild(li);
    });

    // Automatically move to show scores after a pause
    setTimeout(() => {
        displayScores(responses);
    }, 5000); // 5-second pause for reading responses
}

function displayScores(responses) {
    console.log("Displaying responses...");

    const scoresSection = document.getElementById("scores-section");

    // Iterate over responses to display scores
    responses.forEach(res => {
        const scoreRow = document.createElement("div");
        scoreRow.className = "score-row";
        scoreRow.innerHTML = `
            <span class="username">${res.username}</span>
            <span class="score">${res.score} points</span>
        `;
        scoresSection.appendChild(scoreRow);
    });

    // Move to the next prompt or round
    setTimeout(() => {
        moveToNextPromptOrRound();
    }, 5000);
}

function moveToNextPromptOrRound() {
    currentPromptIndex++;

    // Check if the current round's prompts are completed
    if (currentPromptIndex >= TOTAL_PROMPTS_PER_ROUND) {
        currentPromptIndex = 0;
        round++;

        // Check if all rounds are completed
        if (round > TOTAL_ROUNDS) {
            // End the game and display final results
            window.location.href = "results.html";
        } else {
            // Treansition to the next round
            sessionStorage.setItem("currentRound", round);
            sessionStorage.setItem("currentPromptIndex", currentPromptIndex);
            alert(`Round ${round - 1} complete! Starting Round ${round}...`);
            window.location.href = "game.html";
        }
    } else {
        sessionStorage.setItem("currentPromptIndex", currentPromptIndex);
    }

    // Reload the page for the next prompt
    loadPrompt();
}

// Load the prompt and its responses
async function loadPrompt() {
    console.log("Loading prompt...");
    const currentPrompt = prompts.at(currentPromptIndex);
    console.log("Current Prompt:", currentPrompt);

    const responses = await fetchResponses(currentPrompt);
    console.log("Responses fetched:", responses);

    if (responses && Array.isArray(responses) && responses.length > 0) {
        displayResponses(responses);
    } else {
        console.error("No valid responses to display:", responses);
        const responseList = document.getElementById("responses-list");
        if (responseList) {
            responseList.innerHTML = "<p>No responses found for this prompt.</p>";
        }
    }
}

async function startVote(responseId) {
    try {
        await apiRequest(`/games/${gameId}/responses/${responseId}/validate`, "POST", { isValid: false });
        alert("Vote started for this response.")
    } catch (error) {
        console.error("Error starting vote:", error);
    }
}

// Event listener for moving to the next round
document.getElementById("next-round-btn").addEventListener("click", async () => {
    try {
        await apiRequest(`/games/${gameId}/nextRound`, "POST");
        if (round == 3){
            window.location.href = "winner.htl";
        } else {
            // Lood the next prompt 
            sessionStorage.setItem("currentRound", parseInt(round, 10) + 1);
        }
    } catch (error) {
        console.error("Error advancing to next round", error);
    }
})

document.addEventListener("DOMContentLoaded", () => {
    console.log("Review page script loaded."); //Debug log
    console.log("Session Storage Values:", {
        gameId: sessionStorage.getItem("gameId"),
        currentRound : sessionStorage.getItem("currentRound"),
        currentPromptIndex: sessionStorage.getItem("currentPromptIndex"),
    });

    initializePage();
})