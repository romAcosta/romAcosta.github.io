import { apiRequest } from "./apiConfig.js";

const gameId = sessionStorage.getItem("gameId");
const round = sessionStorage.getItem("currentRound");

async function fetchResponses(prompt) {
    try {
        const response = await apiRequest(`/games/${gameId}/round/${round}/prompt/${prompt}/responses`, "GET");
        return response.data;
    } catch (error) {
        console.error("Error fetching responses:", error);
    }
}

function displayResponses(responses) {
    const responseList = document.getElementById("responses-list");
    responseList.innerHTML = ""; // Clear previous responses
    responses.forEach(res => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${res.userId}</strong>: ${res.answer}
            <button onclick="startVote('${res.id}')">Start Vote</button>
        `;
        if (!res.valid) {
            li.style.textDecoration = "line through";
        }
        responseList.appendChild;
    })
}

async function startVote(responseId) {
    try {
        await apiRequest((`/games/${gameId}/responses/${responseId}/validate`, "POST", { isValid: false }));
        alert("Vote started for this response.")
    } catch (error) {
        console.error("Error starting vote:", error);
    }
}

document.getElementById("next-prompt-btn").addEventListener("click", async () => {
    try {
        await apiRequest(`/games/${gameId}/nextPrompt`, "POST");
        loadPrompt();
    } catch (error) {
        console.error("Error moving to next prompt:". error);
    }
});

async function loadPrompt() {
    const currentPrompt = sessionStorage.getItem("currentPrompt");
    const response = await fetchResponses(currentPrompt);
    displayResponses(response);

    setTimeout(() => {
        document.getElementById("nest-prompt-btn").disabled = false;
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    loadPrompt();
})