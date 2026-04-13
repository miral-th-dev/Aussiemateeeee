import client from '../clients';

export const getCommercialJobTypes = async () => {
  const response = await client.get('/admin/commercial-job-types');
  return response.data;
};

export const createCommercialJobType = async (data) => {
  const response = await client.post('/admin/commercial-job-types', data);
  return response.data;
};

export const updateCommercialJobType = async (id, data) => {
  const response = await client.put(`/admin/commercial-job-types/${id}`, data);
  return response.data;
};

export const deleteCommercialJobType = async (id) => {
  const response = await client.delete(`/admin/commercial-job-types/${id}`);
  return response.data;
};

export const updateCommercialJobTypeStatus = async (id, isActive) => {
  const response = await client.put(`/admin/commercial-job-types/${id}`, { isActive });
  return response.data;
};
