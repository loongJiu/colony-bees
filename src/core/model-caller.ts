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
      max_tokens: options?.max_tokens ?? 8192,
    }),
  })

  if (!response.ok) {
    throw new Error(`Model API error: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  const message = data.choices?.[0]?.message
  // 兼容推理模型：glm-4.7 等模型会将思考过程放在 reasoning_content，正式回复放在 content
  const reasoning = message?.reasoning_content ?? ''
  const content = message?.content ?? ''
  return content || reasoning
}
