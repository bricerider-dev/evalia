import api from "./api";

export const login = async (matricule: string, password: string) => {
    const response = await api.post("users/login/", { matricule, password });
    return response.data;
};