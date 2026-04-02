/**
 * Eliminatórias da Copa do Mundo no modo Campanha (2027–2029 → Copa de 2030).
 * Por confederação (como na realidade), calendário em janelas tipo datas FIFA ao longo dos três anos.
 */

import {
  criarTorneioCampanhaComPool,
  montarGruposPorFormato,
  vencedorConfrontoIdaVoltaEliminatorias,
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

/** Ano da primeira Copa do Mundo jogável no modo campanha (ciclos repetem a cada 4 anos). */
export const ANO_COPA_MUNDO_CAMPANHA = 2030;

/** Intervalo entre Copas do Mundo na campanha (anos civis). */
export const INTERVALO_ANOS_ENTRE_COPAS_CAMPANHA = 4;

/** @deprecated Use `copaAlvoEliminatoriasDoAno`; mantido para saves/legado. */
export const ANO_ULTIMA_ELIMINATORIA = 2029;

/**
 * Anos com eliminatórias no primeiro ciclo (2030). Novos ciclos usam `anoComEliminatoriasCopa`.
 * @deprecated
 */
export const ANOS_ELIMINATORIAS_COPA = [2027, 2028, 2029];

/**
 * @param {number} anoCopa ex.: 2030, 2034
 * @returns {[number, number, number]}
 */
export function anosTresEliminatoriasAntesDaCopa(anoCopa) {
  return [anoCopa - 3, anoCopa - 2, anoCopa - 1];
}

/**
 * @param {number} ano civil (calendário da campanha)
 * @returns {boolean}
 */
export function anoComEliminatoriasCopa(ano) {
  return copaAlvoEliminatoriasDoAno(ano) != null;
}

/**
 * Copa à qual pertencem as eliminatórias jogadas em `anoCivil` (ex.: 2028 → 2030).
 * @param {number} anoCivil
 * @returns {number | null}
 */
export function copaAlvoEliminatoriasDoAno(anoCivil) {
  if (!Number.isFinite(anoCivil)) return null;
  for (
    let cup = ANO_COPA_MUNDO_CAMPANHA;
    cup <= anoCivil + 3;
    cup += INTERVALO_ANOS_ENTRE_COPAS_CAMPANHA
  ) {
    const lo = cup - 3;
    const hi = cup - 1;
    if (anoCivil >= lo && anoCivil <= hi) return cup;
  }
  return null;
}

/**
 * Ano civil em que se disputa a Copa (jun/jul no jogo).
 * @param {number} ano
 */
export function anoEhCopaMundialCampanha(ano) {
  if (!Number.isFinite(ano) || ano < ANO_COPA_MUNDO_CAMPANHA) return false;
  return (ano - ANO_COPA_MUNDO_CAMPANHA) % INTERVALO_ANOS_ENTRE_COPAS_CAMPANHA === 0;
}

/**
 * Hub: disputar/acompanhar o Mundial só em junho–julho do ano da Copa (época do torneio no calendário),
 * não desde 1 de janeiro.
 * @param {number} anoCivil
 * @param {number} mes 1–12
 */
export function campanhaEstaNaJanelaCopaDoMundo(anoCivil, mes) {
  if (!anoEhCopaMundialCampanha(anoCivil)) return false;
  const m = Number(mes);
  if (!Number.isFinite(m)) return false;
  return m >= 6 && m <= 7;
}

/**
 * Último ano de eliminatórias imediatamente antes da Copa `anoCopa`.
 * @param {number} anoCopa
 */
export function ultimoAnoEliminatoriasAntesCopa(anoCopa) {
  return anoCopa - 1;
}

/**
 * Doze janelas FIFA (mar/jun/set/nov × 3 anos) para o ciclo que culmina em `anoCopa`.
 * @param {number} anoCopa
 */
function janelasFifaWcqParaCopa(anoCopa) {
  /** @type {{ ano: number, mes: number }[]} */
  const j = [];
  for (const a of anosTresEliminatoriasAntesDaCopa(anoCopa)) {
    for (const mes of [3, 6, 9, 11]) {
      j.push({ ano: a, mes });
    }
  }
  return j;
}

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

/** Texto base (com ano da Copa alvo). */
export function nomeTorneioEliminatoriasCopaMundial(anoCopa) {
  return `Eliminatórias — Copa do Mundo ${anoCopa}`;
}

/** @deprecated Preferir `nomeTorneioEliminatoriasCopaMundial(ANO_COPA_MUNDO_CAMPANHA)`. */
export const NOME_TORNEIO_ELIMINATORIAS = nomeTorneioEliminatoriasCopaMundial(ANO_COPA_MUNDO_CAMPANHA);

/**
 * Título das eliminatórias: não usar o nome do torneio continental (ex. Copa Ouro) — é outra competição.
 * O sufixo indica só a confederação/zona de qualificação.
 * @param {import('./campaign-confederation.js').ConfedKey | string | null | undefined} confKey
 * @param {number} [anoCopaAlvo]
 */
export function tituloEliminatoriasCopaMundial(confKey, anoCopaAlvo = ANO_COPA_MUNDO_CAMPANHA) {
  const base = nomeTorneioEliminatoriasCopaMundial(anoCopaAlvo);
  if (!confKey) return base;
  return `${base} (${confKey})`;
}

/**
 * Atualiza `nomeTorneio` e rótulos de eventos WCQ em saves que usavam "(Copa Ouro)", "(Eurocopa)", etc.
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 */
export function corrigirTitulosEliminatoriasCopaNoEstado(estado) {
  const T = estado.eliminatoriasCopa;
  if (!T || !T.confKey) return;
  const alvo = estado.wcqCicloCopaAlvo ?? ANO_COPA_MUNDO_CAMPANHA;
  const fixo = tituloEliminatoriasCopaMundial(T.confKey, alvo);
  const antigo = T.nomeTorneio;
  if (typeof antigo !== "string" || antigo === fixo) {
    T.nomeTorneio = fixo;
    return;
  }
  T.nomeTorneio = fixo;
  /** @param {import('./campaign-calendar.js').EventoCampanha | null | undefined} ev */
  const reparar = (ev) => {
    if (!ev || ev.tipo !== "eliminatorias_copa") return;
    if (typeof ev.rotulo === "string" && ev.rotulo.startsWith(antigo)) {
      ev.rotulo = fixo + ev.rotulo.slice(antigo.length);
    }
    if (typeof ev.torneioNome === "string" && ev.torneioNome === antigo) {
      ev.torneioNome = fixo;
    }
  };
  for (const ev of estado.eventos ?? []) reparar(ev);
  for (const ev of estado.wcqAgendaHumano ?? []) reparar(ev);

  T.eliminatoriasCopaMundial = true;
  if (
    T.fase === "fim" &&
    T.campeaoContinentalId &&
    (!Array.isArray(T.wcqClassificadosKoIds) || T.wcqClassificadosKoIds.length === 0)
  ) {
    T.wcqClassificadosKoIds = [T.campeaoContinentalId];
    T.campeaoContinentalId = null;
  }
}

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
function janelaFifaParaJogoWcq(indice, totalJogos, anoCopaAlvo) {
  const JANELAS = janelasFifaWcqParaCopa(anoCopaAlvo);
  const t = Math.max(1, totalJogos);
  const idx = Math.min(JANELAS.length - 1, Math.floor((indice + 0.5) * JANELAS.length / t));
  return JANELAS[idx];
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
    const j = T.ko.jogosRodada.find((x) => x.home === h && x.away === a);
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
 * Garante `eliminatoriasCopa` + `wcqAgendaHumano` para o ciclo da Copa alvo (novo sorteio a cada edição).
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {string[]} idsTodos
 */
export function garantirCicloEliminatoriasInicializado(estado, idsTodos) {
  const anoCal = estado.anoCalendario ?? 0;
  if (!anoComEliminatoriasCopa(anoCal)) return;
  const alvo = copaAlvoEliminatoriasDoAno(anoCal);
  if (!alvo) return;

  if (estado.wcqCicloCopaAlvo != null && estado.wcqCicloCopaAlvo !== alvo) {
    estado.wcqAgendaHumano = null;
    estado.eliminatoriasCopa = null;
    estado.wcqPontosAcumulados = {};
  }

  if (
    estado.wcqCicloCopaAlvo === alvo &&
    Array.isArray(estado.wcqAgendaHumano) &&
    estado.wcqAgendaHumano.length > 0
  ) {
    return;
  }

  const rng = criarRng((estado.seedCampanha ^ 0x5e1ec7 ^ alvo * 0x9e3779b1) >>> 0);
  const pool = idsCompeticaoContinental(estado.selecaoId, idsTodos);
  const { key: confKey } = dadosTorneioContinental(estado.selecaoId);
  const nomeTorneio = tituloEliminatoriasCopaMundial(confKey, alvo);
  const pre = montarGruposPredefinidosWcq(estado.selecaoId, pool, confKey, rng);

  const w = criarTorneioCampanhaComPool({
    selecaoPlayerId: estado.selecaoId,
    pool,
    anoCalendario: alvo - 3,
    rng,
    nomeTorneio,
    confKey,
    idSuffix: `wcq${alvo}`,
    tipoEvento: "eliminatorias_copa",
    maxSelecoes: null,
    gruposPredefinidos: pre,
  });

  estado.eliminatoriasCopa = w.torneioContinental;
  estado.wcqCicloCopaAlvo = alvo;
  const n = w.eventosTorneio.length;
  /** @type {import('./campaign-calendar.js').EventoCampanha[]} */
  const agenda = [];
  for (let i = 0; i < n; i++) {
    const e = w.eventosTorneio[i];
    const { ano, mes } = janelaFifaParaJogoWcq(i, n, alvo);
    agenda.push({
      ...e,
      id: `wcq-${alvo}-h${i}`,
      campanhaAno: ano,
      campanhaMes: mes,
      concluido: false,
    });
  }
  estado.wcqAgendaHumano = agenda;
}

/** Lista fixa para o texto do hub (32 vagas). */
const TEXTO_VAGAS_POR_CONFEDERACAO =
  "UEFA 13, CONMEBOL 5, CAF 5, CONCACAF 4, AFC 4, OFC 1";

/**
 * Regras e quotas das eliminatórias no hub.
 * @param {import('./campaign-tournament.js').TorneioContinentalEstado | null | undefined} T
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido | null | undefined} [estado] para o ano-alvo da Copa no ciclo
 */
export function textoRegrasEliminatoriasCopaCampanha(T, estado) {
  const alvo = estado?.wcqCicloCopaAlvo ?? ANO_COPA_MUNDO_CAMPANHA;
  const raw = T?.confKey;
  const conf =
    raw && Object.prototype.hasOwnProperty.call(VAGAS_COPA_POR_CONFEDERACAO, raw)
      ? /** @type {import('./campaign-confederation.js').ConfedKey} */ (raw)
      : "UEFA";
  const vagasZona = VAGAS_COPA_POR_CONFEDERACAO[conf];
  if (conf === "OFC") {
    return (
      `Ao todo são 32 vagas na Copa ${alvo}; na OFC há ${vagasZona} vaga. ` +
      `Distribuição geral no jogo: ${TEXTO_VAGAS_POR_CONFEDERACAO}. ` +
      `Como só existem duas seleções na zona, não há grupos: a vaga decide-se num confronto direto em ida e volta (agregado; gols fora; sorteio). ` +
      `Cada ciclo de Copa repete esse formato entre as duas.`
    );
  }
  return (
    `Ao todo são 32 vagas na Copa ${alvo}; na sua confederação (${conf}) há ${vagasZona} vagas. ` +
    `Distribuição geral: ${TEXTO_VAGAS_POR_CONFEDERACAO}. ` +
    `As seleções classificadas na sua zona são as ${vagasZona} com mais pontos acumulados nos três anos de fase de grupos (jogos em ida e volta, em janelas tipo datas FIFA). ` +
    `Empates no ranking usam, entre outras coisas, a força média do elenco. ` +
    `Não há semifinal nem final entre grupos para distribuir essas vagas — só a fase de grupos alimenta o ranking do ciclo. ` +
    `Cada ciclo de Copa sorteia de novo os grupos na sua zona.`
  );
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
  if (T.formato === "OFC_2_final" && T.ko?.jogosRodada?.length) {
    if (!estado.wcqPontosAcumulados) estado.wcqPontosAcumulados = {};
    const jogos = T.ko.jogosRodada;
    if (T.idaVoltaMataMata && jogos.length >= 2) {
      const j1 = jogos[0];
      const j2 = jogos[1];
      if (j1.gh < 0) {
        const { gh, ga } = simularResultadoDireto(j1.home, j1.away, rng);
        j1.gh = gh;
        j1.ga = ga;
      }
      if (j2.gh < 0) {
        const { gh, ga } = simularResultadoDireto(j2.home, j2.away, rng);
        j2.gh = gh;
        j2.ga = ga;
      }
      const win = vencedorConfrontoIdaVoltaEliminatorias(j1, j2, rng);
      const lose = win === j1.home ? j1.away : j1.home;
      estado.wcqPontosAcumulados[win] = (estado.wcqPontosAcumulados[win] ?? 0) + 120;
      estado.wcqPontosAcumulados[lose] = (estado.wcqPontosAcumulados[lose] ?? 0) + 40;
      return;
    }
    const j = jogos[0];
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
  // Não simular aqui todas as partidas de grupo: isso preenchia o motor antes do calendário
  // (jogos de anos futuros apareciam com placar e a tabela com 6 jogos por equipa).
  // Partidas CPU×CPU fora da rodada do humano são resolvidas em `simularRodadaGruposExcetoPar`;
  // pontos anuais usam só jogos já decididos (`gh >= 0`).
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
 * @param {number} anoCopa ex.: 2030, 2034
 */
export function finalizarClassificadosCopaMundial(estado, idsTodos, rng, anoCopa) {
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
  estado.copaClassificadosAno = anoCopa;
  estado.copa2030Concluida = false;
}

/**
 * @deprecated Use `finalizarClassificadosCopaMundial(..., ANO_COPA_MUNDO_CAMPANHA)`.
 */
export function finalizarClassificadosCopa2030(estado, idsTodos, rng) {
  finalizarClassificadosCopaMundial(estado, idsTodos, rng, ANO_COPA_MUNDO_CAMPANHA);
}

/**
 * Preenche `wcqCicloCopaAlvo` e `copaClassificadosAno` em saves antigos.
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 */
export function inferirMetadadosCiclosCopaCampanha(estado) {
  if (estado.copaClassificadosAno == null && Array.isArray(estado.classificadosCopa2030) && estado.classificadosCopa2030.length === 32) {
    estado.copaClassificadosAno = ANO_COPA_MUNDO_CAMPANHA;
  }
  if (
    estado.wcqCicloCopaAlvo == null &&
    Array.isArray(estado.wcqAgendaHumano) &&
    estado.wcqAgendaHumano.length > 0
  ) {
    const anos = estado.wcqAgendaHumano.map((e) => e.campanhaAno).filter((n) => Number.isFinite(n));
    if (anos.length) estado.wcqCicloCopaAlvo = copaAlvoEliminatoriasDoAno(Math.min(...anos));
  }
}
