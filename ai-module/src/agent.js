/**
 * agent.js — Chatbot REPL
 *
 * Connects to the local MCP Server (mcp-server.js) over STDIO, fetches tools,
 * and enters an interactive chat loop powered by OpenRouter.
 * Handles tool calls requested by the LLM and reports results back.
 */

import readline from 'readline';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { config, validateConfig } from './config.js';
import { logToolCall, logToolResult, logOpenRouterError, logInfo, redact } from './logger.js';

validateConfig({ requireLlmKey: true });

const MODEL_NAME = config.llmModel;
const MAX_TOOL_ROUNDS = 8;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\n👤 You: ',
});

const messages = [
  {
    role: 'system',
    content: `You are the Tvarita Arts Platform Assistant. You help guests discover traditional Indian artists, view events, and make bookings.
You have access to a set of backend tools.
Rules:
1. When a user wants to book, ALWAYS call get_artist_timeslots first so you can present the available dates/times and confirm their choice BEFORE calling create_individual_booking.
2. The slot_id encodes the date and time, so don't ask the user for a separate date if they provide a slot choice.
3. If booking fails with requires_auth / NOT_AUTHENTICATED / "Guest is not authenticated", you MUST call request_otp to send a code to their email, then ask for the code and call verify_otp. After verifying, retry the booking or confirm with the user.
4. If verify_otp fails (wrong/expired code, OTP_INVALID), tell the guest clearly. They CAN retry in this same conversation: ask them to re-enter the code, or call request_otp again for a new code, then verify_otp. Do not start over.
5. If a tool returns an error JSON (4xx/5xx, VALIDATION_ERROR, SLOT_UNAVAILABLE, BACKEND_UNREACHABLE), explain it in plain language. Never dump raw stack traces. Never silently ignore it.
6. Never call create_individual_booking with headcount of 0, a negative number, or missing artist_id/slot_id. Headcount must be 1–50 (default 1 if the guest does not specify).
7. If a timeslot is taken (409 / SLOT_UNAVAILABLE), call get_artist_timeslots again and ask the guest to pick another slot.
8. state_id for get_events_by_state is the \`id\` from get_states, NOT the state name.
9. Keep your responses concise and conversational. Format event details clearly.`,
  },
];

let mcpClient;
let availableTools = [];

function tellUser(text) {
  console.log(`\n🤖 Tvarita AI: ${text}`);
}

async function initMCP() {
  console.log('🔌 Starting MCP Server...');
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['src/mcp-server.js'],
  });

  mcpClient = new Client(
    { name: 'tvarita-chatbot-agent', version: '1.0.0' },
    { capabilities: {} }
  );

  await mcpClient.connect(transport);
  console.log('✅ Connected to MCP Server');

  const { tools } = await mcpClient.listTools();

  availableTools = tools.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    },
  }));

  console.log(`🛠️  Loaded ${availableTools.length} tools`);
}

function openRouterHeaders() {
  return {
    'Authorization': `Bearer ${config.llmApiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'Tvarita AI Agent',
  };
}

/**
 * @returns {Promise<{ message: object | null, userMessage: string | null }>}
 */
async function callOpenRouter() {
  const timeoutMs = config.openRouterTimeoutMs || 60000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: openRouterHeaders(),
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        tools: availableTools,
        tool_choice: 'auto',
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.text();
      const retryAfter = response.headers.get('retry-after') || undefined;
      const rateLimited = response.status === 429;
      logOpenRouterError({
        status: response.status,
        rateLimited,
        retryAfter,
        body: err,
      });

      if (rateLimited) {
        const waitHint = retryAfter ? ` Try again in ${retryAfter} seconds.` : ' Please wait a moment and try again.';
        return {
          message: null,
          userMessage: `The AI provider is rate-limiting us right now.${waitHint}`,
        };
      }
      return {
        message: null,
        userMessage: `The AI provider returned an error (HTTP ${response.status}). Please try again.`,
      };
    }

    const data = await response.json();
    return { message: data.choices[0]?.message ?? null, userMessage: null };
  } catch (error) {
    const timeout = error?.name === 'AbortError';
    logOpenRouterError({
      timeout,
      body: error.message,
    });
    if (timeout) {
      return {
        message: null,
        userMessage: 'The AI provider timed out. Please try again in a moment.',
      };
    }
    return {
      message: null,
      userMessage: 'I could not reach the AI provider. Check your network and try again.',
    };
  } finally {
    clearTimeout(timer);
  }
}

async function handleTurn(toolRound = 0) {
  const { message, userMessage } = await callOpenRouter();
  if (!message) {
    tellUser(userMessage || 'Something went wrong talking to the AI. Please try again.');
    rl.prompt();
    return;
  }

  messages.push(message);

  if (message.content) {
    console.log(`\n🤖 Tvarita AI: ${message.content}`);
  }

  if (message.tool_calls && message.tool_calls.length > 0) {
    if (toolRound >= MAX_TOOL_ROUNDS) {
      logInfo('tool_loop_guard', { rounds: toolRound, max: MAX_TOOL_ROUNDS });
      tellUser('I hit a loop calling tools. Please rephrase or try the next step.');
      rl.prompt();
      return;
    }

    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== 'function') continue;

      const fnName = toolCall.function.name;
      let args = {};
      try {
        args = JSON.parse(toolCall.function.arguments || '{}');
      } catch (e) {
        console.error(`\n⚠️ Failed to parse arguments for ${fnName}`);
      }

      logToolCall(fnName, args);
      console.log(`\n⚙️  Executing tool: ${fnName}(${JSON.stringify(redact(args))})`);

      try {
        const result = await mcpClient.callTool({
          name: fnName,
          arguments: args,
        });

        const textResult = result.content.find((c) => c.type === 'text')?.text || 'Success';
        let parsed = null;
        try {
          parsed = JSON.parse(textResult);
        } catch {
          parsed = null;
        }

        logToolResult(fnName, {
          ok: result.isError !== true,
          status: parsed?.status,
          code: parsed?.code,
          error: parsed?.error,
        });

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: fnName,
          content: textResult,
        });
      } catch (error) {
        logToolResult(fnName, { ok: false, error: error.message });
        console.log(`\n❌ Tool execution error: ${error.message}`);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: fnName,
          content: JSON.stringify({
            error: error.message || 'Tool execution failed',
            code: 'TOOL_EXECUTION_ERROR',
          }),
        });
      }
    }

    await handleTurn(toolRound + 1);
  } else {
    rl.prompt();
  }
}

async function start() {
  await initMCP();
  console.log(`\n💬 Chatbot ready! (Model: ${MODEL_NAME})`);
  console.log(`Type your message and press enter. Type 'exit' to quit.`);
  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (input.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      process.exit(0);
    }
    if (!input) {
      rl.prompt();
      return;
    }

    messages.push({ role: 'user', content: input });
    await handleTurn();
  });
}

start().catch(console.error);
