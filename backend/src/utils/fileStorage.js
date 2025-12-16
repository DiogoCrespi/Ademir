const fs = require('fs')
const path = require('path')

// Diretório de dados
const DATA_DIR = path.join(__dirname, '../../data')
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

/**
 * Lê um arquivo JSON do diretório de dados
 * @param {string} filename - Nome do arquivo (sem caminho)
 * @param {any} defaultValue - Valor padrão se o arquivo não existir
 * @returns {any} Dados do arquivo ou valor padrão
 */
function readDataFile(filename, defaultValue = []) {
  const filepath = path.join(DATA_DIR, filename)
  try {
    if (fs.existsSync(filepath)) {
      const data = fs.readFileSync(filepath, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Erro ao ler ${filename}:`, error)
  }
  return defaultValue
}

/**
 * Escreve dados em um arquivo JSON no diretório de dados
 * @param {string} filename - Nome do arquivo (sem caminho)
 * @param {any} data - Dados a serem salvos
 * @returns {boolean} true se salvou com sucesso, false caso contrário
 */
function writeDataFile(filename, data) {
  const filepath = path.join(DATA_DIR, filename)
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error(`Erro ao escrever ${filename}:`, error)
    return false
  }
}

module.exports = {
  readDataFile,
  writeDataFile,
  DATA_DIR
}
