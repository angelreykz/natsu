const config = require('../../config');

module.exports = {
    name: "info",
    description: "Exibe informações gerais sobre a Natsukashii",
    category: "system",

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;

        const infoText = `
🤖 *${config.botName}*
👑 *Criador:* ${config.ownerName}
⚙️ *Linguagem:* Node.js
📦 *Biblioteca:* Baileys
📌 *Prefixo Atual:* \`${config.prefix}\`

_Um bot focado em moderação, diversão e no futuro, um sistema incrível de RPG!_
        `.trim();

        await sock.sendMessage(chatId, { text: infoText }, { quoted: msg });
    }
};
