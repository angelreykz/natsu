const { getRoomData } = require("../../database/roomManager");

module.exports = {
    name: "sala",
    aliases: ["amongus", "code"],
    description: "Exibe a sala ativa de Among Us marcando os membros.",
    category: "fun",
    groupOnly: true,

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;

        try {
            const room = getRoomData();

            if (!room || !room.code) {
                return await sock.sendMessage(chatId, {
                    text: "❌ Não há nenhuma sala aberta no momento."
                }, { quoted: msg });
            }

            const metadata = await sock.groupMetadata(chatId);
            const mentions = metadata.participants.map(p => p.id);
            const totalMembers = mentions.length;

            let textResponse = [
                "🎮 *CÓDIGO DA SALA* 🎮",
                "",
                `*${room.code.toUpperCase()}*`,
                "",
                `✅ Sala criada! ${totalMembers} membro(s) foi / foram notificado(s).`
            ];

            if (room.obs?.trim()) {
                textResponse.push("");
                textResponse.push(`📝 *Obs:* ${room.obs.trim()}`);
            }

            // Envia a mensagem marcando os membros em background
            await sock.sendMessage(chatId, {
                text: textResponse.join("\n"),
                mentions: mentions
            }, { quoted: msg });

            // Envia o código limpo separado para facilitar copiar no celular
            await sock.sendMessage(chatId, {
                text: room.code.toUpperCase()
            });

        } catch (err) {
            console.error("[ERRO SALA]", err);
            await sock.sendMessage(chatId, {
                text: "❌ Ocorreu um erro ao buscar a sala."
            }, { quoted: msg });
        }
    }
};
