const fs = require('fs');
const path = path = require('path');
const configBot = require('../../config');

module.exports = {
    nome: '/antilink',
    alias: ['/anti-link'],
    descricao: 'Ativa ou desativa o sistema de proteção contra links',
    async executar(sock, remetente, args, msg) {
        if (!remetente.endsWith('@g.us')) {
            await sock.sendMessage(remetente, { text: configBot.mensagens.somenteGrupos }, { quoted: msg });
            return;
        }

        const subComando = args[0] ? args[0].toLowerCase() : '';
        const configPath = path.join(__dirname, '../../../database/config.json');
        let db = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        if (subComando === 'on' || subComando === '1') {
            db.antilinkAtivo = true;
            fs.writeFileSync(configPath, JSON.stringify(db, null, 2));

            await sock.sendMessage(remetente, { 
                text: `${configBot.emojis.sucesso} *Anti-link ativado!* Mensagens com links serão apagadas e o membro será removido.` 
            }, { quoted: msg });
            return;
        } 
        
        if (subComando === 'off' || subComando === '0') {
            db.antilinkAtivo = false;
            fs.writeFileSync(configPath, JSON.stringify(db, null, 2));

            await sock.sendMessage(remetente, { 
                text: `${configBot.emojis.sucesso} *Anti-link desativado!*` 
            }, { quoted: msg });
            return;
        }

        const respostaUso = 
`🛡️ *CONFIGURAÇÃO DO ANTI-LINK*

📊 *Status atual:* ${db.antilinkAtivo ? 'Ativo ✅' : 'Desativado ❌'}

💡 *Como usar:*
• \`/antilink on\` - Ativa o bloqueio de links.
• \`/antilink off\` - Desativa o bloqueio de links.

⚠️ *Nota:* O bot precisa ser Administrador do grupo para apagar mensagens e remover membros.`;

        await sock.sendMessage(remetente, { text: respostaUso }, { quoted: msg });
    }
};
