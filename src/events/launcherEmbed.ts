import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export const createlauncherEmbed = () => {
	const embed = new EmbedBuilder()
		.setTitle("Server Launcher")
		.setDescription("> <:Icon_copiaecola:1159978082715840543>  Zelthoriai SMP uses an **exclusive launcher** that automatically installs the modpack on your computer. To install our launcher, **click the button below.**\n\n> <:warn:1247214745229197313> A Windows SmartScreen warning may appear on your computer, **but don't worry.**\n\n> <:code:1247214743752671262> This is because we do not have a purchased Microsoft Store license. Our launcher is **100% virus-free and open source.**")
		.setColor(7667867)
		.setImage("https://zelthoriaismp.cloud/Bot/launcher.png")
		.setThumbnail("https://zelthoriaismp.cloud/Bot/logo.png")
		.setFooter({ text: "Zelthoriai smp launcher" });

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setLabel("Dowload")
			.setStyle(ButtonStyle.Link)
			.setURL("https://hastastudios.zelthoriaismp.cloud")
			.setEmoji("<:download:1247217058710814770>")
	);

	return { embed, row };
};
