import readline from "readline";
import axios from "axios";
import { client as WebSocketClient, connection } from "websocket";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedBuilder, Message, ActivityType } from "discord.js";
import os from "os";
import { BaseEvent, ExtendedClient, SponsorType } from "../structure";

/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/

export default class ReadyEvent extends BaseEvent {
	private connected = false;

	constructor(client: ExtendedClient) {
		super(client);
	}

	public async execute() {
		if (!this.client.config.guildId) {
			console.log("⚠️⚠️⚠️ Please add the guild id in the config.jsonc file. ⚠️⚠️⚠️");
			process.exit(0);
		}

		await this.client.guilds.fetch(this.client.config.guildId);
		await this.client.guilds.cache.get(this.client.config.guildId)?.members.fetch();
		if (!this.client.guilds.cache.get(this.client.config.guildId)?.members.me?.permissions.has("Administrator")) {
			console.log("\n⚠️⚠️⚠️ I don't have the Administrator permission, to prevent any issues please add the Administrator permission to me. ⚠️⚠️⚠️");
			process.exit(0);
		}

		const embedMessageId = (await this.client.prisma.config.findUnique({
			where: {
				key: "openTicketMessageId",
			}
		}))?.value;
		await this.client.channels.fetch(this.client.config.openTicketChannelId).catch(() => {
			console.error("The channel to open tickets is not found!");
			process.exit(0);
		});
		const openTicketChannel = await this.client.channels.cache.get(this.client.config.openTicketChannelId);
		if (!openTicketChannel) {
			console.error("The channel to open tickets is not found!");
			process.exit(0);
		}

		if (!openTicketChannel.isTextBased()) {
			console.error("The channel to open tickets is not a text-based channel!");
			process.exit(0);
		}
		const locale = this.client.locales;
		let footer = locale.getSubValue("embeds", "openTicket", "footer", "text").replace("ticket.pm", "");
		footer = `${footer.trim() !== "" ? `- ${footer}` : ""}`;
		const embed = new EmbedBuilder({
			...locale.getSubRawValue("embeds.openTicket") as object,
			color: 0,
		})
			.setColor(
				locale.getNoErrorSubValue("embeds", "openTicket", "color") as ColorResolvable | undefined ??
				this.client.config.mainColor
			)
			.setThumbnail('https://zelthoriaismp.cloud/Bot/logo.png')
			.setImage('https://zelthoriaismp.cloud/Bot/ticket.png');

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId("openTicket").setLabel(this.client.locales.getSubValue("other", "openTicketButtonMSG")).setStyle(ButtonStyle.Secondary)
		);

		try {
			const msg = embedMessageId ? await (async () => new Promise<Message | undefined>((res) => {
				openTicketChannel?.messages?.fetch(embedMessageId)
					.then(msg => res(msg))
					.catch(() => res(undefined));
			}))() : undefined;

			if (msg && msg.id) {
				msg.edit({
					embeds: [embed],
					components: [row]
				});
			} else {
				const channel = this.client.channels.cache.get(this.client.config.openTicketChannelId);
				if (!channel || !channel.isTextBased()) return console.error("Invalid openTicketChannelId");
				channel.send({
					embeds: [embed],
					components: [row]
				}).then((rMsg) => {
					this.client.prisma.config.upsert({
						create: {
							key: "openTicketMessageId",
							value: rMsg.id
						},
						update: {
							value: rMsg.id
						},
						where: {
							key: "openTicketMessageId"
						}
					}).then();
				});
			}
		} catch (e) {
			console.error(e);
		}

		this.setStatus();
		setInterval(() => this.setStatus(), 9e5); // 15 minutes

		readline.cursorTo(process.stdout, 0);
		process.stdout.write(
			`\x1b[0m🚀  The bot is ready! Logged in as \x1b[37;46;1m${this.client.user?.tag}\x1b[0m (\x1b[37;46;1m${this.client.user?.id}\x1b[0m)
		\x1b[0m🌟  You can leave a star on GitHub: \x1b[37;46;1mhttps://github.com/Sayrix/ticket-bot \x1b[0m
		\x1b[0m⛅  Host your ticket-bot by being a sponsor from 1$/month: \x1b[37;46;1mhttps://github.com/sponsors/Sayrix \x1b[0m\n`.replace(/\t/g, "")
		);

