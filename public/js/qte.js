/**
 * Ajuste de dificuldade dos QTE (tempo por letra)
 * ================================================
 *
 * Este arquivo só define quanto tempo o jogador tem para acertar **cada** letra,
 * em função do `ratio` do duelo (vantagem estatística). Outros fatores de “dificuldade”
 * ficam em `main.js`: intervalo aleatório da contagem regressiva (`QTE_COUNTDOWN_MS_MIN` /
 * `QTE_COUNTDOWN_MS_MAX`) e quantas letras seguidas no lance de goleiro (3 no chute, 2 na defesa).
 *
 * Fórmula: `tempoLimiteMs = BASE_MS + r * FAIXA_MS`
 *
 * - **BASE_MS** (hoje 350): tempo mínimo quando o duelo está péssimo para você (`r` no piso).
 *   Aumentar → mesmo no pior caso o jogador tem mais tempo (QTE mais fácil no limite inferior).
 *   Diminuir → piso mais cruel (mais difícil quando está em desvantagem).
 *
 * - **FAIXA_MS** (hoje 800): quanto tempo *extra* você ganha quando o duelo favorece você (`r` no teto).
 *   O tempo máximo possível é BASE_MS + FAIXA_MS (com `r` máximo após o clamp).
 *   Aumentar → quem está em vantagem no duelo fica com janela bem maior.
 *   Diminuir → a vantagem no duelo importa menos; todos ficam com tempos mais “apertados”.
 *
 * Clamp de `ratio` → `r` entre **0.07** e **0.93**:
 * - Os extremos **0** e **1** nunca chegam na fórmula: mesmo um duelo 100% favorável não dá
 *   tempo infinito, e um duelo terrível ainda deixa um mínimo de reação.
 * - **Aumentar o piso** (ex.: 0.07 → 0.15): quem perde muito no papel ainda recebe um `r` menos
 *   baixo → um pouco mais de tempo → duelo “perdido” menos punidor.
 * - **Diminuir o piso**: o contrário; desvantagem forte = letras ainda mais rápidas.
 * - **Diminuir o teto** (ex.: 0.93 → 0.85): quem domina o duelo ganha menos tempo extra.
 * - **Aumentar o teto**: quem domina aproxima-se do máximo `BASE_MS + FAIXA_MS`.
 *
 * Letras: sorteio uniforme em A–Z (26 teclas). Para mudar o conjunto (ex.: só um subconjunto
 * mais fácil), altere a expressão que gera `letra`.
 *
 * @param {number} ratio meuPeso / (meuPeso + pesoOponente)
 */
export function parametrosLetra(ratio) {
  const r = Math.min(0.93, Math.max(0.07, ratio));
  const letra = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const tempoLimiteMs = 350 + r * 800;
  return { letra, tempoLimiteMs, ratioUsado: r };
}
