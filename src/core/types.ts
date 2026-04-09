/** Agent 任务上下文的通用输入类型 */
export interface AgentInput {
  [key: string]: unknown
}

/** Agent 任务返回的通用结构 */
export interface AgentResult {
  result: string
}

/** 提示词模板变量映射 */
export type PromptVariables = Record<string, string | number | boolean | undefined>
