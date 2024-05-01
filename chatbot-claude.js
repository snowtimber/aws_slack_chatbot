// index.mjs
import { fileURLToPath } from 'url';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

/**
 * @typedef {Object} ResponseContent
 * @property {string} text
 *
 * @typedef {Object} MessagesResponseBody
 * @property {ResponseContent[]} content
 */

/**
 * Invokes Anthropic Claude 3 Sonnet using the Messages API.
 *
 * @param {string} prompt - The input text prompt for the model to complete.
 */
const invokeClaudeSonnet = async (prompt) => {
  // Create a new Bedrock Runtime client instance.
  const client = new BedrockRuntimeClient({ region: 'us-east-1' });

  // Prepare the payload for the model.
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: prompt }],
      },
    ],
  };

  // Invoke Claude Sonnet with the payload and wait for the response.
  const command = new InvokeModelCommand({
    contentType: 'application/json',
    body: JSON.stringify(payload),
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
  });
  const apiResponse = await client.send(command);

  // Decode and return the response(s)
  const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
  /** @type {MessagesResponseBody} */
  const responseBody = JSON.parse(decodedResponseBody);
  const claudeOutput = responseBody.content[0].text;
  console.log('Claude output:', claudeOutput); // Log the output from Claude
  return claudeOutput;
};

export const handler = async (event) => {
  try {
    console.log('Input event:', event); // Print the full input event

    // Extract the prompt from the event object
    const prompt = event.body?.prompt || '';

    // Check if the prompt is a non-empty string
    if (typeof prompt !== 'string' || prompt.trim() === '') {
      return {
        statusCode: 400,
        body: 'Invalid input: prompt must be a non-empty string.',
      };
    }

    const response = await invokeClaudeSonnet(prompt);
    console.log('Response sent to user:', response); // Log the response sent to the user
    // Return the response or process it further as needed
    return {
      statusCode: 200,
      body: response,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: 'An error occurred while processing your request.',
    };
  }
};