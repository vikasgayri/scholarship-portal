const configuredApiBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim();

export const API_BASE_URL =
  configuredApiBaseUrl || (process.env.NODE_ENV === "development" ? "/api" : "http://localhost:8080/api");
