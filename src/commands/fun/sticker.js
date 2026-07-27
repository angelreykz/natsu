module.exports = {
    name: "sticker",
    aliases: ["s", "fig", "figurinha"],
    description: "Instruções para criação de figurinhas",
    category: "fun",

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        
        await sock.sendMessage(chatId, { 
            text: "🖼️ Envie uma imagem com a legenda `.sticker` (ou responda a uma imagem com `.sticker`) para gerar sua figurinha!" 
        }, { quoted: msg });
    }
};
