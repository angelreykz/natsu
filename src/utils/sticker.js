const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Baixa o buffer da mídia da mensagem
 */
async function downloadMedia(message, type) {
    const stream = await downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

/**
 * Converte Buffer de Imagem/Vídeo para Buffer WebP (Sticker)
 */
function bufferToSticker(buffer, isVideo = false) {
    return new Promise((resolve, reject) => {
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `input_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`);
        const outputPath = path.join(tmpDir, `output_${Date.now()}.webp`);

        fs.writeFileSync(inputPath, buffer);

        let command = ffmpeg(inputPath);

        if (isVideo) {
            command = command
                .inputOptions(['-y', '-t', '10']) // Limita vídeos a 10 segundos
                .outputOptions([
                    '-vcodec libwebp',
                    '-vf scale=512:512:force_original_aspect_ratio=increase,fps=15,crop=512:512',
                    '-loop 0',
                    '-preset default',
                    '-an',
                    '-vsync 0'
                ]);
        } else {
            command = command
                .outputOptions([
                    '-vcodec libwebp',
                    '-vf scale=512:512:force_original_aspect_ratio=increase,crop=512:512',
                    '-preset default'
                ]);
        }

        command
            .toFormat('webp')
            .save(outputPath)
            .on('end', () => {
                const webpBuffer = fs.readFileSync(outputPath);
                // Limpeza dos arquivos temporários
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                resolve(webpBuffer);
            })
            .on('error', (err) => {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                reject(err);
            });
    });
}

module.exports = { downloadMedia, bufferToSticker };
      
