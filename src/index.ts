import 'dotenv/config'
import type { BeeAgent } from 'colony-bee-sdk'
import { createIngredientAnalyzer } from './agents/ingredient-analyzer/index.ts'
import { createRecipeMatcher } from './agents/recipe-matcher/index.ts'
import { createNutritionAssessor } from './agents/nutrition-assessor/index.ts'
import { createCookingTimeEstimator } from './agents/cooking-time-estimator/index.ts'

const QUEEN_URL = process.env.QUEEN_URL || 'http://127.0.0.1:9009'
const COLONY_TOKEN = process.env.COLONY_TOKEN || 'change-me-in-production'

/** Agent 注册表 */
const agentRegistry: Record<string, () => Promise<BeeAgent>> = {
  'ingredient-analyzer': createIngredientAnalyzer,
  'recipe-matcher': createRecipeMatcher,
  'nutrition-assessor': createNutritionAssessor,
  'cooking-time-estimator': createCookingTimeEstimator,
}

async function main() {
  const args = process.argv.slice(2)

  // 确定要启动的 agent 列表
  const targets = args.length > 0 ? args : Object.keys(agentRegistry)

  // 校验参数
  for (const name of targets) {
    if (!agentRegistry[name]) {
      console.error(`Unknown agent: ${name}`)
      console.error(`Available: ${Object.keys(agentRegistry).join(', ')}`)
      process.exit(1)
    }
  }

  console.log(`Starting ${targets.length} agent(s): ${targets.join(', ')}`)

  // 创建所有 agent
  const agents: { name: string; agent: BeeAgent }[] = []
  for (const name of targets) {
    const agent = await agentRegistry[name]()
    agents.push({ name, agent })
  }

  // 并发加入 colony
  const joinResults = await Promise.allSettled(
    agents.map(async ({ name, agent }) => {
      const result = await agent.join(QUEEN_URL, COLONY_TOKEN)
      console.log(`✓ ${name} joined as ${result.agentId}`)
      return { name, ...result }
    })
  )

  // 报告失败
  for (const result of joinResults) {
    if (result.status === 'rejected') {
      console.error(`✗ Join failed: ${result.reason}`)
    }
  }

  const joined = joinResults.filter(r => r.status === 'fulfilled').length
  console.log(`${joined}/${targets.length} agent(s) running. Press Ctrl+C to stop.`)

  // 优雅退出
  const shutdown = async () => {
    console.log('\nShutting down...')
    await Promise.allSettled(agents.map(async ({ name, agent }) => {
      await agent.leave()
      console.log(`✓ ${name} left`)
    }))
    console.log('Goodbye!')
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
