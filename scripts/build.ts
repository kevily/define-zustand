import { Engine, babel, tsc, rollup } from '1k-tasks'
import * as path from 'path'

const task = new Engine({ root: path.join(process.cwd(), 'packages/define-zustand') })
task.registry('tsc', tsc)
task.registry('rollup', rollup, {
    projectType: 'react'
})

task.run()
