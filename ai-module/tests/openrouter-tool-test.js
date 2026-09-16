/**
 * openrouter-tool-test.js
 * 
 * An isolated test to verify that the OpenRouter Google Gemma 4 model
 * correctly returns a structured tool_call instead of just text.
 * 
 * Run with: node tests/openrouter-tool-test.js
 * (Ensure LLM_API_KEY is set in your .env file to an OpenRouter API key)
 */

import { config } from '../src/config.js';
import { discoveryTools } from '../src/tools/discovery.js';

// OpenRouter's Gemma 4 model string (from their API)
const MODEL_NAME = config.llmModel; 

async function runTest() {
  const apiKey = config.llmApiKey;
  if (!apiKey) {
    console.error('❌ Error: LLM_API_KEY is not set in your .env file.');
    console.error('Please add your OpenRouter API key to ai-module/.env and try again.');
    process.exit(1);
  }

  console.log(`\n🧪 Testing Tool Calling with ${MODEL_NAME} via OpenRouter...`);
  console.log('Sending one tool definition (get_states) and one prompt.\n');

  // We use just the first tool (get_states) for this isolated test
  const testTool = discoveryTools.find(t => t.name === 'get_states');

  // Convert MCP tool definition to OpenAI format expected by OpenRouter
  const openaiTools = [
    {
      type: 'function',
      function: {
        name: testTool.name,
        description: testTool.description,
        parameters: testTool.inputSchema,
      },
    },
  ];

  const messages = [
    { role: 'user', content: 'Can you tell me which states have Tvarita events?' }
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // Optional OpenRouter headers
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Tvarita AI Module Test',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        tools: openaiTools,
        tool_choice: 'auto',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ OpenRouter API Error (${response.status}):\n${errText}`);
      return;
    }

    const data = await response.json();
    const message = data.choices[0]?.message;

    console.log('--- RESPONSE FROM GEMMA ---');
    console.log(`Role: ${message.role}`);
    console.log(`Content: ${message.content || '(empty)'}`);

    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log('\n✅ SUCCESS: The model returned a structured tool_call!');
      console.log(JSON.stringify(message.tool_calls, null, 2));
    } else {
      console.log('\n❌ FAILURE: The model DID NOT return a tool_call.');
      console.log('It likely responded with plain text instead of executing the function.');
    }

  } catch (error) {
    console.error('❌ Network or Execution Error:', error.message);
  }
}

runTest();
