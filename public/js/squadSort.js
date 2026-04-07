import { POSITION_SORT_ORDER } from "./constants.js";

/**
 * @param {{ posicao: string, nome?: string, id?: string }[]} jogadores
 */
export function ordenarPorPosicao(jogadores) {
  const idx = (p) => {
    const i = POSITION_SORT_ORDER.indexOf(p);
    return i === -1 ? 99 : i;
  };
  return [...jogadores].sort((a, b) => {
    const d = idx(a.posicao) - idx(b.posicao);
    if (d !== 0) return d;
    return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
  });
}
