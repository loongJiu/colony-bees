import { BeeAgent } from 'colony-bee-sdk'
import { modelCaller } from '../../model-caller.ts'

export async function createCookingTimeEstimator() {
  const specPath = new URL('./bee.yaml', import.meta.url).pathname
  const agent = await BeeAgent.fromSpec(specPath)
  agent.setModelCaller(modelCaller)

  agent.onTask('cooking_time_estimation', async (ctx) => {
    const prompt = `你是一位专业的厨师。请估算以下菜品的烹饪信息，用自然语言介绍：
- 准备时间和烹饪时间各需要多久
- 难度等级和烹饪步骤概要
- 需要哪些厨具
- 一些实用的烹饪技巧和注意事项

输入菜品：${JSON.stringify(ctx.input)}`

    const result = await ctx.callModel(prompt)
    return { result }
  })

  return agent
}
