const fs = require('fs');
const path = require('path');
const configBot = require('../../config');

module.exports = {
    nome: '/sala',
    alias: ['/ver-sala'],
    descricao: 'Exibe o código da sala atual cadastrada',
    async executar(sock, remetente, args, msg) {
        const configPath = path.join(__dirname, '../../../database/config.json');
        const db = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        if (db.codigoSala === 'NENHUMA' || db.codigoSala === 'Nenhum código definido') {
            await sock.sendMessage(remetente, { 
                text: `${configBot.emojis.aviso} Nenhuma sala foi aberta ainda! Use \`/addsala [código]\` para cadastrar.` 
            }, { quoted: msg });
            return;
        }

        let qtdMembrosText = '';
        if (remetente.endsWith('@g.us')) {
            const metadata = await sock.groupMetadata(remetente);
            const qtdMembros = metadata.participants.length;
            qtdMembrosText = `\n\n✅ *Sala criada!* ${qtdMembros} membro(s) foi / foram notificado(s).`;
        }

        const resposta = 
`🎮 *CÓDIGO DA SALA* 🎮

*${db.codigoSala}*
🌍 *Região:* ${db.regiaoSala}${qtdMembrosText}`;

        await sock.sendMessage(remetente, { text: resposta }, { quoted: msg });
    }
};
