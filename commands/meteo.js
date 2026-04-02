import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import axios from 'axios';

const weatherIcons = {
  Thunderstorm: '⛈️',
  Drizzle:      '🌦️',
  Rain:         '🌧️',
  Snow:         '❄️',
  Clear:        '☀️',
  Clouds:       '☁️',
  Mist:         '🌫️',
  Fog:          '🌫️',
  Haze:         '🌫️',
};

export default {
    data: new SlashCommandBuilder()
    .setName('meteo')
    .setDescription("Savoir la méteo en fonction d'une ville")
    .addStringOption(option => option.setName('ville').setDescription("Nom de la ville (Paris etc...)").setRequired(true)),
    async execute(interaction) {
        const ville = interaction.options.getString('ville');
        const APIKEY = process.env.APIKEY_METEO

        await interaction.deferReply();

        try {
            const {data} = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
                params: {
                    q: ville,
                    appid: APIKEY,
                    units: 'metric',
                    lang: 'fr',
                }
            });

            const condition = data.weather[0].main;
            const icon = weatherIcons[condition] ?? '🌡️'

            const embed = new EmbedBuilder()
            .setTitle(`${icon} Méteo à ${data.name}, ${data.sys.country}`)
            .setColor(0xffffff)
            .addFields(
          { name: '🌡️ Température',  value: `${Math.round(data.main.temp)}°C (ressenti ${Math.round(data.main.feels_like)}°C)`, inline: true },
          { name: '💧 Humidité',     value: `${data.main.humidity}%`,          inline: true },
          { name: '💨 Vent',         value: `${Math.round(data.wind.speed * 3.6)} km/h`, inline: true },
          { name: '☁️ Ciel',         value: data.weather[0].description,        inline: true },
          { name: '👁️ Visibilité',   value: `${(data.visibility / 1000).toFixed(1)} km`, inline: true },
          { name: '📊 Pression',     value: `${data.main.pressure} hPa`,        inline: true },
        )
        .setThumbnail(`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)

        await interaction.editReply({ embeds: [embed]})
        } catch (error) {
             const introuvable = error.response?.status === 404;
      await interaction.editReply({
        content: introuvable
          ? `❌ Ville **${ville}** introuvable. Vérifie l'orthographe !`
          : '❌ Erreur lors de la récupération de la météo, réessaie plus tard.',
      });
        }
    }
}