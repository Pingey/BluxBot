const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot == true) return;
        const channelReactions = {
            '1209113484760064000': {
                //👍👎🤩😂😭😱�
                emojis: ['👍','👎','🤩','😂','😭','😱'],
                threadEmoji: '🔗',
            },
            'channel2_id': {
                emojis: ['emoji3', 'emoji4', 'emoji5'],
                threadEmoji: '🔗',
            },
            // if needed add more n stuff idk
        };

        const channelId = message.channel.id;
        const channelData = channelReactions[channelId];

        if (channelData) {
            const { emojis, threadEmoji } = channelData;

            for (const emoji of emojis) {
                await message.react(emoji);
            }

            await message.react(threadEmoji);
        }
    },
};