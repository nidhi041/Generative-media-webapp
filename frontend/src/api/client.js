import axios from "axios";

const api = axios.create({
baseURL:
import.meta.env.MODE === "development"
? "/api"
: import.meta.env.VITE_API_URL,

timeout: 130000,

headers: {
"Content-Type": "application/json",
},
});

api.interceptors.response.use(
(response) => response,

(error) => {
const message =
error?.response?.data?.error ||
error?.message ||
(error.code === "ECONNABORTED"
? "Request timed out"
: "Network error");


console.error("API Error:", message);

return Promise.reject(new Error(message));


}
);

export default api;
