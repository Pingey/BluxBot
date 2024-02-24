const { Events, Constants } = require('discord.js');
const CharacterAI = require('node_characterai');

const characterAI = new CharacterAI();

characterAI.puppeteerProtocolTimeout = 60000

const cooldowns = new Map();
const cooldownTime = 5000;
const targetChannelId = '1209151107260219432'

function retryAuthenticateWithToken(token, maxRetries,client) {
    let retries = 0;

    async function authenticate() {
        try {
            await characterAI.authenticateWithToken(token);
            console.log("Authentication successful!");

            const targetChannel = client.channels.cache.get(targetChannelId);
            
            if (targetChannel) {
                //targetChannel.send("hi, i am Blux Boy from Blockate co. i love being blux boy,,,,")
            } else {
                console.error(`Target channel with ID ${targetChannelId} is not a TextChannel.`);
            }
        } catch (error) {
            console.error("Error during authentication:", error.message);

            if (retries < maxRetries) {
                console.log(`Retrying authentication in 4 seconds (retry ${retries + 1}/${maxRetries})...`);
                setTimeout(authenticate, 4000);
                retries++;
            } else {
                console.error(`Authentication failed after ${maxRetries} retries. Exiting...`);
                process.exit(1);
            }
        }
    };

    authenticate();
}

module.exports = {
    name: Events.MessageCreate,
    init(client) {
        const sessionToken = process.env.CAITOKEN;
        retryAuthenticateWithToken(sessionToken, 5,client);
    
    },
    async execute(message) {
        if (message.content.trim() == '' || message.channel.id !== targetChannelId || message.author.bot == true) {
            return;
        }

        let userMessage = `${message.author.displayName} (@${message.author.username}) says: ${message.content}`;
        console.log(userMessage)
        await message.channel.sendTyping();

        if (cooldowns.has(message.guild.id)) {
            const lastTimestamp = cooldowns.get(message.guild.id);
            if (Date.now() - lastTimestamp < cooldownTime) {
                await message.reply("(Calm down with the chatting...)")

                return;
            }
        }
        

        const repliedToMessage = message.reference ? await message.channel.messages.fetch(message.reference.messageId) : null;
        let replyText = "Reply to: ";
        
        if (repliedToMessage) {
            let repliedUser = repliedToMessage.author;
            if (repliedUser == message.client.user) {
                repliedUser = {
                    displayName: "Blux Boy",
                    username: "bluxboy"
                }
            }
            replyText += `${repliedUser.displayName} (@${repliedUser.username}) said: ${repliedToMessage.content}`;
        } else {
            replyText += "Unknown User said: Unknown Message";
        }
        
        if (message.type === 19 && message.reference) {
            userMessage = `(${replyText})\n${userMessage}`
        }

        userMessage = userMessage.replace(/<@!?\d+>/g, (match) => {
            const userId = match.replace(/<@!?(\d+)>/, '$1');
            const mentionedUser = message.guild.members.cache.get(userId);
            if (mentionedUser && mentionedUser.id === message.client.user.id) {
                return `@bluxboy`;
            }
            return `@${mentionedUser ? mentionedUser.username : 'unknown user'}`;
        });


        cooldowns.set(message.guild.id, Date.now());


        const characterId = "iRitvfX5isDwlLLXtldNGFRKOxLNd9ZSUt0_3EtSy40";

        await message.channel.sendTyping();

        const chat = await characterAI.createOrContinueChat(characterId);

        await message.channel.sendTyping()

        try {
            const response = await chat.sendAndAwaitResponse(userMessage, true);

            await message.channel.sendTyping();
            console.log(`Blux Boy (@BluxBoy) says: ${response.text}`)
            await message.reply(response.text);
            
            cooldowns.set(message.guild.id, Date.now());
        } catch (error) {
            console.error("Error processing Character AI response:", error);
            await message.reply("An error occurred while processing the request. Please try again later.");
        }
    },
};
