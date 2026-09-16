/**
 * api-client.js — Thin HTTP client for calling the Tvarita backend REST API.
 *
 * Uses built-in Node fetch (Node 18+). No retry logic — that belongs in the
 * backend, not here. Each method returns the parsed JSON response or throws
 * a structured error object on non-2xx responses.
 *
 * Auth tokens are injected per-call via the optional `authToken` parameter,
 * which the MCP tool layer will pull from the conversation session store.
 */

import { config } from './config.js';

/**
 * @typedef {Object} ApiError
 * @property {string} error  — Human-readable error message.
 * @property {number} status — HTTP status code from the backend.
 * @property {*}      [body] — Parsed response body, if available.
 */

/**
 * Make a request to the Tvarita backend API.
 *
 * @param {string} method   — HTTP method (GET, POST, etc.)
 * @param {string} path     — API path (e.g. '/states' — will be appended to BACKEND_API_URL)
 * @param {Object} [options]
 * @param {Object} [options.body]      — Request body (will be JSON-stringified)
 * @param {string} [options.authToken] — Bearer token for authenticated endpoints
 * @returns {Promise<*>} Parsed JSON response body
 * @throws {ApiError} On non-2xx responses
 */
export async function apiRequest(method, path, { body, authToken } = {}) {
  const url = `${config.backendApiUrl}${path}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const fetchOptions = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err) {
    // Network-level error (backend unreachable, DNS failure, etc.)
    throw {
      error: `Backend unreachable: ${err.message}`,
      status: 0,
    };
  }

  // Parse response body (may be empty on 204, etc.)
  let responseBody;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }
  } else {
    responseBody = await response.text();
  }

  if (!response.ok) {
    throw {
      error:
        (responseBody && typeof responseBody === 'object' && responseBody.message) ||
        (responseBody && typeof responseBody === 'object' && responseBody.error) ||
        `Backend returned HTTP ${response.status}`,
      status: response.status,
      body: responseBody,
    };
  }

  return responseBody;
}

/** Convenience: GET request (no body, optional auth). */
export function apiGet(path, options = {}) {
  return apiRequest('GET', path, options);
}

/** Convenience: POST request (with body, optional auth). */
export function apiPost(path, body, options = {}) {
  return apiRequest('POST', path, { ...options, body });
}
