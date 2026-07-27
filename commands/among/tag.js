const fs = require('fs');
const path = require('path');
const configBot = require('../../config');

module.exports = {
    nome: '/tag',
    alias: ['/vertag'],
    descricao: 'Exibe a tag oficial da comunidade para usar no nick',
    async executar(sock, remetente, args, msg) {
        const configPath = path.join(__dirname, '../../../database/config.json');
        const db = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        const resposta = 
`🏷️ *TAG OFICIAL DA COMUNIDADE* 🏷️

Copie e coloque o símbolo abaixo no seu nick do Among Us:

ㅤㅤㅤㅤㅤㅤㅤㅤㅤ
${db.tagComunidade}
ㅤㅤㅤㅤㅤㅤㅤㅤㅤ

💡 *Dica:* Mantenha a tag para ser reconhecido nas salas privadas!`;

        await sock.sendMessage(remetente, { text: resposta }, { quoted: msg });
    }
};
