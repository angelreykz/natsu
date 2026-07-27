const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const config = require('./config');
const { loadCommands, handleCommand } = require('./src/handlers/commandHandler');

// Interface do terminal para o Pairing Code
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    // 1. Carrega os comandos da pasta src/commands/
    console.log("📂 Carregando comandos...");
    loadCommands();

    // 2. Prepara as credenciais na pasta auth_info/
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false // Usa Pairing Code no lugar do QR
    });

    // 3. Solicita o código se não estiver registrado
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question(`\n[${config.botName}] Digite o seu número do WhatsApp (ex: 5511999999999): `);
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\n🔑 Seu código de pareamento: ${code}\n`);
    }

    // 4. Status da conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. Reconectando...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log(`\n✅ ${config.botName} online e pronto para uso!\n`);
        }
    });

    // Salva sessão
    sock.ev.on('creds.update', saveCreds);

    // 5. Ouve as mensagens e passa pelo Handler de Comandos
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        for (const msg of messages) {
            if (!msg.message || msg.key.fromMe) continue;
            
            // Repassa para o handler processar se for comando
            await handleCommand(sock, msg);
        }
    });
}

startBot();
