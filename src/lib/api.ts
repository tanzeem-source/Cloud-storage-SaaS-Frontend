export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {  // no more API_URL prefix — path is already relative, e.g. '/api/auth/login'
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}