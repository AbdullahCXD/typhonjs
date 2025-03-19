import loadCommands from "./loadCommands";

async function load() {

    const program = loadCommands("typhon");

    program.parse();

}

load();