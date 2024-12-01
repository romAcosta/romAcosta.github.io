const API_BASE_URL = "https://scattergoriestogetherapi.onrender.com";

export const apiRequest = async (url, method = "GET", body = null) => {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (body && method !== "GET") {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);
        
        // Check if response is okay (status 2xx)
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        // Return JSON if present, or raw text otherwise
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json"))  {
            return await response.json();
        } else {
            return await response.text();
        }

    } catch (error) {
        console.error("API request failed:", error);
        throw error;  // Rethrow the error to be caught in the caller
    }
};
