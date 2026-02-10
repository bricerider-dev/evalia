import api from "./api";
import { Evaluation } from "../lib/types";

export const getEvaluations = async () => {
    const response = await api.get("academic/evaluations/");
    return response.data;
};

export const createEvaluation = async (evaluation: Evaluation) => {
    const response = await api.post("academic/evaluations/", evaluation);
    return response.data;
};

export const updateEvaluation = async (id: number, evaluation: Evaluation) => {
    const response = await api.put(`academic/evaluations/${id}/`, evaluation);
    return response.data;
};