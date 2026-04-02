/**
 * Modo Campanha: convocação, estado novo e utilitários de partida.
 */

import { POSITIONS } from "./constants.js";
import { ANO_BASE_CAMPANHA } from "./campaign-dates.js";
import { gerarPoolCampanha, POOL_DATA_VERSION } from "./campaign-pool.js";
import { criarCalendarioTemporada } from "./campaign-calendar.js";
import { criarRng } from "./world-cup.js";
import { salvarCampanhaAtiva, carregarCampanhaAtiva, CAMPANHA_FORMAT_VERSION } from "./campaign-storage.js";
import { snapshotReferenciasTemporadaCampanha } from "./campaign-progress.js";
import { escalaçãoInicialDeConvocados23, podeMontarEscalaçãoCompleta23 } from "./squad.js";

/**
 * Cópia superficial para o motor da partida (evita mutar o save diretamente).
 * @param {import('./campaign-pool.js').JogadorCampanha} j
 */
export function jogadorCampanhaParaPartida(j) {
  return {
    id: j.id,
    nome: j.nome,
    posicao: j.posicao,
    ataque: j.ataque,
    defesa: j.defesa,
  };
}

/**
 * @param {string[]} idsSelecionados 23 ids
 * @param {Map<string, import('./campaign-pool.js').JogadorCampanha>} porId
 */
export function validarConvocacao23(idsSelecionados, porId) {
  if (idsSelecionados.length !== 23) {
    return { ok: false, msg: "Selecione exatamente 23 jogadores." };
  }
  const uniq = new Set(idsSelecionados);
  if (uniq.size !== 23) {
    return { ok: false, msg: "Há jogadores repetidos na convocação." };
  }
  const list = idsSelecionados.map((id) => porId.get(id)).filter(Boolean);
  if (list.length !== 23) {
    return { ok: false, msg: "Algum id de jogador é inválido." };
  }
  const vinteETres = list.map(jogadorCampanhaParaPartida);
  const r = podeMontarEscalaçãoCompleta23(vinteETres);
  if (!r.ok) return { ok: false, msg: r.msg };
  return { ok: true, msg: "" };
}

/**
 * @param {import('./campaign-pool.js').JogadorCampanha} j
 */
function somaAtributosCampanha(j) {
  return j.ataque + j.defesa;
}

/**
 * Escolhe 23 jogadores com maior soma ataque+defesa possível entre composições que obedecem
 * `podeMontarEscalaçãoCompleta23` (2–3 goleiros; mínimos por linha para titular+banco).
 * @param {import('./campaign-pool.js').JogadorCampanha[]} jogadores
 * @returns {{ ok: true, ids: string[] } | { ok: false, msg: string }}
 */
export function sugerirConvocacaoAutomatica23(jogadores) {
  if (!jogadores.length) {
    return { ok: false, msg: "Elenco vazio." };
  }
  /** @param {string} pos */
  const ordenados = (pos) =>
    jogadores
      .filter((j) => j.posicao === pos)
      .sort((a, b) => somaAtributosCampanha(b) - somaAtributosCampanha(a));
  const gol = ordenados(POSITIONS.GOLEIRO);
  const zag = ordenados(POSITIONS.ZAGUEIRO);
  const mei = ordenados(POSITIONS.MEIA);
  const ata = ordenados(POSITIONS.ATACANTE);
  const slice = (arr, n) => arr.slice(0, n);

  /** @type {string[] | null} */
  let bestIds = null;
  let bestSoma = -1;

  for (let nG = 2; nG <= 3; nG++) {
    if (gol.length < nG) continue;
    for (let nZ = 4; nZ <= zag.length; nZ++) {
      for (let nM = 3; nM <= mei.length; nM++) {
        const nA = 23 - nG - nZ - nM;
        if (nA < 2 || nA > ata.length) continue;
        const pick = [
          ...slice(gol, nG),
          ...slice(zag, nZ),
          ...slice(mei, nM),
          ...slice(ata, nA),
        ];
        if (pick.length !== 23) continue;
        const vinteETres = pick.map(jogadorCampanhaParaPartida);
        if (!podeMontarEscalaçãoCompleta23(vinteETres).ok) continue;
        const soma = pick.reduce((s, j) => s + somaAtributosCampanha(j), 0);
        if (soma > bestSoma) {
          bestSoma = soma;
          bestIds = pick.map((j) => j.id);
        }
      }
    }
  }

  if (!bestIds) {
    return {
      ok: false,
      msg: "Não foi possível montar 23 convocados válidos automaticamente com este elenco.",
    };
  }
  return { ok: true, ids: bestIds };
}

/**
 * @param {string} selecaoId
 * @param {string[]} todosIdsSelecoes ids de SELECOES
 */
