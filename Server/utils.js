/**
 * Gera um código único para aprovação.
 * @returns {string} Um código aleatório de 8 caracteres em maiúsculas.
 */
function gerarCodigoUnico() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Exportar a função para que possa ser utilizada em outros arquivos
module.exports = {
    gerarCodigoUnico
};
