import api from "./api";

export const getGrades = async () => {
    const response = await api.get("grade/notes/");
    return response.data;
};

export const createGrade = async (grade: any) => {
    const response = await api.post("grade/notes/", grade);
    return response.data;
};

export const updateGrade = async (id: string, grade: any) => {
    const response = await api.put(`grade/notes/${id}/`, grade);
    return response.data;
};

export const deleteGrade = async (id: string) => {
    const response = await api.delete(`grade/notes/${id}/`);
    return response.data;
};
