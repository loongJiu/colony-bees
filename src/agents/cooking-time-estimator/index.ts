import { BeeAgent } from 'colony-bee-sdk'
import { modelCaller } from '../../model-caller.ts'

export async function createCookingTimeEstimator() {
  const specPath = new URL('./bee.yaml', import.meta.url).pathname
  const agent = await BeeAgent.fromSpec(specPath)
  agent.setModelCaller(modelCaller)

  agent.onTask('cooking_time_estimation', async (ctx) => {
    const prompt = `你是一位专业的厨师。请估算以下菜品的烹饪信息，返回 JSON 格式的结果，包含以下字段：
- "dish": 菜品名称
- "prep_time": 准备时间（分钟）
- "cook_time": 烹饪时间（分钟）
- "total_time": 总时间（分钟）
- "difficulty": 难度等级（简单/中等/困难）
- "steps_count": 预估步骤数
- "tools": 所需厨具列表
- "tips": 烹饪技巧提示

输入菜品：${JSON.stringify(ctx.input)}

请直接返回 JSON，不要包含其他文字。`

    const result = await ctx.callModel(prompt)
    return { result }
  })

  return agent
}
