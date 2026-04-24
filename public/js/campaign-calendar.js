/**
 * Calendário e eventos do modo Campanha: datas FIFA + torneio continental (grupos, tabela e mata-mata).
 */

import { embaralhar } from "./world-cup.js";
import { anoComEdicaoContinental, dadosTorneioContinental } from "./campaign-confederation.js";
import {
  ANO_BASE_CAMPANHA,
  MES_FIM_TORNEIO_CONTINENTAL_CAMPANHA,
  MES_INICIO_TORNEIO_CONTINENTAL_CAMPANHA,
  extrairRotuloSemPrefixoMesAno,
  textoMesAno,
} from "./campaign-dates.js";
import { criarTorneioContinentalCampanha } from "./campaign-tournament.js";
import { ordenarEventosCalendarioCampanhaNoAno } from "./campaign-calendar-order.js";
import {
  ANO_COPA_MUNDO_CAMPANHA,
  anoComEliminatoriasCopa,
  anoEhCopaMundialCampanha,
  clonarEventosWcqDoAnoComEstado,
  garantirCicloEliminatoriasInicializado,
} from "./campaign-wc-qualifiers.js";

/** Janelas FIFA usadas para amistosos e eliminatórias. */
const MESES_FIFA = [3, 6, 9, 11];

/**
 * Meses em que não cabem amistosos nem eliminatórias (torneio continental + Copa do Mundo).
 * @param {number} ano
 * @param {Iterable<number>} mesesContinental meses 1–12
 */
function mesesBloqueadosAmistosoEWcq(ano, mesesContinental) {
  /** @type {Set<number>} */
  const s = new Set(mesesContinental);
  if (anoEhCopaMundialCampanha(ano)) {
    s.add(6);
    s.add(7);
  }
  return s;
}

/**
 * Meses em que não há amistosos nem WCQ: só a janela fixa do torneio continental (dois meses).
 * @param {EventoCampanha[]} evsTorneo eventos `torneio_continental` do ano
 * @param {boolean} continentalEncerrado `torneioContinental.fase === "fim"` no save — libera o resto do ano
 */
function mesesReservadosTorneioContinental(evsTorneo, continentalEncerrado) {
  if (continentalEncerrado || !evsTorneo.length) return [];
  return [MES_INICIO_TORNEIO_CONTINENTAL_CAMPANHA, MES_FIM_TORNEIO_CONTINENTAL_CAMPANHA];
}

/**
 * Recoloca jogos do torneio continental em jun./jul. (saves antigos com Euro espalhada).
 * @returns {boolean}
 */
function remendarComprimirTorneioContinentalEmDoisMeses(estado, ano) {
  if (estado.torneioContinental?.fase === "fim") return false;
  const evs = estado.eventos;
  if (!Array.isArray(evs)) return false;
  const cont = evs.filter((e) => e.tipo === "torneio_continental" && e.campanhaAno === ano);
  if (!cont.length) return false;
  const M1 = MES_INICIO_TORNEIO_CONTINENTAL_CAMPANHA;
  const M2 = MES_FIM_TORNEIO_CONTINENTAL_CAMPANHA;
  /** @type {Record<string, number>} */
  const ordemFase = { quartas: 0, semi: 1, final: 2 };
  const grupos = cont.filter((e) => e.faseContinental === "grupos" && !e.campanhaKoSlot);
  const kos = cont.filter((e) => e.campanhaKoSlot);
  grupos.sort((a, b) => {
    const r = (a.campanhaRodadaGrupo ?? 0) - (b.campanhaRodadaGrupo ?? 0);
    if (r !== 0) return r;
    return String(a.id).localeCompare(String(b.id));
  });
  kos.sort((a, b) => {
    const fa = a.faseContinental ?? "";
    const fb = b.faseContinental ?? "";
    const oa = ordemFase[fa] ?? 9;
    const ob = ordemFase[fb] ?? 9;
    if (oa !== ob) return oa - ob;
    return String(a.id).localeCompare(String(b.id));
  });
  let alterou = false;
  for (const e of grupos) {
    if ((e.campanhaMes ?? 0) !== M1) alterou = true;
    aplicarMesCampanhaNoRotulo(e, M1, ano);
  }
  for (const e of kos) {
    if ((e.campanhaMes ?? 0) !== M2) alterou = true;
    aplicarMesCampanhaNoRotulo(e, M2, ano);
  }
  return alterou;
}

