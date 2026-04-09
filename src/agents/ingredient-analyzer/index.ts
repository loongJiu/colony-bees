import { BeeAgent } from 'colony-bee-sdk'
import { modelCaller } from '../../model-caller.ts'

export async function createIngredientAnalyzer() {
  const specPath = new URL('./bee.yaml', import.meta.url).pathname
  const agent = await BeeAgent.fromSpec(specPath)
  agent.setModelCaller(modelCaller)

  agent.onTask('ingredient_analysis', async (ctx) => {
    const prompt = `你是一位专业的食材分析师。请分析以下食材，返回 JSON 格式的结果，包含以下字段：
- "ingredients": 每种食材的分类（蔬菜/肉类/海鲜/调味品/主食等）
- "seasonality": 每种食材的最佳季节和当前是否应季
- "pairing": 食材之间的搭配建议，包括互补和相克的食材
- "nutrition": 每种食材的主要营养成分概要

输入食材：${JSON.stringify(ctx.input)}

请直接返回 JSON，不要包含其他文字。`

    const result = await ctx.callModel(prompt)
    return { result }
  })

  return agent
}
