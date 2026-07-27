const fs = require('fs');
const path = require('path');
const configBot = require('../../config');

module.exports = {
    nome: '/setwelcome',
    alias: ['/boasvindas', '/setbv'],
    descricao: 'Configura ou ativa/desativa a mensagem de boas-vindas',
    async executar(sock, remetente, args, msg) {
        if (!remetente.endsWith('@g.us')) {
            await sock.sendMessage(remetente, { text: configBot.mensagens.somenteGrupos }, { quoted: msg });
            return;
        }

        const subComando = args[0] ? args[0].toLowerCase() : '';
        const configPath = path.join(__dirname, '../../../database/config.json');
        let db = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        // Se usar: /setwelcome on ou /setwelcome off
        if (subComando === 'on' || subComando === 'off') {
            db.welcomeAtivo = (subComando === 'on');
            fs.writeFileSync(configPath, JSON.stringify(db, null, 2));

            const estado = db.welcomeAtivo ? 'ativado' : 'desativado';
            await sock.sendMessage(remetente, { 
                text: `${configBot.emojis.sucesso} Sistema de boas-vindas **${estado}** com sucesso!` 
            }, { quoted: msg });
            return;
        }

        // Se enviar o texto da nova mensagem
        const novaMensagem = args.join(' ');

        if (!novaMensagem) {
            const respostaUso = 
`👋 *CONFIGURAÇÃO DE BOAS-VINDAS*

📋 *Mensagem atual:*
"${db.welcomeMsg}"

📊 *Status:* ${db.welcomeAtivo ? 'Ativo ✅' : 'Desativado ❌'}

💡 *Como usar:*
• \`/setwelcome [sua mensagem]\` - Define uma nova mensagem.
• \`/setwelcome on\` - Ativa as boas-vindas.
• \`/setwelcome off\` - Desativa as boas-vindas.

📌 *Dica:* Use \`@user\` na mensagem para mencionar o novo membro automaticamente!`;

            await sock.sendMessage(remetente, { text: respostaUso }, { quoted: msg });
            return;
        }

        db.welcomeMsg = novaMensagem;
        db.welcomeAtivo = true;
        fs.writeFileSync(configPath, JSON.stringify(db, null, 2));

        const respostaSucesso = 
`✅ *Mensagem de boas-vindas atualizada!*

📋 *Nova mensagem:*
"${db.welcomeMsg}"

✨ O recurso foi ativado automaticamente.`;

        await sock.sendMessage(remetente, { text: respostaSucesso }, { quoted: msg });
    }
};
              
