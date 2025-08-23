// Utilidades de tiempo para manejo de períodos y fechas

/**
 * Obtiene el inicio de un período UTC específico
 * @param {string} unit - Unidad de tiempo: 'day', 'week', 'month'
 * @returns {Date} Fecha de inicio del período
 */
function startOfUTC(unit) {
  const now = new Date();
  
  switch (unit) {
    case 'day':
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    case 'week':
      const d = new Date();
      const day = d.getUTCDay();
      // ISO week start Monday (1), Sunday is 0
      const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
    
    case 'month':
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    
    default:
      throw new Error(`Unidad de tiempo no válida: ${unit}`);
  }
}

/**
 * Obtiene el fin de un período UTC específico
 * @param {string} unit - Unidad de tiempo: 'day', 'week', 'month'
 * @returns {Date} Fecha de fin del período
 */
function endOfUTC(unit) {
  const start = startOfUTC(unit);
  
  switch (unit) {
    case 'day':
      return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    
    case 'week':
      return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
    
    case 'month':
      return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    
    default:
      throw new Error(`Unidad de tiempo no válida: ${unit}`);
  }
}

/**
 * Verifica si una fecha está dentro de un período específico
 * @param {Date} date - Fecha a verificar
 * @param {string} period - Período: 'day', 'week', 'month'
 * @returns {boolean} True si la fecha está en el período
 */
function isInPeriod(date, period) {
  const start = startOfUTC(period);
  const end = endOfUTC(period);
  return date >= start && date <= end;
}

/**
 * Obtiene el período actual basado en una fecha
 * @param {Date} date - Fecha de referencia
 * @returns {Object} Objeto con información del período
 */
function getCurrentPeriod(date = new Date()) {
  const now = date;
  
  return {
    day: {
      start: startOfUTC('day'),
      end: endOfUTC('day'),
      isCurrent: isInPeriod(now, 'day')
    },
    week: {
      start: startOfUTC('week'),
      end: endOfUTC('week'),
      isCurrent: isInPeriod(now, 'week')
    },
    month: {
      start: startOfUTC('month'),
      end: endOfUTC('month'),
      isCurrent: isInPeriod(now, 'month')
    }
  };
}

/**
 * Formatea una fecha para mostrar en español
 * @param {Date} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
function formatDateES(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return new Intl.DateTimeFormat('es-ES', formatOptions).format(date);
  } catch (error) {
    // Fallback si el formato falla
    return date.toLocaleString('es-ES');
  }
}

/**
 * Calcula la diferencia de tiempo entre dos fechas
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @returns {Object} Objeto con la diferencia en diferentes unidades
 */
function timeDifference(startDate, endDate) {
  const diffMs = endDate.getTime() - startDate.getTime();
  
  return {
    milliseconds: diffMs,
    seconds: Math.floor(diffMs / 1000),
    minutes: Math.floor(diffMs / (1000 * 60)),
    hours: Math.floor(diffMs / (1000 * 60 * 60)),
    days: Math.floor(diffMs / (1000 * 60 * 60 * 24))
  };
}

/**
 * Verifica si han pasado suficientes segundos desde la última actividad
 * @param {Date} lastActivity - Última actividad
 * @param {number} cooldownSeconds - Segundos de cooldown
 * @returns {Object} Información del cooldown
 */
function checkCooldown(lastActivity, cooldownSeconds) {
  if (!lastActivity) {
    return { canProceed: true, secondsLeft: 0 };
  }
  
  const now = new Date();
  const diff = timeDifference(lastActivity, now);
  const canProceed = diff.seconds >= cooldownSeconds;
  const secondsLeft = Math.max(0, cooldownSeconds - diff.seconds);
  
  return {
    canProceed,
    secondsLeft,
    lastActivity,
    cooldownSeconds
  };
}

module.exports = {
  startOfUTC,
  endOfUTC,
  isInPeriod,
  getCurrentPeriod,
  formatDateES,
  timeDifference,
  checkCooldown
};
