import client from '../clients';

export const getExtraServiceItems = async () => {
  const response = await client.get('/admin/extra-service-items');
  return response.data;
};

export const createExtraServiceItem = async (data) => {
  const response = await client.post('/admin/extra-service-items', data);
  return response.data;
};

export const updateExtraServiceItem = async (id, data) => {
  const response = await client.put(`/admin/extra-service-items/${id}`, data);
  return response.data;
};

export const deleteExtraServiceItem = async (id) => {
  const response = await client.delete(`/admin/extra-service-items/${id}`);
  return response.data;
};

export const updateExtraServiceItemStatus = async (id, isActive) => {
  const response = await client.put(`/admin/extra-service-items/${id}`, { isActive });
  return response.data;
};
