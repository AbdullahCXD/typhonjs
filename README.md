
<p align="center">
  <img src="https://github.com/user-attachments/assets/a5d270ab-cc8d-4549-ba73-7c07934e0269" width="256" height="256" />
</p>

<h1 align="center">Typhonjs</h1>


<p align="center">
  <img src="https://img.shields.io/npm/v/typhonjs" alt="npm version">
  <img src="https://img.shields.io/github/languages/code-size/abdullahcxd/Typhonjs" alt="code size">
  <img src="https://img.shields.io/github/license/abdullahcxd/Typhonjs" alt="license">
</p>

## What is Typhonjs?

**Typhonjs** is a **JavaScript/TypeScript project manager** inspired by tools like **Maven** and **Gradle**. It brings the power of modern CLI-driven builds and project management to the JavaScript ecosystem. Whether you're building a simple app or a massive enterprise project, Typhonjs is designed to help you get things.

If you're using **pnpm**, **npm** or **yarn**, just run:

```bash
# Typhon
pnpm add -g typhonjs

# Yarn
yarn global add typhonjs

# NPM 
npm install --location=global typhonjs
```

---

## Usage

### Initialize Your Project

Once Typhonjs is installed, create a new project with: 

```bash
typhon init
```

This will set up a basic `typh.config.js` configuration file, which you can customize to suit your project.

### Running Tasks

To run a build task, just use:

```bash
typh build
```

Typhonjs takes care of the rest, automatically executing the tasks defined in your configuration file. You can define your own custom tasks as well!

---

## Configuration

Typhonjs is configured through the `typh.config.js` file. Here's a basic example:

```js
module.exports = {
  buildinfo: {
    name: "example",
    version: "1.0.0",
    packageManager: "pnpm"
  },
  build: {
    main: "com.example.ExampleClass" // dots are replaced with the path separator like Java
  },
  dependencies: {
    "consola": "^3.4.2"
  }
};
```

In this example, we’ve defined two tasks: `build` and `test`. Each task has a description and an associated command that will be run when you invoke the task.

---

## Plugins

Typhonjs is **extensible**! You can add plugins to customize its functionality. Just add them to the `plugins` array in the `plugins.typh.js` file:

This feature is still work in progress. Mainly this feature will adopt similar like idea of Gradle commands/plugins.

```js
module.exports = {
  plugins: [
    ExamplePlugin
  ],
};
```

---

## License

Typhonjs is open-source and available under the [MIT License](https://github.com/AbdullahCXD/typhonjs/blob/master/LICENSE).

---

## Contributing

We love contributions! If you want to help make Typhonjs even better, feel free to fork the repo and submit a pull request. You can also open issues to report bugs or suggest features. Your input is always appreciated!

---

## Contact

Got questions? Need help? You can reach me at [send@abdullahcxd.is-a.dev](mailto:send@abdullahcxd.is-a.dev), or open an issue on [GitHub](https://github.com/abdullahcxd/Typhonjs).

---

<div align="center">
  <p>Made with 💙 by <a href="https://github.com/abdullahcxd" target="_blank">Abdullahcxd</a></p>
</div>
