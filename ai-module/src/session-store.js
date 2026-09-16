/**
 * session-store.js — Conversation-scoped session store for guest auth tokens.
 *
 * DESIGN NOTE (read this before modifying):
 * ─────────────────────────────────────────
 * After a guest verifies their OTP via the `verify_otp` tool, the backend
 * returns a JWT. We store that JWT here, keyed by conversation ID.
 *
 * All subsequent authenticated tool calls (e.g. `create_individual_booking`)
 * read the token from this store transparently — the LLM never needs to
 * manage or pass tokens explicitly.
 *
 * For now (v1), we use a single fixed session per process run — no multi-user
 * session handling needed yet. The conversationId defaults to 'default'.
 *
 * When the LLM calls an authenticated tool and no token exists, the tool
 * returns an error message telling the LLM to authenticate first (guiding
 * it to call request_otp → verify_otp).
 */

class SessionStore {
  constructor() {
    /** @type {Map<string, { token: string, email: string }>} */
    this._sessions = new Map();
  }

  /**
   * Store a guest session after successful OTP verification.
   * @param {string} conversationId
   * @param {string} token — JWT from the backend
   * @param {string} email — Guest email
   */
  setSession(conversationId, token, email) {
    this._sessions.set(conversationId, { token, email });
  }

  /**
   * Retrieve the auth token for a conversation.
   * @param {string} conversationId
   * @returns {string|null} JWT or null if not authenticated
   */
  getToken(conversationId) {
    return this._sessions.get(conversationId)?.token || null;
  }

  /**
   * Retrieve the guest email for a conversation.
   * @param {string} conversationId
   * @returns {string|null}
   */
  getEmail(conversationId) {
    return this._sessions.get(conversationId)?.email || null;
  }

  /**
   * Check if a conversation has an active session.
   * @param {string} conversationId
   * @returns {boolean}
   */
  hasSession(conversationId) {
    return this._sessions.has(conversationId);
  }

  /**
   * Clear a session (e.g. on logout or token expiry).
   * @param {string} conversationId
   */
  clearSession(conversationId) {
    this._sessions.delete(conversationId);
  }
}

/** Singleton instance — shared across all tools in the same process. */
export const sessionStore = new SessionStore();

/** Default conversation ID for single-session mode. */
export const DEFAULT_CONVERSATION_ID = 'default';
