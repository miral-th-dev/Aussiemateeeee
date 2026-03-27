import client from '../clients';
import { ENDPOINTS } from '../constants/endpoints';

/**
 * FAQ Categories APIs
 */
export const fetchFaqCategories = async () => {
  const response = await client.get(ENDPOINTS.FAQ_CATEGORIES);
  return response.data;
};

export const createFaqCategory = async (data) => {
  const response = await client.post(ENDPOINTS.FAQ_CATEGORIES, data);
  return response.data;
};

export const updateFaqCategory = async (id, data) => {
  const response = await client.put(`${ENDPOINTS.FAQ_CATEGORIES}/${id}`, data);
  return response.data;
};

export const deleteFaqCategory = async (id) => {
  const response = await client.delete(`${ENDPOINTS.FAQ_CATEGORIES}/${id}`);
  return response.data;
};

/**
 * FAQs APIs
 */
export const fetchFaqs = async () => {
  const response = await client.get(ENDPOINTS.FAQS);
  return response.data;
};

export const createFaq = async (data) => {
  const response = await client.post(ENDPOINTS.FAQS, data);
  return response.data;
};

export const updateFaq = async (id, data) => {
  const response = await client.put(`${ENDPOINTS.FAQS}/${id}`, data);
  return response.data;
};

export const deleteFaq = async (id) => {
  const response = await client.delete(`${ENDPOINTS.FAQS}/${id}`);
  return response.data;
};
