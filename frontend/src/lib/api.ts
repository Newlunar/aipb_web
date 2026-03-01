const BASE_URL = import.meta.env.VITE_API_URL || ''

function buildUrl(path: string, params?: Record<string, string | number | undefined | null>): string {
  const url = new URL(path, BASE_URL || window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const target = url.startsWith('http') ? url : `${BASE_URL}${url}`
  const res = await fetch(target, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>
  }
  return res.text() as Promise<T>
}

export const api = {
  get<T>(path: string, params?: Record<string, string | number | undefined | null>): Promise<T> {
    return request<T>(buildUrl(path, params))
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(`${BASE_URL}${path}`, {
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    })
  },
}
