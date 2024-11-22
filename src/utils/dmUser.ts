import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ButtonInteraction,
    CommandInteraction,
} from "discord.js";
import { ExtendedClient } from "../structure"; 

export async function dmUser(interaction: ButtonInteraction | CommandInteraction, client: ExtendedClient) {
    const ticket = await client.prisma.tickets.findUnique({
        where: {
            channelid: interaction.channel?.id
        }
    });

    if (!ticket) {
        return interaction.reply({ content: "Ticket Not Found.", ephemeral: true }).catch((e) => console.log(e));
    }

    const creatorId = ticket.creator;

    try {
        const creator = await client.users.fetch(creatorId);

        const embed = new EmbedBuilder()
            .setTitle("<:warn:1309304254091100220> Ticker Reminder!")
            .setDescription(`> This is a friendly reminder to please respond to your ticket at <#${interaction.channel?.id}>.`)
            .setColor(client.config.mainColor)
            .setThumbnail('https://hastastudios.com.br/Bot/hstudios.png')
			.setImage('https://hastastudios.com.br/Bot/ticket.png')
            .setFooter({ 
            text: "Please access your ticket as soon as possible.",
            iconURL: ('https://hastastudios.com.br/Bot/hstudios.png')

            });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel("Jump to ticket")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${interaction.guild?.id}/${interaction.channel?.id}`)
        );

        await creator.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: "Message successfully sent to the user!", ephemeral: true });
    } catch (error) {
        console.log(error);
        return interaction.reply({ content: "User not found :/", ephemeral: true });
    }
}
