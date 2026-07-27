const fs = require('fs');
const path = require('path');
const configBot = require('../../config');

module.exports = {
    nome: '/addsala',
    alias: ['/setsala'],
    descricao: 'Atualiza o código e região da sala no banco de dados',
    async executar(sock, remetente, args, msg) {
        const novoCodigo = args[0];
        const regiao = args[1] ? args[1].toUpperCase() : 'AMÉRICA';

        if (!novoCodigo) {
            await sock.sendMessage(remetente, { 
                text: `${configBot.emojis.erro} *Uso incorreto!* Informe o código da sala.\nExemplo: \`/addsala RPTBRG América\`` 
            }, { quoted: msg });
            return;
        }

        const configPath = path.join(__dirname, '../../../database/config.json');
        
        // Lê o arquivo do banco de dados
        let db = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        const codigoAntigo = db.codigoSala;
        db.codigoSala = novoCodigo.toUpperCase();
        db.regiaoSala = regiao;
        db.totalSalasCriadas = (db.totalSalasCriadas || 0) + 1;
        db.ultimaAtualizacao = new Date().toLocaleString('pt-BR');

        // Salva as alterações no arquivo config.json
        fs.writeFileSync(configPath, JSON.stringify(db, null, 2));

        // Descobre o nome do grupo se a mensagem veio de um grupo
        let nomeGrupo = 'Privado / Grupo';
        if (remetente.endsWith('@g.us')) {
            const metadata = await sock.groupMetadata(remetente);
            nomeGrupo = metadata.subject;
        }

        const resposta = 
`✅ *Código da sala atualizado!*

📋 *Grupo:* ${nomeGrupo}
🔄 *Alteração:* ${codigoAntigo} ➔ *${db.codigoSala}*
🌍 *Região:* ${db.regiaoSala}
📅 *Atualizado:* ${db.ultimaAtualizacao}`;

        await sock.sendMessage(remetente, { text: resposta }, { quoted: msg });
    }
};
              
