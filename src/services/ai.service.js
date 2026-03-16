import { grokChatCompletion } from './grokSdk.service.js';

export const generateRecommendationExplanation = async ({ profile, ranked }) => {
  const prompt = `Student profile: ${JSON.stringify(profile)}. Ranked colleges: ${JSON.stringify(
    ranked.map((r) => ({ name: r.college.name, score: r.modelScore, roi: r.estimatedROI }))
  )}. Return concise counseling summary with action points.`;

  return grokChatCompletion({
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content: 'You are an admissions counselor. Be concise and practical.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });
};