/**
 * @param {Set<number>} bloqueado
 * @param {Set<number>} preferirLivre meses já usados por outro jogo WCQ no mesmo ano (evita empilhar sem necessidade)
 */
function escolherMesParaWcqOuAmistoso(bloqueado, preferirLivre) {
  for (const m of MESES_FIFA) {
    if (!bloqueado.has(m) && !preferirLivre.has(m)) return m;
  }
  for (const m of MESES_FIFA) {
    if (!bloqueado.has(m)) return m;
  }
  for (let m = 1; m <= 12; m++) {
    if (!bloqueado.has(m)) return m;
  }
  return 10;
}

/**
 * @param {EventoCampanha} e
 * @param {number} mes
 * @param {number} ano
 */
function aplicarMesCampanhaNoRotulo(e, mes, ano) {
  e.campanhaMes = mes;
  const base = extrairRotuloSemPrefixoMesAno(e.rotulo, ano);
  e.rotulo = `${textoMesAno(mes, ano)} — ${base}`;
}

/**
 * @param {EventoCampanha[]} evWcq
 * @param {Set<number>} bloqueado
 * @param {number} ano
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido | null | undefined} estadoCampanha
 */
function realocarEliminatoriasForaDeMesesBloqueados(evWcq, bloqueado, ano, estadoCampanha) {
  const usados = new Set();
  for (const e of evWcq) {
    const m0 = e.campanhaMes ?? 3;
    if (bloqueado.has(m0)) {
      const m = escolherMesParaWcqOuAmistoso(bloqueado, usados);
      aplicarMesCampanhaNoRotulo(e, m, ano);
    }
    usados.add(e.campanhaMes ?? 3);
  }
  const tpl = estadoCampanha?.wcqAgendaHumano;
  if (tpl?.length) {
    for (const e of evWcq) {
      const row = tpl.find((x) => x.id === e.id);
      if (row) {
        row.campanhaMes = e.campanhaMes;
        row.campanhaAno = e.campanhaAno;
        row.rotulo = extrairRotuloSemPrefixoMesAno(e.rotulo, ano);
      }
    }
  }
}

/**
 * @param {EventoCampanha[]} amistosos
 * @param {Set<number>} bloqueado
 * @param {number} ano
 */
function realocarAmistososForaDeMesesBloqueados(amistosos, bloqueado, ano) {
  const usados = new Set();
  for (const a of amistosos) {
    const m0 = a.campanhaMes ?? 3;
    if (!bloqueado.has(m0)) {
      usados.add(m0);
      continue;
    }
    const m = escolherMesParaWcqOuAmistoso(bloqueado, usados);
    aplicarMesCampanhaNoRotulo(a, m, ano);
    usados.add(m);
  }
}

/**
 * @typedef {'amistoso' | 'torneio_continental' | 'eliminatorias_copa' | 'copa_mundial'} TipoEventoCampanha
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
 *   placarVoce?: number | null,
 *   placarAdv?: number | null,
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
 * Mês do slot da Copa no calendário: julho se no mesmo ano há torneio continental (ex.: Copa América em jun.–ago.),
 * senão junho — evita empilhar o Mundial no mesmo mês que a fase final continental.
 * @param {boolean} haTorneioContinentalEsteAno
 */
export function mesCalendarioSlotCopaMundialCampanha(haTorneioContinentalEsteAno) {
  return haTorneioContinentalEsteAno ? 7 : 6;
}

/**
 * Slot no ano do Mundial para quem se classificou: obriga “Jogar próximo evento” a abrir a Copa antes dos amistosos de set/nov.
 * @param {number} anoCalendario
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido | null | undefined} estadoCampanha
 * @param {number} [mesSlot] 6 ou 7 — usar `mesCalendarioSlotCopaMundialCampanha(...)`
 * @returns {EventoCampanha | null}
 */
