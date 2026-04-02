import {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Affiche la banner d'un user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("L'utilisateur")
        .setRequired(true),
    ),

  async execute(interaction) {
    const member = interaction.member;

    const user = interaction.options.getUser("user");
    const fetchedUser = await user.fetch();
    const bannerUrl = fetchedUser.bannerURL({ size: 1024, extension: 'png', forceStatic: false});

    if (!bannerUrl) {
      return interaction.reply({
        content: `**${user.username}** n'a pas de bannière de profil.`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
    .setTitle(`Bannière de de ${user.username}`)
    .setImage(bannerUrl)
    .setColor(0xffffff)

    return interaction.reply({ embeds: [embed] });
  },
};

export const handleBannerCommand = async (message, args) => {
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

  const fetchedUser = await user.fetch();
    const bannerUrl = fetchedUser.bannerURL({ size: 1024, extension: 'png', forceStatic: false});

 const embed = new EmbedBuilder()
    .setTitle(`Bannière de ${user.username}`)
    .setImage(bannerUrl)
    .setColor(0xffffff)

  return message.reply({ embeds: [embed] });
};
