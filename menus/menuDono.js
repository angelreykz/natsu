const config = require('../src/config');

module.exports = {
    nome: '/menudono',
    descricao: 'Menu exclusivo para os donos do bot',
    async executar(sock, remetente, args, msg) {
        // Descobre quem enviou a mensagem
        const numeroRemetente = (msg.key.participant || msg.key.remoteJid).split('@')[0];

        // Verifica se o número está na lista de donos do config.js
        if (!config.owners.includes(numeroRemetente)) {
            await sock.sendMessage(remetente, { text: config.mensagens.somenteDono }, { quoted: msg });
            return;
        }

        const texto = `${config.emojis.dono} *MENU DO DONO - ${config.botName}* ${config.emojis.dono}\n\n...`;
        await sock.sendMessage(remetente, { text }, { quoted: msg });
    }
};
