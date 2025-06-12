import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default readFileSync(join(process.cwd(), 'ai', 'system.md'), 'utf-8')
