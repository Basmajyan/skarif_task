import axios from 'axios';

const API_URL = 'http://localhost:8000/api/annotations/';

export const createAnnotation = async (annotation) => {
    const response = await axios.post(API_URL, annotation);
    return response.data;
};

export const getAllAnnotations = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getAnnotation = async (annotationId) => {
    const response = await axios.get(`${API_URL}${annotationId}`);
    return response.data;
};

export const updateAnnotation = async (annotationId, annotation) => {
    const response = await axios.put(`${API_URL}${annotationId}`, annotation);
    return response.data;
};

export const deleteAnnotation = async (annotationId) => {
    const response = await axios.delete(`${API_URL}${annotationId}`);
    return response.data;
};
