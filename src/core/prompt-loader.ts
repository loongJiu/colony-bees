import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PromptVariables } from './types.ts'

/** 提示词文件缓存 */
const cache = new Map<string, string>()

/**
 * 加载提示词模板文件并渲染变量
 *
 * @param moduleFile - 调用方的 `import.meta.url`，用于定位提示词目录
 * @param filename   - prompts/ 目录下的文件名，如 `"analysis.md"`
 * @param variables  - 可选的模板变量，支持 `{{key}}` 占位符
 */
export function loadPrompt(
  moduleFile: string,
  filename: string,
  variables?: PromptVariables,
): string {
  const key = `${moduleFile}::${filename}`

  let template = cache.get(key)
  if (!template) {
    const dir = dirname(fileURLToPath(moduleFile))
    const filePath = join(dir, 'prompts', filename)
    template = readFileSync(filePath, 'utf-8')
    cache.set(key, template)
  }

  if (!variables) return template

  return template.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    const value = variables[name]
    return value !== undefined ? String(value) : ''
  })
}
