/**
 * mcp-server.js — The MCP Server for the Tvarita AI Module.
 *
 * Exposes our backend REST wrappers (discovery, auth, booking) as MCP tools
 * over a standard STDIO transport. This allows any MCP-compatible client
 * (like our agent.js, or Claude Desktop) to connect and use these tools.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { validateConfig } from './config.js';
import { discoveryTools, handleDiscoveryToolCall } from './tools/discovery.js';
import { authTools, handleAuthToolCall } from './tools/auth.js';
import { bookingTools, handleBookingToolCall } from './tools/booking.js';
import { paymentTools, handlePaymentToolCall } from './tools/payments.js';
import { feedbackTools, handleFeedbackToolCall } from './tools/feedback.js';
import { logToolCall, logToolResult } from './logger.js';
import { summarizeMcpResult } from './mcp-result.js';

// Validate env vars before starting
validateConfig();

// Combine all tools
const ALL_TOOLS = [...discoveryTools, ...authTools, ...bookingTools, ...paymentTools, ...feedbackTools];

// Initialize the MCP Server
const server = new Server(
  {
    name: 'tvarita-ai-module',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: ALL_TOOLS,
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  logToolCall(name, args);

  let result = null;

  try {
    if (discoveryTools.some((t) => t.name === name)) {
      result = await handleDiscoveryToolCall(name, args);
    } else if (authTools.some((t) => t.name === name)) {
      result = await handleAuthToolCall(name, args);
    } else if (bookingTools.some((t) => t.name === name)) {
      result = await handleBookingToolCall(name, args);
    } else if (paymentTools.some((t) => t.name === name)) {
      result = await handlePaymentToolCall(name, args);
    } else if (feedbackTools.some((t) => t.name === name)) {
      result = await handleFeedbackToolCall(name, args);
    }
  } catch (err) {
    logToolResult(name, {
      ok: false,
      error: err?.message || 'Unhandled tool exception',
    });
    throw err;
  }

  if (result) {
    logToolResult(name, summarizeMcpResult(result));
    return result;
  }

  logToolResult(name, { ok: false, error: `Tool not found: ${name}` });
  throw new Error(`Tool not found: ${name}`);
});

// Start the server with STDIO transport
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Tvarita MCP Server running on STDIO');
}

runServer().catch((error) => {
  console.error('Fatal error running MCP server:', error);
  process.exit(1);
});
