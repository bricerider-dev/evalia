import api from "./api";

export const login = async (username: string, password: string) => {
    const response = await api.post("users/login/", { username, password });
    return response.data;
};