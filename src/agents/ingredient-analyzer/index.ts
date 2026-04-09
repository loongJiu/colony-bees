import { BeeAgent } from 'colony-bee-sdk'
import { modelCaller } from '../../model-caller.ts'

export async function createIngredientAnalyzer() {
  const specPath = new URL('./bee.yaml', import.meta.url).pathname
  const agent = await BeeAgent.fromSpec(specPath)
  agent.setModelCaller(modelCaller)

  agent.onTask('ingredient_analysis', async (ctx) => {
    const prompt = `你是一位专业的食材分析师。请分析以下食材，用清晰易懂的语言介绍：
- 每种食材的分类（蔬菜/肉类/海鲜/调味品/主食等）
- 食材的季节性和新鲜度建议
- 食材之间的搭配建议，哪些搭配好，哪些要避免
- 简要的营养特点

输入食材：${JSON.stringify(ctx.input)}`

    const result = await ctx.callModel(prompt)
    return { result }
  })

  return agent
}
