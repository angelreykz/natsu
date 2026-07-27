const config = require('../../config');

module.exports = {
    name: "menu",
    description: "Exibe o menu de comandos do bot",
    category: "fun",

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;

        const menuText = `
🌸 *${config.botName.toUpperCase()}* 🌸
_Dono: ${config.ownerName}_

📌 *COMANDOS DISPONÍVEIS:*
• \`${config.prefix}menu\` - Exibe este menu
• \`${config.prefix}ping\` - Testa a resposta do bot
• \`${config.prefix}sticker\` - Cria figurinhas
• \`${config.prefix}ban\` - Bane um membro (Admin)
        `.trim();

        await sock.sendMessage(chatId, { text: menuText }, { quoted: msg });
    }
};
