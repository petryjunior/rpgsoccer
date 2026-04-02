/**
 * 1.ª temporada da campanha começa neste ano civil.
 * 2026 fica de fora (Copa do Mundo / sem eliminatórias no jogo).
 */
export const ANO_BASE_CAMPANHA = 2027;

/**
 * Janela fixa de dois meses para Euro, Copa América, etc. no modo campanha (todos os jogos do torneio cabem aqui).
 */
export const MES_INICIO_TORNEIO_CONTINENTAL_CAMPANHA = 6;
export const MES_FIM_TORNEIO_CONTINENTAL_CAMPANHA = 7;

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

/**
 * Remove o prefixo "Mês de AAAA — " do rótulo (calendário da campanha).
 * @param {string} rotulo
 * @param {number} ano
 */
export function extrairRotuloSemPrefixoMesAno(rotulo, ano) {
  const escaped = String(ano).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^(${MESES_PT.join("|")}) de ${escaped} — `);
  return rotulo.replace(re, "");
}
