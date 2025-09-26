// API utility to handle backend URL configuration
export const getBackendUrl = (): string => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;

  // If we have an environment variable, use it
  if (envUrl) {
    // Ensure HTTPS in production (Amplify)
    if (window.location.protocol === "https:" && envUrl.startsWith("http:")) {
      return envUrl.replace("https:", "https:");
    }
    return envUrl;
  }

  // Fallback URL - use HTTPS in production
  const fallbackUrl =
    window.location.protocol === "https:"
      ? "https://52.66.225.78:8000"
      : "https://kubera-backend.thetailoredai.co";

  return fallbackUrl;
};

// Common headers for authenticated requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// API fetch wrapper with proper error handling
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const baseUrl = getBackendUrl();
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
  });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
      throw new Error("Authentication failed");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};

export const fetchCompaniesFundsAPI = async (projectId) => {
  const baseUrl = getBackendUrl();
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `${baseUrl}/metadata/projects/${projectId}/mapping/funds/companies`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch companies/funds:", error);
    return null;
  }
};

export const fetchCompaniesFundsDetailedAPI = async (projectId, company, fund_name) => {
  const baseUrl = getBackendUrl();
  const token = localStorage.getItem("token");
  const body = JSON.stringify({
    company_name: company,
    fund_name: fund_name,
  });
  try {
    const response = await fetch(
      `${baseUrl}/metadata/projects/${projectId}/sources/excel/specifications`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch companies/funds:", error);
    return null;
  }
};