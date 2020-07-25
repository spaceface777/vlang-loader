# vlang-loader
Webpack loader for the V programming language; supports V's JS backend and (soon) WASM  


## Setup
It's the same as other Webpack loader: just `npm install vlang-loader`, and tell Webpack to use it for your `.v` files:

```sh
$ npm install --save-dev vlang-loader
```

`webpack.config.js`:
```js
module.exports = {
    entry: './src/main.v',
    module: {
        rules: [{ test: /\.v$/, use: 'vlang-loader' }]
    }
}
```

`src/main.v`:
```v
fn main() {
    println('Hello, Webpack + V.js!')
}
```

And that's all the setup you'll need. Run `npx webpack`, and you'll see Webpack's output JS file at `dist/main.js`.

As with other loaders, it can be chained, so (for example) you may use something like `UglifyJS` to further minify the output.


## Usage
There's two main ways of using this loader. The first is to have a V entrypoint, where the `main` module and `fn main()` are defined inside a `.v` file. Note that you can still use V's JS interop as you would normally.

The second is to have a mixed project, where some modules are written in V, but the entrypoint is in a different language (JS, TS, etc.)

JS is supported out of the box. You only need to add `-shared` to your Webpack config, to tell V to export its functions:
```js
{
    test: /\.v$/,
    use: {
        loader: 'vlang-loader',
        options: {
            shared: true
        }
    }
}
```

Note that to have a function or constant exported to JS, you need to define it with `pub`:

`src/mod1/mod1.v`
```v
module mod1

fn log(s string) { println(s) } // Not `pub`, so will not be exported to JS
pub fn foo() { log('foo') }
pub fn bar() { log('bar') }
```

After that, you can `import` that module as you would with any other JS module:

`src/main.js`
```js
import mod1 from './mod1/mod1.v'    // Imports the whole namespace, or
import { bar } from './mod1/mod1.v' // Imports a specific function

mod1.foo() // prints 'foo'
bar()      // prints 'bar'
```

Getting TypeScript to work is a little more difficult, as you need to define the types for the modules's exports manually for type checking to work, and also tell TypeScript to load and process `.v` files.  
If you want to use it, though, there's a working, example configuration [here](tests/mixed_ts_vjs/simple/).

For more example project configurations, you may take a look at the `tests` dir.


## Configuration
This loader supports the same flags as the regular `v` compiler:
```js
options: {
	shared: false,
	enable_globals: false,
	// sourcemap: true,

	vPath: 'v',
	// emccPath: 'emcc',

	// wasm: false,
	// asm_js: false,
}
```
All options are optional, and these are their defaults.  
Commented options are not supported yet, see below for more details.


## HMR
Webpack's HMR works with V, so you get to keep the convenience of having your page update automatically on every change.
Note that Webpack's default behavior is to reload the page, rather than applying the changes live.
You need to call `module.hot.accept()` yourself to force `hot` behavior.

If you are using a non-V entrypoint, enabling this is simple. Just add this to your entry file:
```js
if (module.hot) module.hot.accept()
```

For V entrypoints, this is a bit more complicated. This method will most likely improve in the future, but for now you can use something like this:
`src/hmr/hmr.js.v`:
```v
module hmr

pub fn accept() {
    #if (module.hot) module.hot.accept()
}
```

`src/main.v`:
```v
import hmr

fn main() {
    println('Hello from Webpack + V.js + HMR!')
    hmr.accept()
}
```


## Limitations
  - For now, you need the V compiler installed, since this module will look for a `v` executable in your PATH. In the future, whenever V and this loader stabilize a little, a WebAssembly compiled binary of the V compiler may be bundled along with this library, and used if the V compiler is not found.
  - Similarly, if you want to use `wasm` / `asm.js`, you also need the `emcc` compiler installed.
  - This loader is just an integration between V and Webpack, so any issues with V will also be issues here.


## Troubleshooting
V and this plugin are in alpha stage, so you may encounter bugs while using them. If you do, try the following before reporting an issue:

  1. Try to compile your code using V normally.
  2. Try to compile your code with V's JS backend normally (`v -b js your_file.v`)

If either one of these fails to compile, open an issue in the [V repo](https://github.com/vlang/v).  
If they do compile, open an issue here with the V code / Webpack config causing issues.

You may also use `#help` in the [V Discord server](https://discord.gg/vlang).


## TODOs
 - Implement WebAssembly generation via C->JS using `emscripten`
 - Implement code splitting per V module (`builtin` especially), to avoid bundling everything per output file. This will allow for smaller download sizes.
 - Generate source maps for a better debugging experience (shows error positions and allows setting breakpoints directly in the `.v` file)


## Contributing
Contributions are welcome. Please make sure to keep the same code style (no semicolons, single quotes, indentation using tabs...)

#### Code structure
The loader itself is in `src`, and is written in TypeScript. Tests for it are located in `tests`. Each subfolder contains independent projects, which are each compiled separately. Their runtime output is compared to the contents of `expected_out.txt`, if they match the test was successful.

To run the tests locally, use `npm test`.
