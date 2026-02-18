import api from "./api";

// ============ CRUD Grades ============
export const getGrades = async (params?: {
    student_id?: string | number;
    evaluation_id?: string | number;
    evaluation_type?: string;
    ue_id?: string | number;
} ) => {
    const response = await api.get("grade/notes/", { params });
    return response.data;
};

export const getGradeById = async (id: string) => {
    const response = await api.get(`grade/notes/${id}/`);
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

export const patchGrade = async (id: string, grade: any) => {
    const response = await api.patch(`grade/notes/${id}/`, grade);
    return response.data;
};

export const deleteGrade = async (id: string) => {
    const response = await api.delete(`grade/notes/${id}/`);
    return response.data;
};

// ============ Génération des PV ============
export const generatePV = async (
  evaluationType: 'CC' | 'SN' | 'RA' | 'Final',
  params?: { filiere_id?: string; niveau?: string }
) => {
    try {
        const response = await api.get(`grade/generate-pv/${evaluationType}/`, {
            responseType: 'blob',
            params: params || {}
        });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la génération du PV ${evaluationType}:`, error);
        throw error;
    }
};

/**
 * Récupère les filtres disponibles pour la génération de PV Final
 */
export const getPVFilters = async () => {
    try {
        const response = await api.get('grade/pv-filters/');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des filtres de PV:', error);
        throw error;
    }
};

// ============ Rapports étudiants ============
export const getStudentGradeReport = async (studentId: string | number) => {
    try {
        const response = await api.get(`grade/student-report/${studentId}/`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération du rapport étudiant ${studentId}:`, error);
        throw error;
    }
};

// ============ Utilitaires ============
/**
 * Télécharge un fichier PDF
 * @param blob - Le blob du fichier
 * @param filename - Nom du fichier
 */
export const downloadPDF = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Télécharge un PV en PDF
 * @param evaluationType - Type d'évaluation (CC, SN, RA, Final)
 * @param params - Paramètres optionnels (filiere_id, niveau pour PV Final)
 */
export const downloadPVPDF = async (
  evaluationType: 'CC' | 'SN' | 'RA' | 'Final',
  params?: { filiere_id?: string; niveau?: string }
) => {
    try {
        const blob = await generatePV(evaluationType, params);
        const timestamp = new Date().toISOString().split('T')[0];
        let filename = `PV_${evaluationType}_${timestamp}.pdf`;
        
        // Ajouter les filtres au nom du fichier si présents
        if (params) {
            const filterParts = [];
            if (params.filiere_id) filterParts.push(`F${params.filiere_id}`);
            if (params.niveau) filterParts.push(`N${params.niveau}`);
            if (filterParts.length > 0) {
                filename = `PV_${evaluationType}_${filterParts.join('_')}_${timestamp}.pdf`;
            }
        }
        
        downloadPDF(blob, filename);
        return filename;
    } catch (error) {
        console.error(`Erreur lors du téléchargement du PV:`, error);
        throw error;
    }
};
