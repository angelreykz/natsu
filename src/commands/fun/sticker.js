const { downloadMedia, bufferToSticker } = require('../../utils/sticker');

module.exports = {
    name: "sticker",
    aliases: ["s", "fig", "figurinha"],
    description: "Converte imagens ou vídeos curtos em figurinha",
    category: "fun",

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;

        // Verifica se a mensagem ou a mensagem respondida contém imagem/vídeo
        const isImage = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        const isVideo = msg.message?.videoMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

        if (!isImage && !isVideo) {
            return await sock.sendMessage(chatId, { 
                text: "⚠️ Envie uma **imagem/vídeo** com a legenda `.sticker` ou **responda** a uma mídia usando o comando!" 
            }, { quoted: msg });
        }

        await sock.sendMessage(chatId, { text: "⏳ Criando sua figurinha..." }, { quoted: msg });

        try {
            let mediaBuffer;
            let mediaType;

            if (isImage) {
                const imageMsg = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
                mediaBuffer = await downloadMedia(imageMsg, 'image');
                mediaType = 'image';
            } else if (isVideo) {
                const videoMsg = msg.message?.videoMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
                
                // Limite de tempo do vídeo (ex: máximo 10s)
                if (videoMsg.seconds > 10) {
                    return await sock.sendMessage(chatId, { text: "❌ O vídeo precisa ter no máximo 10 segundos!" }, { quoted: msg });
                }

                mediaBuffer = await downloadMedia(videoMsg, 'video');
                mediaType = 'video';
            }

            // Converte para WebP
            const stickerBuffer = await bufferToSticker(mediaBuffer, mediaType === 'video');

            // Envia a figurinha no WhatsApp
            await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });

        } catch (error) {
            console.error("Erro ao gerar sticker:", error);
            await sock.sendMessage(chatId, { 
                text: "❌ Ocorreu um erro ao converter a mídia em figurinha." 
            }, { quoted: msg });
        }
    }
};
