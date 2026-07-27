const fs = require('fs');
const path = require('path');

function carregarComandos() {
    const comandos = new Map();

    // Função recursiva para varrer pastas e subpastas
    function lerDiretorio(diretorio) {
        if (!fs.existsSync(diretorio)) return;

        const arquivosOuPastas = fs.readdirSync(diretorio);

        for (const item of arquivosOuPastas) {
            const caminhoCompleto = path.join(diretorio, item);
            const stats = fs.statSync(caminhoCompleto);

            if (stats.isDirectory()) {
                // Se for uma pasta, entra nela e lê os arquivos de dentro
                lerDiretorio(caminhoCompleto);
            } else if (item.endsWith('.js')) {
                // Se for arquivo JS, carrega como comando
                try {
                    const comando = require(caminhoCompleto);
                    if (comando.nome) {
                        comandos.set(comando.nome.toLowerCase(), comando);
                        
                        // Registra apelidos/aliases do comando, se existirem (ex: /ajuda para /menu)
                        if (comando.alias && Array.isArray(comando.alias)) {
                            for (const apelido of comando.alias) {
                                comandos.set(apelido.toLowerCase(), comando);
                            }
                        }
                    }
                } catch (err) {
                    console.error(`❌ Erro ao carregar o comando no arquivo ${item}:`, err.message);
                }
            }
        }
    }

    // Pastas de onde o handler vai puxar os comandos
    const pastaCommands = path.join(__dirname, '../commands');
    const pastaMenus = path.join(__dirname, '../../menus');

    lerDiretorio(pastaCommands);
    lerDiretorio(pastaMenus);

    console.log(`📦 [HANDLER] Total de ${comandos.size} comandos/menus carregados com sucesso!`);
    return comandos;
}

module.exports = { carregarComandos };
