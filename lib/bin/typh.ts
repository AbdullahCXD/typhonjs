import loadCommands from "./loadCommands";

async function load() {

    const program = loadCommands("typh");

    program.parse();

}

load();