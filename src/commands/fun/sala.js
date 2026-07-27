const { getRoomData } = require('../../database/roomManager');

module.exports = {
    name: "sala",
    aliases: ["amongus"],
    description: "Exibe a sala ativa de Among Us e notifica o grupo",
    category: "fun",
    groupOnly: true, // Garante que puxará a lista de participantes do grupo

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const room = getRoomData();

        // Caso não haja nenhuma sala cadastrada no JSON
        if (!room) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Não há nenhuma sala aberta no momento." 
            }, { quoted: msg });
        }

        // Puxa a lista de todos os participantes do grupo para a menção fantasma
        let groupParticipants = [];
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            groupParticipants = groupMetadata.participants.map(p => p.id);
        } catch (error) {
            console.error("Erro ao buscar participantes do grupo:", error);
        }

        // Montagem do texto do anúncio
        let roomText = `🎮 *Sala de Among Us*\n\n`;
        roomText += `🔑 *Código:* ${room.code}\n`;
        roomText += `👤 *Criada por:* ${room.author}\n`;
        roomText += `🕒 *Horário:* ${room.time}\n`;

        if (room.obs) {
            roomText += `\n📝 *Observação:*\n${room.obs}`;
        }

        // 1. Envia o anúncio com as menções invisíveis (passando a lista no array `mentions`)
        await sock.sendMessage(chatId, {
            text: roomText,
            mentions: groupParticipants
        }, { quoted: msg });

        // 2. Envia apenas o código em uma mensagem separada para facilitar copiar e colar
        await sock.sendMessage(chatId, { text: room.code });
    }
};
