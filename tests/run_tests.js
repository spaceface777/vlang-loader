const vm = require('vm')
const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')

const webpack_path = path.resolve(__dirname, '../node_modules/webpack-cli/bin/cli.js')
const test_dirs = fs.readdirSync(__dirname).filter(f => fs.lstatSync(path.join(__dirname, f)).isDirectory())
const nr_tests = test_dirs.length

const pad = n => ('' + n).padStart(('' + nr_tests).length, ' ')
const ok = (i, msg) => console.log(`\x1b[32mOK\x1b[0m   [${pad(i+1)}/${nr_tests}] ${msg}`)
const fail = (i, msg) => console.log(`\x1b[31mFAIL\x1b[0m [${pad(i+1)}/${nr_tests}] ${msg}`)

const sandbox = {
    console: {
        log: str => out.push(str + '\n')
    },
    process: {
        stdout: {
            write: str => out.push(str)
        },
        stderr: {
            write: str => out.push(str)
        }
    }
}

let out = []

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
