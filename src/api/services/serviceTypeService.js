import client from '../clients';

export const getServiceTypesByCategory = async (categoryId) => {
  const response = await client.get(`/admin/categories/${categoryId}/service-types`);
  return response.data;
};

export const createServiceType = async (data) => {
  const response = await client.post('/admin/service-types', data);
  return response.data;
};

export const updateServiceType = async (id, data) => {
  const response = await client.put(`/admin/service-types/${id}`, data);
  return response.data;
};

export const deleteServiceType = async (id) => {
  const response = await client.delete(`/admin/service-types/${id}`);
  return response.data;
};

export const updateServiceTypeStatus = async (id, isActive) => {
  const response = await client.put(`/admin/service-types/${id}`, { isActive });
  return response.data;
};
