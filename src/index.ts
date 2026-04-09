import 'dotenv/config'
import type { BeeAgent } from 'colony-bee-sdk'
import { createIngredientAnalyzer } from './agents/ingredient-analyzer/index.ts'
import { createRecipeMatcher } from './agents/recipe-matcher/index.ts'
import { createNutritionAssessor } from './agents/nutrition-assessor/index.ts'
import { createCookingTimeEstimator } from './agents/cooking-time-estimator/index.ts'
import { createTextSummarizer } from './agents/text-summarizer/index.ts'
import { createTranslator } from './agents/translator/index.ts'
import { createSentimentAnalyzer } from './agents/sentiment-analyzer/index.ts'
import { createCodeAssistant } from './agents/code-assistant/index.ts'
import { createBrainstormer } from './agents/brainstormer/index.ts'
import { createProofreader } from './agents/proofreader/index.ts'
import { createDataExplainer } from './agents/data-explainer/index.ts'
import { createComparisonAnalyzer } from './agents/comparison-analyzer/index.ts'
import { createTaskDecomposer } from './agents/task-decomposer/index.ts'
import { createKeywordExtractor } from './agents/keyword-extractor/index.ts'
import { createQuizGenerator } from './agents/quiz-generator/index.ts'
import { createAgentLogger, startTimer } from './core/logger.ts'

const logger = createAgentLogger('launcher')

const QUEEN_URL = process.env.QUEEN_URL || 'http://127.0.0.1:9009'
const COLONY_TOKEN = process.env.COLONY_TOKEN || 'change-me-in-production'

/** Agent 注册表 */
const agentRegistry: Record<string, () => Promise<BeeAgent>> = {
  'ingredient-analyzer': createIngredientAnalyzer,
  'recipe-matcher': createRecipeMatcher,
  'nutrition-assessor': createNutritionAssessor,
  'cooking-time-estimator': createCookingTimeEstimator,
  'text-summarizer': createTextSummarizer,
  'translator': createTranslator,
  'sentiment-analyzer': createSentimentAnalyzer,
  'code-assistant': createCodeAssistant,
  'brainstormer': createBrainstormer,
  'proofreader': createProofreader,
  'data-explainer': createDataExplainer,
  'comparison-analyzer': createComparisonAnalyzer,
  'task-decomposer': createTaskDecomposer,
  'keyword-extractor': createKeywordExtractor,
  'quiz-generator': createQuizGenerator,
}

/** 为 agent 注册全局生命周期事件监听 */
function bindLifecycleEvents(name: string, agent: BeeAgent) {
  agent.on('joined', ({ agentId }) => {
    logger.info('已加入集群', { agent: name, agentId })
  })

  agent.on('disconnected', ({ reason }) => {
    logger.warn('连接断开', { agent: name, reason })
  })

  agent.on('reconnected', ({ agentId }) => {
    logger.info('已重连', { agent: name, agentId })
  })
}

async function main() {
  const args = process.argv.slice(2)
  const targets = args.length > 0 ? args : Object.keys(agentRegistry)

  for (const name of targets) {
    if (!agentRegistry[name]) {
      logger.error('未知的 agent', { name, available: Object.keys(agentRegistry).join(', ') })
      process.exit(1)
    }
  }

  logger.info('启动中', { agents: targets.join(', '), queenUrl: QUEEN_URL })

  // 创建所有 agent
  const agents: { name: string; agent: BeeAgent }[] = []
  for (const name of targets) {
    const initTimer = startTimer()
    const agent = await agentRegistry[name]()
    logger.info('agent 创建完成', { agent: name, initMs: initTimer() })
    bindLifecycleEvents(name, agent)
    agents.push({ name, agent })
  }

  // 并发加入 colony
  const joinTimer = startTimer()
  const joinResults = await Promise.allSettled(
    agents.map(async ({ name, agent }) => {
      const result = await agent.join(QUEEN_URL, COLONY_TOKEN)
      return { name, ...result }
    }),
  )
  logger.info('集群加入阶段完成', { totalMs: joinTimer() })

  for (const result of joinResults) {
    if (result.status === 'rejected') {
      logger.error('加入集群失败', { error: String(result.reason) })
    }
  }

  const joined = joinResults.filter(r => r.status === 'fulfilled').length
  logger.info('全部就绪', { joined, total: targets.length })

  // 优雅退出
  const shutdown = async () => {
    logger.info('开始优雅退出...')
    const shutdownTimer = startTimer()

    await Promise.allSettled(
      agents.map(async ({ name, agent }) => {
        await agent.leave()
        logger.info('已离开集群', { agent: name })
      }),
    )

    logger.info('全部退出完成', { totalMs: shutdownTimer() })
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  logger.error('启动失败', { error: String(err) })
  process.exit(1)
})
