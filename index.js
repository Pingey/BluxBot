console.log("I just started! Spawning the client...");
require('dotenv').config()
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { TOKEN } = process.env

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages,GatewayIntentBits.GuildMessageReactions] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
console.log(" ")
console.log("Loading commands...");
console.log(" ")
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        console.log(`loading command ${file}`);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            console.log(`loaded command ${file}`);
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
console.log(" ")
console.log("finished loading all commands")
console.log(" ")
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
console.log("Loading event files...");
console.log(" ")
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    console.log(`loading event ${file}`);
    const event = require(filePath);

    if (event.init && typeof event.init === 'function') {
        event.init(client); 
    }

    if (event.once) {
        console.log(`loaded event ${file}`);
        client.once(event.name, (...args) => {
            try {
                event.execute(...args);
            } catch (error) {
                console.error(`Error in ${event.name} event execution: ${error.message}`);
            }
        });
    } else {
        console.log(`loaded event ${file}`);
        client.on(event.name, (...args) => {
            try {
                event.execute(...args);
            } catch (error) {
                console.error(`Error in ${event.name} event execution: ${error.message}`);
            }
        });
    }
}

console.log(" ")
console.log("finished loading all events")
console.log(" ")

console.log("all finished, im logging in...");
client.login(TOKEN);