/**
 * Persistência do modo Campanha (localStorage, um save ativo).
 */

import { ANO_BASE_CAMPANHA, textoMesAno } from "./campaign-dates.js";
import { POOL_DATA_VERSION } from "./campaign-pool.js";
import { remendarConflitosCalendarioCampanhaAoCarregar } from "./campaign-calendar.js";
import {
  corrigirTitulosEliminatoriasCopaNoEstado,
  inferirMetadadosCiclosCopaCampanha,
} from "./campaign-wc-qualifiers.js";

const STORAGE_KEY = "qwerty-football-campanha-v1";
export const CAMPANHA_FORMAT_VERSION = 8;

/**
 * @typedef {import('./campaign-pool.js').JogadorCampanha} JogadorCampanha
 */

/**
 * @typedef {{
 *   formatVersion: number,
 *   poolVersion: number,
 *   selecaoId: string,
 *   temporada: number,
 *   anoCalendario: number,
 *   mesAtual: number,
 *   seedCampanha: number,
 *   jogadores: JogadorCampanha[],
 *   convocadosIds: string[],
 *   eventos: import('./campaign-calendar.js').EventoCampanha[],
 *   torneioContinental?: object | null,
 *   eliminatoriasCopa?: object | null,
 *   wcqPontosAcumulados?: Record<string, number>,
 *   classificadosCopa2030?: string[] | null,
 *   copaClassificadosAno?: number | null,
 *   wcqCicloCopaAlvo?: number | null,
 *   wcqAgendaHumano?: import('./campaign-calendar.js').EventoCampanha[] | null,
 *   copa2030Concluida?: boolean,
 *   campanhaUltimoMesOscStats?: number,
 *   historicoEventosCampanha?: { ano: number, eventos: import('./campaign-calendar.js').EventoCampanha[] }[],
 *   historicoCampeoes?: { chave: string, ano: number, competicao: string, vencedorId: string }[],
 *   savedAt?: string,
 * }} CampanhaEstadoPersistido
 */

/**
 * Eliminatórias por confederação + calendário em janelas FIFA (v5).
 * @param {object} d
 */
function migrarCampanhaV4ParaV5(d) {
  d.formatVersion = 5;
  d.eliminatoriasCopa = null;
  d.wcqAgendaHumano = null;
  d.wcqPontosAcumulados = {};
  d.classificadosCopa2030 = null;
  d.copa2030Concluida = false;
}

/**
 * Referências de stats por temporada + controle de oscilação mensal.
 * @param {object} d
 */
function migrarCampanhaV5ParaV6(d) {
  d.formatVersion = 6;
  const mes = d.mesAtual ?? 3;
  d.campanhaUltimoMesOscStats = mes;
  if (Array.isArray(d.jogadores)) {
    for (const j of d.jogadores) {
      j.refAtaqueTemporada = j.ataque;
      j.refDefesaTemporada = j.defesa;
    }
  }
}

/** Referência de atributos desde o início da campanha (delta na convocação). */
function migrarCampanhaV6ParaV7(d) {
  d.formatVersion = 7;
  if (Array.isArray(d.jogadores)) {
    for (const j of d.jogadores) {
      if (j.refAtaqueCampanha == null) {
        j.refAtaqueCampanha = j.ataque;
        j.refDefesaCampanha = j.defesa;
      }
    }
  }
}

/** Histórico de campeões (Mundial + continentais). */
function migrarCampanhaV7ParaV8(d) {
  d.formatVersion = 8;
  if (!Array.isArray(d.historicoCampeoes)) d.historicoCampeoes = [];
}

/**
 * @param {object} d
 */
function migrarCampanhaV3ParaV4(d) {
  d.formatVersion = 4;
  if (d.eliminatoriasCopa === undefined) d.eliminatoriasCopa = null;
  if (!d.wcqPontosAcumulados || typeof d.wcqPontosAcumulados !== "object") d.wcqPontosAcumulados = {};
  if (d.classificadosCopa2030 === undefined) d.classificadosCopa2030 = null;
}

/**
 * @param {object} d
 */
