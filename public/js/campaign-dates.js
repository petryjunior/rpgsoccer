/**
 * 1.ª temporada da campanha começa neste ano civil.
 * 2026 fica de fora (Copa do Mundo / sem eliminatórias no jogo).
 */
export const ANO_BASE_CAMPANHA = 2027;

const MESES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/**
 * @param {number} mes 1–12
 * @param {number} ano
 */
export function textoMesAno(mes, ano) {
  const m = Math.max(1, Math.min(12, mes | 0));
  return `${MESES_PT[m - 1]} de ${ano}`;
}
