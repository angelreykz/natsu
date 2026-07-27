// Armazena os jogos ativos em memória
// Chave: ID do Chat | Valor: Objeto do jogo
const games = new Map();

// Desenha o tabuleiro visual
function renderBoard(board) {
    const symbols = { null: "⬜", "X": "❌", "O": "⭕" };
    return [
        `${symbols[board[0]]} | ${symbols[board[1]]} | ${symbols[board[2]]}   (1 | 2 | 3)`,
        `${symbols[board[3]]} | ${symbols[board[4]]} | ${symbols[board[5]]}   (4 | 5 | 6)`,
        `${symbols[board[6]]} | ${symbols[board[7]]} | ${symbols[board[8]]}   (7 | 8 | 9)`
    ].join("\n");
}

// Combinações vitoriosas
const WIN_CONDITIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
];

function checkWinner(board) {
    for (const [a, b, c] of WIN_CONDITIONS) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (board.every(cell => cell !== null)) return "EMPATE";
    return null;
}

module.exports = {
    name: "velha",
    aliases: ["ttt", "jogodavelha"],
    description: "Desafie outro membro do grupo para o Jogo da Velha!",
    category: "fun",
    groupOnly: true,

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || chatId;
        const senderName = msg.pushName || "Jogador 1";

        const currentGame = games.get(chatId);

        // Subcomando: Aceitar desafio
        if (args[0]?.toLowerCase() === "aceitar") {
            if (!currentGame || currentGame.status !== "WAITING") {
                return await sock.sendMessage(chatId, { text: "⚠️ Não há nenhum desafio pendente neste grupo." }, { quoted: msg });
            }
            if (currentGame.playerX.id === sender) {
                return await sock.sendMessage(chatId, { text: "❌ Você não pode jogar contra você mesmo!" }, { quoted: msg });
            }

            currentGame.playerO = { id: sender, name: senderName };
            currentGame.status = "PLAYING";
            currentGame.turn = currentGame.playerX.id; // X começa

            const text = [
                "🎮 *JOGO DA VELHA INICIADO!*",
                "",
                `❌ *X:* @${currentGame.playerX.id.split('@')[0]}`,
                `⭕ *O:* @${currentGame.playerO.id.split('@')[0]}`,
                "",
                renderBoard(currentGame.board),
                "",
                `👉 Vez de: @${currentGame.turn.split('@')[0]} (Digite de 1 a 9)`
            ].join("\n");

            return await sock.sendMessage(chatId, { 
                text, 
                mentions: [currentGame.playerX.id, currentGame.playerO.id] 
            }, { quoted: msg });
        }

        // Subcomando: Cancelar/Desistir
        if (args[0]?.toLowerCase() === "desistir" || args[0]?.toLowerCase() === "cancelar") {
            if (!currentGame) {
                return await sock.sendMessage(chatId, { text: "⚠️ Não há nenhuma partida em andamento." }, { quoted: msg });
            }
            games.delete(chatId);
            return await sock.sendMessage(chatId, { text: "🏳️ O jogo da velha foi cancelado." }, { quoted: msg });
        }

        // Se o jogo está rolando e o jogador fez uma jogada (1 a 9)
        if (currentGame && currentGame.status === "PLAYING") {
            if (sender !== currentGame.turn) {
                return await sock.sendMessage(chatId, { text: "⚠️ Não é a sua vez de jogar!" }, { quoted: msg });
            }

            const position = parseInt(args[0]) - 1;

            if (isNaN(position) || position < 0 || position > 8) {
                return await sock.sendMessage(chatId, { text: "⚠️ Digite um número de **1 a 9** para jogar na posição desejada." }, { quoted: msg });
            }

            if (currentGame.board[position] !== null) {
                return await sock.sendMessage(chatId, { text: "❌ Essa posição já foi ocupada! Escolha outra." }, { quoted: msg });
            }

            // Marca a jogada
            const symbol = sender === currentGame.playerX.id ? "X" : "O";
            currentGame.board[position] = symbol;

            // Checa vitória / empate
            const result = checkWinner(currentGame.board);

            if (result) {
                let finalText = "";
                if (result === "EMPATE") {
                    finalText = `🤝 *EMPATE!* Ninguém venceu esta partida.\n\n${renderBoard(currentGame.board)}`;
                } else {
                    const winner = result === "X" ? currentGame.playerX : currentGame.playerO;
                    finalText = `🏆 *VITÓRIA!* @${winner.id.split('@')[0]} (${result}) venceu o jogo!\n\n${renderBoard(currentGame.board)}`;
                }

                games.delete(chatId);
                return await sock.sendMessage(chatId, { 
                    text: finalText, 
                    mentions: [currentGame.playerX.id, currentGame.playerO.id] 
                }, { quoted: msg });
            }

            // Troca o turno
            currentGame.turn = sender === currentGame.playerX.id ? currentGame.playerO.id : currentGame.playerX.id;

            const turnText = [
                renderBoard(currentGame.board),
                "",
                `👉 Vez de: @${currentGame.turn.split('@')[0]} (Digite de 1 a 9)`
            ].join("\n");

            return await sock.sendMessage(chatId, { 
                text: turnText, 
                mentions: [currentGame.turn] 
            }, { quoted: msg });
        }

        // Se não há jogo, cria um desafio novo
        if (currentGame) {
            return await sock.sendMessage(chatId, { text: "⚠️ Já existe um jogo em andamento neste grupo! Digite `.velha cancelar` para encerrar." }, { quoted: msg });
        }

        games.set(chatId, {
            status: "WAITING",
            playerX: { id: sender, name: senderName },
            playerO: null,
            turn: null,
            board: Array(9).fill(null)
        });

        await sock.sendMessage(chatId, {
            text: `⚔️ *DESAFIO DE JOGO DA VELHA!*\n\n@${sender.split('@')[0]} criou um jogo da velha!\n\nPara aceitar o desafio, digite: \`.velha aceitar\``,
            mentions: [sender]
        }, { quoted: msg });
    }
};
                  
