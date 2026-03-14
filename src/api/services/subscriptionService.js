import client from "../clients";

export const getSubscriptionPlans = async () => {
    const response = await client.get("/subscriptions/plans");
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
