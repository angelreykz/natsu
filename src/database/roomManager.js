const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'room.json');

// Função auxiliar para ler os dados do arquivo JSON
function getRoomData() {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler o arquivo room.json:', error);
        return null;
    }
}

// Salva ou substitui a sala ativa
function saveRoom(code, authorName, obs = '') {
    const now = new Date();
    // Formata o horário no padrão HH:MM (ex: 21:43)
    const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const roomData = {
        code: code.toUpperCase(),
        author: authorName,
        time: timeFormatted,
        obs: obs.trim()
    };

    fs.writeFileSync(filePath, JSON.stringify(roomData, null, 2), 'utf-8');
    return roomData;
}

module.exports = { getRoomData, saveRoom };
