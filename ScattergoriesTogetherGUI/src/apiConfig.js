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

    const response = await fetch('${API_BASE_URL}${url', options);
    if (!response.ok){
        throw new Error("Error: ${response.status}");
    }
    return response.json();
};