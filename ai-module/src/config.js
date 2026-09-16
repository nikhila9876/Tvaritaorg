/**
 * config.js — Environment configuration loader for the Tvarita AI module.
 *
 * Reads all config from .env via dotenv. Never hardcodes URLs or secrets.
 * Validates that required vars are present at startup.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from ai-module root
dotenv.config({ path: resolve(__dirname, '..', '.env') });

export const config = {
  /** Base URL for the Tvarita backend REST API (Person A's backend). */
  backendApiUrl: process.env.BACKEND_API_URL || 'http://localhost:5000/api',

  /** API key for the LLM provider (e.g. OpenAI). */
  llmApiKey: process.env.LLM_API_KEY || '',

  /** LLM model identifier (e.g. gpt-4o). */
  llmModel: process.env.LLM_MODEL || 'gpt-4o',

  /** Port for the MCP server (reserved for future HTTP transport). */
  mcpServerPort: parseInt(process.env.MCP_SERVER_PORT || '3001', 10),
};

/**
 * Validate that critical config values are present.
 * Call this at startup — fails fast rather than silently using empty strings.
 */
export function validateConfig({ requireLlmKey = false } = {}) {
  const missing = [];

  if (!config.backendApiUrl) {
    missing.push('BACKEND_API_URL');
  }

  if (requireLlmKey && !config.llmApiKey) {
    missing.push('LLM_API_KEY');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Copy .env.example to .env and fill in the values.`
    );
  }
}
