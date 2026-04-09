import { BeeAgent } from 'colony-bee-sdk'
import { modelCaller } from '../../model-caller.ts'

export async function createNutritionAssessor() {
  const specPath = new URL('./bee.yaml', import.meta.url).pathname
  const agent = await BeeAgent.fromSpec(specPath)
  agent.setModelCaller(modelCaller)

  agent.onTask('nutrition_assessment', async (ctx) => {
    const prompt = `你是一位专业的营养师。请评估以下菜品的营养成分，用通俗易懂的语言介绍：
- 预估热量和主要营养素（蛋白质、碳水、脂肪）含量
- 富含的维生素和矿物质
- 整体健康评价和饮食建议
- 适合的人群和注意事项

输入菜品：${JSON.stringify(ctx.input)}`

    const result = await ctx.callModel(prompt)
    return { result }
  })

  return agent
}
