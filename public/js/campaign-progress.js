/**
 * Progressão e oscilação de atributos no modo Campanha (v1).
 */

import { listasNomesCampanha } from "./campaign-names.js";
import { hashStringToSeed, statsPorPosicaoCampanha, forcaMediaTitularesSelecao } from "./campaign-pool.js";
import { criarRng } from "./world-cup.js";

/**
 * Probabilidade de aposentadoria + regeneração (filho) ao fim do ano civil, após +1 idade.
 * @param {number} idade idade atual do jogador (já incrementada para o novo ano).
 */
export function chanceAposentadoriaRegenPorIdade(idade) {
  if (idade < 36) return 0;
  if (idade >= 42) return 0.99;
  const t = /** @type {Record<number, number>} */ ({
    36: 0.25,
    37: 0.35,
    38: 0.45,
    39: 0.55,
    40: 0.8,
    41: 0.95,
  });
  return t[idade] ?? 0.99;
}

/**
 * @param {() => number} rng
 * @param {number} lo
 * @param {number} hi
 */
function intRngRegen(rng, lo, hi) {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/**
 * Fim de temporada: jogadores 36+ podem “se aposentar” e voltar no ano seguinte como jovem
 * (novo prenome, mesmo sobrenome, stats e idade 16–18, novo id). Atualiza `convocadosIds` se preciso.
 *
 * @param {import('./campaign-pool.js').JogadorCampanha[]} jogadores
 * @param {string[]} convocadosIds mutável
 * @param {string} selecaoId
 * @param {number} temporadaParaIds temporada **após** o avanço (ex.: temporada + 1 antes do incremento no estado)
 * @param {number} seedBase
 */
export function processarAposentadoriaERegeneracaoCampanha(
  jogadores,
  convocadosIds,
  selecaoId,
  temporadaParaIds,
  seedBase,
) {
  const existing = new Set(jogadores.map((j) => j.id));
  const fm = forcaMediaTitularesSelecao(selecaoId);
  const { prenomes } = listasNomesCampanha(selecaoId);
  if (!prenomes.length) return;

  let regenSerial = 0;

  for (let i = 0; i < jogadores.length; i++) {
    const j = jogadores[i];
    const idade = j.idade ?? 22;
    const p = chanceAposentadoriaRegenPorIdade(idade);
    if (p <= 0) continue;

    const rngRoll = criarRng((seedBase ^ hashStringToSeed(j.id)) >>> 0);
    if (rngRoll() >= p) continue;

    const rng = criarRng((seedBase ^ hashStringToSeed(j.id) ^ 0xbad5eed) >>> 0);

    const parts = String(j.nome || "").trim().split(/\s+/);
    const oldPrenome = parts[0] || "Jogador";
    const sobrenomeResto = parts.length > 1 ? parts.slice(1).join(" ") : "";

    let novoPrenome = prenomes[intRngRegen(rng, 0, prenomes.length - 1)];
    let tent = 0;
    while (novoPrenome.toLowerCase() === oldPrenome.toLowerCase() && tent < 48) {
      novoPrenome = prenomes[intRngRegen(rng, 0, prenomes.length - 1)];
      tent++;
    }

    const novoNome = sobrenomeResto ? `${novoPrenome} ${sobrenomeResto}` : novoPrenome;

    const novaIdade = intRngRegen(rng, 16, 18);
    let ataque;
    let defesa;
    ({ ataque, defesa } = statsPorPosicaoCampanha(j.posicao, rng, fm));
    ataque = Math.min(99, Math.max(1, ataque + intRngRegen(rng, -10, 10)));
    defesa = Math.min(99, Math.max(1, defesa + intRngRegen(rng, -10, 10)));

    const basePot = Math.max(ataque, defesa);
    const tetoPot = Math.min(
      99,
      Math.max(basePot + 5, Math.round(fm + intRngRegen(rng, 6, 22))),
    );
    const potencial = intRngRegen(rng, basePot, Math.max(basePot, tetoPot));

    existing.delete(j.id);
    let novoId;
    do {
      novoId = `camp-${selecaoId}-s${temporadaParaIds}-r${String(regenSerial).padStart(5, "0")}`;
      regenSerial++;
    } while (existing.has(novoId));
    existing.add(novoId);

    const ci = convocadosIds.indexOf(j.id);
    if (ci >= 0) convocadosIds[ci] = novoId;

    jogadores[i] = {
      id: novoId,
      nome: novoNome,
      posicao: j.posicao,
      ataque,
      defesa,
      idade: novaIdade,
      potencial,
      forma: 100,
    };
  }
}

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
 * Opcional: `minutosPorJogadorId` — só quem jogou >0 min recebe intensidade extra (jovem sobe mais, veterano desce mais).
 * Opcional: `idsBonusAttrMaiorInicio` — bónus raro (ex.: atributo acima do snapshot do após duelos fortes).
 * @param {import('./campaign-pool.js').JogadorCampanha[]} todosJogadores
 * @param {Set<string>} idsConvocados
 * @param {number} seed
 * @param {{
 *   minutosPorJogadorId?: Map<string, number>,
 *   idsBonusAttrMaiorInicio?: Set<string>,
 * }} [opts]
 */
export function aplicarEfeitoPosPartidaCampanha(todosJogadores, idsConvocados, seed, opts = {}) {
  const minutosMap = opts.minutosPorJogadorId instanceof Map ? opts.minutosPorJogadorId : null;
  const bonusAttr = opts.idsBonusAttrMaiorInicio instanceof Set ? opts.idsBonusAttrMaiorInicio : null;
  const rng = criarRng((seed ^ 0x9e3779b9) >>> 0);
  for (const j of todosJogadores) {
    if (!idsConvocados.has(j.id)) continue;
    const mp = minutosMap?.get(j.id) ?? 0;
    const temMinutos = mp > 0;
    const fMin = temMinutos ? Math.min(1, mp / 90) : 0;

    const fator = (j.forma - 100) / 200;
    const delta = Math.round((rng() - 0.5) * 10 + fator * 4);
    const sub = fatorTendenciaSubidaIdade(j.idade);
    const queda = fatorTendenciaQuedaIdade(j.idade);
    let pJovem = 0.1 + sub * 0.32;
    let pVelho = 0.08 + queda * 0.28;
    if (temMinutos) {
      if (sub > 0) pJovem *= 1 + 0.5 * fMin;
      if (queda > 0) pVelho *= 1 + 0.45 * fMin;
      const cap = pJovem + pVelho;
      if (cap > 0.86) {
        const t = 0.86 / cap;
        pJovem *= t;
        pVelho *= t;
      }
    }
    const trip = rng();
    const magPeq = () => {
      const base = rng() < 0.55 ? 1 : 2;
      if (!temMinutos) return base;
      const extra = fMin >= 0.55 ? 2 : fMin >= 0.22 ? 1 : 0;
      return base + extra;
    };
    if (trip < pJovem && rng() < 0.5) {
      if (rng() < 0.5) aplicarDeltaAttr(j, "ataque", magPeq());
      else aplicarDeltaAttr(j, "defesa", magPeq());
    } else if (trip < pJovem + pVelho && rng() < 0.46) {
      let m = rng() < 0.65 ? 1 : 2;
      if (temMinutos && queda > 0) {
        m = Math.max(1, m - (fMin >= 0.5 && rng() < 0.35 ? 1 : 0));
      }
      if (rng() < 0.5) aplicarDeltaAttr(j, "ataque", -m);
      else aplicarDeltaAttr(j, "defesa", -m);
    } else if (delta !== 0 && rng() < 0.62) {
      const d = Math.max(-4, Math.min(4, delta));
      if (rng() < 0.5) aplicarDeltaAttr(j, "ataque", d);
      else aplicarDeltaAttr(j, "defesa", d);
    }
    if (bonusAttr?.has(j.id) && rng() < 0.32) {
      if (rng() < 0.5) aplicarDeltaAttr(j, "ataque", 1);
      else aplicarDeltaAttr(j, "defesa", 1);
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
