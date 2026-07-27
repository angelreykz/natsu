const { getRoomData } = require("../../database/roomManager");

module.exports = {
    name: "sala",
    aliases: ["amongus"],
    description: "Mostra a sala ativa de Among Us.",
    category: "among",
    groupOnly: true,

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;

        try {
            const room = getRoomData();

            if (!room || !room.code) {
                return await sock.sendMessage(chatId, {
                    text: "❌ Não há nenhuma sala aberta no momento."
                }, {
                    quoted: msg
                });
            }

            const metadata = await sock.groupMetadata(chatId);
            const mentions = metadata.participants.map(p => p.id);

            const linhas = [
                "🎮 *SALA DE AMONG US*",
                "",
                `🔑 *Código:* \`${room.code}\``,
                `👤 *Host:* ${room.author}`,
                `🕒 *Criada às:* ${room.time}`
            ];

            if (room.obs?.trim()) {
                linhas.push("");
                linhas.push("📝 *Observação*");
                linhas.push(room.obs.trim());
            }

            linhas.push("");
            linhas.push("📋 O código será enviado abaixo para facilitar copiar.");

            await sock.sendMessage(chatId, {
                text: linhas.join("\n"),
                mentions
            }, {
                quoted: msg
            });

            await sock.sendMessage(chatId, {
                text: room.code
            });

        } catch (err) {
            console.error("[SALA]", err);

            await sock.sendMessage(chatId, {
                text: "❌ Ocorreu um erro ao buscar a sala."
            }, {
                quoted: msg
            });
        }
    }
};