export function criarEstadoCampanhaNovo(selecaoId, todosIdsSelecoes) {
  const seedCampanha = (Date.now() ^ (Math.floor(Math.random() * 0x7fffffff) << 8)) >>> 0;
  const jogadores = gerarPoolCampanha(selecaoId);
  const rng = criarRng(seedCampanha ^ 0xdeadbeef);
  /** @type {import('./campaign-storage.js').CampanhaEstadoPersistido} */
  const estado = {
    formatVersion: CAMPANHA_FORMAT_VERSION,
    poolVersion: POOL_DATA_VERSION,
    selecaoId,
    temporada: 1,
    anoCalendario: ANO_BASE_CAMPANHA,
    mesAtual: 3,
    seedCampanha,
    jogadores,
    convocadosIds: [],
    eventos: [],
    torneioContinental: null,
    eliminatoriasCopa: null,
    wcqAgendaHumano: null,
    wcqPontosAcumulados: {},
    classificadosCopa2030: null,
    copaClassificadosAno: null,
    wcqCicloCopaAlvo: null,
    copa2030Concluida: false,
    campanhaUltimoMesOscStats: 3,
    historicoEventosCampanha: [],
  };
  const { eventos, torneioContinental, eliminatoriasCopa } = criarCalendarioTemporada(
    selecaoId,
    todosIdsSelecoes,
    ANO_BASE_CAMPANHA,
    rng,
    estado,
  );
  estado.eventos = eventos;
  estado.torneioContinental = torneioContinental;
  estado.eliminatoriasCopa = eliminatoriasCopa ?? null;
  estado.mesAtual = eventos[0]?.campanhaMes ?? 3;
  estado.campanhaUltimoMesOscStats = estado.mesAtual;
  snapshotReferenciasTemporadaCampanha(estado.jogadores);
  for (const j of estado.jogadores) {
    j.refAtaqueCampanha = j.ataque;
    j.refDefesaCampanha = j.defesa;
  }
  salvarCampanhaAtiva(estado);
  return estado;
}

/**
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {string[]} convocadosIds
 */
export function aplicarConvocacaoNoEstado(estado, convocadosIds) {
  estado.convocadosIds = [...convocadosIds];
  salvarCampanhaAtiva(estado);
}

/**
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 */
export function montarTimeJogadorCampanhaParaPartida(estado) {
  const map = new Map(estado.jogadores.map((j) => [j.id, j]));
  const conv = estado.convocadosIds.map((id) => map.get(id)).filter(Boolean);
  if (conv.length !== 23) {
    throw new Error("Convocação incompleta.");
  }
  const clones = conv.map(jogadorCampanhaParaPartida);
  return escalaçãoInicialDeConvocados23(clones);
}

export { carregarCampanhaAtiva, salvarCampanhaAtiva, limparCampanhaAtiva, haCampanhaSalva } from "./campaign-storage.js";
export {
  anoComEdicaoContinental,
  confederacaoId,
  dadosTorneioContinental,
} from "./campaign-confederation.js";
export { ANO_BASE_CAMPANHA, textoMesAno } from "./campaign-dates.js";
export {
  proximoEventoPendente,
  criarCalendarioTemporada,
  arquivarEventosCalendarioCampanha,
  garantirEventoCopaMundialNoCalendarioAtual,
  jogouTudoAntesDoSlotCopaMundialNoCalendario,
  mesCalendarioSlotCopaMundialCampanha,
  remendarConflitosCalendarioCampanhaAoCarregar,
} from "./campaign-calendar.js";
export {
  aplicarResultadoPartidaTorneioCampanha,
  placarDisplayJogadorVsAdversario,
  vencedorConfrontoIdaVoltaEliminatorias,
  textoRegrasClassificacaoTorneioCampanha,
  paragrafosHistoricoMataMataCampanha,
  repararFaseGruposTorneioCampanha,
} from "./campaign-tournament.js";
export {
  anoComEliminatoriasCopa,
  agregarPontosEliminatoriasDoAno,
  agregarSimulacaoOutrasConfederacoesWcq,
  finalizarClassificadosCopa2030,
  finalizarClassificadosCopaMundial,
  copaAlvoEliminatoriasDoAno,
  anoEhCopaMundialCampanha,
  campanhaEstaNaJanelaCopaDoMundo,
  ultimoAnoEliminatoriasAntesCopa,
  ANO_COPA_MUNDO_CAMPANHA,
  ANO_ULTIMA_ELIMINATORIA,
  textoRegrasEliminatoriasCopaCampanha,
  tituloEliminatoriasCopaMundial,
} from "./campaign-wc-qualifiers.js";
export {
  aplicarEfeitoPosPartidaCampanha,
  aplicarProgressaoFimDeJanela,
  aplicarOscilacaoPreCompeticao,
  aplicarOscilacaoMensalCampanha,
  incrementarIdadeElencoCampanha,
  snapshotReferenciasTemporadaCampanha,
} from "./campaign-progress.js";
