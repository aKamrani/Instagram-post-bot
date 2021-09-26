#!/usr/bin/env node

const chalk = require("chalk");
const boxen = require("boxen");
const yargs = require("yargs");
const bot = require("./runner");

// message box
const greeting = chalk.white.bold("• Instagram Post Publisher Bot •");
const boxenOptions = {
 padding: 1,
 margin: 1,
 borderStyle: "round",
 borderColor: "#FCAF45",
 backgroundColor: "#E1306C"
};
const msgBox = boxen( greeting, boxenOptions );
console.log(msgBox);

// command detector
const options = yargs
 .usage("Usage: <media_path> -c <caption> -u <user> -p <password> -f <bool>")
 .option("_", { describe: "relative path to picture/video to publsih", type: "string", demandOption: true }).demandCommand(0)
 .option("c", { alias: "caption", describe: "caption message (use /n for newline)       [optional]", type: "string", demandOption: false })
 .option("u", { alias: "username", describe: "username", type: "string", demandOption: true })
 .option("p", { alias: "password", describe: "password", type: "string", demandOption: true })
 .option("f", { alias: "fit", describe: "to fit picture or not                               [optional]", default:false, type: "boolean", demandOption: false })
 .argv;

const path = `${options._}`;
const caption = `${options.caption}`;
const username = `${options.username}`;
const password = `${options.password}`;
const fit = `${options.fit}`;

if ( !path || !username || !password ) {
    console.log('Error - please set attribute correctly');
    return;
}

// call main runner
console.log('PLease be patient. its Running...');
bot.run(path, caption, username, password, fit);
