/**
 * Eliminatórias da Copa do Mundo no modo Campanha (2027–2029 → Copa de 2030).
 * Por confederação (como na realidade), calendário em janelas tipo datas FIFA ao longo dos três anos.
 */

import {
  criarTorneioCampanhaComPool,
  montarGruposPorFormato,
  simularPartidasPendentesTodosGrupos,
} from "./campaign-tournament.js";
import { dadosTorneioContinental, idsCompeticaoContinental, selecoesPorConfederacao } from "./campaign-confederation.js";
import { elencoDaSelecao } from "./national-teams.js";
import {
  agregarClassificacao,
  criarRng,
  embaralhar,
  forcaMediaSelecao,
  ordenarGrupoFifa,
  simularPlacar,
} from "./world-cup.js";

/** Ano da primeira Copa do Mundo jogável no ciclo da campanha. */
export const ANO_COPA_MUNDO_CAMPANHA = 2030;

/** Último ano de eliminatórias antes da Copa. */
export const ANO_ULTIMA_ELIMINATORIA = 2029;

/** Anos com fase de eliminatórias (pontos do jogador na sua confederação + simulação das outras). */
export const ANOS_ELIMINATORIAS_COPA = [2027, 2028, 2029];

/** Doze janelas (mar/jun/set/nov × 3 anos). */
const JANELAS_FIFA_WCQ = (() => {
  /** @type {{ ano: number, mes: number }[]} */
  const j = [];
  for (const ano of ANOS_ELIMINATORIAS_COPA) {
    for (const mes of [3, 6, 9, 11]) {
      j.push({ ano, mes });
    }
  }
  return j;
})();

/**
 * Vagas aproximadas por confederação (total 32).
 * @type {Record<import('./campaign-confederation.js').ConfedKey, number>}
 */
export const VAGAS_COPA_POR_CONFEDERACAO = {
  UEFA: 13,
  CONMEBOL: 5,
  CONCACAF: 4,
  CAF: 5,
  AFC: 4,
  OFC: 1,
};

/**
 * @param {number} ano
 */
export function anoComEliminatoriasCopa(ano) {
  return ANOS_ELIMINATORIAS_COPA.includes(ano);
}

export const NOME_TORNEIO_ELIMINATORIAS = "Eliminatórias — Copa do Mundo 2030";

/**
 * Particiona `pool` em grupos com os tamanhos indicados (jogador fica no 1.º grupo).
 * @param {string} playerId
 * @param {string[]} pool
 * @param {() => number} rng
 * @param {number[]} tamanhos
 */
function particionarGruposTamanhos(playerId, pool, rng, tamanhos) {
  const mist = embaralhar(pool.filter((id) => id !== playerId), rng);
  /** @type {string[][]} */
  const grupos = tamanhos.map(() => []);
  grupos[0].push(playerId);
  let i = 0;
  for (const id of mist) {
    while (grupos[i].length >= tamanhos[i]) {
      i = (i + 1) % grupos.length;
    }
    grupos[i].push(id);
    i = (i + 1) % grupos.length;
  }
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  /** @type {Record<string, string[]>} */
  const out = {};
  for (let g = 0; g < grupos.length; g++) {
    out[letras[g]] = grupos[g];
  }
  return out;
}

/**
 * UEFA e confederações grandes: preferir grupos de 4 (estilo pré-eliminatória).
 * @param {number} n
 * @returns {number[] | null}
 */
function tamanhosGruposQuatro(n) {
  if (n < 12) return null;
  const base = Math.floor(n / 4);
  const r = n % 4;
  /** @type {number[]} */
  let t = [];
  if (r === 0) {
    t = Array(base).fill(4);
  } else if (r === 1) {
    const b = Math.max(0, base - 1);
    t = Array(b).fill(4);
    t.push(5);
  } else if (r === 2) {
    const b = Math.max(0, base - 1);
    t = Array(b).fill(4);
    t.push(3, 3);
  } else {
    t = Array(base).fill(4);
    t.push(3);
  }
  return t;
}

/**
 * @param {string} selecaoPlayerId
 * @param {string[]} pool ids da mesma confederação
 * @param {import('./campaign-confederation.js').ConfedKey} confKey
 * @param {() => number} rng
 */
export function montarGruposPredefinidosWcq(selecaoPlayerId, pool, confKey, rng) {
  const n = pool.length;
  if (n < 2) {
    throw new Error("Campanha: eliminatórias precisam de pelo menos 2 seleções na confederação.");
  }
  if (confKey === "UEFA") {
    const tam = tamanhosGruposQuatro(n);
    if (tam) {
      return {
        grupos: particionarGruposTamanhos(selecaoPlayerId, pool, rng, tam),
        formato: `UEFA_WCQ_${tam.join("_")}`,
      };
    }
  }
  return montarGruposPorFormato(selecaoPlayerId, pool, rng);
}

