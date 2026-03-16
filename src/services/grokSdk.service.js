import { getGrokConfig } from '../config/grok.js';

export const grokChatCompletion = async ({ messages, temperature = 0.4 }) => {
  const config = getGrokConfig();
  if (!config) return null;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature,
      messages,
    }),
  }).catch(() => null);

  if (!response?.ok) return null;
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
};
