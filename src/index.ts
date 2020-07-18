import fs from 'fs'
import os from 'os'
import path from 'path'
import spawn from 'cross-spawn'
import { loader } from 'webpack'

let v_output: string[] = []
const append_output = (out: string) => v_output.push(out)

const tmp_file = path.join(os.tmpdir(), '__v_webpack_tmp__')
const tmp_file_js = `${tmp_file}.js`

export default function loader(this: loader.LoaderContext, __source: string) {
	const cb = this.async()
	const file_path = this.resourcePath
	const v_cmd = spawn('v', ['-b', 'js', '-o', tmp_file, file_path], {})
	v_cmd.stdout?.on('data', append_output)
	v_cmd.stderr?.on('data', append_output)
	v_cmd.on('close', code => {
		if (code === 0) {
			fs.readFile(tmp_file_js, (err, data) => {
				fs.unlink(tmp_file_js, err1 => {
					cb?.(err ?? err1, data)
				})
			})
		} else {
			cb?.(new Error(v_output.join('\n')))
		}

		v_output = []
	})
}
