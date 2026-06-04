import {SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder} from "discord.js";
import boost from "./boost.js";


export async function handleRenewCommand(message) {
    const channel = message.channel;
    const member = message.member;

    const snapshot = {
        name: channel.name,
        type: channel.type,
        topic: channel.topic ?? null,
        nsfw: channel.nsfw ?? false,
        rateLimitPerUser: channel.rateLimitPerUser ?? 0,
        position: channel.position,
        parent: channel.parentId,
        permissionOverwrites: channel.permissionOverwrites.cache.map(o => ({
            id: o.id,
            type: o.type,
            allow: o.allow.bitfield.toString(),
            deny: o.deny.bitfield.toString(),
        })),
    };

    await channel.delete(`Channel renew par ${member.user.tag}`);

    const newChannel = await message.guild.channels.create({
        name: snapshot.name,
        type: snapshot.type,
        topic: snapshot.topic,
        nsfw: snapshot.nsfw,
        rateLimitPerUser: snapshot.rateLimitPerUser,
        position: snapshot.position,
        parent: snapshot.parent,
        permissionOverwrites: snapshot.permissionOverwrites.map(o => ({
            id: o.id,
            type: o.type,
            allow: BigInt(o.allow),
            deny: BigInt(o.deny),
        })),
    });

    const succesEmbed = new EmbedBuilder()
        .setColor(0xffffff)
        .setDescription(`Channel renew`)
    await newChannel.send({content: `<@${member.id}>`, embeds: [succesEmbed] });
}

const renew = {
    data: new SlashCommandBuilder()
        .setName('renew')
        .setDescription('Recrée un channel cible')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
    const channel = interaction.channel;
    const member = interaction.member;
        const snapshot = {
            name: channel.name,
            type: channel.type,
            topic: channel.topic ?? null,
            nsfw: channel.nsfw ?? false,
            rateLimitPerUser: channel.rateLimitPerUser ?? 0,
            position: channel.position,
            parent: channel.parentId,
            permissionOverwrites: channel.permissionOverwrites.cache.map(overwrite => ({
                id: overwrite.id,
                type: overwrite.type,
                allow: overwrite.allow.bitfield.toString(),
                deny: overwrite.deny.bitfield.toString(),
            })),
        };

        await interaction.deferReply({ephemeral: true});

        await channel.delete(`Channel renew par ${interaction.member.user.tag}`);

        const newChannel = await interaction.guild.channels.create({
            name: snapshot.name,
            type: snapshot.type,
            topic: snapshot.topic,
            nsfw: snapshot.nsfw,
            rateLimitPerUser: snapshot.rateLimitPerUser,
            position: snapshot.position,
            parent: snapshot.parent,
            permissionOverwrites: snapshot.permissionOverwrites.map(o => ({
                id: o.id,
                type: o.type,
                allow: BigInt(o.allow),
                deny: BigInt(o.deny),
            })),
        });

        const succesEmbed = new EmbedBuilder()
            .setColor(0xffffff)
            .setDescription(`Channel renew`)
        await newChannel.send({content: `<@${member.id}>`, embeds: [succesEmbed] });

        try {
            await interaction.followUp({ content: `✅ Channel recréé : ${newChannel}`, ephemeral: true });
        } catch {
            // L'interaction a expiré si trop lent — la confirmation dans le channel suffit
        }
    }
}

export default renew;
