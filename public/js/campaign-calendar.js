/**
 * Calendário e eventos do modo Campanha: datas FIFA + torneio continental (grupos, tabela e mata-mata).
 */

import { embaralhar } from "./world-cup.js";
import { anoComEdicaoContinental, dadosTorneioContinental } from "./campaign-confederation.js";
import { textoMesAno } from "./campaign-dates.js";
import { criarTorneioContinentalCampanha } from "./campaign-tournament.js";
import {
  anoComEliminatoriasCopa,
  clonarEventosWcqDoAnoComEstado,
  garantirCicloEliminatoriasInicializado,
} from "./campaign-wc-qualifiers.js";

/**
 * @typedef {'amistoso' | 'torneio_continental' | 'eliminatorias_copa'} TipoEventoCampanha
 */

/**
 * @typedef {'grupos' | 'quartas' | 'semi' | 'final'} FaseContinentalCampanha
 */

/**
 * @typedef {{
 *   id: string,
 *   tipo: TipoEventoCampanha,
 *   rotulo: string,
 *   adversarioId: string | null,
 *   concluido: boolean,
 *   torneioNome?: string,
 *   faseContinental?: FaseContinentalCampanha,
 *   campanhaGrupo?: string | null,
 *   campanhaRodadaGrupo?: number | null,
 *   campanhaHumanoCasa?: boolean,
 *   campanhaParHome?: string,
 *   campanhaParAway?: string,
 *   campanhaIdxPartidaGrupo?: number | null,
 *   campanhaKoSlot?: boolean,
 *   campanhaAno?: number,
 *   campanhaMes?: number,
 * }} EventoCampanha
 */

/**
 * @param {string} selecaoPlayerId
 * @param {string[]} idsSelecoes todas as seleções (inclui jogador)
 * @param {number} anoCalendario ano civil da janela (ex.: 2027)
 * @param {() => number} rng
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido | null | undefined} [estadoCampanha] quando definido, preserva eliminatórias (ciclo 2027–29) e injeta só jogos WCQ daquele ano
 * @returns {{ eventos: EventoCampanha[], torneioContinental: object | null, eliminatoriasCopa: object | null }}
 */
export function criarCalendarioTemporada(selecaoPlayerId, idsSelecoes, anoCalendario, rng, estadoCampanha) {
  const outros = idsSelecoes.filter((id) => id !== selecaoPlayerId);
  if (outros.length === 0) {
    throw new Error("Campanha: é preciso haver pelo menos outra seleção além da sua.");
  }
  const embs = embaralhar([...outros], rng);
  const ano = anoCalendario;
  let amIdx = 0;
  /** @param {{ mes: number, emb: number, n: number }} d */
  const mkAm = (d) => {
    const id = `a${ano}-am-${amIdx++}`;
    const pre = textoMesAno(d.mes, ano);
    return {
      id,
      tipo: /** @type {const} */ ("amistoso"),
      rotulo: `${pre} — Data FIFA — amistoso (${d.n}/4)`,
      adversarioId: embs[d.emb % embs.length],
      concluido: false,
      campanhaAno: ano,
      campanhaMes: d.mes,
    };
  };
  const amMar1 = mkAm({ mes: 3, emb: 0, n: 1 });
  const amMar2 = mkAm({ mes: 3, emb: 1, n: 2 });
  const amSet = mkAm({ mes: 9, emb: 2, n: 3 });
  const amNov = mkAm({ mes: 11, emb: 3, n: 4 });

  const { key: confKey } = dadosTorneioContinental(selecaoPlayerId);

  /** @type {object | null} */
  let torneioContinental = null;
  /** @type {EventoCampanha[]} */
  const meioContinental = [];

  if (anoComEdicaoContinental(confKey, ano)) {
    const c = criarTorneioContinentalCampanha(selecaoPlayerId, idsSelecoes, anoCalendario, rng);
    torneioContinental = c.torneioContinental;
    for (const x of c.eventosTorneio) meioContinental.push(/** @type {EventoCampanha} */ (x));
  }

  /** @type {EventoCampanha[]} */
  let evWcq = [];
  if (estadoCampanha && anoComEliminatoriasCopa(ano)) {
    garantirCicloEliminatoriasInicializado(estadoCampanha, idsSelecoes);
    const T = estadoCampanha.eliminatoriasCopa;
    const templates = estadoCampanha.wcqAgendaHumano ?? [];
    evWcq = clonarEventosWcqDoAnoComEstado(T, templates, ano);
    for (const e of evWcq) {
      const pre = textoMesAno(e.campanhaMes ?? 3, ano);
      if (!e.rotulo.startsWith(pre)) {
        e.rotulo = `${pre} — ${e.rotulo}`;
      }
    }
  }

  const meio = [...meioContinental, ...evWcq];
  if (meio.length === 0) {
    return {
      eventos: [amMar1, amMar2, amSet, amNov],
      torneioContinental: null,
      eliminatoriasCopa: estadoCampanha?.eliminatoriasCopa ?? null,
    };
  }

  const span = Math.max(meioContinental.length - 1, 1);
  for (let k = 0; k < meioContinental.length; k++) {
    const e = meioContinental[k];
    e.campanhaAno = ano;
    e.campanhaMes = Math.min(8, 6 + Math.round((k * 2) / span));
    const pre = textoMesAno(e.campanhaMes, ano);
    if (!e.rotulo.startsWith(pre)) {
      e.rotulo = `${pre} — ${e.rotulo}`;
    }
  }

  const competicaoOrdenada = [...meio].sort(
    (a, b) => (a.campanhaMes ?? 12) - (b.campanhaMes ?? 12),
  );

  const ev = [...competicaoOrdenada];
  ev.splice(0, 0, amMar1, amMar2);
  ev.push(amSet, amNov);
  return {
    eventos: ev,
    torneioContinental,
    eliminatoriasCopa: estadoCampanha?.eliminatoriasCopa ?? null,
  };
}

/**
 * @param {EventoCampanha[]} eventos
 * @returns {EventoCampanha | null}
 */
export function proximoEventoPendente(eventos) {
  return eventos.find((e) => !e.concluido) ?? null;
}
