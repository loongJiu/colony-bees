import { BeeAgent } from 'colony-bee-sdk'
import { modelCaller } from '../../model-caller.ts'

export async function createRecipeMatcher() {
  const specPath = new URL('./bee.yaml', import.meta.url).pathname
  const agent = await BeeAgent.fromSpec(specPath)
  agent.setModelCaller(modelCaller)

  agent.onTask('recipe_matching', async (ctx) => {
    const prompt = `你是一位专业的菜谱推荐师。请根据以下食材推荐 3-5 道菜谱，用自然语言介绍每道菜：
- 菜名和口味特点
- 需要的食材（标注哪些已有、哪些需要额外购买）
- 难度和预估烹饪时间
- 简要的烹饪步骤

输入食材：${JSON.stringify(ctx.input)}`

    const result = await ctx.callModel(prompt)
    return { result }
  })

  return agent
}
