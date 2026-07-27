module.exports = {
    name: "ping",
    aliases: ["p"],
    description: "Verifica se o bot está online",
    category: "system",

    async execute(sock, msg) {
        const start = Date.now();
        const chatId = msg.key.remoteJid;

        await sock.sendMessage(chatId, { text: "🏓 Pong!" }, { quoted: msg });
    }
};
