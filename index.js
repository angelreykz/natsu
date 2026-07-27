const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const config = require('./config');

// Interface para digitar o número no terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    // Salva a sessão na pasta auth_info
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false // Desativado para usar Pairing Code
    });

    // Solicita o código de pareamento caso não esteja autenticado
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question(`\n[${config.botName}] Digite o seu número do WhatsApp (ex: 5511999999999): `);
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\n🔑 Seu código de pareamento: ${code}\n`);
    }

    // Gerenciamento de eventos da conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. Reconectando...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(`✅ ${config.botName} conectado com sucesso!`);
        }
    });

    // Salva as credenciais sempre que atualizadas
    sock.ev.on('creds.update', saveCreds);

    // Evento ao receber mensagens
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // Aqui você chamará o handler de comandos no futuro
        console.log(`Mensagem recebida de ${msg.pushName}:`, msg.message);
    });
}

startBot();
      
