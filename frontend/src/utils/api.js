/**
 * Frontend API Adapter for The Last Remembering.
 * All views call these helper methods rather than calling fetch directly.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let errorDetail = "Request failed";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function checkHealth() {
  return request("/api/health");
}

export async function getPeople() {
  return request("/api/people");
}

export async function getPerson(id) {
  return request(`/api/people/${id}`);
}

export async function createPerson(data) {
  return request("/api/people", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function uploadPhoto(personId, file) {
  const formData = new FormData();
  formData.append("file", file);
  return request(`/api/people/${personId}/photo`, {
    method: "POST",
    body: formData,
  });
}

export async function getKeepsake(personId) {
  return request(`/api/people/${personId}/keepsake`);
}

// Phase 2 placeholders
export async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  return request("/api/transcribe", {
    method: "POST",
    body: formData,
  });
}

export async function extractFacts(text, personId = null) {
  return request("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, person_id: personId }),
  });
}

export async function saveMemory(memoryData) {
  return request("/api/memories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(memoryData),
  });
}

export async function askQuestion(question, personId = null) {
  return request("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, person_id: personId }),
  });
}

