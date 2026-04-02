import {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("find")
    .setDescription("Chercher les infos d'un utilisateur")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("L'utilisateur à chercher")
        .setRequired(true),
    ),

  async execute(interaction) {
    const member = interaction.member;
    if (!member.roles.cache.has("1488889893957533917")) {
      return interaction.reply({
        content: `Cette commande nécessite minimum la perm <@&1488889893957533917>`,
        flags: MessageFlags.Ephemeral,
      });
    }

    const user = interaction.options.getUser("user");
    const guildMember = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const lastMessage = messages
      .filter((m) => m.author.id === user.id)
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
      .first();

    let voiceInfo = "Cette personne n'est pas en vocal.";
    if (guildMember?.voice?.channel) {
      voiceInfo = `<@${guildMember.id}> est dans ${guildMember.voice.channel.name}`;
    }

    const lastMessageText =
      lastMessage?.content && lastMessage.content.length > 0
        ? lastMessage.content
        : "*[embed/fichier]*";

    const finalEmbed = new EmbedBuilder().setColor(0xffffff).addFields(
      { name: "Vocal", value: voiceInfo },
      {
        name: "Dernier message (dans ce salon)",
        value: lastMessage
          ? `${lastMessageText}\n[Jump](${lastMessage.url})`
          : "Aucun message récent trouvé dans ce salon.",
      },
    );

    return interaction.reply({ embeds: [finalEmbed] });
  },
};

export const handleFindCommand = async (message, args) => {
  const query = args[0];
  if (!query) {
    const errorreply = new EmbedBuilder()
      .setColor(0xffffff)
      .setDescription(`***Tu dois préciser un id ou un @ à chercher***`);
    message.reply({ embeds: [errorreply] });
    return;
  }

  let user;

  if (message.mentions.users.size > 0) {
    user = message.mentions.users.first();
  } else if (/^\d{17,20}$/.test(query)) {
    try {
      user = await message.client.users.fetch(query);
    } catch {}
  }

  if (!user) {
    const noUser = new EmbedBuilder()
      .setColor(0xffffff)
      .setDescription(`***user ou id introuvée.***`);
    message.reply({ embeds: [noUser] });
    return;
  }

  const member = await message.guild.members.fetch(user.id).catch(() => null);

  const messages = await message.channel.messages.fetch({ limit: 100 });
  const lastMessage = messages
    .filter((m) => m.author.id === user.id)
    .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
    .first();

  let voiceInfo = "Cette personne n'est pas en vocal.";
  if (member && member.voice && member.voice.channel) {
    voiceInfo = `<@${member.id}> est dans ${member.voice.channel.name}`;
  }

  const lastMessageText =
    lastMessage?.content && lastMessage.content.length > 0
      ? lastMessage.content
      : "*[embed/fichier]*";

  const finalEmbed = new EmbedBuilder().setColor(0xffffff).addFields(
    { name: "Vocal", value: voiceInfo },
    {
      name: "Dernier message (dans ce salon)",
      value: lastMessage
        ? `${lastMessageText}\n[Jump](${lastMessage.url})`
        : "Aucun message récent trouvé dans ce salon.",
    },
  );
  return message.reply({ embeds: [finalEmbed] });
};
