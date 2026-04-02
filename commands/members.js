import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

async function replyMemberCount(guild, reply) {
  await guild.members.fetch();
  const count = guild.memberCount;
  const memberEmbed = new EmbedBuilder()
    .setColor(0xffffff)
    .setDescription(`**Il y a actuellement ${count} membres**`);
  await reply({ embeds: [memberEmbed] });
}

export default {
  data: new SlashCommandBuilder()
    .setName("members")
    .setDescription("Avoir la liste de membres"),
  async execute(interaction) {
    await replyMemberCount(interaction.guild, (opts) =>
      interaction.reply(opts),
    );
  },
};

export async function handleMembersCommand(message) {
  await replyMemberCount(message.guild, (opts) => message.reply(opts));
}
