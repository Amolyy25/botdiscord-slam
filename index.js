import dotenv from "dotenv";
dotenv.config();
import fs from "node:fs";
import path from "node:path";
import {
  Client,
  Collection,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import { fileURLToPath } from "node:url";
import { handleFindCommand } from "./commands/find.js";
import { handleMembersCommand } from "./commands/members.js";
import { handlePicCommand } from "./commands/pic.js";
import { handleBannerCommand } from "./commands/banner.js";
import { handleClearCommand } from "./commands/clear.js";
import { ActivityType } from "discord.js";

const TOKEN = process.env.TOKEN;
const PREFIX = process.env.PREFIX || "=";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, "counters.json");

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return { guilds: {} };
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

const countersConfig = loadConfig();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLocaleLowerCase();

  if (commandName === "find") {
    const member = message.member;
    if (!member.roles.cache.has("1488889893957533917")) {
      const errorreply = new EmbedBuilder()
        .setColor(0xffffff)
        .setDescription(
          `***Cette commande nécessite minimum la perm <@&1488889893957533917>***`,
        );
      message.reply({ embeds: [errorreply] });
      return;
    }
    await handleFindCommand(message, args);
    return;
  }
  if (commandName === "members") {
    const member = message.member;
    if (!member.roles.cache.has("1488889893957533917")) {
      const errorreply = new EmbedBuilder()
        .setColor(0xffffff)
        .setDescription(
          `***Cette commande nécessite minimum la perm <@&1488889893957533917>***`,
        );
      message.reply({ embeds: [errorreply] });
      return;
    }
    await handleMembersCommand(message);
    return;
  }
  if (commandName === "clear") {
    const member = message.member;
    if (!member.roles.cache.has("1488889893957533917")) {
      const errorreply = new EmbedBuilder()
        .setColor(0xffffff)
        .setDescription(
          `***Cette commande nécessite minimum la perm <@&1488889893957533917>***`,
        );
      message.reply({ embeds: [errorreply] });
      return;
    }
    await handleClearCommand(message, args);
    return;
  }
  if (commandName === "pic") {
    const member = message.member;
    await handlePicCommand(message, args);
    return;
  }
   if (commandName === "banner") {
    const member = message.member;
    await handleBannerCommand(message, args);
    return;
  }
});

client.countersConfig = countersConfig;
client.saveCountersConfig = () => saveConfig(client.countersConfig);

client.setGuildCounter = (guild, field, value) =>
  setGuildCounter(guild, field, value);

client.once(Events.ClientReady, (readyClient) => {
  client.user.setActivity('.gg/Olympe', { type: ActivityType.Streaming, url: 'https://twitch.tv/Olympe' });
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

async function updateCountersForGuild(guild) {
  const counters = getGuildCounters(guild);

  if (counters.memberCounterChannelId) {
    const channel = guild.channels.cache.get(counters.memberCounterChannelId);
    if (channel) {
      const members = guild.memberCount;
      await channel.setName(`│🚀・Membres : ${members}`);
    }
  }

  if (counters.vocalCounterChannelId) {
    const channel = guild.channels.cache.get(counters.vocalCounterChannelId);
    if (channel) {
      const voiceChannels = guild.channels.cache.filter((c) =>
        c.isVoiceBased(),
      );
      let total = 0;
      for (const c of voiceChannels.values()) {
        total += c.members.size;
      }
      await channel.setName(`│🔈・Vocal : ${total}`);
    }
  }
  if (counters.boostCounterChannelId) {
    const boostChannel = guild.channels.cache.get(
      counters.boostCounterChannelId,
    );
    if (boostChannel) {
      const boosts = guild.premiumSubscriptionCount ?? 0;
      await boostChannel.setName(`│🔮・Boosts : ${boosts}`);
    }
  }
}

setInterval(
  async () => {
    try {
      for (const guild of client.guilds.cache.values()) {
        await updateCountersForGuild(guild);
      }
    } catch (err) {
      console.error(`Erreur : ${err}`);
    }
  },
  2 * 60 * 1000,
);

function getGuildCounters(guild) {
  const guildId = guild.id;
  const all = client.countersConfig.guilds || {};
  return all[guildId] || {};
}

const setGuildCounter = (guild, field, value) => {
  const guildId = guild.id;
  if (!client.countersConfig.guilds) {
    client.countersConfig.guilds = {};
  }
  if (!client.countersConfig.guilds[guildId]) {
    client.countersConfig.guilds[guildId] = {};
  }
  client.countersConfig.guilds[guildId][field] = value;
  client.saveCountersConfig();
};

client.commands = new Collection();

// Chargement dynamique des commandes depuis le dossier "commands"
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

console.log(`FOLDER : ${commandsPath}`);
console.log(`COMMAND FILES : ${commandFiles}`);

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const imported = await import(filePath);
  const command = imported.default ?? imported;

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`Attention, commande invalide : ${filePath}`);
  }
}

// Gestion générique des interactions (slash commands)
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
    return;
  }
});

// Chargement dynamique des events depuis le dossier "events"
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const imported = await import(filePath);
    const event = imported.default ?? imported;

    if (!event || !event.name || !event.execute) {
      console.log(`Attention, event invalide : ${filePath}`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

client.login(TOKEN);
