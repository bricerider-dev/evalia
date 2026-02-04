import api from "./api";

export const getSubjects = async () => {
    const response = await api.get("academic/subjects/");
    return response.data;
};

export const createSubject = async (subject: any) => {
    const response = await api.post("academic/subjects/", subject);
    return response.data;
};

export const updateSubject = async (id: number | string, subject: any) => {
    const response = await api.put(`academic/subjects/${id}/`, subject);
    return response.data;
};

export const deleteSubject = async (id: number | string) => {
    const response = await api.delete(`academic/subjects/${id}/`);
    return response.data;
};

export const getUnits = async () => {
    const response = await api.get("academic/units/");
    return response.data;
};
