import { BeeAgent } from 'colony-bee-sdk'
import { modelCaller } from '../../model-caller.ts'

export async function createNutritionAssessor() {
  const specPath = new URL('./bee.yaml', import.meta.url).pathname
  const agent = await BeeAgent.fromSpec(specPath)
  agent.setModelCaller(modelCaller)

  agent.onTask('nutrition_assessment', async (ctx) => {
    const prompt = `你是一位专业的营养师。请评估以下菜品的营养成分，返回 JSON 格式的结果，包含以下字段：
- "dish": 菜品名称
- "calories": 预估热量（千卡）
- "protein": 蛋白质含量（克）
- "carbs": 碳水化合物含量（克）
- "fat": 脂肪含量（克）
- "fiber": 膳食纤维含量（克）
- "vitamins": 主要维生素列表
- "minerals": 主要矿物质列表
- "health_index": 健康指数评分（1-10）

输入菜品：${JSON.stringify(ctx.input)}

请直接返回 JSON，不要包含其他文字。`

    const result = await ctx.callModel(prompt)
    return { result }
  })

  return agent
}
