module.exports = {
    name: "ban",
    description: "Bane um usuário do grupo",
    category: "admin",
    adminOnly: true,

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        
        // Verifica se é um grupo
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: "Este comando só pode ser usado em grupos!" }, { quoted: msg });
        }

        // Pega a pessoa mencionada
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!mentionedJid) {
            return await sock.sendMessage(chatId, { text: "Marque o usuário que deseja banir!" }, { quoted: msg });
        }

        await sock.groupParticipantsUpdate(chatId, [mentionedJid], "remove");
        await sock.sendMessage(chatId, { text: "🚫 Usuário removido com sucesso!" }, { quoted: msg });
    }
};

