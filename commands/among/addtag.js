const fs = require('fs');
const path = require('path');
const configBot = require('../../config');

module.exports = {
    nome: '/addtag',
    alias: ['/settag'],
    descricao: 'Altera a tag oficial da comunidade no banco de dados',
    async executar(sock, remetente, args, msg) {
        const novaTag = args.join(' ');

        if (!novaTag) {
            await sock.sendMessage(remetente, { 
                text: `${configBot.emojis.erro} *Uso incorreto!* Informe a nova tag.\nExemplo: \`/addtag [NTS]\`` 
            }, { quoted: msg });
            return;
        }

        const configPath = path.join(__dirname, '../../../database/config.json');
        let db = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        const tagAntiga = db.tagComunidade;
        db.tagComunidade = novaTag;

        // Salva a alteração no arquivo JSON
        fs.writeFileSync(configPath, JSON.stringify(db, null, 2));

        const resposta = 
`✅ *Tag da comunidade atualizada!*

📋 *Alteração:* ${tagAntiga} ➔ *${db.tagComunidade}*
📅 *Atualizado:* ${new Date().toLocaleString('pt-BR')}`;

        await sock.sendMessage(remetente, { text: resposta }, { quoted: msg });
    }
};
