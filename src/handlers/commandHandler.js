const fs = require('fs');
const path = require('path');
const config = require('../../config');

// Coleções para guardar os comandos e seus apelidos (aliases)
const commands = new Map();
const aliases = new Map();

/**
 * Carrega todos os arquivos de comandos de forma recursiva dentro de src/commands/
 */
function loadCommands(dirPath = path.join(__dirname, '../commands')) {
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        // Se for um diretório/subpasta (ex: system, admin, fun), entra nele recursivamente
        if (stat.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                // Remove o cache do Node caso recarregue comandos sem reiniciar o bot
                delete require.cache[require.resolve(fullPath)];
                const command = require(fullPath);

                if (command.name) {
                    commands.set(command.name.toLowerCase(), command);

                    // Cadastra aliases (ex: .s para .sticker)
                    if (Array.isArray(command.aliases)) {
                        command.aliases.forEach(alias => {
                            aliases.set(alias.toLowerCase(), command.name.toLowerCase());
                        });
                    }

                    console.log(`[⚡ COMANDO CARREGADO] -> ${command.name}`);
                }
            } catch (error) {
                console.error(`❌ Erro ao carregar o comando no arquivo ${file}:`, error);
            }
        }
    }
}

/**
 * Processa a mensagem recebida e executa o comando correspondente
 */
async function handleCommand(sock, msg) {
    // Pega o texto da mensagem (seja texto simples, legenda de mídia ou resposta)
    const messageText = 
        msg.message?.conversation || 
        msg.message?.extendedTextMessage?.text || 
        msg.message?.imageMessage?.caption || 
        msg.message?.videoMessage?.caption || 
        "";

    // Se não começa com o prefixo configurado, ignora
    if (!messageText.startsWith(config.prefix)) return;

    // Separa o nome do comando dos argumentos
    const args = messageText.slice(config.prefix.length).trim().split(/ +/);
    const inputName = args.shift().toLowerCase();

    // Busca pelo nome principal ou pelo alias
    const commandName = commands.has(inputName) ? inputName : aliases.get(inputName);
    const command = commands.get(commandName);

    // Comando não existe
    if (!command) return;

    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const sender = isGroup ? msg.key.participant : chatId;

    // 🔴 1. Trava: Somente Dono (Reykz)
    if (command.ownerOnly) {
        const ownerJid = `${config.ownerNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
        if (sender !== ownerJid) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Este comando é exclusivo do meu criador (Reykz)!" 
            }, { quoted: msg });
        }
    }

    // 🔴 2. Trava: Somente Grupos
    if (command.groupOnly && !isGroup) {
        return await sock.sendMessage(chatId, { 
            text: "⚠️ Este comando só pode ser utilizado em grupos!" 
        }, { quoted: msg });
    }

    // 🔴 3. Trava: Somente Administradores
    if (command.adminOnly && isGroup) {
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;
            const participant = participants.find(p => p.id === sender);
            const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

            if (!isAdmin) {
                return await sock.sendMessage(chatId, { 
                    text: "🚫 Você precisa ser um administrador do grupo para usar este comando." 
                }, { quoted: msg });
            }
        } catch (err) {
            console.error("Erro ao verificar permissão de admin:", err);
            return;
        }
    }

    // 🚀 Execução do comando com captura de erro segura
    try {
        await command.execute(sock, msg, args, { commands, aliases });
    } catch (error) {
        console.error(` Erro ao executar o comando .${commandName}:`, error);
        await sock.sendMessage(chatId, { 
            text: `❌ Ocorreu um erro ao executar o comando \`${inputName}\`.` 
        }, { quoted: msg });
    }
}

module.exports = { loadCommands, handleCommand, commands, aliases };
