# vlang-loader
Webpack loader for the V programming language; supports V's JS backend and (soon) WASM  
https://npmjs.com/vlang-loader


### Setup
It's the same as other Webpack loader: just `npm install` it, and set up your Webpack config to use it for `.v` files:

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


### Usage
There's two main ways of using this loader. The first is to have a V entrypoint, where the `main` function is defined inside a `.v` file.
Note that you can still use V's JS interop as you would normally.

The second is to have a mixed project, where some modules are written in V, but the entrypoint is in a different language like JS or TS.
JS support works out of the box, you just need to add `-shared` to your Webpack config, to tell V that the module is not `main`:
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

Note that to export a function or constant to JS, you need to define it with `pub`:
`src/mod1/mod1.v`
```v
module mod1

pub fn foo() string { return 'foo' }
pub fn bar() string { return 'bar' }
    fn baz() string { return 'baz' }  // not `pub`, so will not be exported
```

After that, you can `import` that module as you would with any other JS module:
`src/main.js`
```js
import mod1 from './mod1/mod1.v'    // Imports the whole namespace, or
import { bar } from './mod1/mod1.v' // Imports a specific function

console.log(mod1.foo()) // prints 'foo'
console.log(bar())      // prints 'bar'
```

<!-- Finish writing

Getting TypeScript to work is more difficult, as you need to define the types for the modules's exports manually, and get TypeScript to load `.v` files.  
There's a full, working example [here](tests/mixed_ts_vjs/simple/), but the basic idea is the following:
`src/mod1/mod1.v`
```v
module mod1

pub fn foo() string { return 'foo' }
pub fn bar(s string) { return s }
    fn baz(i int) string { return 'baz' }  // not `pub`, so will not be exported
```

`src/mod1/mod1.d.ts`
```ts
declare module 'mod1/mod1.v' {
	const exports: {
        foo: () => string,
        bar: (s: string) => void,
        baz: (i: number) => string
	}

	export = exports
}
```

`src/main.ts`
```ts
import mod1 from './mod1/mod1.v'    // Imports the whole namespace, or
import { bar } from './mod1/mod1.v' // Imports a specific function

console.log(mod1.foo()) // prints 'foo'
console.log(bar())      // prints 'bar'
```

-->

***

For more examples on how to use each of these options, you may take a look at the `tests` dir.


### Configuration
This loader supports the same flags as the regular `v` compiler:
```js
options: {
    shared: false,
    enable_globals: false,
    sourcemap: true // TODO: Doesn't work yet, see below
}
```


### HMR
Webpack's HMR works with V, so you get to keep the convenience of having your page update automatically on every change.  
Note that Webpack's default behavior is to reload the page, rather than applying the changes live. You need to call `module.hot.accept()` to force `hot` behavior.

If you are using a non-V entrypoint, enabling this is simple. Just add this to your entry file:
```js
if (module.hot) module.hot.accept()
```

For full V modules, this is a bit more complicated. It will improve in the future, but for now you can use something like this:
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


### Limitations
 - For now, you **need the V compiler installed**, since this module will look for a `v` executable in your PATH.
 - In the future (whenever V stabilizes a little), a WebAssembly compiled binary of the V compiler may be bundled along with this library, and used if the V compiler is not found.
 - This loader is just an integration between V and Webpack, so **any issues with V will also occur in this module**. If your code does not compile, first try to compile it with the regular V compiler. If that does not work either, report an issue in the [regular V repo](https://github.com/vlang/v). If it *does* work, open an issue here.


### TODOs
 - Implement WebAssembly generation via C->JS using `emscripten`
 - Implement code splitting per V module (`builtin` especially), to avoid bundling everything per output file. This will allow for smaller download sizes.
 - Generate source maps for a better debugging experience (shows error positions and allows setting breakpoints directly in the `.v` file)


### Code structure
The loader itself is in `src`. Tests for it are located in `tests`, each subfolder is an independent project and is compiled separately. Their runtime output is compared to the contents of `expected_out.txt`, if they match the test was successful.  
To run the tests, use `npm test`.


### Contributing
Contributions are welcome. Please make sure to keep the same code style (no semicolons, single quotes, indentation using tabs...)
