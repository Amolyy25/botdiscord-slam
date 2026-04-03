import { Events, EmbedBuilder } from 'discord.js';

const GUILD_ID = process.env.GUILD_ID;
const CHAT = "1488889718690283673";
const ROLE = "1489682846137188513";
const TEXT = ".gg/Olympe";

export default {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        if (!newPresence.guild || newPresence.guild.id !== GUILD_ID) return;
        if (newPresence.user?.bot) return;

        const member = newPresence.member;
        if (!member) return;

        const oldStatus = oldPresence?.activities.find(a => a.type === 4)?.state?.toLowerCase() ?? '';
        const newStatus = newPresence?.activities.find(a => a.type === 4)?.state?.toLowerCase() ?? '';

        const textLower = TEXT.toLowerCase();
        const aLeLien = newStatus.includes(textLower);
        const avaisLeLien = oldStatus.includes(textLower);
        const aLeRole = member.roles.cache.has(ROLE);
    
        if (aLeLien && !avaisLeLien && !aLeRole) {
            try {
                await member.roles.add(ROLE);

                const channel = member.guild.channels.cache.get(CHAT);
                if (!channel) return;

                const embed = new EmbedBuilder()
                    .setDescription(`Un nouvel Élu des dieux nous a rejoint grâce à son statut ! ${member}`)
                    .setColor(0xffffff)
                    .setTimestamp()
                    .setFooter({ text: "Olympe" });
                
                await channel.send({ content: `🏺 ${member}`, embeds: [embed] });
            } catch (err) {
                console.error(`Erreur lors de l'ajout du rôle : ${err}`);
            }
        }

        if (!aLeLien && avaisLeLien && aLeRole) {
            try {
                await member.roles.remove(ROLE);

                const channel = member.guild.channels.cache.get(CHAT);
                if (!channel) return;

                const embed = new EmbedBuilder()
                    .setDescription(`Un Élu des dieux nous a quitté ! ${member}`)
                    .setColor(0xffffff)
                    .setTimestamp()
                    .setFooter({ text: "Olympe" });
                
                await channel.send({ content: `🏺 ${member}`, embeds: [embed] });
            } catch (err) {
                console.error(`Erreur lors du retrait du rôle : ${err}`);
            }
        }
    }
}