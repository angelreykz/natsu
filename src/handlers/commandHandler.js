const fs = require('fs');
const path = require('path');
const config = require('../../config');

// Mapa para guardar os comandos em memória
const commands = new Map();

function loadCommands() {
    const categoriesPath = path.join(__dirname, '../commands');
    const categories = fs.readdirSync(categoriesPath);

    for (const category of categories) {
        const commandFiles = fs.readdirSync(path.join(categoriesPath, category)).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`../commands/${category}/${file}`);
            commands.set(command.name, command);
            console.log(`[COMANDO CARREGADO] -> ${command.name}`);
        }
    }
}

async function handleCommand(sock, msg) {
    const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

    // Verifica se a mensagem começa com o prefixo
    if (!messageText.startsWith(config.prefix)) return;

    const args = messageText.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Busca o comando
    const command = commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(sock, msg, args);
    } catch (error) {
        console.error(`Erro ao executar o comando ${commandName}:`, error);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ Ocorreu um erro ao executar este comando." }, { quoted: msg });
    }
}

module.exports = { loadCommands, handleCommand };