export function criarEventoCopaMundialCampanhaSeClassificado(
  anoCalendario,
  estadoCampanha,
  mesSlot = 6,
) {
  if (!estadoCampanha || !anoEhCopaMundialCampanha(anoCalendario)) return null;
  if (estadoCampanha.copa2030Concluida) return null;
  const idsCopa = estadoCampanha.classificadosCopa2030;
  const anoEd = estadoCampanha.copaClassificadosAno ?? ANO_COPA_MUNDO_CAMPANHA;
  const nOk =
    Array.isArray(idsCopa) && (idsCopa.length === 48 || idsCopa.length === 32);
  if (!nOk || anoEd !== anoCalendario) return null;
  if (!idsCopa.includes(estadoCampanha.selecaoId)) return null;
  const m = mesSlot === 7 ? 7 : 6;
  const pre = textoMesAno(m, anoCalendario);
  return {
    id: `a${anoCalendario}-copa-mundial`,
    tipo: /** @type {const} */ ("copa_mundial"),
    rotulo: `${pre} — Copa do Mundo ${anoCalendario} (abrir o hub da competição)`,
    adversarioId: null,
    concluido: false,
    campanhaAno: anoCalendario,
    campanhaMes: m,
  };
}

/**
 * Saves já em ano de Copa sem este evento (ex.: calendário só com amistosos) — insere o slot da Copa.
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @returns {boolean} true se alterou `eventos`
 */
export function garantirEventoCopaMundialNoCalendarioAtual(estado) {
  const ano =
    estado.anoCalendario ??
    ANO_BASE_CAMPANHA + ((estado.temporada ?? 1) - 1);
  const temContinental = (estado.eventos ?? []).some(
    (e) => e.tipo === "torneio_continental" && e.campanhaAno === ano,
  );
  const mesWc = mesCalendarioSlotCopaMundialCampanha(temContinental);
  const slot = criarEventoCopaMundialCampanhaSeClassificado(ano, estado, mesWc);
  if (!slot) return false;
  if (!Array.isArray(estado.eventos)) return false;
  if (estado.eventos.some((e) => e.tipo === "copa_mundial" && e.campanhaAno === ano)) return false;
  estado.eventos.push(slot);
  ordenarEventosCalendarioCampanhaNoAno(estado.eventos);
  return true;
}

/**
 * @param {string} selecaoPlayerId
 * @param {string[]} idsSelecoes todas as seleções (inclui jogador)
 * @param {number} anoCalendario ano da janela (ex.: 2027)
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
    const evSóAmi = [amMar1, amMar2, amSet, amNov];
    const mesWc0 = mesCalendarioSlotCopaMundialCampanha(false);
    const slotCopa0 = criarEventoCopaMundialCampanhaSeClassificado(ano, estadoCampanha, mesWc0);
    if (slotCopa0) evSóAmi.push(slotCopa0);
    ordenarEventosCalendarioCampanhaNoAno(evSóAmi);
    return {
      eventos: evSóAmi,
      torneioContinental: null,
      eliminatoriasCopa: estadoCampanha?.eliminatoriasCopa ?? null,
    };
  }

  const M1 = MES_INICIO_TORNEIO_CONTINENTAL_CAMPANHA;
  const M2 = MES_FIM_TORNEIO_CONTINENTAL_CAMPANHA;
  const ordGrupo = [...meioContinental].sort((a, b) => {
    const r = (a.campanhaRodadaGrupo ?? 0) - (b.campanhaRodadaGrupo ?? 0);
    if (r !== 0) return r;
    return String(a.id).localeCompare(String(b.id));
  });
  /** OFC (só final ida/volta): alterna jun./jul.; com fase de grupos, tudo em junho e o mata-mata só em julho (evita quartas em junho antes de jogos de grupo em julho). */
  const agendaSóMataMataInicial = meioContinental.every(
    (x) =>
      Boolean(x.campanhaKoSlot) ||
      (x.faseContinental != null && x.faseContinental !== "grupos"),
  );
  for (let k = 0; k < ordGrupo.length; k++) {
    const e = ordGrupo[k];
    e.campanhaAno = ano;
    e.campanhaMes = agendaSóMataMataInicial ? (k % 2 === 0 ? M1 : M2) : M1;
    const pre = textoMesAno(e.campanhaMes, ano);
    if (!e.rotulo.startsWith(pre)) {
      e.rotulo = `${pre} — ${e.rotulo}`;
    }
  }

  const reservadosCont = mesesReservadosTorneioContinental(meioContinental, false);
  const bloqueado = mesesBloqueadosAmistosoEWcq(ano, reservadosCont);
  realocarEliminatoriasForaDeMesesBloqueados(evWcq, bloqueado, ano, estadoCampanha);
  realocarAmistososForaDeMesesBloqueados([amMar1, amMar2, amSet, amNov], bloqueado, ano);

  const competicaoOrdenada = [...meio];
  ordenarEventosCalendarioCampanhaNoAno(competicaoOrdenada);

  const ev = [...competicaoOrdenada];
  ev.splice(0, 0, amMar1, amMar2);
  ev.push(amSet, amNov);
  const mesWc = mesCalendarioSlotCopaMundialCampanha(meioContinental.length > 0);
  const slotCopa = criarEventoCopaMundialCampanhaSeClassificado(ano, estadoCampanha, mesWc);
  if (slotCopa) ev.push(slotCopa);
  ordenarEventosCalendarioCampanhaNoAno(ev);
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

