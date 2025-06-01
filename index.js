const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

const botToken = 'BOT_TOKEN';

const allowedUserIds = ['816685073897881600', '1239764064385634385'];

const targetServerId = '1323763018668052621';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

client.once('ready', () => {
  console.log(`Bot is ready`);
});

client.on('messageCreate', async (message) => {
  if (allowedUserIds.includes(message.author.id)) {
    if (message.content.toLowerCase() === '!join') {
      const guild = client.guilds.cache.get(targetServerId);
      if (!guild) {
        return;
      }

      const member = guild.members.cache.get(message.author.id);
      if (!member) {
        return;
      }

      if (member.voice.channel) {
        const voiceChannel = member.voice.channel;

        if (client.voice.adapters.get(voiceChannel.guild.id)) {
          const botChannel = voiceChannel.guild.me.voice.channel;
          if (botChannel && botChannel.id === voiceChannel.id) {
            return;
          }
        }

        try {
          const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
          });

          connection.on(VoiceConnectionStatus.Ready, () => {
            console.log(`Bot successfully joined the voice channel: ${voiceChannel.name}`);
          });

          connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log('Voice connection was disconnected');
            connection.destroy();
          });

        } catch (error) {
          console.error(`Failed to join the voice channel: ${error.message}`);
        }
      }
    }
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.member.id === client.user.id) {
    // Check if the bot was moved to another voice channel
    if (oldState.channelId && oldState.channelId !== newState.channelId) {
      console.log(`Bot moved from channel ${oldState.channel?.name} to ${newState.channel?.name}`);

      // Force the bot to stay in the new channel, even if moved
      const voiceChannel = newState.channel;
      if (voiceChannel) {
        joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: newState.guild.id,
          adapterCreator: newState.guild.voiceAdapterCreator,
        });
      }
    }
  }
});

client.login(botToken);
