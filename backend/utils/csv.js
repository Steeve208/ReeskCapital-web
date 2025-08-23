const { stringify } = require('csv-stringify/sync');

/**
 * Convierte un array de objetos a formato CSV
 * @param {Array} rows - Array de objetos a convertir
 * @param {Array} columns - Columnas específicas a incluir (opcional)
 * @param {Object} options - Opciones adicionales de CSV
 * @returns {string} String en formato CSV
 */
function toCSV(rows, columns = null, options = {}) {
  const defaultOptions = {
    header: true,
    columns: columns,
    delimiter: ',',
    quoted: true,
    quoted_empty: true
  };

  const csvOptions = { ...defaultOptions, ...options };
  
  try {
    return stringify(rows, csvOptions);
  } catch (error) {
    console.error('Error generando CSV:', error);
    throw new Error('Error generando archivo CSV');
  }
}

/**
 * Genera CSV para usuarios con formato específico
 * @param {Array} users - Array de usuarios
 * @returns {string} CSV formateado para usuarios
 */
function generateUsersCSV(users) {
  const formattedUsers = users.map(user => ({
    ID: user.id,
    Email: user.email || 'N/A',
    'Wallet Address': user.wallet_address || 'N/A',
    'Balance Minado': user.mined_balance || 0,
    'Fecha de Registro': user.created_at ? new Date(user.created_at).toLocaleString('es-ES') : 'N/A',
    'Última Mina': user.last_mine ? new Date(user.last_mine).toLocaleString('es-ES') : 'N/A',
    Estado: user.status || 'active'
  }));

  return toCSV(formattedUsers);
}

/**
 * Genera CSV para eventos de minería con formato específico
 * @param {Array} miningEvents - Array de eventos de minería
 * @returns {string} CSV formateado para eventos de minería
 */
function generateMiningEventsCSV(miningEvents) {
  const formattedEvents = miningEvents.map(event => ({
    ID: event.id,
    'ID Usuario': event.user_id,
    'Email Usuario': event.user_email || 'N/A',
    Recompensa: event.reward || 0,
    'Fecha de Mina': event.created_at ? new Date(event.created_at).toLocaleString('es-ES') : 'N/A',
    'IP Address': event.ip || 'N/A',
    'User Agent': event.user_agent || 'N/A'
  }));

  return toCSV(formattedEvents);
}

/**
 * Genera CSV para estadísticas del sistema
 * @param {Array} stats - Array de estadísticas
 * @returns {string} CSV formateado para estadísticas
 */
function generateStatsCSV(stats) {
  const formattedStats = stats.map(stat => ({
    Fecha: stat.stat_date || 'N/A',
    'Total Usuarios': stat.total_users || 0,
    'Mineros Activos': stat.active_miners || 0,
    'Total Tokens Simulados': stat.total_tokens_simulated || 0,
    'Total Sesiones de Minería': stat.total_mining_sessions || 0,
    'Total Horas de Minería': stat.total_mining_hours || 0
  }));

  return toCSV(formattedStats);
}

/**
 * Genera CSV para leaderboard
 * @param {Array} leaderboard - Array del leaderboard
 * @param {string} period - Período del leaderboard
 * @returns {string} CSV formateado para leaderboard
 */
function generateLeaderboardCSV(leaderboard, period = 'all') {
  const formattedLeaderboard = leaderboard.map((entry, index) => ({
    Posición: index + 1,
    'ID Usuario': entry.id,
    Email: entry.email || 'N/A',
    'Total Minado': entry.total || 0,
    Período: period
  }));

  return toCSV(formattedLeaderboard);
}

/**
 * Configura headers para descarga de CSV
 * @param {Object} res - Objeto response de Express
 * @param {string} filename - Nombre del archivo
 */
function setCSVHeaders(res, filename) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-cache');
}

module.exports = {
  toCSV,
  generateUsersCSV,
  generateMiningEventsCSV,
  generateStatsCSV,
  generateLeaderboardCSV,
  setCSVHeaders
};
