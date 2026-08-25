// REST API client. Uses the nonce localized by the WordPress admin bootstrap.
//
// optipressSettings is injected via wp_localize_script into the global scope.

const REQUEST_TIMEOUT = 45000;

export class ApiError extends Error {
  constructor(message, kind = 'http', status = 0) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind; // 'nonce' | 'timeout' | 'parse' | 'http'
    this.status = status;
  }
}

const getConfig = () => {
  if (typeof window === 'undefined' || !window.optipressSettings) {
    return { apiUrl: '/wp-json/optipress/v1', nonce: '', isRtl: true };
  }
  return window.optipressSettings;
};

async function request(path, { method = 'GET', body } = {}) {
  const { apiUrl, nonce } = getConfig();
  const headers = {
    'X-WP-Nonce': nonce,
    Accept: 'application/json',
  };
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${apiUrl}${path}`, {
      method,
      headers,
      credentials: 'same-origin',
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout
        ? AbortSignal.timeout(REQUEST_TIMEOUT)
        : undefined,
    });
  } catch (e) {
    if (e && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
      throw new ApiError('پاسخی از سرور دریافت نشد؛ دوباره تلاش کنید.', 'timeout');
    }
    throw new ApiError('ارتباط با سرور برقرار نشد.', 'network');
  }

  if (!res.ok) {
    let payload = null;
    try {
      payload = await res.json();
    } catch (e) {
      /* non-JSON error body */
    }
    if (
      res.status === 403 &&
      (!payload || payload.code === 'rest_cookie_invalid_nonce' || /nonce/i.test(String(payload?.message || '')))
    ) {
      throw new ApiError('نشست شما منقضی شده است؛ لطفاً صفحه را دوباره بارگذاری کنید.', 'nonce', 403);
    }
    throw new ApiError(payload?.message || 'خطایی رخ داده است.', 'http', res.status);
  }

  // Guard against a 200 response that isn't JSON (PHP fatal, cache layer).
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new ApiError('پاسخ نامعتبری از سرور دریافت شد.', 'parse');
  }
  return data;
}

export const api = {
  getCompatibility: () => request('/compatibility'),
  getStats: () => request('/stats'),
  getSettings: () => request('/settings'),
  updateSettings: (settings) => request('/settings', { method: 'POST', body: settings }),

  // Scanner
  scan: (payload) => request('/scan', { method: 'POST', body: payload }),

  // Queue
  getQueue: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    ).toString();
    return request(`/queue${qs ? `?${qs}` : ''}`);
  },
  queueStart: (batchSize = 0) =>
    request('/queue/start', {
      method: 'POST',
      body: batchSize > 0 ? { batch_size: batchSize } : undefined,
    }),
  queuePause: () => request('/queue/pause', { method: 'POST' }),
  queueResume: () => request('/queue/resume', { method: 'POST' }),
  queueStop: () => request('/queue/stop', { method: 'POST' }),
  queueRetry: () => request('/queue/retry', { method: 'POST' }),
  queueProcess: (batchSize = 0) =>
    request('/queue/process', {
      method: 'POST',
      body: batchSize > 0 ? { batch_size: batchSize } : undefined,
    }),

  // Backup
  backupRestore: (attachmentId) =>
    request('/backup/restore', { method: 'POST', body: { attachment_id: attachmentId } }),

  // Statistics & reports
  getStatistics: () => request('/statistics'),
  getReports: () => request('/reports'),

  // Logs
  getLogs: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    ).toString();
    return request(`/logs${qs ? `?${qs}` : ''}`);
  },
  clearLogs: () => request('/logs/clear', { method: 'POST' }),
};