function migrarCampanhaV2ParaV3(d) {
  const temporada = d.temporada ?? 1;
  const ano = ANO_BASE_CAMPANHA + temporada - 1;
  d.formatVersion = 3;
  d.anoCalendario = ano;
  const evs = d.eventos;
  if (!Array.isArray(evs)) {
    d.mesAtual = 3;
    return;
  }
  const nTor = evs.filter((e) => e.tipo === "torneio_continental").length;
  const span = Math.max(nTor - 1, 1);
  for (let i = 0; i < evs.length; i++) {
    const e = evs[i];
    e.campanhaAno = ano;
    if (e.tipo === "amistoso") {
      const j = evs.slice(0, i + 1).filter((x) => x.tipo === "amistoso").length;
      e.campanhaMes = j <= 2 ? 3 : j === 3 ? 9 : 11;
    } else {
      const k = evs.slice(0, i).filter((x) => x.tipo === "torneio_continental").length;
      e.campanhaMes = Math.min(8, 6 + Math.round((k * 2) / span));
    }
    const pre = textoMesAno(e.campanhaMes, ano);
    if (e.rotulo && !e.rotulo.startsWith(pre)) {
      e.rotulo = `${pre} — ${e.rotulo}`;
    }
  }
  const pend = evs.find((e) => !e.concluido);
  d.mesAtual = pend?.campanhaMes ?? evs[evs.length - 1]?.campanhaMes ?? 3;
}

/**
 * @returns {CampanhaEstadoPersistido | null}
 */
export function carregarCampanhaAtiva() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || !Array.isArray(d.jogadores) || !d.selecaoId) return null;
    if (d.formatVersion === 2) {
      migrarCampanhaV2ParaV3(d);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    }
    if (d.formatVersion === 3) {
      migrarCampanhaV3ParaV4(d);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    }
    if (d.formatVersion === 4) {
      migrarCampanhaV4ParaV5(d);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    }
    if (d.formatVersion === 5) {
      migrarCampanhaV5ParaV6(d);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    }
    if (d.formatVersion === 6) {
      migrarCampanhaV6ParaV7(d);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    }
    if (d.formatVersion === 7) {
      migrarCampanhaV7ParaV8(d);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    }
    if (d.formatVersion !== CAMPANHA_FORMAT_VERSION) return null;
    if (d.anoCalendario == null) {
      d.anoCalendario = ANO_BASE_CAMPANHA + ((d.temporada ?? 1) - 1);
    }
    if (d.mesAtual == null) {
      const evs = d.eventos;
      const pend = Array.isArray(evs) ? evs.find((e) => !e.concluido) : null;
      d.mesAtual = pend?.campanhaMes ?? 3;
    }
    if (d.eliminatoriasCopa === undefined) d.eliminatoriasCopa = null;
    if (!d.wcqPontosAcumulados || typeof d.wcqPontosAcumulados !== "object") {
      d.wcqPontosAcumulados = {};
    }
    if (d.classificadosCopa2030 === undefined) d.classificadosCopa2030 = null;
    if (d.wcqAgendaHumano === undefined) d.wcqAgendaHumano = null;
    if (d.copaClassificadosAno === undefined) d.copaClassificadosAno = null;
    if (d.wcqCicloCopaAlvo === undefined) d.wcqCicloCopaAlvo = null;
    if (d.copa2030Concluida === undefined) d.copa2030Concluida = false;
    if (d.campanhaUltimoMesOscStats == null) {
      d.campanhaUltimoMesOscStats = d.mesAtual ?? 3;
    }
    if (!Array.isArray(d.historicoEventosCampanha)) {
      d.historicoEventosCampanha = [];
    }
    if (!Array.isArray(d.historicoCampeoes)) {
      d.historicoCampeoes = [];
    }
    if (Array.isArray(d.jogadores)) {
      for (const j of d.jogadores) {
        if (j.refAtaqueTemporada == null) j.refAtaqueTemporada = j.ataque;
        if (j.refDefesaTemporada == null) j.refDefesaTemporada = j.defesa;
        if (j.refAtaqueCampanha == null) {
          j.refAtaqueCampanha = j.ataque;
          j.refDefesaCampanha = j.defesa;
        }
      }
    }
    inferirMetadadosCiclosCopaCampanha(/** @type {CampanhaEstadoPersistido} */ (d));
    corrigirTitulosEliminatoriasCopaNoEstado(/** @type {CampanhaEstadoPersistido} */ (d));
    remendarConflitosCalendarioCampanhaAoCarregar(/** @type {CampanhaEstadoPersistido} */ (d));
    return d;
  } catch {
    return null;
  }
}

/**
 * @param {CampanhaEstadoPersistido} estado
 */
export function salvarCampanhaAtiva(estado) {
  const payload = {
    ...estado,
    formatVersion: CAMPANHA_FORMAT_VERSION,
    poolVersion: POOL_DATA_VERSION,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function limparCampanhaAtiva() {
  localStorage.removeItem(STORAGE_KEY);
}

export function haCampanhaSalva() {
  return carregarCampanhaAtiva() != null;
}
