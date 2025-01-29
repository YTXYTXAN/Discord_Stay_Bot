const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

const botToken = 'MTMzMzc4NjM5NTA0MjUxNzAxMg.G6AIeZ.fG7lnPc64bDAzB2o_aVjGYqFPGsVuQw4upA9iQ'; // Replace this with your bot's actual token

const allowedUserIds = ['816685073897881600'];

const targetServerId = '1310280950206435338';

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

  // Set the activity in Arabic as soon as the bot is ready
  client.user.setActivity({
    name: "Abo Khalid on Top",
    type: ActivityType.Streaming,
    url: "https://www.twitch.tv/tolkin",
  });
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

      // Make sure the bot is connected to the new voice channel
      const voiceChannel = newState.channel;
      if (voiceChannel) {
        // Disconnect from the old channel if needed
        const oldConnection = client.voice.adapters.get(oldState.guild.id);
        if (oldConnection) {
          oldConnection.destroy();
        }

        // Join the new channel
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
