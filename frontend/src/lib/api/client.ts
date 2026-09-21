// ─── Centralized API Client ───────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export { BASE_URL };

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  // Don't set Content-Type for FormData — browser sets it with boundary
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = isFormData
    ? {}
    : { 'Content-Type': 'application/json' };

  const res = await fetch(url, {
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
    ...options,
  });

  if (!res.ok) {
    let errorMessage = `API error ${res.status}`;
    try {
      const body = await res.json();
      errorMessage = body?.detail ?? errorMessage;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}
