import api from "./api";

export const getEtudiants = async () => {
    const response = await api.get("/etudiants");
    return response.data;
};

export const getEtudiant = async (id: string) => {
    const response = await api.get(`/etudiants/${id}`);
    return response.data;
}

export const createEtudiant = async (etudiant: any) => {
    const response = await api.post("/etudiants", etudiant);
    return response.data;
}

export const updateEtudiant = async (id: string, etudiant: any) => {
    const response = await api.put(`/etudiants/${id}`, etudiant);
    return response.data;
}

export const deleteEtudiant = async (id: string) => {
    const response = await api.delete(`/etudiants/${id}`);
    return response.data;
}