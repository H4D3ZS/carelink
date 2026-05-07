export type DemoTask = { id: string; title: string; status: "open" | "done" };
export type DemoNote = { id: string; author: string; text: string; audience: "family" | "staff"; createdAt: string };
export type DemoState = {
  consentEnabled: boolean;
  patient: { id: string; name: string; status: string; location: string };
  tasks: DemoTask[];
  notes: DemoNote[];
};

export type User = { id: string; email: string; role: "admin" | "staff" | "family"; patientIds: string[] };
export type Patient = { id: string; name: string; status: string; location: string; consentEnabled: boolean };
export type Task = { id: string; patientId: string; title: string; status: "open" | "done" };
export type Note = { id: string; patientId: string; author: string; audience: "family" | "staff"; text: string; createdAt: string };
export type Encounter = { id: string; patientId: string; type: string; status: string; start: string; end?: string; assignee?: string };

// API Base URL - uses environment variable in production, localhost in development
const BASE = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");

// Ensure no trailing slash
const API_BASE = BASE.replace(/\/$/, '');

const tokenKey = "carelink_token";
export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(tokenKey, token);
}
export function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(tokenKey) || undefined;
}
export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(tokenKey);
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `API error ${res.status}`);
  }
  return res.json();
}

export const authApi = {
  register: (email: string, password: string, role: "family" | "staff" | "admin" = "family") =>
    api<{ token: string; user: User }>("/auth/register", { method: "POST", body: JSON.stringify({ email, password, role }) }),
  login: (email: string, password: string) =>
    api<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => api<User>("/auth/me"),
};

export const patientApi = {
  list: () => api<Patient[]>("/patients"),
  get: (id: string) => api<Patient>("/patients/" + id),
  getConsent: (id: string) => api<{ consentEnabled: boolean }>("/patients/" + id + "/consent"),
  setConsent: (id: string, enabled: boolean) =>
    api<{ consentEnabled: boolean }>("/patients/" + id + "/consent", { method: "POST", body: JSON.stringify({ enabled }) }),
  listTasks: (id: string) => api<Task[]>("/patients/" + id + "/tasks"),
  addTask: (id: string, title: string) =>
    api<Task>("/patients/" + id + "/tasks", { method: "POST", body: JSON.stringify({ title }) }),
  toggleTask: (id: string, taskId: string) =>
    api<Task>("/patients/" + id + "/tasks/" + taskId + "/toggle", { method: "PATCH" }),
  listNotes: (id: string) => api<Note[]>("/patients/" + id + "/notes"),
  addNote: (id: string, text: string, audience: "family" | "staff") =>
    api<Note>("/patients/" + id + "/notes", { method: "POST", body: JSON.stringify({ text, audience }) }),
  listEncounters: (id: string) => api<Encounter[]>("/patients/" + id + "/encounters"),
};

export const demoApi = {
  getState: () => api<DemoState>("/demo/state"),
  setConsent: (enabled: boolean) =>
    api<DemoState>("/demo/consent", { method: "POST", body: JSON.stringify({ enabled }) }),
  addTask: (title: string) =>
    api("/demo/tasks", { method: "POST", body: JSON.stringify({ title }) }),
  toggleTask: (id: string) =>
    api("/demo/tasks/" + id + "/toggle", { method: "PATCH" }),
  addNote: (text: string, audience: "family" | "staff") =>
    api("/demo/notes", { method: "POST", body: JSON.stringify({ text, audience }) }),
};
