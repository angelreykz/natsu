module.exports = {
    // ==========================================
    // 🤖 INFORMAÇÕES BÁSICAS DO BOT
    // ==========================================
    botName: 'Natsu Bot',
    prefix: '/',                     // Prefixo padrão para comandos (ex: /, ., !)
    ownerName: 'Angel',              // Seu nome / Apelido
    
    // Lista de números dos Donos (Apenas números com DDI + DDD, sem traço ou espaço)
    // Exemplo: '5531999999999'
    owners: [
        '5531999999999'
    ],

    // ==========================================
    // 🎨 EMOTICONS E ESTILO VISUAL
    // ==========================================
    emojis: {
        sucesso: '✅',
        erro: '❌',
        aviso: '⚠️',
        carregando: '⏳',
        bot: '🤖',
        jogo: '🎮',
        admin: '🛡️',
        dono: '👑',
        festa: '🎉'
    },

    // ==========================================
    // 🎮 CONFIGURAÇÕES INICIAIS DO AMONG US
    // ==========================================
    amongUs: {
        codigoSalaPadrao: 'Nenhum código definido',
        regiaoPadrao: 'AMÉRICA',
        tagPadrao: '» 𝒩𝒶𝓉𝓈𝓊 «'
    },

    // ==========================================
    // 💬 MENSAGENS PERSONALIZADAS
    // ==========================================
    mensagens: {
        somenteAdmins: '❌ Este comando só pode ser usado por administradores do grupo!',
        somenteGrupos: '❌ Este comando só pode ser utilizado dentro de grupos!',
        somenteDono: '👑 Apenas o Dono do Bot tem permissão para usar este comando!',
        botPrecisaSerAdmin: '❌ O bot precisa ser Administrador do grupo para executar esta ação.',
        erroComando: '❌ Ocorreu um erro interno ao tentar executar este comando.'
    }
};
