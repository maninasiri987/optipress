// REST API client. Uses the nonce localized by the WordPress admin bootstrap.
//
// optipressSettings is injected via wp_localize_script into the global scope.

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

  const res = await fetch(`${apiUrl}${path}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  if (!res.ok) {
    let message = 'خطایی رخ داده است.';
    try {
      const err = await res.json();
      message = err.message || message;
    } catch (e) {
      /* ignore parse errors */
    }
    throw new Error(message);
  }

  return res.json();
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
  queueStart: () => request('/queue/start', { method: 'POST' }),
  queuePause: () => request('/queue/pause', { method: 'POST' }),
  queueResume: () => request('/queue/resume', { method: 'POST' }),
  queueStop: () => request('/queue/stop', { method: 'POST' }),
  queueRetry: () => request('/queue/retry', { method: 'POST' }),
  queueProcess: () => request('/queue/process', { method: 'POST' }),

  // Backup
  backupRestore: (attachmentId) =>
    request('/backup/restore', { method: 'POST', body: { attachment_id: attachmentId } }),

  // Statistics & reports
  getStatistics: () => request('/statistics'),
  getReports: () => request('/reports'),
};
