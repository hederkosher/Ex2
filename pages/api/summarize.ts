import type { NextApiRequest, NextApiResponse } from 'next';

interface SummarizeRequest {
  text: string;
  apiKey: string;
  provider?: 'openai' | 'groq' | 'anthropic';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, apiKey, provider = 'openai' }: SummarizeRequest = req.body;

  if (!text || !apiKey) {
    return res.status(400).json({ 
      error: 'Missing required fields: text and apiKey are required' 
    });
  }

  try {
    let summary = '';

    if (provider === 'groq') {
      // Use Groq API (free tier available)
      // Try multiple models in case one is unavailable
      const models = ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
      let lastError: Error | null = null;

      for (const model of models) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful assistant that summarizes text concisely in up to 3 sentences.',
                },
                {
                  role: 'user',
                  content: `Please summarize the following text in up to 3 sentences:\n\n${text}`,
                },
              ],
              max_tokens: 150,
              temperature: 0.7,
            }),
          });

          if (!response.ok) {
            let errorMessage = 'Unknown error';
            try {
              const errorData = await response.json();
              errorMessage = errorData.error?.message || errorData.message || response.statusText;
            } catch (e) {
              errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            lastError = new Error(`Groq API error (${model}): ${errorMessage}`);
            // If it's not a model error, break and throw
            if (!errorMessage.includes('model') && !errorMessage.includes('Model')) {
              throw lastError;
            }
            // Otherwise try next model
            continue;
          }

          const data = await response.json();
          summary = data.choices[0]?.message?.content || '';
          
          if (summary && summary.trim() !== '') {
            break; // Success, exit loop
          }
        } catch (err: any) {
          lastError = err;
          // Continue to next model
          continue;
        }
      }

      if (!summary || summary.trim() === '') {
        throw lastError || new Error('All Groq models failed. Please check your API key.');
      }
    } else if (provider === 'openai') {
      // Use OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes text concisely in up to 3 sentences.',
            },
            {
              role: 'user',
              content: `Please summarize the following text in up to 3 sentences:\n\n${text}`,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      summary = data.choices[0]?.message?.content || 'Failed to generate summary';
    } else if (provider === 'anthropic') {
      // Use Anthropic Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 150,
          messages: [
            {
              role: 'user',
              content: `Please summarize the following text in up to 3 sentences:\n\n${text}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      summary = data.content[0]?.text || 'Failed to generate summary';
    } else {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    return res.status(200).json({ summary });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return res.status(500).json({ 
      error: 'Failed to generate summary',
      message: error.message 
    });
  }
}
