const config = require('../../../config');

module.exports = {
    name: "setprefix",
    description: "Altera o prefixo dos comandos do bot",
    category: "system",
    ownerOnly: true, // Somente o Reykz (dono) pode alterar o prefixo geral

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        const newPrefix = args[0];

        if (!newPrefix) {
            return await sock.sendMessage(chatId, { 
                text: `⚠️ Por favor, informe o novo prefixo!\nExemplo: \`${config.prefix}setprefix !\`` 
            }, { quoted: msg });
        }

        if (newPrefix.length > 3) {
            return await sock.sendMessage(chatId, { 
                text: "❌ O prefixo não pode ter mais de 3 caracteres." 
            }, { quoted: msg });
        }

        const oldPrefix = config.prefix;
        config.prefix = newPrefix; // Atualiza em memória (depois você salva no banco de dados)

        await sock.sendMessage(chatId, { 
            text: `✅ Prefixo alterado de \`${oldPrefix}\` para \`${newPrefix}\` com sucesso!` 
        }, { quoted: msg });
    }
};
