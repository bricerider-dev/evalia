import api from "./api";

export const getEtudiants = async () => {
    const response = await api.get("users/etudiants/");
    return response.data;
};

export const getEtudiant = async (id: string) => {
    const response = await api.get(`users/etudiants/${id}/`);
    return response.data;
}

export const createEtudiant = async (etudiant: any) => {
    const response = await api.post("users/etudiants/", etudiant);
    return response.data;
}

export const updateEtudiant = async (id: string, etudiant: any) => {
    const response = await api.put(`users/etudiants/${id}/`, etudiant);
    return response.data;
}

export const deleteEtudiant = async (id: string) => {
    const response = await api.delete(`users/etudiants/${id}/`);
    return response.data;
}