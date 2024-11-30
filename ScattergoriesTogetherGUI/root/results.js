import { apiRequest } from "./apiConfig";

const gameId = sessionStorage.getItem("gameId");

// Fetch final game results
async function fetchResults() {
    try {
        const response = await apiRequest(`/games/${gameId}/end`, "POST");
        return response.data.leaderboard;
    } catch (error) {
        console.error("Error fetching game results:", error);
    }
}

function displayResults(leaderboard) {
    const firstPlayer = document.getElementById("first-player");
    const secondPlayer = document.getElementById("second-player");
    const thirdPlayer = document.getElementById("third-player");
    const playerList = document.getElementById("player-list");

    // Clear existing content
    firstPlayer.innerHTML = "";
    secondPlayer.innerHTML = "";
    thirdPlayer.innerHTML = "";
    playerList.innerHTML = "";

    leaderboard.forEach(player => {
        const { username, score, rank } = player;

        // Assing players to the podium
        if (rank === 1) {
            firstPlayer.innerHTML = `<h3>${username}</h3><p>${score} points</p>`;
        } else if (rank === 2) {
            secondPlayer.innerHTML = `<h3>${username}</h3><p>${score} points</p>`;
        } else if (rank === 3) {
            thirdPlayer.innerHTML = `<h3>${username}</h3><p>${score} points</p>`;
        } else if (rank <= 5) {
            // Add players ranked 4th and 5th to the "Honorable Mentions" section
            const li = document.createElement("li");
            li.innerHTML = `<strong>${rank}.</strong> ${username} - ${score} points`;
            playerList.appendChild(li);
        }
    });
}

// Load results on page load
document.addEventListener("DOMContentLoaded", async () => {
    const leaderboard = await fetchResults();
    if (leaderboard) {
        displayResults(leaderboard);
    }
})