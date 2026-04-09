import { BeeAgent } from 'colony-bee-sdk'
import { modelCaller } from '../../model-caller.ts'

export async function createRecipeMatcher() {
  const specPath = new URL('./bee.yaml', import.meta.url).pathname
  const agent = await BeeAgent.fromSpec(specPath)
  agent.setModelCaller(modelCaller)

  agent.onTask('recipe_matching', async (ctx) => {
    const prompt = `你是一位专业的菜谱推荐师。请根据以下食材匹配合适的菜谱，返回 JSON 数组格式，每道菜包含以下字段：
- "name": 菜谱名称
- "ingredients": 所需食材列表（标注哪些来自输入、哪些需要额外购买）
- "difficulty": 难度等级（简单/中等/困难）
- "time": 预估烹饪时间（分钟）
- "steps": 简要烹饪步骤（3-5步）
- "flavor": 口味描述（如：咸鲜、麻辣、清淡等）

输入食材：${JSON.stringify(ctx.input)}

请推荐 3-5 道菜谱，直接返回 JSON 数组，不要包含其他文字。`

    const result = await ctx.callModel(prompt)
    return { result }
  })

  return agent
}