/**
 * @param {number} indice 0-based
 * @param {number} totalJogos
 */
function janelaFifaParaJogoWcq(indice, totalJogos) {
  const t = Math.max(1, totalJogos);
  const idx = Math.min(JANELAS_FIFA_WCQ.length - 1, Math.floor((indice + 0.5) * JANELAS_FIFA_WCQ.length / t));
  return JANELAS_FIFA_WCQ[idx];
}

/**
 * @param {import('./campaign-tournament.js').TorneioContinentalEstado | null | undefined} T
 * @param {import('./campaign-calendar.js').EventoCampanha} ev
 */
export function eventoWcqPartidaConcluida(T, ev) {
  if (!T) return false;
  if (ev.campanhaKoSlot && T.fase === "mata_mata" && T.ko) {
    const h = ev.campanhaParHome;
    const a = ev.campanhaParAway;
    if (!h || !a) return false;
    const j = T.ko.jogosRodada.find(
      (x) => (x.home === h && x.away === a) || (x.home === a && x.away === h),
    );
    return Boolean(j && j.gh >= 0);
  }
  if (ev.faseContinental !== "grupos" || !ev.campanhaGrupo) return false;
  const lista = T.partidasPorGrupo[ev.campanhaGrupo];
  const ix = ev.campanhaIdxPartidaGrupo;
  if (ix == null || ix < 0 || !lista) return false;
  const p = lista[ix];
  return Boolean(p && p.gh >= 0);
}

/**
 * @param {import('./campaign-tournament.js').TorneioContinentalEstado | null | undefined} T
 * @param {import('./campaign-calendar.js').EventoCampanha[]} templates
 * @returns {import('./campaign-calendar.js').EventoCampanha[]}
 */
export function clonarEventosWcqDoAnoComEstado(T, templates, anoCivil) {
  return templates
    .filter((e) => e.campanhaAno === anoCivil)
    .map((e) => ({
      ...e,
      concluido: eventoWcqPartidaConcluida(T, e),
    }));
}

/**
 * Garante `eliminatoriasCopa` + `wcqAgendaHumano` (ciclo único 2027–2029).
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {string[]} idsTodos
 */
export function garantirCicloEliminatoriasInicializado(estado, idsTodos) {
  if (!anoComEliminatoriasCopa(estado.anoCalendario ?? 0)) return;
  if (Array.isArray(estado.wcqAgendaHumano) && estado.wcqAgendaHumano.length > 0) return;

  const rng = criarRng((estado.seedCampanha ^ 0x5e1ec7) >>> 0);
  const pool = idsCompeticaoContinental(estado.selecaoId, idsTodos);
  const { nomeTorneio: nomeCont, key: confKey } = dadosTorneioContinental(estado.selecaoId);
  const nomeTorneio = `${NOME_TORNEIO_ELIMINATORIAS} (${nomeCont})`;
  const pre = montarGruposPredefinidosWcq(estado.selecaoId, pool, confKey, rng);

  const w = criarTorneioCampanhaComPool({
    selecaoPlayerId: estado.selecaoId,
    pool,
    anoCalendario: ANOS_ELIMINATORIAS_COPA[0],
    rng,
    nomeTorneio,
    confKey,
    idSuffix: "wcq",
    tipoEvento: "eliminatorias_copa",
    maxSelecoes: null,
    gruposPredefinidos: pre,
  });

  estado.eliminatoriasCopa = w.torneioContinental;
  const n = w.eventosTorneio.length;
  /** @type {import('./campaign-calendar.js').EventoCampanha[]} */
  const agenda = [];
  for (let i = 0; i < n; i++) {
    const e = w.eventosTorneio[i];
    const { ano, mes } = janelaFifaParaJogoWcq(i, n);
    agenda.push({
      ...e,
      id: `wcq-h${i}`,
      campanhaAno: ano,
      campanhaMes: mes,
      concluido: false,
    });
  }
  estado.wcqAgendaHumano = agenda;
}

/**
 * @param {import('./campaign-tournament.js').TorneioContinentalEstado | null | undefined} _T
 */
export function textoRegrasEliminatoriasCopaCampanha(_T) {
  return "Objetivo: somar pontos nas eliminatórias da sua confederação (2027–2029), em janelas ao longo de cada ano. Não há título de eliminatórias: as vagas para a Copa de 2030 seguem quotas por continente; o desempate usa o ranking acumulado e a força do elenco.";
}

/**
 * Simula jogos de grupo em aberto na confederação do jogador e atualiza ranking.
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {() => number} rng
 */
/** @param {string} id */
function forcaId(id) {
  return forcaMediaSelecao(elencoDaSelecao(id));
}

/**
 * @param {string} h
 * @param {string} a
 * @param {() => number} rng
 */
