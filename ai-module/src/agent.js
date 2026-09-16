/**
 * agent.js — Chatbot REPL
 *
 * Connects to the local MCP Server (mcp-server.js) over STDIO, fetches tools,
 * and enters an interactive chat loop powered by OpenRouter (Gemma 4).
 * Handles tool calls requested by the LLM and reports results back.
 */

import readline from 'readline';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { config, validateConfig } from './config.js';

validateConfig({ requireLlmKey: true });

const MODEL_NAME = config.llmModel || 'google/gemma-4-31b-it';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\n👤 You: ',
});

// The conversation history
const messages = [
  {
    role: 'system',
    content: `You are the Tvarita Arts Platform Assistant. You help guests discover traditional Indian artists, view events, and make bookings.
You have access to a set of backend tools.
Rules:
1. When a user wants to book, ALWAYS call get_artist_timeslots first so you can present the available dates/times and confirm their choice BEFORE calling create_individual_booking.
2. The slot_id encodes the date and time, so don't ask the user for a separate date if they provide a slot choice.
3. If booking fails with "Guest is not authenticated", you MUST call request_otp to send a code to their email, then ask for the code and call verify_otp. After verifying, you can automatically retry the booking or confirm with the user.
4. Keep your responses concise and conversational. Format event details clearly.`
  }
];

let mcpClient;
let availableTools = [];

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
  
  // Convert MCP tools to OpenAI function format for OpenRouter
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

async function callOpenRouter() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.llmApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Tvarita AI Agent',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        tools: availableTools,
        tool_choice: 'auto',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`\n❌ OpenRouter API Error: ${err}`);
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message;
  } catch (error) {
    console.error(`\n❌ LLM Network Error:`, error.message);
    return null;
  }
}

async function handleTurn() {
  const message = await callOpenRouter();
  if (!message) {
    rl.prompt();
    return;
  }

  messages.push(message);

  if (message.content) {
    console.log(`\n🤖 Tvarita AI: ${message.content}`);
  }

  // Handle tool calls
  if (message.tool_calls && message.tool_calls.length > 0) {
    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== 'function') continue;
      
      const fnName = toolCall.function.name;
      let args = {};
      try {
        args = JSON.parse(toolCall.function.arguments || '{}');
      } catch (e) {
        console.error(`\n⚠️ Failed to parse arguments for ${fnName}`);
      }

      console.log(`\n⚙️  Executing tool: ${fnName}(${JSON.stringify(args)})`);
      
      try {
        // Call the MCP Server
        const result = await mcpClient.callTool({
          name: fnName,
          arguments: args,
        });

        // The MCP SDK returns content array
        const textResult = result.content.find(c => c.type === 'text')?.text || 'Success';

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: fnName,
          content: textResult,
        });

      } catch (error) {
        console.log(`\n❌ Tool execution error: ${error.message}`);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: fnName,
          content: JSON.stringify({ error: error.message }),
        });
      }
    }

    // After providing tool results, loop back to the LLM to get its response
    await handleTurn();
  } else {
    // LLM is done, prompt user
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
