import client from "../clients";

export const getSubscriptionPlans = async () => {
    const response = await client.get("/subscriptions/admin/plans");
    return response.data;
};

export const createSubscriptionPlan = async (planData) => {
    const response = await client.post("/subscriptions/plans", planData);
    return response.data;
};

export const updateSubscriptionPlan = async (planId, planData) => {
    const response = await client.put(`/subscriptions/plans/${planId}`, planData);
    return response.data;
};

export const deleteSubscriptionPlan = async (planId) => {
    const response = await client.delete(`/subscriptions/plans/${planId}`);
    return response.data;
};

export const updatePlanStatus = async (planId, isActive) => {
    const response = await client.put(`/subscriptions/plans/${planId}`, { isActive });
    return response.data;
};

export const getCleanerSubscriptionsReport = async () => {
  const response = await client.get("/admin/subscriptions/report");
  return response.data;
};

// Extra Credit Packages
export const getExtraCreditPackages = async () => {
    const response = await client.get("/subscriptions/credits");
    return response.data;
};

export const createExtraCreditPackage = async (creditData) => {
    const response = await client.post("/subscriptions/credits", creditData);
    return response.data;
};

export const updateExtraCreditPackage = async (creditId, creditData) => {
    const response = await client.put(`/subscriptions/credits/${creditId}`, creditData);
    return response.data;
};

export const deleteExtraCreditPackage = async (creditId) => {
    const response = await client.delete(`/subscriptions/credits/${creditId}`);
    return response.data;
};
