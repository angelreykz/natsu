const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Interface para leitura no terminal durante a autenticação
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolve) => rl.question(texto, resolve));

// Importa o gerenciador de comandos modularizados (Handler)
const { carregarComandos } = require('./src/handlers/commandHandler');

// Inicializa a coleção de comandos
const comandos = carregarComandos();

async function conectarBot() {
    // Pasta onde ficará salva a sessão do WhatsApp
    const caminhoSessao = path.join(__dirname, 'sessao_natsu');
    const { state, saveCreds } = await useMultiFileAuthState(caminhoSessao);

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    // Método de conexão (apenas se ainda não estiver autenticado)
    if (!sock.authState.creds.registered) {
        console.log('\n======================================');
        console.log('       🍥 NATSU BOT - AUTHENTICATION     ');
        console.log('======================================');
        console.log('1. QR Code');
        console.log('2. Pairing Code (Código de Pareamento)');
        
        const opcao = await question('\nEscolha o método de conexão (1 ou 2): ');

        if (opcao.trim() === '2') {
            const numero = await question('Digite seu número com DDI e DDD (Ex: 5531999999999): ');
            const numLimpo = numero.replace(/[^0-9]/g, '');
            
            await delay(3000);
            const code = await sock.requestPairingCode(numLimpo);
            console.log(`\n🔑 Seu código de pareamento é: \x1b[32m${code}\x1b[0m\n`);
        }
    }

    // Eventos de Conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !sock.authState.creds.registered) {
            console.log('\n--- ESCANEIE O QR CODE ABAIXO ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const statusReason = lastDisconnect?.error?.output?.statusCode;
            const deveReconectar = statusReason !== DisconnectReason.loggedOut;
            console.log(`❌ Conexão fechada. Reconectando: ${deveReconectar}`);
            
            if (deveReconectar) {
                conectarBot();
            }
        } else if (connection === 'open') {
            console.log('\n✅ [NATSU BOT] Conectado com sucesso ao WhatsApp!');
        }
    });

    // Escutador e Roteador de Mensagens
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (msg.key.fromMe) continue;

            const remetente = msg.key.remoteJid;
            const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

            if (!texto.startsWith('/')) continue; // Aceita comandos com prefixo '/'

            const args = texto.trim().split(/ +/);
            const nomeComando = args.shift().toLowerCase();

            // Busca o comando no Handler
            const cmd = comandos.get(nomeComando);
            if (cmd) {
                try {
                    await cmd.executar(sock, remetente, args, msg);
                } catch (err) {
                    console.error(`❌ Erro ao executar o comando ${nomeComando}:`, err);
                    await sock.sendMessage(remetente, { text: '❌ Ocorreu um erro ao executar este comando.' }, { quoted: msg });
                }
            }
        }
    });
}

conectarBot();
      
