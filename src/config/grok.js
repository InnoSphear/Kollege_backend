export const getGrokConfig = () => {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) return null;
  const isGroqKey = apiKey.startsWith('gsk_');
  const baseUrl = process.env.GROK_API_BASE_URL || (isGroqKey ? 'https://api.groq.com/openai/v1' : 'https://api.x.ai/v1');
  const model = process.env.GROK_MODEL || (isGroqKey ? 'llama-3.3-70b-versatile' : 'grok-2-latest');

  return {
    apiKey,
    baseUrl,
    model,
  };
};
