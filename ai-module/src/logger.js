/**
 * logger.js — stderr logging with redaction for the AI module.
 *
 * MCP uses STDOUT for the protocol, so all logs go to stderr (console.error).
 * Never print tokens, emails, OTPs, or Authorization headers.
 */

const REDACT_KEY = /email|token|otp|authorization|password|secret|jwt|api[_-]?key/i;

/**
 * Deep-clone a value with sensitive fields replaced by '[REDACTED]'.
 * @param {*} value
 * @returns {*}
 */
export function redact(value) {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value !== 'object') return value;

  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (REDACT_KEY.test(key)) {
      out[key] = '[REDACTED]';
    } else {
      out[key] = redact(val);
    }
  }
  return out;
}

function ts() {
  return new Date().toISOString();
}

function write(level, event, payload = {}) {
  const line = {
    ts: ts(),
    level,
    event,
    ...redact(payload),
  };
  console.error(`[ai-module] ${JSON.stringify(line)}`);
}

/** Log an MCP tool invocation (args redacted). */
export function logToolCall(name, args) {
  write('info', 'tool_call', { tool: name, args: args || {} });
}

/**
 * Log a tool outcome. Pass only a short summary — never the raw backend body.
 * @param {string} name
 * @param {{ ok: boolean, status?: number, error?: string, code?: string }} outcome
 */
export function logToolResult(name, outcome) {
  write(outcome.ok ? 'info' : 'error', 'tool_result', {
    tool: name,
    ok: outcome.ok,
    status: outcome.status,
    code: outcome.code,
    error: outcome.error,
  });
}

/**
 * Log an OpenRouter / LLM provider failure.
 * @param {{ status?: number, timeout?: boolean, rateLimited?: boolean, retryAfter?: string, body?: string }} info
 */
export function logOpenRouterError(info = {}) {
  const body = typeof info.body === 'string' ? info.body.slice(0, 500) : info.body;
  write('error', 'openrouter_error', {
    status: info.status,
    timeout: Boolean(info.timeout),
    rateLimited: Boolean(info.rateLimited) || info.status === 429,
    retryAfter: info.retryAfter,
    body,
  });
}

export function logInfo(event, payload) {
  write('info', event, payload);
}

export function logError(event, payload) {
  write('error', event, payload);
}
