import fs from 'fs'
import os from 'os'
import path from 'path'
import spawn from 'cross-spawn'
import webpack from 'webpack'

import { get_options } from './options'

let v_output: string[] = []
const append_output = (out: string) => v_output.push(out)

let tmp_idx = 0
const get_tmp_file = () => path.join(os.tmpdir(), `__v_webpack_tmp__${tmp_idx++}`)

export default function loader(this: webpack.loader.LoaderContext, _source: string) {
	const options = get_options(this)

	const cb = this.async()!
	const file_path = this.resourcePath
	const tmp_file = get_tmp_file()

	const v_options = ['-b', 'js']
	const tmp_out = ['-o', tmp_file, file_path]

	if (this.mode === 'production') v_options.push('-prod')
	if (options.shared) v_options.push('-shared')

	const v_cmd = spawn('v', [...v_options, ...tmp_out])
	v_cmd.stdout?.on('data', append_output)
	v_cmd.stderr?.on('data', append_output)
	v_cmd.on('close', code => {
		if (code === 0) {
			fs.readFile(`${tmp_file}.js`, (err, data) => {
				fs.unlink(`${tmp_file}.js`, err1 => {
					cb(err ?? err1, data)
				})
			})
		} else {
			cb(new Error(v_output.join('\n')))
		}

		v_output = []
	})
}
