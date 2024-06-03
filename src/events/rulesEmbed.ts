import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export const createRulesEmbed = () => {
	const embed = new EmbedBuilder()
		.setTitle("Server Rules")
		.setDescription("> <:rules1:1247192890170544220> Click the button below to select the language of the rules document. Please read it carefully. **ALL** players need to read this, and if you don't, you might get banned soon.")
		.setColor(7667867)
		.setImage("https://zelthoriaismp.cloud/Bot/rules.png")
		.setThumbnail("https://zelthoriaismp.cloud/Bot/logo.png")
		.setFooter({ text: "Zelthoriai smp official rules" });

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setLabel("English")
			.setStyle(ButtonStyle.Link)
			.setURL("https://docs.google.com/document/d/13elIRSKLwOWwdNfzDQgf9_nGP8LjQK2oFPJCkYzjzFk/edit?usp=sharing")
			.setEmoji("🇺🇸"),
		new ButtonBuilder()
			.setLabel("Portuguese")
			.setStyle(ButtonStyle.Link)
			.setURL("https://docs.google.com/document/d/1TkEOFRmPhOToa8IfFK6xhDHWBRkaL-W25ODtUYD3ZPw/edit?usp=sharing")
			.setEmoji("🇧🇷"),
		new ButtonBuilder()
			.setLabel("Spanish")
			.setStyle(ButtonStyle.Link)
			.setURL("https://docs.google.com/document/d/17TA1GhV5zmI41YEM-aypiTOl4JF5hBwyic8APN3Gj78/edit?usp=sharing")
			.setEmoji("🇪🇸")
	);

	return { embed, row };
};
