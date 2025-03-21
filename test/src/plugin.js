/* Generated Typhon Plugin Product */

const { TyphonPlugin } = require("typhonjs");

class PluginProduct extends TyphonPlugin {

    load() {
        console.log("Loaded!");
    }

    onEvent(key, ...args) {
        if (key === "test") console.log("Recieved test event")
        return args;
    }

}

module.exports = PluginProduct;
