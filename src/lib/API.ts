import axios, { AxiosHeaders } from "axios";

/* ------------------------------ Base URLs ------------------------------ */
const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const SIMULATION_BASE_URL =
  import.meta.env.VITE_SIM_API_URL || BACKEND_BASE_URL;

/* ------------------------------ Debug Bus ------------------------------ */
const DEBUG_MAX = 300;
const DebugBus = {
  events: [] as Array<Record<string, unknown>>,
  push(evt: Record<string, unknown>) {
    this.events.push({ ts: Date.now(), ...evt });
    if (this.events.length > DEBUG_MAX) this.events.shift();
    window.__apiDebug = this.events;
    document.dispatchEvent(new CustomEvent("api-debug", { detail: evt }));
  },
};

declare global {
  interface Window {
    __apiDebug?: Array<Record<string, unknown>>;
  }
}

/* ------------------------------ Instance Helper ------------------------------ */
const attachInterceptors = (instance: ReturnType<typeof axios.create>, label = "api") => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        config.headers.Authorization = `Bearer ${token}`;
      }

      const reqInfo = {
        kind: "request",
        label,
        method: (config.method || "GET").toUpperCase(),
        url: (config.baseURL || "") + (config.url || ""),
        params: config.params || null,
        data: config.data || null,
      };

      console.groupCollapsed(
        `%c[${label}] -> ${reqInfo.method} ${reqInfo.url}`,
        "color:#888"
      );
      if (reqInfo.params) console.log("params:", reqInfo.params);
      if (reqInfo.data) console.log("data:", reqInfo.data);
      console.groupEnd();

      DebugBus.push(reqInfo);

      config.headers["X-Client-Req-Id"] = `${label}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      return config;
    },
    (error) => {
      DebugBus.push({
        kind: "request_error",
        label,
        error: error?.message || String(error),
      });
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      const resInfo = {
        kind: "response",
        label,
        status: response.status,
        url: response.config?.baseURL + response.config?.url,
        data: response.data,
        headers: response.headers,
      };

      console.groupCollapsed(
        `%c[${label}] <- ${resInfo.status} ${resInfo.url}`,
        resInfo.status >= 400 ? "color:#e00" : "color:#0a0"
      );
      console.log("headers:", response.headers);
      console.log("data:", response.data);
      console.groupEnd();

      DebugBus.push(resInfo);
      return response;
    },
    (error) => {
      const res = error.response;
      const errInfo = {
        kind: "response_error",
        label,
        status: res?.status || 0,
        url: res?.config ? res.config.baseURL + res.config.url : undefined,
        data: res?.data,
        message: error.message,
      };

      console.groupCollapsed(
        `%c[${label}] <- ERROR ${errInfo.status} ${errInfo.url || ""}`,
        "color:#e00"
      );
      console.log("message:", error.message);
      if (res?.headers) console.log("headers:", res.headers);
      if (res?.data) console.log("data:", res.data);
      console.groupEnd();

      DebugBus.push(errInfo);
      return Promise.reject(error);
    }
  );
};

/* ------------------------------ Axios Instances ------------------------------ */
const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  withCredentials: true,
});

const simApi = axios.create({
  baseURL: SIMULATION_BASE_URL,
  withCredentials: SIMULATION_BASE_URL === BACKEND_BASE_URL,
});

attachInterceptors(api);
attachInterceptors(simApi);

/* ===============================
   AUTH ROUTES
=============================== */
export const registerUser = async (payload: unknown) =>
  (await api.post("/auth/register", payload)).data;
export const loginUser = async (payload: unknown) =>
  (await api.post("/auth/login", payload)).data;
export const verifyToken = async () => (await api.get("/auth/verify")).data;
export const logoutUser = async () => (await api.post("/auth/logout")).data;
export const getAuthMe = async () => (await api.get("/auth/me")).data;
export const changePassword = async (payload: { current_password: string; new_password: string }) =>
  (await api.post("/auth/change-password", payload)).data;
export const forgotPassword = async (payload: { email: string }) =>
  (await api.post("/auth/forgot-password", payload)).data;
export const resetPassword = async (payload: { token: string; new_password: string }) =>
  (await api.post("/auth/reset-password", payload)).data;

/* ===============================
   ADMIN USER CREATION
=============================== */
export const createAdminUser = async (payload: { name: string; email: string }) =>
  (await api.post("/admin/users/admin", payload)).data;
export const createOrgUser = async (payload: {
  org_name: string;
  org_type: string;
  data_domain: string;
  country: string;
  official_email: string;
  address_detail: string;
  contact_name: string;
  contact_email: string;
}) => (await api.post("/admin/users/org", payload)).data;

/* ===============================
   ORGS
=============================== */
export const listOrgs = async () => (await api.get("/orgs")).data;

/* ===============================
   ORG APPLICATIONS
=============================== */
export const submitOrgApplication = async (payload: unknown) =>
  (await api.post("/org-applications", payload)).data;

export const listOrgApplications = async (status?: string) =>
  (await api.get("/org-applications", { params: status ? { status } : undefined })).data;

export const reviewOrgApplication = async (applicationId: number, payload: unknown) =>
  (await api.patch(`/org-applications/${applicationId}`, payload)).data;

export const uploadOrgApplicationFile = async (applicationId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return (await api.post(`/files/applications/${applicationId}`, formData)).data;
};

export const listOrgApplicationFiles = async (applicationId: number) =>
  (await api.get(`/files/applications/${applicationId}`)).data;

/* ===============================
   ORG PROFILE
=============================== */
export const getMyOrg = async () => (await api.get("/orgs/me")).data;

export { api, simApi };
