/**
 * Utilidades para estadísticas de transacciones
 */

/** Agrupa montos por mes (YYYY-MM). Devuelve objeto { 'YYYY-MM': { income, expense, net } } */
export function groupByMonth(transactions = []) {
  const result = {};
  for (const t of transactions) {
    const date = t?.date ? new Date(t.date) : null;
    if (!date || isNaN(date)) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!result[key]) result[key] = { income: 0, expense: 0, net: 0 };
    const amount = Number(t.amount || 0);
    if (amount >= 0) result[key].income += amount;
    else result[key].expense += Math.abs(amount);
    result[key].net += amount;
  }
  return result;
}

/**
 * Devuelve arrays ordenados por mes para gráficas: [{ month: 'YYYY-MM', income, expense, net }]
 */
export function getMonthlyTotals(transactions = []) {
  const map = groupByMonth(transactions);
  return Object.entries(map)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, v]) => ({ month, ...v }));
}

