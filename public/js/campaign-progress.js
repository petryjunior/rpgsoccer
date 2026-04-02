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

/** Tendência de crescimento (18–27): mais forte no início da carreira, suave perto dos 27. */
function fatorTendenciaSubidaIdade(idade) {
  if (idade > 27) return 0;
  const t = (28 - idade) / 10;
  return Math.pow(Math.max(0, Math.min(1, t)), 0.68);
}

/** Tendência de declínio (28+): acelera de forma sublinear com a idade. */
function fatorTendenciaQuedaIdade(idade) {
  if (idade < 28) return 0;
  const t = (idade - 27) / 16;
  return Math.pow(Math.max(0, Math.min(1, t)), 0.62);
}

/**
 * @param {import('./campaign-pool.js').JogadorCampanha} j
 * @param {"ataque" | "defesa"} attr
 * @param {number} delta
 */
function aplicarDeltaAttr(j, attr, delta) {
  if (delta === 0) return;
  if (attr === "ataque") {
    j.ataque = Math.min(j.potencial, Math.max(1, j.ataque + delta));
  } else {
    j.defesa = Math.min(j.potencial, Math.max(1, j.defesa + delta));
  }
}

/**
 * Baseline da temporada atual (convocação mostra delta vs estes valores).
 * @param {import('./campaign-pool.js').JogadorCampanha[]} jogadores
 */
export function snapshotReferenciasTemporadaCampanha(jogadores) {
  for (const j of jogadores) {
    j.refAtaqueTemporada = j.ataque;
    j.refDefesaTemporada = j.defesa;
  }
}

/**
 * +1 ano civil por temporada concluída no calendário da campanha.
 * @param {import('./campaign-pool.js').JogadorCampanha[]} jogadores
 */
export function incrementarIdadeElencoCampanha(jogadores) {
  for (const j of jogadores) {
    j.idade = Math.min(45, (j.idade ?? 22) + 1);
  }
}

/**
 * Após uma partida: oscilações maiores no mesmo ano (forma + ruído; viés por idade).
 * @param {import('./campaign-pool.js').JogadorCampanha[]} todosJogadores
 * @param {Set<string>} idsConvocados
 * @param {number} seed
 */
export function aplicarEfeitoPosPartidaCampanha(todosJogadores, idsConvocados, seed) {
  const rng = criarRng((seed ^ 0x9e3779b9) >>> 0);
  for (const j of todosJogadores) {
    if (!idsConvocados.has(j.id)) continue;
    const fator = (j.forma - 100) / 200;
    const delta = Math.round((rng() - 0.5) * 10 + fator * 4);
    const sub = fatorTendenciaSubidaIdade(j.idade);
    const queda = fatorTendenciaQuedaIdade(j.idade);
    const pJovem = 0.1 + sub * 0.32;
    const pVelho = 0.08 + queda * 0.28;
    const trip = rng();
    const magPeq = () => (rng() < 0.55 ? 1 : 2);
    if (trip < pJovem && rng() < 0.5) {
      if (rng() < 0.5) aplicarDeltaAttr(j, "ataque", magPeq());
      else aplicarDeltaAttr(j, "defesa", magPeq());
    } else if (trip < pJovem + pVelho && rng() < 0.46) {
      const m = rng() < 0.65 ? 1 : 2;
      if (rng() < 0.5) aplicarDeltaAttr(j, "ataque", -m);
      else aplicarDeltaAttr(j, "defesa", -m);
    } else if (delta !== 0 && rng() < 0.62) {
      const d = Math.max(-4, Math.min(4, delta));
      if (rng() < 0.5) aplicarDeltaAttr(j, "ataque", d);
      else aplicarDeltaAttr(j, "defesa", d);
    }
    clampStatValues(j);
  }
}

/**
 * Quando o mês da campanha avança: oscilação temporária mais forte em todo o elenco.
 * @param {import('./campaign-pool.js').JogadorCampanha[]} jogadores
 * @param {number} seed
 */
export function aplicarOscilacaoMensalCampanha(jogadores, seed) {
  const rng = criarRng((seed ^ 0xa56f91c7) >>> 0);
  for (const j of jogadores) {
    const sub = fatorTendenciaSubidaIdade(j.idade);
    const queda = fatorTendenciaQuedaIdade(j.idade);
    const pUp = 0.04 + sub * 0.16;
    const pDown = 0.038 + queda * 0.18;
    const r = rng();
    const magMes = () => {
      const u = rng();
      if (u < 0.07) return rng() < 0.5 ? 3 : 4;
      if (u < 0.35) return 2;
      return 1;
    };
    if (r < pUp && rng() < 0.48) {
      if (rng() < 0.5) aplicarDeltaAttr(j, "ataque", magMes());
      else aplicarDeltaAttr(j, "defesa", magMes());
    } else if (r < pUp + pDown && rng() < 0.5) {
      const m = magMes();
      if (rng() < 0.5) aplicarDeltaAttr(j, "ataque", -m);
      else aplicarDeltaAttr(j, "defesa", -m);
    } else if (rng() < 0.26) {
      const d = Math.round((rng() - 0.5) * 9);
      const c = Math.max(-4, Math.min(4, d === 0 ? (rng() < 0.5 ? -1 : 1) : d));
      if (rng() < 0.5) aplicarDeltaAttr(j, "ataque", c);
      else aplicarDeltaAttr(j, "defesa", c);
    }
    clampStatValues(j);
  }
}

/**
 * Fim de temporada: forma + progressão anual com saltos de 1–3 pontos possíveis por atributo.
 * Chamar após {@link incrementarIdadeElencoCampanha}.
 * @param {import('./campaign-pool.js').JogadorCampanha[]} jogadores
 * @param {number} seed
 */
export function aplicarProgressaoFimDeJanela(jogadores, seed) {
  const rng = criarRng(seed >>> 0);
  for (const j of jogadores) {
    const sub = fatorTendenciaSubidaIdade(j.idade);
    const queda = fatorTendenciaQuedaIdade(j.idade);

    const magCrescimento = () => {
      const u = rng();
      if (u < 0.07 + sub * 0.16) return 3;
      if (u < 0.32 + sub * 0.28) return 2;
      return 1;
    };
    const magQueda = () => {
      const u = rng();
      if (u < 0.06 + queda * 0.14) return 3;
      if (u < 0.3 + queda * 0.26) return 2;
      return 1;
    };

    const attr = rng() < 0.5 ? "ataque" : "defesa";
    const limUp = 0.42 + sub * 0.26;
    const limDown = Math.min(0.94, limUp + 0.34 + queda * 0.22);
    const ru = rng();
    if (ru < limUp) {
      aplicarDeltaAttr(j, attr, magCrescimento());
    } else if (ru < limDown) {
      aplicarDeltaAttr(j, attr, -magQueda());
    } else if (ru < 0.9) {
      aplicarDeltaAttr(j, attr, rng() < 0.5 ? -1 : 1);
    }

    if (rng() < 0.2 + sub * 0.12 + queda * 0.1) {
      const outro = attr === "ataque" ? "defesa" : "ataque";
      const fav = 0.48 + sub * 0.1 - queda * 0.08;
      const s = rng() < fav ? 1 : -1;
      const m = rng() < 0.14 ? 2 : 1;
      aplicarDeltaAttr(j, outro, s * m);
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
