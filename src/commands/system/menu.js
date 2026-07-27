const config = require('../../../config');

module.exports = {
    name: "menu",
    aliases: ["help", "ajuda"],
    description: "Exibe o menu de comandos do bot",
    category: "system",

    async execute(sock, msg, args, { commands }) {
        const chatId = msg.key.remoteJid;

        // Agrupa comandos por categoria
        const categories = {};
        commands.forEach((cmd) => {
            const cat = cmd.category || "Outros";
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd.name);
        });

        let menuText = `🌸 *${config.botName.toUpperCase()}* 🌸\n`;
        menuText += `👑 *Dono:* ${config.ownerName}\n`;
        menuText += `📌 *Prefixo:* \`${config.prefix}\`\n\n`;

        for (const [category, cmds] of Object.entries(categories)) {
            menuText += `*=== [ ${category.toUpperCase()} ] ===*\n`;
            menuText += cmds.map(c => `• \`${config.prefix}${c}\``).join("\n") + "\n\n";
        }

        await sock.sendMessage(chatId, { text: menuText.trim() }, { quoted: msg });
    }
};
