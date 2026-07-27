module.exports = {
    name: "sticker",
    description: "Converte imagem/vídeo em figurinha (suporte a figurinhas será finalizado com ffmpeg)",
    category: "fun",
    adminOnly: false,

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        
        // Estrutura pronta para receber a lógica do FFMPEG depois
        await sock.sendMessage(chatId, { text: "🖼️ Envie uma imagem com a legenda .sticker para transformar em figurinha!" }, { quoted: msg });
    }
};
