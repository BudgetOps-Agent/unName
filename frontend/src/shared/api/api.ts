import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

      if (originalRequest.url?.includes("/api/user/login") || originalRequest.url?.includes("/api/user/reissue") || originalRequest.url?.includes("/api/user/logout")) {
            throw error;
        }

        const isAuthError = error.response?.status === 401 || error.response?.status === 403;

        if(isAuthError && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await api.post("/api/user/reissue");

                return api(originalRequest);
            } catch (reissueError) {
                if(typeof window !== "undefined") {
                    window.location.href = "/auth/signin";
                }
                throw reissueError;
            }
        }
        throw error;
    }
)

export default api;