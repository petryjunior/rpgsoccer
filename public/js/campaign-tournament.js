/**
 * Torneio continental no modo Campanha: grupos (tabela + rodadas), mata-mata e calendário
 * alinhados à quantidade de seleções por confederação no jogo.
 */

import { dadosTorneioContinental, idsCompeticaoContinental } from "./campaign-confederation.js";
import { elencoDaSelecao } from "./national-teams.js";
import {
  agregarClassificacao,
  aplicarResultadoNaLista,
  embaralhar,
  forcaMediaSelecao,
  ordenarGrupoFifa,
  partidasDoGrupo,
  simularPlacar,
} from "./world-cup.js";
import { ANO_BASE_CAMPANHA, textoMesAno } from "./campaign-dates.js";

/**
 * @typedef {import('./world-cup.js').ResultadoPartida} ResultadoPartida
 */

/**
 * @typedef {'grupos' | 'quartas' | 'semi' | 'final' | 'fim'} FaseMataMataCampanha
 */

/**
 * @typedef {{
 *   home: string,
 *   away: string,
 *   gh: number,
 *   ga: number,
 *   humanoEnvolvido: boolean,
 * }} JogoKoCampanha
 */

/**
 * @typedef {{
 *   confKey: string,
 *   nomeTorneio: string,
 *   formato: string,
 *   playerId: string,
 *   grupos: Record<string, string[]>,
 *   partidasPorGrupo: Record<string, ResultadoPartida[]>,
 *   rodadasPorGrupo: Record<string, [string, string][][]>,
 *   playerGrupo: string,
 *   fase: 'grupos' | 'mata_mata' | 'fim',
 *   rodadaGrupoHumanoAtual: number,
 *   eliminado: boolean,
 *   ko?: {
 *     fase: FaseMataMataCampanha,
 *     jogosRodada: JogoKoCampanha[],
 *     idxProximoJogoHumano: number,
 *     vencedoresAcumulados: string[],
 *   },
 * }} TorneioContinentalEstado
 */

/** @param {string} id */
function forcaSelecaoId(id) {
  return forcaMediaSelecao(elencoDaSelecao(id));
}

/**
 * Round-robin (Berger). Com n ímpar, um bye (null) por rodada.
 * @param {string[]} ids
 * @returns {[string, string][][]}
 */
export function gerarRodadasRoundRobin(ids) {
  let arr = [...ids];
  if (arr.length % 2 === 1) arr.push(/** @type {any} */ (null));
  const n = arr.length;
  const numRounds = n - 1;
  const half = n / 2;
  /** @type {[string, string][][]} */
  const rounds = [];
  for (let r = 0; r < numRounds; r++) {
    /** @type {[string, string][]} */
    const pairs = [];
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a != null && b != null) pairs.push([a, b]);
    }
    rounds.push(pairs);
    const fixed = arr[0];
    const last = arr[n - 1];
    const middle = arr.slice(1, n - 1);
    arr = [fixed, last, ...middle];
  }
  return rounds;
}

/**
 * @param {string} playerId
 * @param {string[]} pool
 * @param {() => number} rng
 * @param {number[]} tamanhos ex.: [5,5]
 */
