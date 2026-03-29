import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const projectRoot = resolve(new URL('..', import.meta.url).pathname)
const outputPath = resolve(projectRoot, 'assets/runtime-config.js')
const url = String(process.env.SUPABASE_URL || '').trim()
const key = String(process.env.SUPABASE_PUBLISHABLE_KEY || '').trim()

if (!url || !key) {
  console.error('缺少环境变量：SUPABASE_URL 或 SUPABASE_PUBLISHABLE_KEY')
  process.exit(1)
}

const fileContent = `window.TRHAIRGUIDE_RUNTIME_CONFIG = {
  SUPABASE_URL: ${JSON.stringify(url)},
  SUPABASE_PUBLISHABLE_KEY: ${JSON.stringify(key)},
}
`

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, fileContent, 'utf8')
console.log(`已生成 ${outputPath}`)
