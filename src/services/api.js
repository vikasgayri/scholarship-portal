import { API_BASE_URL } from "../lib/config";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function shouldRetry(response) {
  return response.status >= 500;
}

async function fetchWithRetry(requestUrl, fetchOptions) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(requestUrl, fetchOptions);

      if (!shouldRetry(response) || attempt === MAX_RETRIES) {
        return response;
      }
    } catch (error) {
      lastError = error;

      if (attempt === MAX_RETRIES) {
        throw lastError;
      }
    }

    await delay(RETRY_DELAY_MS);
  }

  throw lastError;
}

async function request(path, options = {}) {
  const requestUrl = `${API_BASE_URL}${path}`;
  let response;

  try {
    response = await fetchWithRetry(requestUrl, {
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers,
      },
      method: options.method || "GET",
      body: options.body,
    });
  } catch (error) {
      console.error("API connection error:", error);

      throw new Error(
        "Server is starting up... please wait a few seconds and try again."
      );
  }

  if (options.parseAs === "blob") {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Request failed.");
    }

    return response.blob();
  }

  const contentType = response.headers.get("content-type");
  const payload = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(
      payload?.errors?.join(" ")
        || payload?.details?.join(" ")
        || payload?.message
        || payload?.error
        || "Request failed.",
    );
  }

  if (payload && typeof payload.success === "boolean") {
    if (!payload.success) {
      throw new Error(payload.errors?.join(" ") || payload.message || "Request failed.");
    }

    return payload.data;
  }

  return payload;
}

export const api = {
  login(payload) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  verifyEmail(payload) {
    return request("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  resendEmailOtp(payload) {
    return request("/auth/resend-email-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me(token) {
    return request("/auth/me", { token });
  },
  scholarships(query = "") {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("query", query.trim());
    }

    const suffix = params.toString() ? `?${params.toString()}` : "";
    return request(`/scholarships${suffix}`);
  },
  publicScholarships(query = "") {
    return api.scholarships(query);
  },
  studentDashboard(token) {
    return request("/student/dashboard", { token });
  },
  studentApplications(token) {
    return request("/student/applications", { token });
  },
  createApplication(token, payload) {
    const formData = new FormData();
    const { documents = {}, ...application } = payload;
    formData.append(
      "application",
      new Blob([JSON.stringify(application)], { type: "application/json" }),
    );
    formData.append("idProof", documents.idProof);
    formData.append("incomeCertificate", documents.incomeCertificate);
    formData.append("marksheet", documents.marksheet);

    return request("/applications", {
      method: "POST",
      token,
      body: formData,
    });
  },
  userApplications(token, userId) {
    return request(`/applications/user/${userId}`, { token });
  },
  studentDocuments(token) {
    return request("/student/documents", { token });
  },
  uploadDocument(token, payload) {
    const formData = new FormData();
    formData.append("category", payload.category);
    formData.append("file", payload.file);

    return request("/student/documents", {
      method: "POST",
      token,
      body: formData,
    });
  },
  viewStudentDocument(token, documentId) {
    return request(`/student/documents/${documentId}/view`, {
      token,
      parseAs: "blob",
    });
  },
  downloadStudentDocument(token, documentId) {
    return request(`/student/documents/${documentId}/download`, {
      token,
      parseAs: "blob",
    });
  },
  deleteStudentDocument(token, documentId) {
    return request(`/student/documents/${documentId}`, {
      method: "DELETE",
      token,
    });
  },
  studentProfile(token) {
    return request("/student/profile", { token });
  },
  updateStudentProfile(token, payload) {
    return request("/student/profile", {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  },
  deleteAccount(token) {
    return request("/student/account", {
      method: "DELETE",
      token,
    });
  },
  studentActivities(token) {
    return request("/student/activities", { token });
  },
  adminOverview(token) {
    return request("/admin/overview", { token });
  },
  adminUsers(token) {
    return request("/admin/users", { token });
  },
  deleteAdminUser(token, userId) {
    return request(`/admin/users/${userId}`, {
      method: "DELETE",
      token,
    });
  },
  adminApplications(token) {
    return request("/admin/applications", { token });
  },
  updateApplicationStatus(token, applicationId, payload) {
    return request(`/admin/application/${applicationId}/status`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  },
  fileUrl(storedFileName) {
    return `${API_BASE_URL}/files/${encodeURIComponent(storedFileName)}`;
  },
  viewFile(token, storedFileName) {
    return request(`/files/${encodeURIComponent(storedFileName)}`, {
      token,
      parseAs: "blob",
    });
  },
  downloadFile(token, storedFileName) {
    return request(`/files/${encodeURIComponent(storedFileName)}?mode=download`, {
      token,
      parseAs: "blob",
    });
  },
  adminDocuments(token) {
    return request("/admin/documents", { token });
  },
  viewAdminDocument(token, documentId) {
    return request(`/admin/documents/${documentId}/view`, {
      token,
      parseAs: "blob",
    });
  },
  downloadAdminDocument(token, documentId) {
    return request(`/admin/documents/${documentId}/download`, {
      token,
      parseAs: "blob",
    });
  },
  updateDocumentStatus(token, documentId, status) {
    return request(`/admin/documents/${documentId}/status?status=${status}`, {
      method: "PATCH",
      token,
    });
  },
  deleteAdminDocument(token, documentId) {
    return request(`/admin/documents/${documentId}`, {
      method: "DELETE",
      token,
    });
  },
  adminScholarships(token) {
    return request("/admin/scholarships", { token });
  },
  createScholarship(token, payload) {
    return request("/admin/scholarships", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  updateScholarship(token, scholarshipId, payload) {
    return request(`/admin/scholarships/${scholarshipId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  },
};
