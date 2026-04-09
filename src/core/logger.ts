import { Logger } from 'colony-bee-sdk'

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error'

/** 创建带 agent 名称绑定的 Logger */
export function createAgentLogger(agentName: string): Logger {
  return new Logger({ level: LOG_LEVEL }, { agent: agentName })
}

/** 计时器工具，用于追踪步骤耗时 */
export function startTimer(): () => number {
  const start = performance.now()
  return () => Math.round(performance.now() - start)
}
