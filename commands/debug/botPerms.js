const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botperms')
        .setDescription('Displays bot permissions in the current channel'),

    async execute(interaction) {
        const member = await interaction.guild.members.cache.get(interaction.client.user.id);
        const channel = interaction.channel;

        if (!member || !channel) {
            return await interaction.reply('Unable to fetch bot or channel information.');
        }

        const botPermissionsInChannel = await channel.permissionsFor(member);
        
        await interaction.reply({
            content: `Bot permissions in the current channel: ${botPermissionsInChannel ? botPermissionsInChannel.toArray().join(', ') : 'N/A'}`,
            ephemeral: true,
        });
    },
};
