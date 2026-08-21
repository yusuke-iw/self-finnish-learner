import axios from 'axios';

export const fetchSentences = () => axios.get('/api/sentences');
export const fetchPassages = () => axios.get('/api/passages');
export const fetchPassageById = (id) => axios.get(`/api/passages/${id}`);
export const generateSession = (sentenceCount, category, level) => axios.post('/api/sessions/generate', { sentenceCount, category, level });
export const checkAnswer = (payload) => axios.post('/api/sessions/check', payload);
