const API_BASE_URL = "https://scattergoriestogetherapi.onrender.com";

export const apiRequest = async (url, method = "GET", body = null) => {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);
        
        // Check if response is okay (status 2xx)
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        // Check if the response is JSON
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
            // Parse the response body as JSON
            const json = await response.json();
            return json;
        } else {
            // If not JSON, handle non-JSON responses (e.g., plain text or empty)
            const text = await response.text();
            console.log("Non-JSON response:", text);
            return text; // Or handle accordingly
        }
    } catch (error) {
        console.error("API request failed:", error);
        throw error;  // Rethrow the error to be caught in the caller
    }
};
