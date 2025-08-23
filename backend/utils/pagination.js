// Utilidades de paginación para consultas de base de datos

/**
 * Parsea los parámetros de paginación de la query string
 * @param {Object} query - Objeto query de Express
 * @returns {Object} Objeto con page, pageSize, offset y limit
 */
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20));
  const offset = (page - 1) * pageSize;
  
  return {
    page,
    pageSize,
    offset,
    limit: pageSize
  };
}

/**
 * Genera metadatos de paginación para la respuesta
 * @param {number} total - Total de registros
 * @param {number} page - Página actual
 * @param {number} pageSize - Tamaño de página
 * @returns {Object} Metadatos de paginación
 */
function generatePaginationMetadata(total, page, pageSize) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    pagination: {
      currentPage: page,
      pageSize,
      totalPages,
      totalRecords: total,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  };
}

/**
 * Construye una respuesta paginada completa
 * @param {Array} data - Datos de la página actual
 * @param {number} total - Total de registros
 * @param {Object} pagination - Objeto de paginación
 * @returns {Object} Respuesta completa con datos y metadatos
 */
function buildPaginatedResponse(data, total, pagination) {
  const { page, pageSize } = pagination;
  const metadata = generatePaginationMetadata(total, page, pageSize);
  
  return {
    success: true,
    data,
    ...metadata
  };
}

/**
 * Valida que los parámetros de paginación sean válidos
 * @param {Object} query - Objeto query de Express
 * @returns {Object} Resultado de validación
 */
function validatePagination(query) {
  const page = parseInt(query.page);
  const pageSize = parseInt(query.pageSize);
  
  const errors = [];
  
  if (page && (page < 1 || !Number.isInteger(page))) {
    errors.push('La página debe ser un número entero mayor a 0');
  }
  
  if (pageSize && (pageSize < 1 || pageSize > 100 || !Number.isInteger(pageSize))) {
    errors.push('El tamaño de página debe ser un número entero entre 1 y 100');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  parsePagination,
  generatePaginationMetadata,
  buildPaginatedResponse,
  validatePagination
};
