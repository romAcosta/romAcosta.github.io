const API_BASE_URL = "https://scattergoriestogetherapi.onrender.com";

export const apiRequest = async (url, method = "GET", body = null) => {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (body && method !== "GET" && method !== "HEAD") {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, options);
        
        // Check if response is okay (status 2xx)
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        // Check if the response body is empty
        const text = await response.text();
        if (text) {
            // Check if the response body is JSON
            try {
                const json = JSON.parse(text); // Try to parse as JSON
                return json
            } catch (error) {
                console.warn("Response is not JSON, returning raw text:", text);
                return text;
            }
        } else {
            return {};
        }

    } catch (error) {
        console.error("API request failed:", error);
        throw error;  // Rethrow the error to be caught in the caller
    }
};
