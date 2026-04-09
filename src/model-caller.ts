import type { ModelCaller } from 'colony-bee-sdk'

const MODEL_API_URL = process.env.MODEL_API_URL || ''
const MODEL_API_KEY = process.env.MODEL_API_KEY || ''
const MODEL_NAME = process.env.MODEL_NAME || 'glm-4'

/**
 * 共享 LLM 调用器，兼容 OpenAI Chat Completions API 格式
 */
export const modelCaller: ModelCaller = async (prompt, options) => {
  const response = await fetch(MODEL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MODEL_API_KEY}`,
    },
    body: JSON.stringify({
      model: (options?.model as string) || MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2048,
    }),
  })

  if (!response.ok) {
    throw new Error(`Model API error: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? ''
}
