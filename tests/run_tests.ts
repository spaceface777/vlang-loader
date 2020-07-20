import vm from 'vm'
import fs from 'fs'
import path from 'path'
import spawn from 'cross-spawn'

function find_tests(dir: string) {
	return fs.readdirSync(dir).filter(f => fs.lstatSync(path.join(dir, f)).isDirectory() && !f.startsWith('_'))
}
const webpack_path = path.resolve(__dirname, '../node_modules/webpack-cli/bin/cli.js')

const sandbox = {
	console: {
		log: (str: string) => out.push(str + '\n'),
		error: (str: string) => out.push(str + '\n')
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
let failed_count = 0

function test_all_in_dir(...paths: string[]) {
	const full_path = path.join(...paths)
	const test_dirs = find_tests(full_path)
	const nr_tests = test_dirs.length

	const pad = (n: number) => ('' + n).padStart(('' + nr_tests).length, ' ')
	const ok = (i: number, msg: string) => console.log(`  \x1b[32mOK\x1b[0m   [${pad(i+1)}/${nr_tests}] ${msg}`)
	const fail = (i: number, msg: string) => console.log(`  \x1b[31mFAIL\x1b[0m [${pad(i+1)}/${nr_tests}] ${msg}`)

	for (const [i, _dir] of test_dirs.entries()) {
		let error: Error | undefined
		const dir = path.join(full_path, _dir)

		try {
			const res = spawn.sync('node', [webpack_path, '--bail'], { cwd: dir, encoding: 'utf8' })
			if (res.status || res.signal || res.error) throw res.error
		} catch (err) {
			error = err
		}

		let out_js = ''
		let expected_out = ''

		try {
			out_js = fs.readFileSync(path.join(dir, 'dist/output.js'), 'utf8')
			expected_out = fs.readFileSync(path.join(dir, 'expected_out.txt'), 'utf8')

			vm.runInNewContext(out_js, sandbox)
		} catch (err) {
			error = err
		}

		const actual_out = out.join('')
		out = []

		if (error) {
			fail(i, _dir)
			console.log('')
			console.log('-----error thrown-----')
			//console.log(error)
			failed_count++
		} else if (actual_out === expected_out) {
			ok(i, _dir)
		} else {
			fail(i, _dir)
			console.log('')
			console.log('-------expected-------')
			console.log(expected_out)
			console.log('-------received-------')
			console.log(actual_out)
			console.log('----------------------')
			failed_count++
		}
	}
}

for (const dir of find_tests('tests/')) {
	console.log(`\nTesting dir '${dir}'...`)
	test_all_in_dir('tests', dir)
}

if (failed_count > 0) {
	console.log('\n')
	process.exit(1)
}
