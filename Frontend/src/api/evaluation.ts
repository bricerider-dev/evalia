import api from "./api";

export const getEvaluationsCC = async () => {
    const response = await api.get("academic/cc/");
    return response.data;
};

export const createEvaluationCC = async (evalCC: any) => {
    const response = await api.post("academic/cc/", evalCC);
    return response.data;
};

export const getEvaluationsSN = async () => {
    const response = await api.get("academic/sn/");
    return response.data;
};

export const createEvaluationSN = async (evalSN: any) => {
    const response = await api.post("academic/sn/", evalSN);
    return response.data;
};

export const getEvaluationsRA = async () => {
    const response = await api.get("academic/ra/");
    return response.data;
};

export const createEvaluationRA = async (evalRA: any) => {
    const response = await api.post("academic/ra/", evalRA);
    return response.data;
};

export const deleteEvaluation = async (type: 'CC' | 'SN' | 'RA', id: string) => {
    const endpoint = type.toLowerCase();
    const response = await api.delete(`academic/${endpoint}/${id}/`);
    return response.data;
};
