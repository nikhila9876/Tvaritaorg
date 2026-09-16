/**
 * mcp-result.js — Helpers for MCP tool success / error payloads.
 *
 * Errors are returned as MCP results (isError: true) rather than thrown, so the
 * agent loop can feed them back to the LLM instead of crashing.
 */

export function mcpOk(payload) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}

/**
 * @param {string} error — Human-readable message the LLM can act on
 * @param {Object} [extra] — status, code, details, requires_auth, etc.
 */
export function mcpError(error, extra = {}) {
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ error, ...extra }, null, 2),
    }],
    isError: true,
  };
}

/**
 * Normalize a thrown api-client error (or generic Error) into an MCP error result.
 * Passes through backend status / details so the LLM sees the real failure shape.
 */
export function mcpFromCaught(err) {
  const error = err?.error || err?.message || 'Unknown error';
  const extra = {};
  if (err?.status != null) extra.status = err.status;
  if (err?.code) extra.code = err.code;
  if (err?.details) extra.details = err.details;
  if (err?.body && typeof err.body === 'object' && err.body.details && !extra.details) {
    extra.details = err.body.details;
  }
  if (!extra.code && extra.status === 409) extra.code = 'SLOT_UNAVAILABLE';
  if (!extra.code && extra.status === 429) extra.code = 'RATE_LIMITED';
  if (!extra.code && extra.status >= 500) extra.code = 'BACKEND_ERROR';
  if (!extra.code && extra.status === 0) extra.code = 'BACKEND_UNREACHABLE';
  return mcpError(error, extra);
}

/**
 * Summarize an MCP result for logging (no response bodies).
 */
export function summarizeMcpResult(result) {
  if (!result) {
    return { ok: false, error: 'Tool not found' };
  }
  let parsed = null;
  try {
    parsed = JSON.parse(result.content?.[0]?.text || '');
  } catch {
    parsed = null;
  }
  if (result.isError) {
    return {
      ok: false,
      status: parsed?.status,
      code: parsed?.code,
      error: parsed?.error || 'Tool returned an error',
    };
  }
  return { ok: true };
}
