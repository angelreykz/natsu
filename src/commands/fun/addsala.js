const { saveRoom } = require('../../database/roomManager');

module.exports = {
    name: "addsala",
    aliases: ["criarsala"],
    description: "Cadastra uma nova sala de Among Us",
    category: "fun",

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;

        if (args.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "⚠️ Uso incorreto! Exemplo: `.addsala ABCDEF` ou `.addsala ABCDEF Sala com mods TOR`" 
            }, { quoted: msg });
        }

        const rawCode = args[0];
        
        // Validação: precisa conter exatamente 6 letras
        if (!/^[a-zA-Z]{6}$/.test(rawCode)) {
            return await sock.sendMessage(chatId, { 
                text: "❌ O código da sala deve conter **exatamente 6 letras** (sem números ou caracteres especiais)." 
            }, { quoted: msg });
        }

        // Pega a observação (se houver) unindo o restante dos argumentos
        const obs = args.slice(1).join(" ");
        const authorName = msg.pushName || "Jogador";

        // Salva a nova sala (substituindo qualquer existente)
        const room = saveRoom(rawCode, authorName, obs);

        await sock.sendMessage(chatId, { 
            text: `✅ Sala **${room.code}** cadastrada com sucesso por ${room.author}!` 
        }, { quoted: msg });
    }
};
