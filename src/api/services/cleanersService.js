import client from '../clients';
import { ENDPOINTS } from '../constants/endpoints';

export const fetchCleanersKYC = async (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    role = '',
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = params;

  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  if (search) queryParams.append('search', search);
  if (role) queryParams.append('role', role);
  if (status) queryParams.append('status', status);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);

  const response = await client.get(`${ENDPOINTS.CLEANERS_KYC}?${queryParams.toString()}`);
  return response.data;
};

export const fetchCleanersKYCStats = async () => {
  const response = await client.get(ENDPOINTS.CLEANERS_KYC_STATS);
  return response.data;
};

// Fetch cleaner KYC details by ID
export const fetchCleanerKYCById = async (cleanerId) => {
  try {
    // Common REST style: /admin/cleaners/kyc/:id
    const response = await client.get(`${ENDPOINTS.CLEANERS_KYC}/${cleanerId}`);
    return response.data;
  } catch (error) {
    // Fallback: some backends use query param ?cleanerId=
    try {
      const response = await client.get(
        `${ENDPOINTS.CLEANERS_KYC}?cleanerId=${encodeURIComponent(cleanerId)}`
      );
      return response.data;
    } catch (err) {
      console.error("Failed to fetch cleaner KYC", err);
      throw err;
    }
  }
};

export const fetchCleaners = async (params = {}) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    role = '',
    status = '',
    badge = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = params;

  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  if (search) queryParams.append('search', search);
  if (role) queryParams.append('role', role);
  if (status) queryParams.append('status', status);
  if (badge) queryParams.append('badge', badge);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);

  const response = await client.get(`${ENDPOINTS.CLEANERS}?${queryParams.toString()}`);
  return response.data;
};

// Fetch cleaners jobs stats
export const fetchCleanersJobsStats = async () => {
  const response = await client.get(ENDPOINTS.CLEANERS_JOBS_STATS);
  return response.data;
};

// Fetch jobs for a specific cleaner
// GET /cleaners/:cleanerId/jobs
export const fetchCleanerJobs = async (cleanerId, params = {}) => {
  if (!cleanerId) throw new Error("cleanerId is required");

  const queryParams = new URLSearchParams();

  // If params is a number (legacy support), treat it as limit
  if (typeof params === 'number') {
    queryParams.append('limit', params.toString());
  } else {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });
  }

  const qs = queryParams.toString();
  const response = await client.get(
    `/cleaners/${encodeURIComponent(cleanerId)}/jobs${qs ? `?${qs}` : ""}`
  );
  return response.data;
};

// Fetch job summary for a specific cleaner
// GET /cleaners/:cleanerId/job-summary
export const fetchCleanerJobSummary = async (cleanerId) => {
  if (!cleanerId) throw new Error("cleanerId is required");
  const response = await client.get(`/cleaners/${encodeURIComponent(cleanerId)}/job-summary`);
  return response.data;
};

// Fetch reviews for a specific cleaner
// GET /reviews/cleaner/:cleanerId
export const fetchCleanerReviews = async (cleanerId, params = {}) => {
  if (!cleanerId) throw new Error("cleanerId is required");
  const { page, limit } = params;
  const queryParams = new URLSearchParams();
  if (page) queryParams.append('page', page.toString());
  if (limit) queryParams.append('limit', limit.toString());
  const qs = queryParams.toString();
  const response = await client.get(
    `${ENDPOINTS.REVIEWS_CLEANER}/${encodeURIComponent(cleanerId)}${qs ? `?${qs}` : ""}`
  );
  return response.data;
};

// Fetch a single cleaner by ID - tries direct ID fetch first, then searches in list
export const fetchCleanerById = async (cleanerId) => {
  try {
    // Prefer query-param patterns first (some backends don't expose GET /admin/cleaners/:id)
    try {
      const response = await client.get(`${ENDPOINTS.CLEANERS}?id=${encodeURIComponent(cleanerId)}`);
      // Could be {data: {...}} or {data: [...]} etc.
      if (response?.data) return response.data;
    } catch (_) {
      // ignore and try next pattern
    }

    try {
      const response = await client.get(
        `${ENDPOINTS.CLEANERS}?cleanerId=${encodeURIComponent(cleanerId)}`
      );
      if (response?.data) return response.data;
    } catch (_) {
      // ignore and try next pattern
    }

    // Try fetching directly by ID
    const response = await client.get(`${ENDPOINTS.CLEANERS}/${cleanerId}`);
    return response.data;
  } catch (error) {
    // If direct fetch fails, fetch all cleaners and find by ID
    try {
      const response = await fetchCleaners({ page: 1, limit: 1000 });
      const cleaners = response?.data || response?.cleaners || response || [];
      const cleaner = Array.isArray(cleaners)
        ? cleaners.find((c) => c.id === cleanerId || c._id === cleanerId)
        : null;
      return cleaner ? { data: cleaner } : null;
    } catch (err) {
      console.error("Failed to fetch cleaner by ID", err);
      throw err;
    }
  }
};

