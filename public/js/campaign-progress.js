/**
 * Progressão e oscilação de atributos no modo Campanha (v1).
 */

import { criarRng } from "./world-cup.js";

/**
 * @param {import('./campaign-pool.js').JogadorCampanha} j
 */
function clampStatValues(j) {
  j.ataque = Math.min(99, Math.max(1, Math.round(j.ataque)));
  j.defesa = Math.min(99, Math.max(1, Math.round(j.defesa)));
  j.potencial = Math.min(99, Math.max(Math.max(j.ataque, j.defesa), j.potencial));
  j.forma = Math.min(150, Math.max(50, Math.round(j.forma)));
}

/**
 * Após uma partida: micro-ajuste em quem foi convocado (forma + leve ruído nos atributos).
 * @param {import('./campaign-pool.js').JogadorCampanha[]} todosJogadores
 * @param {Set<string>} idsConvocados
 * @param {number} seed
 */
export function aplicarEfeitoPosPartidaCampanha(todosJogadores, idsConvocados, seed) {
  const rng = criarRng((seed ^ 0x9e3779b9) >>> 0);
  for (const j of todosJogadores) {
    if (!idsConvocados.has(j.id)) continue;
    const fator = (j.forma - 100) / 200;
    const delta = Math.round((rng() - 0.5) * 3 + fator * 2);
    if (j.idade < 24 && rng() < 0.35) {
      if (rng() < 0.5) j.ataque = Math.min(j.potencial, j.ataque + (rng() < 0.5 ? 1 : 0));
      else j.defesa = Math.min(j.potencial, j.defesa + (rng() < 0.5 ? 1 : 0));
    } else if (j.idade > 32 && rng() < 0.25) {
      if (rng() < 0.5) j.ataque = Math.max(1, j.ataque - 1);
      else j.defesa = Math.max(1, j.defesa - 1);
    } else if (delta !== 0) {
      if (rng() < 0.5) j.ataque = Math.min(j.potencial, Math.max(1, j.ataque + delta));
      else j.defesa = Math.min(j.potencial, Math.max(1, j.defesa + delta));
    }
    clampStatValues(j);
  }
}

/**
 * Fim de janela (ex.: avanço de data FIFA / fase do calendário): tendência por idade.
 * @param {import('./campaign-pool.js').JogadorCampanha[]} jogadores
 * @param {number} seed
 */
export function aplicarProgressaoFimDeJanela(jogadores, seed) {
  const rng = criarRng(seed >>> 0);
  for (const j of jogadores) {
    if (j.idade <= 21 && rng() < 0.4) {
      const alvo = rng() < 0.5 ? "ataque" : "defesa";
      if (alvo === "ataque") j.ataque = Math.min(j.potencial, j.ataque + 1);
      else j.defesa = Math.min(j.potencial, j.defesa + 1);
    } else if (j.idade >= 33 && rng() < 0.35) {
      if (rng() < 0.5) j.ataque = Math.max(1, j.ataque - 1);
      else j.defesa = Math.max(1, j.defesa - 1);
    }
    j.forma = Math.round(100 + (rng() - 0.5) * 20);
    j.forma = Math.min(130, Math.max(70, j.forma));
    clampStatValues(j);
  }
}

/**
 * Oscilação ao entrar em competição (reset parcial de forma).
 * @param {import('./campaign-pool.js').JogadorCampanha[]} jogadoresConvocados
 * @param {number} seed
 */
export function aplicarOscilacaoPreCompeticao(jogadoresConvocados, seed) {
  const rng = criarRng((seed + 1) >>> 0);
  for (const j of jogadoresConvocados) {
    j.forma = Math.round(95 + rng() * 15);
    clampStatValues(j);
  }
}
