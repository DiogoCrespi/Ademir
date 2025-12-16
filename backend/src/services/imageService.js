/**
 * Serviço de gerenciamento de imagens
 *
 * TODO: Implementar upload de imagens
 * - Upload de imagens de categorias do menu
 * - Upload de imagens de produtos/itens
 * - Validação de tipos de arquivo (jpg, png, webp)
 * - Redimensionamento automático
 * - Armazenamento local ou cloud storage (S3, Cloudinary, etc)
 * - Geração de URLs públicas
 * - Limpeza de imagens não utilizadas
 */

/**
 * Faz upload de uma imagem
 * @param {Buffer} fileBuffer - Buffer do arquivo
 * @param {string} filename - Nome original do arquivo
 * @param {string} folder - Pasta de destino (ex: 'categorias', 'produtos')
 * @returns {Promise<{url: string, path: string}>}
 */
async function uploadImage(fileBuffer, filename, folder = 'uploads') {
  // TODO: Implementar upload
  throw new Error('Upload de imagens não implementado ainda')
}

/**
 * Remove uma imagem
 * @param {string} imagePath - Caminho da imagem
 * @returns {Promise<boolean>}
 */
async function deleteImage(imagePath) {
  // TODO: Implementar remoção
  throw new Error('Remoção de imagens não implementado ainda')
}

/**
 * Valida se o arquivo é uma imagem válida
 * @param {string} mimetype - Tipo MIME do arquivo
 * @param {number} size - Tamanho do arquivo em bytes
 * @returns {boolean}
 */
function validateImage(mimetype, size) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(mimetype)) {
    return false
  }

  if (size > maxSize) {
    return false
  }

  return true
}

module.exports = {
  uploadImage,
  deleteImage,
  validateImage
}
