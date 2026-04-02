/**
 * Ordenação estável do calendário da campanha (mês + tipo de evento).
 * Evita eliminatórias “no meio” do torneio continental e mata-mata antes do fim dos grupos na UI.
 */

/**
 * @param {{ tipo?: string, campanhaMes?: number, campanhaKoSlot?: boolean, faseContinental?: string }} e
 */
export function prioridadeEventoCalendarioCampanha(e) {
  const m = e.campanhaMes ?? 0;
  if (e.tipo === "amistoso") {
    if (m <= 4) return 5;
    if (m >= 9) return 50;
    return 15;
  }
  if (e.tipo === "torneio_continental") {
    if (e.campanhaKoSlot) return 50;
    return 20;
  }
  if (e.tipo === "eliminatorias_copa") {
    if (e.campanhaKoSlot) return 55;
    return 40;
  }
  if (e.tipo === "copa_mundial") return 35;
  return 100;
}

/**
 * @param {unknown[]} eventos mutável
 */
export function ordenarEventosCalendarioCampanhaNoAno(eventos) {
  if (!Array.isArray(eventos)) return;
  eventos.sort((a, b) => {
    const ea = /** @type {{ campanhaMes?: number, id?: string }} */ (a);
    const eb = /** @type {{ campanhaMes?: number, id?: string }} */ (b);
    const ma = ea.campanhaMes ?? 12;
    const mb = eb.campanhaMes ?? 12;
    if (ma !== mb) return ma - mb;
    const pa = prioridadeEventoCalendarioCampanha(
      /** @type {{ tipo?: string, campanhaMes?: number, campanhaKoSlot?: boolean, faseContinental?: string }} */ (a),
    );
    const pb = prioridadeEventoCalendarioCampanha(
      /** @type {{ tipo?: string, campanhaMes?: number, campanhaKoSlot?: boolean, faseContinental?: string }} */ (b),
    );
    if (pa !== pb) return pa - pb;
    const ta = /** @type {{ tipo?: string, campanhaKoSlot?: boolean, campanhaRodadaGrupo?: number, faseContinental?: string }} */ (
      a
    );
    const tb = /** @type {{ tipo?: string, campanhaKoSlot?: boolean, campanhaRodadaGrupo?: number, faseContinental?: string }} */ (
      b
    );
    if (ta.tipo === "torneio_continental" && tb.tipo === "torneio_continental") {
      const koA = Boolean(ta.campanhaKoSlot);
      const koB = Boolean(tb.campanhaKoSlot);
      if (koA !== koB) return koA ? 1 : -1;
      if (!koA && !koB) {
        const ra = ta.campanhaRodadaGrupo ?? 0;
        const rb = tb.campanhaRodadaGrupo ?? 0;
        if (ra !== rb) return ra - rb;
      }
      if (koA && koB) {
        /** @type {Record<string, number>} */
        const ordF = { quartas: 0, semi: 1, final: 2 };
        const fa = ordF[ta.faseContinental ?? ""] ?? 9;
        const fb = ordF[tb.faseContinental ?? ""] ?? 9;
        if (fa !== fb) return fa - fb;
      }
    }
    return String(ea.id ?? "").localeCompare(String(eb.id ?? ""));
  });
}
