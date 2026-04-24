/**
 * Preferências da sessão (não persistem após fechar a aba).
 * Por ora: apenas dificuldade, aplicada aos QTE em todos os modos.
 */

export const DIFICULDADE_FACIL = "facil";
export const DIFICULDADE_MEDIA = "media";
export const DIFICULDADE_DIFICIL = "dificil";

/** @type {typeof DIFICULDADE_FACIL | typeof DIFICULDADE_MEDIA | typeof DIFICULDADE_DIFICIL} */
let dificuldadeSessao = DIFICULDADE_MEDIA;

/**
 * @returns {typeof DIFICULDADE_FACIL | typeof DIFICULDADE_MEDIA | typeof DIFICULDADE_DIFICIL}
 */
export function getDificuldadeSessao() {
  return dificuldadeSessao;
}

/**
 * @param {string} v
 */
export function setDificuldadeSessao(v) {
  if (v === DIFICULDADE_FACIL || v === DIFICULDADE_MEDIA || v === DIFICULDADE_DIFICIL) {
    dificuldadeSessao = v;
  }
}

/**
 * Multiplicador no tempo de cada letra e na contagem 3–2–1 dos QTE.
 * Acima de 1 = mais tempo = mais fácil; abaixo de 1 = mais difícil.
 * Média = 1 (comportamento atual). Fácil/difícil = ±25 % em relação à média.
 */
export function multiplicadorTempoQtePorDificuldade() {
  switch (dificuldadeSessao) {
    case DIFICULDADE_FACIL:
      return 1.25;
    case DIFICULDADE_DIFICIL:
      return 0.75;
    default:
      return 1;
  }
}