function particionarGrupos(playerId, pool, rng, tamanhos) {
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
 * @param {Record<string, string[]>} grupos
 * @param {string} playerId
 */
function grupoDoJogador(grupos, playerId) {
  for (const L of Object.keys(grupos).sort()) {
    if (grupos[L].includes(playerId)) return L;
  }
  return "A";
}

/**
 * @param {string} playerId
 * @param {string[]} idsConf
 * @param {() => number} rng
 */
export function montarGruposPorFormato(playerId, idsConf, rng) {
  const n = idsConf.length;
  if (n < 2) throw new Error("Torneio: confederação precisa de pelo menos 2 seleções.");
  if (n === 2) {
    return { grupos: { A: [...idsConf] }, formato: "OFC_2_final" };
  }
  if (n === 8) {
    return {
      grupos: particionarGrupos(playerId, idsConf, rng, [4, 4]),
      formato: "DOIS_GRUPOS_4",
    };
  }
  if (n === 9) {
    return {
      grupos: particionarGrupos(playerId, idsConf, rng, [3, 3, 3]),
      formato: "TRES_GRUPOS_3",
    };
  }
  if (n === 10) {
    return {
      grupos: particionarGrupos(playerId, idsConf, rng, [5, 5]),
      formato: "DOIS_GRUPOS_5",
    };
  }
  if (n === 20) {
    return {
      grupos: particionarGrupos(playerId, idsConf, rng, [5, 5, 5, 5]),
      formato: "QUATRO_GRUPOS_5",
    };
  }
  if (n === 4) {
    return {
      grupos: particionarGrupos(playerId, idsConf, rng, [4]),
      formato: "UM_GRUPO_4",
    };
  }
  if (n === 3) {
    return {
      grupos: particionarGrupos(playerId, idsConf, rng, [3]),
      formato: "UM_GRUPO_3",
    };
  }
  if (n <= 6) {
    return {
      grupos: particionarGrupos(playerId, idsConf, rng, [n]),
      formato: `UM_GRUPO_${n}`,
    };
  }
  const a = Math.floor(n / 2);
  const b = n - a;
  return {
    grupos: particionarGrupos(playerId, idsConf, rng, [a, b]),
    formato: `DOIS_GRUPOS_${a}_${b}`,
  };
}

/**
 * @param {Record<string, string[]>} grupos
 * @returns {Record<string, ResultadoPartida[]>}
 */
function criarPartidasPorGrupo(grupos) {
  /** @type {Record<string, ResultadoPartida[]>} */
  const part = {};
  /** @type {Record<string, [string, string][][]>} */
  const rodadas = {};
  for (const L of Object.keys(grupos).sort()) {
    const ids = grupos[L];
    if (ids.length === 4) {
      part[L] = partidasDoGrupo(ids);
      const idxRodada = [
        [0, 5],
        [1, 4],
        [2, 3],
      ];
      rodadas[L] = idxRodada.map((ix) =>
        ix.map((pi) => {
          const p = part[L][pi];
          return /** @type {[string, string]} */ ([p.home, p.away]);
        }),
      );
    } else {
      rodadas[L] = gerarRodadasRoundRobin(ids);
      /** @type {ResultadoPartida[]} */
      const lista = [];
      for (const [h, a] of rodadas[L].flat()) {
        lista.push({ home: h, away: a, gh: -1, ga: -1 });
      }
      part[L] = lista;
    }
  }
  return { part, rodadas };
}

/**
 * @param {string} playerId
 * @param {string} grupo
 * @param {[string, string][][]} rodadas
 * @param {ResultadoPartida[]} lista
 * @param {'torneio_continental' | 'eliminatorias_copa'} tipoEvento
 * @param {string} nomeTorneio
 */
function agendaHumanoGrupo(playerId, grupo, rodadas, lista, tipoEvento, nomeTorneio) {
  /** @type {Record<string, unknown>[]} */
  const ev = [];
  for (let r = 0; r < rodadas.length; r++) {
    for (const [h, a] of rodadas[r]) {
      if (h !== playerId && a !== playerId) continue;
      const adv = h === playerId ? a : h;
      const humanoCasa = h === playerId;
      const partida = lista.find((p) => (p.home === h && p.away === a) || (p.home === a && p.away === h));
      const idx = partida ? lista.indexOf(partida) : -1;
      ev.push({
        id: "",
        tipo: tipoEvento,
        rotulo: "",
        adversarioId: adv,
        concluido: false,
        torneioNome: nomeTorneio,
        faseContinental: "grupos",
        campanhaGrupo: grupo,
        campanhaRodadaGrupo: r + 1,
        campanhaHumanoCasa: humanoCasa,
        campanhaParHome: h,
        campanhaParAway: a,
        campanhaIdxPartidaGrupo: idx,
      });
    }
  }
  return ev;
}

/**
 * Seleções da mesma confederação que constam do mapa (evita “UEFA” por defeito para todas as não listadas).
 * @param {string} selecaoPlayerId
 * @param {string[]} idsTodos
 */
function poolConfederacaoCampanha(selecaoPlayerId, idsTodos) {
  let pool = idsCompeticaoContinental(selecaoPlayerId, idsTodos);
  if (!pool.includes(selecaoPlayerId)) {
    pool = [selecaoPlayerId, ...pool];
  }
  return pool;
}

/**
 * @param {string} selecaoPlayerId
 * @param {string[]} idsSelecoes
 * @param {number} anoCalendario
 * @param {() => number} rng
 */
const MAX_SELECOES_TORNEIO_CONTINENTAL = 20;

/**
 * @param {{
 *   selecaoPlayerId: string,
 *   pool: string[],
 *   anoCalendario: number,
 *   rng: () => number,
 *   nomeTorneio: string,
 *   confKey: string,
 *   idSuffix: string,
 *   tipoEvento: 'torneio_continental' | 'eliminatorias_copa',
 *   maxSelecoes: number | null,
 *   gruposPredefinidos?: { grupos: Record<string, string[]>, formato: string } | null,
 * }} op
 */
export function criarTorneioCampanhaComPool(op) {
  const {
    selecaoPlayerId,
    pool: poolIn,
    anoCalendario,
    rng,
    nomeTorneio,
    confKey,
    idSuffix,
    tipoEvento,
    maxSelecoes,
    gruposPredefinidos,
  } = op;

  let pool = [...new Set(poolIn)];
  if (!pool.includes(selecaoPlayerId)) {
    pool = [selecaoPlayerId, ...pool];
  }
  if (maxSelecoes != null && pool.length > maxSelecoes) {
    const outros = embaralhar(
      pool.filter((id) => id !== selecaoPlayerId),
      rng,
    ).slice(0, maxSelecoes - 1);
    pool = [selecaoPlayerId, ...outros];
  }

  const base = `a${anoCalendario}-${idSuffix}-`;

  if (pool.length === 2) {
    const outro = pool.find((id) => id !== selecaoPlayerId) ?? pool[0];
    /** @type {TorneioContinentalEstado} */
    const torneioContinental = {
      confKey,
      nomeTorneio,
      formato: "OFC_2_final",
      playerId: selecaoPlayerId,
      grupos: { A: pool },
      partidasPorGrupo: { A: [] },
      rodadasPorGrupo: { A: [] },
      playerGrupo: "A",
      fase: "mata_mata",
      rodadaGrupoHumanoAtual: 0,
      eliminado: false,
      ko: {
        fase: "final",
        jogosRodada: [
          {
            home: selecaoPlayerId,
            away: outro,
            gh: -1,
            ga: -1,
            humanoEnvolvido: true,
          },
        ],
        idxProximoJogoHumano: 0,
        vencedoresAcumulados: [],
      },
    };
    const e0 = {
      id: `${base}fin`,
      tipo: tipoEvento,
      rotulo: `${nomeTorneio} — final`,
      adversarioId: outro,
      concluido: false,
      torneioNome: nomeTorneio,
      faseContinental: /** @type {const} */ ("final"),
      campanhaHumanoCasa: true,
      campanhaParHome: selecaoPlayerId,
      campanhaParAway: outro,
      campanhaGrupo: null,
      campanhaRodadaGrupo: null,
      campanhaIdxPartidaGrupo: null,
      campanhaKoSlot: true,
    };
    return { torneioContinental, eventosTorneio: [e0] };
  }

  const { grupos, formato } =
    gruposPredefinidos ??
    montarGruposPorFormato(selecaoPlayerId, pool, rng);
  const { part: partidasPorGrupo, rodadas: rodadasPorGrupo } = criarPartidasPorGrupo(grupos);
  const playerGrupo = grupoDoJogador(grupos, selecaoPlayerId);
  const listaP = partidasPorGrupo[playerGrupo];
  const rodadasP = rodadasPorGrupo[playerGrupo];
  const agenda = agendaHumanoGrupo(
    selecaoPlayerId,
    playerGrupo,
    rodadasP,
    listaP,
    tipoEvento,
    nomeTorneio,
  );

  /** @type {TorneioContinentalEstado} */
  const torneioContinental = {
    confKey,
    nomeTorneio,
    formato,
    playerId: selecaoPlayerId,
    grupos,
    partidasPorGrupo,
    rodadasPorGrupo,
    playerGrupo,
    fase: "grupos",
    rodadaGrupoHumanoAtual: 0,
    eliminado: false,
  };

  const eventosTorneio = agenda.map((e, i) => ({
    ...e,
    id: `${base}g${i}`,
    torneioNome: nomeTorneio,
    rotulo: `${nomeTorneio} — Grupo ${playerGrupo} · rodada ${e.campanhaRodadaGrupo}/${rodadasP.length}`,
  }));

  return { torneioContinental, eventosTorneio };
}

export function criarTorneioContinentalCampanha(selecaoPlayerId, idsSelecoes, anoCalendario, rng) {
  const { nomeTorneio, key: confKey } = dadosTorneioContinental(selecaoPlayerId);
  const pool = poolConfederacaoCampanha(selecaoPlayerId, idsSelecoes);
  return criarTorneioCampanhaComPool({
    selecaoPlayerId,
    pool,
    anoCalendario,
    rng,
    nomeTorneio,
    confKey,
    idSuffix: "tor",
    tipoEvento: "torneio_continental",
    maxSelecoes: MAX_SELECOES_TORNEIO_CONTINENTAL,
  });
}

/**
 * @param {() => number} rng
 */
function simularAteDecidir(fCasa, fFora, rng) {
  for (let k = 0; k < 12; k++) {
    const { gh, ga } = simularPlacar(fCasa, fFora, rng);
    if (gh !== ga) return { gh, ga };
  }
  return rng() < 0.5 ? { gh: 1, ga: 0 } : { gh: 0, ga: 1 };
}

/**
 * Simula todos os jogos da mesma rodada (índice 0-based) em todos os grupos, exceto o par do humano (já aplicado).
 * @param {TorneioContinentalEstado} T
 * @param {number} rodadaIdx0
 * @param {string | null} skipHome
 * @param {string | null} skipAway
 * @param {() => number} rng
 */
function simularRodadaGruposExcetoPar(T, rodadaIdx0, skipHome, skipAway, rng) {
  for (const L of Object.keys(T.grupos).sort()) {
    const rodadas = T.rodadasPorGrupo[L];
    const lista = T.partidasPorGrupo[L];
    if (!rodadas[rodadaIdx0]) continue;
    for (const [h, a] of rodadas[rodadaIdx0]) {
      if (skipHome && skipAway && h === skipHome && a === skipAway) continue;
      const p = lista.find((x) => (x.home === h && x.away === a) || (x.home === a && x.away === h));
      if (p && p.gh >= 0) continue;
      const { gh, ga } = simularAteDecidir(forcaSelecaoId(h), forcaSelecaoId(a), rng);
      aplicarResultadoNaLista(lista, h, a, gh, ga);
    }
  }
}

/**
 * Preenche placares ainda não decididos em todos os grupos (pontuação de fim de ciclo).
 * @param {TorneioContinentalEstado} T
 * @param {() => number} rng
 */
export function simularPartidasPendentesTodosGrupos(T, rng) {
  if (!T?.grupos) return;
  for (const L of Object.keys(T.grupos).sort()) {
    const lista = T.partidasPorGrupo[L];
    if (!lista) continue;
    for (const p of lista) {
      if (p.gh >= 0) continue;
      const { gh, ga } = simularAteDecidir(forcaSelecaoId(p.home), forcaSelecaoId(p.away), rng);
      aplicarResultadoNaLista(lista, p.home, p.away, gh, ga);
    }
  }
}

/**
 * @param {TorneioContinentalEstado} T
 * @param {() => number} rng
 */
function ordenacaoGrupo(T, L, rng) {
  const ids = T.grupos[L];
  const lista = T.partidasPorGrupo[L];
  return ordenarGrupoFifa(ids, lista, rng);
}

/**
 * @param {TorneioContinentalEstado} T
 * @param {string} L
 * @param {string} teamId
 */
function linhaNoGrupo(T, L, teamId) {
  const tab = agregarClassificacao(T.grupos[L], T.partidasPorGrupo[L]);
  return tab[teamId];
}

/**
 * @returns {{ times: string[], primeiraFaseKo: FaseMataMataCampanha }}
 */
function qualificadosAposGrupos(T, rng) {
  const fmt = T.formato;
  const letras = Object.keys(T.grupos).sort();

  if (fmt.startsWith("UM_GRUPO_")) {
    const L = letras[0];
    const ord = ordenacaoGrupo(T, L, rng);
    const n = T.grupos[L].length;
    if (n <= 3) {
      return { times: [ord[0], ord[1]], primeiraFaseKo: "final" };
    }
    if (n === 4) {
      return { times: [ord[0], ord[1]], primeiraFaseKo: "final" };
    }
    return { times: ord.slice(0, 4), primeiraFaseKo: "semi" };
  }

  if (fmt.startsWith("DOIS_GRUPOS_")) {
    const [L1, L2] = letras;
    const o1 = ordenacaoGrupo(T, L1, rng);
    const o2 = ordenacaoGrupo(T, L2, rng);
    return {
      times: [o1[0], o1[1], o2[0], o2[1]],
      primeiraFaseKo: "semi",
    };
  }

  if (fmt === "QUATRO_GRUPOS_5") {
    const oA = ordenacaoGrupo(T, "A", rng);
    const oB = ordenacaoGrupo(T, "B", rng);
    const oC = ordenacaoGrupo(T, "C", rng);
    const oD = ordenacaoGrupo(T, "D", rng);
    return {
      times: [oA[0], oB[1], oB[0], oA[1], oC[0], oD[1], oD[0], oC[1]],
      primeiraFaseKo: "quartas",
    };
  }

  if (fmt === "TRES_GRUPOS_3") {
    const o1 = ordenacaoGrupo(T, "A", rng);
    const o2 = ordenacaoGrupo(T, "B", rng);
    const o3 = ordenacaoGrupo(T, "C", rng);
    const w1 = o1[0];
    const w2 = o2[0];
    const w3 = o3[0];
    const s1 = o1[1];
    const s2 = o2[1];
    const s3 = o3[1];
    /** @type {{ id: string, pts: number, sg: number, gf: number }[]} */
    const candidatos2 = [s1, s2, s3].map((id, i) => {
      const L = ["A", "B", "C"][i];
      const ln = linhaNoGrupo(T, L, id);
      return { id, pts: ln.pts, sg: ln.sg, gf: ln.gf };
    });
    candidatos2.sort((a, b) => b.pts - a.pts || b.sg - a.sg || b.gf - a.gf);
    const melhor2 = candidatos2[0].id;
    const quatro = [w1, w2, w3, melhor2];
    const ranked = quatro.map((id) => {
      const L = letras.find((l) => T.grupos[l].includes(id)) ?? "A";
      const ln = linhaNoGrupo(T, L, id);
      return { id, pts: ln.pts, sg: ln.sg, gf: ln.gf };
    });
    ranked.sort((a, b) => b.pts - a.pts || b.sg - a.sg || b.gf - a.gf);
    return {
      times: ranked.map((x) => x.id),
      primeiraFaseKo: "semi",
    };
  }

  return { times: [], primeiraFaseKo: "final" };
}

/**
 * Onde enfileirar jogos de mata-mata: antes dos amistosos já agendados para set./nov.,
 * para não “furar” a Copa com datas FIFA posteriores na ordem do array.
 * @param {import('./campaign-calendar.js').EventoCampanha[]} eventos
 */
function indiceInserirKoAntesAmistososFinais(eventos) {
  const i = eventos.findIndex(
    (e) => !e.concluido && e.tipo === "amistoso" && (e.campanhaMes ?? 0) >= 9,
  );
  return i < 0 ? eventos.length : i;
}

/**
 * Texto curto para o hub: quantos classificam e que fase eliminatória vem a seguir.
 * @param {TorneioContinentalEstado | null | undefined} T
 * @returns {string}
 */
export function textoRegrasClassificacaoTorneioCampanha(T) {
  if (!T || T.formato === "OFC_2_final") return "";
  const fmt = T.formato;
  if (fmt === "UM_GRUPO_3" || fmt === "UM_GRUPO_4") {
    return "Classificam os 2 primeiros; a decisão é direta (final).";
  }
  if (fmt.startsWith("UM_GRUPO_")) {
    return "Classificam os 4 primeiros do grupo; semifinais e final.";
  }
  if (fmt === "DOIS_GRUPOS_4" || fmt === "DOIS_GRUPOS_5") {
    return "Classificam 2 por grupo (4 no total); semifinais e final.";
  }
  if (fmt.startsWith("DOIS_GRUPOS_")) {
    return "Classificam 2 por grupo (4 no total); semifinais e final.";
  }
  if (fmt === "TRES_GRUPOS_3") {
    return "Classificam os três 1.ºs lugares e o melhor 2.º (4 no total); semifinais e final.";
  }
  if (fmt === "QUATRO_GRUPOS_5") {
    return "Classificam 2 por grupo (8 no total); quartas, semifinais e final.";
  }
  return "";
}

/**
 * @param {string} h
 * @param {string} a
 * @param {string} playerId
 */
function humanoEhCasa(h, a, playerId) {
  return h === playerId;
}

/**
 * @param {JogoKoCampanha} j
 * @param {string} playerId
 */
function jogoEnvolveHumano(j, playerId) {
  return j.home === playerId || j.away === playerId;
}

/**
 * @param {JogoKoCampanha} j
 * @param {() => number} rng
 */
function simularJogoKoCpu(j, rng) {
  const { gh, ga } = simularAteDecidir(forcaSelecaoId(j.home), forcaSelecaoId(j.away), rng);
  j.gh = gh;
  j.ga = ga;
}

/**
 * @param {JogoKoCampanha[]} jogos
 * @param {string} playerId
 * @param {() => number} rng
 */
function simularTodosCpuNaRodada(jogos, playerId, rng) {
  for (const j of jogos) {
    if (j.gh >= 0) continue;
    if (jogoEnvolveHumano(j, playerId)) continue;
    simularJogoKoCpu(j, rng);
  }
}

/**
 * @param {JogoKoCampanha[]} jogos
 */
function todosJogosRodadaDecididos(jogos) {
  return jogos.every((j) => j.gh >= 0);
}

/**
 * @param {JogoKoCampanha[]} jogos
 * @returns {string[]}
 */
function vencedoresNaOrdem(jogos) {
  return jogos.map((j) => (j.gh > j.ga ? j.home : j.away));
}

/**
 * @param {TorneioContinentalEstado} T
 * @param {() => number} rng
 */
function montarPrimeiraRodadaKo(T, rng) {
  const { times, primeiraFaseKo } = qualificadosAposGrupos(T, rng);
  if (!times.includes(T.playerId)) {
    T.eliminado = true;
    T.fase = "fim";
    return;
  }
  /** @type {JogoKoCampanha[]} */
  let jogos = [];
  /** @type {FaseMataMataCampanha} */
  let label = primeiraFaseKo;

  if (primeiraFaseKo === "final") {
    const jf = {
      home: times[0],
      away: times[1],
      gh: -1,
      ga: -1,
      humanoEnvolvido: false,
    };
    jf.humanoEnvolvido = jogoEnvolveHumano(jf, T.playerId);
    jogos = [jf];
    label = "final";
  } else if (primeiraFaseKo === "semi") {
    if (times.length === 4) {
      jogos = [
        { home: times[0], away: times[3], gh: -1, ga: -1, humanoEnvolvido: false },
        { home: times[1], away: times[2], gh: -1, ga: -1, humanoEnvolvido: false },
      ];
    } else {
      T.eliminado = true;
      T.fase = "fim";
      return;
    }
    for (const j of jogos) j.humanoEnvolvido = jogoEnvolveHumano(j, T.playerId);
    label = "semi";
  } else if (primeiraFaseKo === "quartas") {
    if (times.length !== 8) {
      T.eliminado = true;
      T.fase = "fim";
      return;
    }
    for (let i = 0; i < 8; i += 2) {
      jogos.push({
        home: times[i],
        away: times[i + 1],
        gh: -1,
        ga: -1,
        humanoEnvolvido: false,
      });
    }
    for (const j of jogos) j.humanoEnvolvido = jogoEnvolveHumano(j, T.playerId);
    label = "quartas";
  }

  T.fase = "mata_mata";
  T.ko = {
    fase: label,
    jogosRodada: jogos,
    idxProximoJogoHumano: 0,
    vencedoresAcumulados: [],
  };
  simularTodosCpuNaRodada(jogos, T.playerId, rng);
}

/**
 * @param {TorneioContinentalEstado} T
 * @param {() => number} rng
 */
function avancarParaProximaRodadaKo(T, rng) {
  const jogos = T.ko?.jogosRodada;
  if (!jogos || !todosJogosRodadaDecididos(jogos)) return;
  const wins = vencedoresNaOrdem(jogos);
  if (wins.length === 1) {
    T.fase = "fim";
    T.ko = undefined;
    return;
  }
  if (wins.length === 2) {
    T.ko = {
      fase: "final",
      jogosRodada: [
        {
          home: wins[0],
          away: wins[1],
          gh: -1,
          ga: -1,
          humanoEnvolvido: false,
        },
      ],
      idxProximoJogoHumano: 0,
      vencedoresAcumulados: wins,
    };
    T.ko.jogosRodada[0].humanoEnvolvido = jogoEnvolveHumano(T.ko.jogosRodada[0], T.playerId);
    simularTodosCpuNaRodada(T.ko.jogosRodada, T.playerId, rng);
    return;
  }
  if (wins.length === 4) {
    T.ko = {
      fase: "semi",
      jogosRodada: [
        { home: wins[0], away: wins[1], gh: -1, ga: -1, humanoEnvolvido: false },
        { home: wins[2], away: wins[3], gh: -1, ga: -1, humanoEnvolvido: false },
      ],
      idxProximoJogoHumano: 0,
      vencedoresAcumulados: wins,
    };
    for (const j of T.ko.jogosRodada) j.humanoEnvolvido = jogoEnvolveHumano(j, T.playerId);
    simularTodosCpuNaRodada(T.ko.jogosRodada, T.playerId, rng);
  }
}

/** @typedef {'continental' | 'wcq'} SlotTorneioCampanha */

/**
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {number} anoCalendario
 * @param {() => number} rng
 * @param {SlotTorneioCampanha} slot
 * @returns {boolean} true se enfileirou novo evento
 */
function enfileirarProximoJogoKo(estado, anoCalendario, rng, slot = "continental") {
  const T = slot === "wcq" ? estado.eliminatoriasCopa : estado.torneioContinental;
  if (!T || T.eliminado || T.fase === "fim") return false;
  if (T.fase !== "mata_mata" || !T.ko) return false;
  const jogos = T.ko.jogosRodada;
  let humano = jogos.find((j) => j.gh < 0 && jogoEnvolveHumano(j, T.playerId));
  if (!humano && todosJogosRodadaDecididos(jogos)) {
    avancarParaProximaRodadaKo(T, rng);
    if (T.fase !== "mata_mata" || !T.ko) return false;
    humano = T.ko.jogosRodada.find((j) => j.gh < 0 && jogoEnvolveHumano(j, T.playerId));
    simularTodosCpuNaRodada(T.ko.jogosRodada, T.playerId, rng);
    humano = T.ko.jogosRodada.find((j) => j.gh < 0 && jogoEnvolveHumano(j, T.playerId));
  }
  if (!humano) {
    if (T.ko && !todosJogosRodadaDecididos(T.ko.jogosRodada)) {
      simularTodosCpuNaRodada(T.ko.jogosRodada, T.playerId, rng);
      humano = T.ko.jogosRodada.find((j) => j.gh < 0 && jogoEnvolveHumano(j, T.playerId));
    }
  }
  if (!humano) return false;
  const adv = humano.home === T.playerId ? humano.away : humano.home;
  const tag = slot === "wcq" ? "wcq" : "tor";
  const tipoEv =
    slot === "wcq"
      ? /** @type {const} */ ("eliminatorias_copa")
      : /** @type {const} */ ("torneio_continental");
  const base = `a${anoCalendario}-${tag}-`;
  const pend = estado.eventos.find(
    (e) => !e.concluido && e.tipo === tipoEv && e.campanhaKoSlot,
  );
  if (pend && pend.adversarioId === adv && pend.faseContinental === T.ko.fase) return false;
  const nKo = estado.eventos.filter((e) => e.id.includes(`-${tag}-ko`)).length;
  const fase = T.ko.fase;
  const rotuloFase =
    fase === "quartas" ? "quartas de final" : fase === "semi" ? "semifinal" : "final";
  const mesKo = Math.min(8, 7 + nKo);
  const pre = textoMesAno(mesKo, anoCalendario);
  const novo = {
    id: `${base}ko${nKo}`,
    tipo: tipoEv,
    rotulo: `${pre} — ${T.nomeTorneio} — ${rotuloFase}`,
    adversarioId: adv,
    concluido: false,
    torneioNome: T.nomeTorneio,
    faseContinental: fase,
    campanhaHumanoCasa: humanoEhCasa(humano.home, humano.away, T.playerId),
    campanhaParHome: humano.home,
    campanhaParAway: humano.away,
    campanhaKoSlot: true,
    campanhaAno: anoCalendario,
    campanhaMes: mesKo,
  };
  const pos = indiceInserirKoAntesAmistososFinais(estado.eventos);
  estado.eventos.splice(pos, 0, novo);
  return true;
}

/**
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {number} anoCalendario
 * @param {() => number} rng
 * @param {SlotTorneioCampanha} [slot]
 */
export function iniciarMataMataSeAplicavel(estado, anoCalendario, rng, slot = "continental") {
  const T = slot === "wcq" ? estado.eliminatoriasCopa : estado.torneioContinental;
  if (!T || T.eliminado || T.fase !== "grupos") return;
  montarPrimeiraRodadaKo(T, rng);
  if (T.eliminado || T.fase !== "mata_mata") return;
  enfileirarProximoJogoKo(estado, anoCalendario, rng, slot);
}

/**
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {import('./campaign-calendar.js').EventoCampanha} evento
 * @param {number} golsJogador
 * @param {number} golsCpu
 * @param {() => number} rng
 */
export function aplicarResultadoPartidaTorneioCampanha(estado, evento, golsJogador, golsCpu, rng) {
  /** @type {SlotTorneioCampanha | null} */
  let slot = null;
  if (evento.tipo === "torneio_continental") slot = "continental";
  else if (evento.tipo === "eliminatorias_copa") slot = "wcq";
  if (!slot) return;

  const T = slot === "wcq" ? estado.eliminatoriasCopa : estado.torneioContinental;
  if (!T) return;
  const anoCal =
    estado.anoCalendario ?? ANO_BASE_CAMPANHA + ((estado.temporada ?? 1) - 1);

  const pid = T.playerId;
  let gh = golsJogador;
  let ga = golsCpu;
  if (evento.campanhaHumanoCasa === false) {
    gh = golsCpu;
    ga = golsJogador;
  }

  if (T.fase === "grupos" && evento.faseContinental === "grupos") {
    const L = T.playerGrupo;
    const lista = T.partidasPorGrupo[L];
    const h = /** @type {string} */ (evento.campanhaParHome);
    const a = /** @type {string} */ (evento.campanhaParAway);
    aplicarResultadoNaLista(lista, h, a, gh, ga);
    const rodadaIdx = (evento.campanhaRodadaGrupo ?? 1) - 1;
    simularRodadaGruposExcetoPar(T, rodadaIdx, h, a, rng);
    const rodadasP = T.rodadasPorGrupo[L];
    if (rodadaIdx >= rodadasP.length - 1 && slot !== "wcq") {
      iniciarMataMataSeAplicavel(estado, anoCal, rng, slot);
    }
    return;
  }

  if (T.fase === "mata_mata" && T.ko && evento.campanhaKoSlot) {
    const h = /** @type {string} */ (evento.campanhaParHome);
    const a = /** @type {string} */ (evento.campanhaParAway);
    const jogo = T.ko.jogosRodada.find(
      (j) =>
        (j.home === h && j.away === a) || (j.home === a && j.away === h),
    );
    if (!jogo) return;
    jogo.gh = gh;
    jogo.ga = ga;
    let win = jogo.gh > jogo.ga ? jogo.home : jogo.away;
    if (jogo.gh === jogo.ga) win = rng() < 0.5 ? jogo.home : jogo.away;
    if (win !== pid) {
      T.eliminado = true;
      T.fase = "fim";
      T.ko = undefined;
      return;
    }
    simularTodosCpuNaRodada(T.ko.jogosRodada, pid, rng);
    if (todosJogosRodadaDecididos(T.ko.jogosRodada)) {
      avancarParaProximaRodadaKo(T, rng);
      if (T.fase === "mata_mata" && T.ko) {
        simularTodosCpuNaRodada(T.ko.jogosRodada, pid, rng);
      }
    }
    enfileirarProximoJogoKo(estado, anoCal, rng, slot);
  }
}

/**
 * Tabelas do torneio para o hub (texto simples).
 * @param {TorneioContinentalEstado | null | undefined} T
 * @param {() => number} rng
 * @returns {{ titulo: string, linhas: string[] }[]}
 */
export function resumoTabelasTorneioCampanha(T, rng) {
  if (!T || T.formato === "OFC_2_final") return [];
  /** @type {{ titulo: string, linhas: string[] }[]} */
  const blocos = [];
  for (const L of Object.keys(T.grupos).sort()) {
    const ids = T.grupos[L];
    if (ids.length < 2) continue;
    const ord = ordenacaoGrupo(T, L, rng);
    const tab = agregarClassificacao(ids, T.partidasPorGrupo[L]);
    const linhas = ord.map((id, i) => {
      const ln = tab[id];
      return `${i + 1}. ${id}  ${ln.pts}pts  ${ln.pj}j  ${ln.vit}-${ln.emp}-${ln.der}  sg${ln.sg}`;
    });
    blocos.push({ titulo: `Grupo ${L}`, linhas });
  }
  return blocos;
}
