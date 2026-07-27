const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Configurações do Bot
const config = require('./src/config');
const { carregarComandos } = require('./src/handlers/commandHandler');

// Interface de leitura do terminal
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolve) => rl.question(texto, resolve));

// Carrega os comandos/menus modularizados
const comandos = carregarComandos();

async function conectarBot() {
    const caminhoSessao = path.join(__dirname, 'sessao_natsu');
    const { state, saveCreds } = await useMultiFileAuthState(caminhoSessao);

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    // Autenticação via Pairing Code ou QR Code
    if (!sock.authState.creds.registered) {
        console.log('\n======================================');
        console.log(`       ${config.emojis.festa} ${config.botName.toUpperCase()} - AUTENTICAÇÃO     `);
        console.log('======================================');
        console.log('1. QR Code');
        console.log('2. Pairing Code (Código de Pareamento)');
        
        const opcao = await question('\nEscolha a opção (1 ou 2): ');

        if (opcao.trim() === '2') {
            const numero = await question('Digite seu número com DDI e DDD (Ex: 5531999999999): ');
            const numLimpo = numero.replace(/[^0-9]/g, '');
            
            await delay(3000);
            const code = await sock.requestPairingCode(numLimpo);
            console.log(`\n🔑 Seu código de pareamento é: \x1b[32m${code}\x1b[0m\n`);
        }
    }

    // Monitoramento da Conexão
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
            console.log(`\n✅ [${config.botName}] Conectado com sucesso ao WhatsApp!`);
        }
    });

    // Evento: Recebimento e Processamento de Mensagens
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (msg.key.fromMe) continue;

            const remetente = msg.key.remoteJid;
            const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

            // Verifica se a mensagem usa o prefixo configurado
            if (!texto.startsWith(config.prefix)) continue;

            const args = texto.trim().split(/ +/);
            const nomeComando = args.shift().toLowerCase();

            // Busca o comando no Handler
            const cmd = comandos.get(nomeComando);
            if (cmd) {
                try {
                    await cmd.executar(sock, remetente, args, msg);
                } catch (err) {
                    console.error(`❌ Erro no comando ${nomeComando}:`, err);
                    await sock.sendMessage(remetente, { text: config.mensagens.erroComando }, { quoted: msg });
                }
            }
        }
    });

    // Evento: Entrada e Saída de Membros nos Grupos (Boas-vindas)
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;

        // Dispara ao adicionar novos participantes
        if (action === 'add') {
            const configPath = path.join(__dirname, 'database/config.json');
            if (!fs.existsSync(configPath)) return;

            try {
                const db = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

                if (db.welcomeAtivo && db.welcomeMsg) {
                    for (const num of participants) {
                        const textoFinal = db.welcomeMsg.replace(/@user/g, `@${num.split('@')[0]}`);

                        await sock.sendMessage(id, {
                            text: textoFinal,
                            mentions: [num]
                        });
                    }
                }
            } catch (err) {
                console.error('❌ Erro no evento de Boas-Vindas:', err);
            }
        }
    });
}

conectarBot();