/**
 * KYC review APIs (endpoint patterns vary across backends).
 * These helpers try a few common routes so the frontend works with minimal backend changes.
 */
const tryRequestsInOrder = async (requests) => {
  let lastErr;
  for (const req of requests) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await req();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
};

export const updateCleanerKycDocumentStatus = async (
  cleanerId,
  documentKey,
  status,
  rejectionReason
) => {
  const payload = {
    status,
    ...(rejectionReason ? { rejectionReason } : {}),
  };

  return tryRequestsInOrder([
    // Preferred: single backend endpoint handling approve/reject for specific documentType
    () =>
      approveCleanerKyc(cleanerId, {
        action: status === "approved" ? "approve" : status === "rejected" ? "reject" : status,
        documentType: documentKey,
        ...(rejectionReason ? { rejectionReason } : {}),
      }),
    // --- Prefer PUT-only routes (some servers block PATCH via CORS) ---
    // /admin/cleaners/kyc/:id/documents/:docKey/approved|rejected  (PUT)
    () =>
      client
        .put(`${ENDPOINTS.CLEANERS_KYC}/${cleanerId}/documents/${documentKey}/${status}`, payload)
        .then((r) => r.data),
    // /admin/cleaners/kyc/:id/documents/:docKey
    () =>
      client
        .put(`${ENDPOINTS.CLEANERS_KYC}/${cleanerId}/documents/${documentKey}`, payload)
        .then((r) => r.data),
    // /admin/cleaners/kyc/:id/documents/review  (PUT with body)
    () =>
      client
        .put(`${ENDPOINTS.CLEANERS_KYC}/${cleanerId}/documents/review`, {
          documentKey,
          status,
          ...(rejectionReason ? { rejectionReason } : {}),
        })
        .then((r) => r.data),
    // fallback: update whole record
    () =>
      client
        .put(`${ENDPOINTS.CLEANERS_KYC}/${cleanerId}`, {
          documents: { [documentKey]: payload },
        })
        .then((r) => r.data),
  ]);
};

export const updateCleanerKycVerification = async (cleanerId, isVerified) => {
  return tryRequestsInOrder([
    () =>
      client
        .put(`${ENDPOINTS.CLEANERS_KYC}/${cleanerId}/verify`, { isVerified })
        .then((r) => r.data),
    () =>
      client
        .put(`${ENDPOINTS.CLEANERS_KYC}/${cleanerId}`, { isVerified })
        .then((r) => r.data),
  ]);
};

export const updateCleanerKycOverallStatus = async (cleanerId, approvalStatus) => {
  return tryRequestsInOrder([
    () =>
      client
        .put(`${ENDPOINTS.CLEANERS_KYC}/${cleanerId}/status`, { approvalStatus })
        .then((r) => r.data),
    () =>
      client
        .put(`${ENDPOINTS.CLEANERS_KYC}/${cleanerId}`, { approvalStatus })
        .then((r) => r.data),
  ]);
};

// --- Specific backend routes provided by you ---
export const approveCleanerKyc = async (cleanerId, payload = {}) => {
  // Backend route supports body:
  // { action: "approve" | "reject", documentType: "policeCheck" | "photoId" | "trainingCertificates" | "all", rejectionReason? }
  const response = await client.put(`${ENDPOINTS.CLEANERS_KYC}/${cleanerId}/approve`, payload);
  return response.data;
};

export const verifyCleanerAbn = async (cleanerId, verified) => {
  const url = `${ENDPOINTS.CLEANER_ABN_VERIFY}/${cleanerId}/abn/verify`;
  const value = !!verified;

  // Different backends expect different payload shapes; try a few common ones.
  return tryRequestsInOrder([
    // As initially documented
    () => client.put(url, { verified: value }).then((r) => r.data),
    // Alternate common keys
    () => client.put(url, { isVerified: value }).then((r) => r.data),
    () => client.put(url, { abnVerified: value }).then((r) => r.data),
    // Some controllers accept nested objects
    () => client.put(url, { abn: { verified: value } }).then((r) => r.data),
    // Some backends ignore body and just toggle on the route
    () => client.put(url).then((r) => r.data),
  ]);
};

export const fetchCleanerPayments = async (cleanerId) => {
  if (!cleanerId) throw new Error("cleanerId is required");
  const response = await client.get(`${ENDPOINTS.CLEANER_PAYMENTS}/${encodeURIComponent(cleanerId)}/payments`);
  return response.data;
};
