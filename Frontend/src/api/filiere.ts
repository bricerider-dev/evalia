import api from "./api";
import { Filiere } from "../lib/types";

export const getFilieres = async () => {
    const response = await api.get("dep/filieres/");
    return response.data;
};

export const createFiliere = async (filiere: any) => {
    const response = await api.post("dep/filieres/", filiere);
    return response.data;
};

export const updateFiliere = async (id: string, filiere: any) => {
    const response = await api.put(`dep/filieres/${id}/`, filiere);
    return response.data;
};

export const deleteFiliere = async (id: string) => {
    const response = await api.delete(`dep/filieres/${id}/`);
    return response.data;
};
