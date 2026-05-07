const configuredApiBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim();

export const API_BASE_URL = configuredApiBaseUrl
  ? `${configuredApiBaseUrl.replace(/\/$/, "")}/api`
  : "https://scholarship-portal-zrng.onrender.com/api";