		const a = await axios.get("https://raw.githubusercontent.com/Sayrix/sponsors/main/sponsors.json").catch(() => { return; });
		if (a) {
			const sponsors: SponsorType[] = a.data;
			const sponsorsList = sponsors
				.map((s) => `\x1b]8;;https://github.com/${s.sponsor.login}\x1b\\\x1b[1m${s.sponsor.login}\x1b]8;;\x1b\\\x1b[0m`)
				.join(", ");
			process.stdout.write(`\x1b[0m💖  Thanks to our sponsors: ${sponsorsList}\n`);
		}

		if ((await this.client.prisma.config.findUnique({
			where: {
				key: "firstStart",
			}
		})) === null) {
			await this.client.prisma.config.create({
				data: {
					key: "firstStart",
					value: "true",
				}
			});

			if (!this.client.config.minimalTracking) console.warn(`
				PRIVACY NOTICES
				-------------------------------
				Telemetry is current set to full and the following information are sent to the server anonymously:
				* Discord Bot's number of guilds & users
				* Current Source Version
				* NodeJS Version
				* OS Version
				* CPU version, name, core count, architecture, and model
				* Current Process up-time
				* System total ram and freed ram
				* Client name and id
				* Guild ID
				-------------------------------
				If you wish to minimize the information that are being sent, please set "minimalTracking" to true in the config
		`.replace(/\t/g, ""));
			else console.warn(`
				PRIVACY NOTICES
				-------------------------------
				Minimal tracking has been enabled; the following information are sent anonymously:
				* Current Source Version
				* NodeJS Version
				-------------------------------
		`.replace(/\t/g, ""));
		}

		this.connect(this.client.config.showWSLog);

		this.client.deployCommands();

		// Set the bot's presence
		this.client.user?.setPresence({
			activities: [{
				name: 'Zelhoriai SMP',
				type: ActivityType.Playing, 
				url: 'https://zelthoriaismp.cloud'
			}],
			status: 'online'
		});
	}


	private setStatus() {
		// Your setStatus implementation here
	}

	private connect(enableLog?: boolean): void {
		if (this.connected) return;
		const ws = new WebSocketClient();
		ws.on("connectFailed", (e) => {
			this.connected = false;
			setTimeout(() => this.connect(enableLog), Math.random() * 1e4);
			if (enableLog)
				console.log(`❌  WebSocket Error: ${e.toString()}`);
		});

		ws.on("connect", (connection) => {
			connection.on("error", (e) => {
				this.connected = false;
				setTimeout(() => this.connect(enableLog), Math.random() * 1e4);
				if (enableLog)
					console.log(`❌  WebSocket Error: ${e.toString()}`);
			});

			connection.on("close", (e) => {
				this.connected = false;
				setTimeout(() => this.connect(enableLog), Math.random() * 1e4);
				if (enableLog)
					console.log(`❌  WebSocket Error: ${e.toString()}`);
			});

			this.connected = true;
			if (enableLog)
				console.log("✅  Connected to WebSocket server.");
			this.telemetry(connection);

			setInterval(() => {
				this.telemetry(connection);
			}, 120_000);
		});

		ws.connect("wss://ws.ticket.pm");
	}

	private telemetry(connection: connection) {
		connection.sendUTF(JSON.stringify({
			source: {
				version: process.env.npm_package_version,
				node: process.version,
				os: os.version(),
				cpu: os.cpus()[0].model,
				arch: os.arch(),
				coreCount: os.cpus().length,
				totalRam: os.totalmem(),
				freeRam: os.freemem(),
				uptime: process.uptime(),
			},
			...this.client.config.minimalTracking ? {} : {
				bot: {
					clientName: this.client.user?.username,
					clientId: this.client.user?.id,
					guildsCount: this.client.guilds.cache.size,
					usersCount: this.client.users.cache.size,
				}
			}
		}));
	}
}
