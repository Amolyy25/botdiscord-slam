import {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("pic")
    .setDescription("Affiche la pp d'un user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("L'utilisateur")
        .setRequired(true),
    ),

  async execute(interaction) {
    const member = interaction.member;

    const user = interaction.options.getUser("user");
    const avatarUrl = user.displayAvatarURL({ size: 1024, extension: 'png', forceStatic: false});

    const embed = new EmbedBuilder()
    .setTitle(`Photo de profil de ${user.username}`)
    .setImage(avatarUrl)
    .setColor(0xffffff)

    return interaction.reply({ embeds: [embed] });
  },
};

export const handlePicCommand = async (message, args) => {
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

  const avatarUrl = user.displayAvatarURL({ size: 1024, extension: 'png', forceStatic: false});

 const embed = new EmbedBuilder()
    .setTitle(`Photo de profil de ${user.username}`)
    .setImage(avatarUrl)
    .setColor(0xffffff)

  return message.reply({ embeds: [embed] });
};
