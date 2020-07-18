import vm from 'vm'
import fs from 'fs'
import path from 'path'
import spawn from 'cross-spawn'

const webpack_path = path.resolve(__dirname, '../node_modules/webpack-cli/bin/cli.js')
const test_dirs = fs.readdirSync(__dirname).filter(f => fs.lstatSync(path.join(__dirname, f)).isDirectory())
const nr_tests = test_dirs.length

const pad = (n: number) => ('' + n).padStart(('' + nr_tests).length, ' ')
const ok = (i: number, msg: string) => console.log(`\x1b[32mOK\x1b[0m   [${pad(i+1)}/${nr_tests}] ${msg}`)
const fail = (i: number, msg: string) => console.log(`\x1b[31mFAIL\x1b[0m [${pad(i+1)}/${nr_tests}] ${msg}`)

const sandbox = {
    console: {
        log: (str: string) => out.push(str + '\n')
    },
    process: {
        stdout: {
            write: (str: string) => out.push(str)
        },
        stderr: {
            write: (str: string) => out.push(str)
        }
    }
}

let out: string[] = []

for (const [i, _dir] of test_dirs.entries()) {
    const dir = path.join(__dirname, _dir)
    spawn.sync('node', [webpack_path], { cwd: dir })

    const out_js = fs.readFileSync(path.join(dir, 'dist/output.js'), 'utf8')
    const expected_out = fs.readFileSync(path.join(dir, 'expected_out.txt'), 'utf8')

    vm.runInNewContext(out_js, sandbox)
    const actual_out = out.join('')
    out = []

    if (actual_out === expected_out) {
        ok(i, _dir)
    } else {
        fail(i, _dir)
        console.log('')
        console.log('-------expected-------')
        console.log(expected_out)
        console.log('-------received-------')
        console.log(actual_out)
        console.log('----------------------')
        process.exit(1)
    }
}
