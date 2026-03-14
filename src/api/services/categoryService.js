import client from '../clients';

export const getCategories = async () => {
  const response = await client.get('/admin/categories');
  return response.data;
};

export const createCategory = async (data) => {
  const response = await client.post('/admin/categories', data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await client.put(`/admin/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await client.delete(`/admin/categories/${id}`);
  return response.data;
};

export const updateCategoryStatus = async (id, isActive) => {
  const response = await client.put(`/admin/categories/${id}`, { isActive });
  return response.data;
};
