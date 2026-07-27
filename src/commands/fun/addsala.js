const { saveRoom } = require('../../database/roomManager');

module.exports = {
    name: "addsala",
    aliases: ["criarsala"],
    description: "Cadastra uma nova sala de Among Us",
    category: "fun",
    groupOnly: true,

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;

        if (args.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "⚠️ Uso incorreto! Exemplo: `.addsala RPTBRG` ou `.addsala RPTBRG Sala com mods`" 
            }, { quoted: msg });
        }

        const rawCode = args[0];
        
        // Validação: precisa conter exatamente 6 letras
        if (!/^[a-zA-Z]{6}$/.test(rawCode)) {
            return await sock.sendMessage(chatId, { 
                text: "❌ O código da sala deve conter **exatamente 6 letras** (sem números ou caracteres especiais)." 
            }, { quoted: msg });
        }

        const obs = args.slice(1).join(" ");
        const authorName = msg.pushName || "Jogador";

        // Salva a nova sala e pega os dados antigos (se houver)
        const room = saveRoom(rawCode, authorName, obs);

        // Busca dados do grupo
        const groupMetadata = await sock.groupMetadata(chatId);
        const groupName = groupMetadata.subject;

        // Formata data e hora atual no padrão BR
        const now = new Date();
        const formattedDate = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        const previousCode = room.previousCode || "NENHUMA";

        const textResponse = [
            "✅ *Código da sala atualizado!*",
            "",
            `📋 *Grupo:* ${groupName}`,
            `🔄 *Alteração:* ${previousCode} → *${room.code.toUpperCase()}*`,
            `📅 *Atualizado:* ${formattedDate}`
        ].join("\n");

        await sock.sendMessage(chatId, { text: textResponse }, { quoted: msg });
    }
};
