/**
 * QTE por letra: sorteia A–Z; o jogador deve pressionar a tecla certa dentro do prazo.
 * `ratio` vem de metricasDuelo (0–1): mais vantagem no duelo = mais tempo.
 *
 * @param {number} ratio meuPeso / (meuPeso + pesoOponente)
 */
export function parametrosLetra(ratio) {
  const r = Math.min(0.93, Math.max(0.07, ratio));
  const letra = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const tempoLimiteMs = 360 + r * 980;
  return { letra, tempoLimiteMs, ratioUsado: r };
}
