import {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("supprime un nombre de message")
    .addIntegerOption((option) =>
      option
        .setName("nombre")
        .setDescription("Le nombre de message à supprimer")
        .setRequired(true)
        .setMaxValue(100)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),


  async execute(interaction) {
    const nombre = interaction.options.getInteger("nombre");
    await interaction.channel.bulkDelete(nombre, true); 

    const embed = new EmbedBuilder()
      .setTitle(`${nombre} message(s) supprimé(s)`)
      .setColor(0xffffff);

    await interaction.reply({ embeds: [embed] });
    
    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, 3000);
  },
};

export const handleClearCommand = async (message, args) => {
  const amount = parseInt(args[0]);

  if (isNaN(amount) || amount < 1 || amount > 100) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("Format invalide")
      .setDescription("Veuillez spécifier un nombre entre 1 et 100.")
      .setColor(0xff0000);
    const errorMsg = await message.reply({ embeds: [errorEmbed] });
    setTimeout(() => errorMsg.delete().catch(() => {}), 3000);
    return;
  }

  const messages = await message.channel.bulkDelete(amount, true); 

  const embed = new EmbedBuilder()
    .setTitle(`${messages.size} message(s) supprimé(s)`)
    .setColor(0xffffff);

  const sentMessage = await message.channel.send({ embeds: [embed] });

  setTimeout(() => {
    sentMessage.delete().catch(() => {});
  }, 3000);
};
