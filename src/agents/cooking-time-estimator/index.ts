import { BeeAgent } from 'colony-bee-sdk'
import { modelCaller } from '../../core/model-caller.ts'
import { loadPrompt } from '../../core/prompt-loader.ts'
import { createAgentLogger, startTimer } from '../../core/logger.ts'

const AGENT_NAME = 'cooking-time-estimator'
const logger = createAgentLogger(AGENT_NAME)

export async function createCookingTimeEstimator() {
  logger.info('初始化开始')

  const specPath = new URL('./bee.yaml', import.meta.url).pathname
  logger.info('加载 spec 配置', { specPath })

  const agent = await BeeAgent.fromSpec(specPath, { logger })
  agent.setModelCaller(modelCaller)
  logger.info('模型调用器已注入')

  agent.onTask('cooking_time_estimation', async (ctx) => {
    const elapsed = startTimer()
    const inputStr = JSON.stringify(ctx.input)

    logger.info('任务开始', { taskId: ctx.taskId, capability: ctx.capability, inputLength: inputStr.length })

    const prompt = loadPrompt(import.meta.url, 'estimation.md', { input: inputStr })
    logger.info('提示词已加载', { taskId: ctx.taskId, promptLength: prompt.length })

    ctx.progress(10, '提示词已加载，开始调用模型')

    const modelStart = performance.now()
    const result = await ctx.callModel(prompt)
    const modelLatency = Math.round(performance.now() - modelStart)

    logger.info('模型调用完成', { taskId: ctx.taskId, modelLatencyMs: modelLatency })

    const resultStr = String(result)
    ctx.progress(90, '估算完成，整理结果')

    logger.info('任务完成', { taskId: ctx.taskId, totalMs: elapsed(), resultLength: resultStr.length })
    return { result: resultStr }
  })

  logger.info('初始化完成，任务处理器已注册')
  return agent
}
