module.exports = {
    name: "kick",
    aliases: ["remover", "ban"],
    description: "Remove um participante do grupo",
    category: "admin",
    groupOnly: true,
    adminOnly: true,

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;

        // Pega o usuário marcado (@usuario) ou respondido
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                             msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!mentionedJid) {
            return await sock.sendMessage(chatId, { 
                text: "⚠️ Marque a pessoa ou responda a mensagem de quem você deseja remover." 
            }, { quoted: msg });
        }

        try {
            await sock.groupParticipantsUpdate(chatId, [mentionedJid], "remove");
            await sock.sendMessage(chatId, { text: "👢 Usuário removido do grupo." }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(chatId, { text: "❌ Ocorreu um erro. Verifique se o bot é administrador do grupo." }, { quoted: msg });
        }
    }
};