function simularResultadoDireto(h, a, rng) {
  for (let k = 0; k < 12; k++) {
    const { gh, ga } = simularPlacar(forcaId(h), forcaId(a), rng);
    if (gh !== ga) return { gh, ga };
  }
  return rng() < 0.5 ? { gh: 1, ga: 0 } : { gh: 0, ga: 1 };
}

export function agregarPontosEliminatoriasDoAno(estado, rng) {
  const T = estado.eliminatoriasCopa;
  if (!T) return;
  if (T.formato === "OFC_2_final" && T.ko?.jogosRodada?.[0]) {
    if (!estado.wcqPontosAcumulados) estado.wcqPontosAcumulados = {};
    const j = T.ko.jogosRodada[0];
    if (j.gh < 0) {
      const { gh, ga } = simularResultadoDireto(j.home, j.away, rng);
      j.gh = gh;
      j.ga = ga;
    }
    const win = j.gh > j.ga ? j.home : j.away;
    const lose = j.gh > j.ga ? j.away : j.home;
    estado.wcqPontosAcumulados[win] = (estado.wcqPontosAcumulados[win] ?? 0) + 120;
    estado.wcqPontosAcumulados[lose] = (estado.wcqPontosAcumulados[lose] ?? 0) + 40;
    return;
  }
  simularPartidasPendentesTodosGrupos(T, rng);
  if (!estado.wcqPontosAcumulados) estado.wcqPontosAcumulados = {};
  for (const L of Object.keys(T.grupos).sort()) {
    const ids = T.grupos[L];
    if (ids.length < 2) continue;
    const lista = T.partidasPorGrupo[L];
    const partidas = lista.filter((x) => x.gh >= 0);
    const ordem = ordenarGrupoFifa(ids, partidas, rng);
    const agg = agregarClassificacao(ids, partidas);
    const n = ordem.length;
    ordem.forEach((id, i) => {
      const r = agg[id];
      const posBonus = (n - i) * 4;
      const pts = r.pts * 10 + r.gf * 2 + r.sg + posBonus;
      estado.wcqPontosAcumulados[id] = (estado.wcqPontosAcumulados[id] ?? 0) + pts;
    });
  }
}

/**
 * @param {import('./campaign-confederation.js').ConfedKey} exceto
 * @param {string[]} idsTodos
 * @param {() => number} rng
 */
function simularAcumuloOutrasConfederacoes(estado, exceto, idsTodos, rng) {
  if (!estado.wcqPontosAcumulados) estado.wcqPontosAcumulados = {};
  const por = selecoesPorConfederacao(idsTodos);
  for (const ck of /** @type {const} */ ([
    "UEFA",
    "CONMEBOL",
    "CONCACAF",
    "CAF",
    "AFC",
    "OFC",
  ])) {
    if (ck === exceto) continue;
    for (const id of por[ck]) {
      const f = forcaMediaSelecao(elencoDaSelecao(id));
      estado.wcqPontosAcumulados[id] =
        (estado.wcqPontosAcumulados[id] ?? 0) + f * (2.5 + rng() * 3.5);
    }
  }
}

/**
 * Deve ser chamado no fim de cada ano de eliminatórias, depois de `agregarPontosEliminatoriasDoAno`.
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {string[]} idsTodos
 * @param {() => number} rng
 */
export function agregarSimulacaoOutrasConfederacoesWcq(estado, idsTodos, rng) {
  const { key } = dadosTorneioContinental(estado.selecaoId);
  simularAcumuloOutrasConfederacoes(estado, key, idsTodos, rng);
}

/**
 * Define os 32 classificados (quotas por confederação + ranking dentro de cada pool).
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {string[]} idsTodos
 * @param {() => number} rng
 */
export function finalizarClassificadosCopa2030(estado, idsTodos, rng) {
  if (!estado.wcqPontosAcumulados) estado.wcqPontosAcumulados = {};
  const por = selecoesPorConfederacao(idsTodos);
  const pts = estado.wcqPontosAcumulados;
  /** @type {string[]} */
  const classificados = [];
  for (const ck of /** @type {const} */ ([
    "UEFA",
    "CONMEBOL",
    "CONCACAF",
    "CAF",
    "AFC",
    "OFC",
  ])) {
    const pool = por[ck];
    const vagas = VAGAS_COPA_POR_CONFEDERACAO[ck];
    const k = Math.min(vagas, pool.length);
    const sorted = [...pool].sort((a, b) => {
      const d = (pts[b] ?? 0) - (pts[a] ?? 0);
      if (d !== 0) return d;
      return (
        forcaMediaSelecao(elencoDaSelecao(b)) - forcaMediaSelecao(elencoDaSelecao(a)) + (rng() - 0.5) * 0.01
      );
    });
    for (let i = 0; i < k; i++) {
      classificados.push(sorted[i]);
    }
  }
  estado.classificadosCopa2030 = classificados.slice(0, 32);
}
