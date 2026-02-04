import api from "./api";

export const getEnseignants = async () => {
    const response = await api.get("users/enseignants/");
    return response.data;
};

export const createEnseignant = async (enseignant: any) => {
    const response = await api.post("users/enseignants/", enseignant);
    return response.data;
};

export const updateEnseignant = async (id: string, enseignant: any) => {
    const response = await api.put(`users/enseignants/${id}/`, enseignant);
    return response.data;
};

export const deleteEnseignant = async (id: string) => {
    const response = await api.delete(`users/enseignants/${id}/`);
    return response.data;
};