/**
 * True se todos os eventos que precedem o slot da Copa na ordem do calendário já estão concluídos.
 * Sem evento `copa_mundial` nesse ano, devolve true (não bloqueia o botão do hub).
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {number} anoCivil
 */
export function jogouTudoAntesDoSlotCopaMundialNoCalendario(estado, anoCivil) {
  const evs = estado?.eventos;
  if (!Array.isArray(evs) || !evs.length) return true;
  const ordenado = [...evs];
  ordenarEventosCalendarioCampanhaNoAno(ordenado);
  const idx = ordenado.findIndex(
    (e) => e.tipo === "copa_mundial" && e.campanhaAno === anoCivil,
  );
  if (idx < 0) return true;
  for (let i = 0; i < idx; i++) {
    if (!ordenado[i].concluido) return false;
  }
  return true;
}

/**
 * Saves antigos: eliminatórias/amistosos no mesmo mês que o torneio continental ou a Copa (2030).
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 */
/**
 * Guarda uma cópia do calendário do ano antes de substituir por `criarCalendarioTemporada`.
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {number} anoCivilQueTermina
 */
export function arquivarEventosCalendarioCampanha(estado, anoCivilQueTermina) {
  if (!Number.isFinite(anoCivilQueTermina) || !Array.isArray(estado.eventos) || estado.eventos.length === 0) {
    return;
  }
  if (!Array.isArray(estado.historicoEventosCampanha)) {
    estado.historicoEventosCampanha = [];
  }
  const hist = estado.historicoEventosCampanha;
  if (hist.some((x) => x.ano === anoCivilQueTermina)) return;
  const eventos = estado.eventos.map((e) => ({ ...e }));
  hist.push({ ano: anoCivilQueTermina, eventos });
  hist.sort((a, b) => b.ano - a.ano);
}

/**
 * Reacomoda amistosos e WCQ que caiam em meses do torneio continental (grupos + mata-mata).
 * @returns {boolean} true se alterou meses de algum evento
 */
export function remendarConflitosCalendarioCampanhaAoCarregar(estado) {
  const ano =
    estado.anoCalendario ??
    ANO_BASE_CAMPANHA + ((estado.temporada ?? 1) - 1);
  const evs = estado.eventos;
  if (!Array.isArray(evs) || evs.length === 0) return false;
  const comprimiu = remendarComprimirTorneioContinentalEmDoisMeses(estado, ano);
  const evContAno = evs.filter((e) => e.tipo === "torneio_continental" && e.campanhaAno === ano);
  const continentalEncerrado = estado.torneioContinental?.fase === "fim";
  const reservadosCont = mesesReservadosTorneioContinental(evContAno, continentalEncerrado);
  const bloqueado = mesesBloqueadosAmistosoEWcq(ano, reservadosCont);
  const evWcq = evs.filter(
    (e) => e.tipo === "eliminatorias_copa" && e.campanhaAno === ano,
  );
  const ami = evs.filter((e) => e.tipo === "amistoso" && e.campanhaAno === ano);
  let precisa = false;
  for (const e of evWcq) {
    if (bloqueado.has(e.campanhaMes ?? 3)) precisa = true;
  }
  for (const a of ami) {
    if (bloqueado.has(a.campanhaMes ?? 3)) precisa = true;
  }
  if (precisa) {
    realocarEliminatoriasForaDeMesesBloqueados(evWcq, bloqueado, ano, estado);
    realocarAmistososForaDeMesesBloqueados(ami, bloqueado, ano);
  }
  ordenarEventosCalendarioCampanhaNoAno(evs);
  return comprimiu || precisa;
}
