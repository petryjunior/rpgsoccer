/**
 * Jogadores extras fictícios para convocação (Copa / Campanha): mesma lógica de atributos
 * que `gerarPoolCampanha`, mas gravados em `convocacaoExtra` por seleção.
 */

import { POSITIONS } from "./constants.js";
import { criarRng } from "./world-cup.js";
import { listasNomesCampanha } from "./campaign-names.js";

/** @typedef {{ nome: string, posicao: import('./constants.js').Position, ataque: number, defesa: number }} JogadorDef */

const FM_ANCORA_TITULARES = 68;
const FM_SHIFT_POR_PONTO = 1.08;
const FM_TETO_EXTRA_NOS_ATRIBUTOS = 19;

/** @param {string} s */
export function hashStringToSeedConvExtra(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** @param {() => number} rng @param {number} lo @param {number} hi */
function intRng(rng, lo, hi) {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/**
 * @param {import('./constants.js').Position} pos
 * @param {() => number} rng
 * @param {number} forcaMediaTitulares
 */
function statsPorPosicaoExtra(pos, rng, forcaMediaTitulares) {
  const shift = Math.round((forcaMediaTitulares - FM_ANCORA_TITULARES) * FM_SHIFT_POR_PONTO);
  const teto = Math.min(99, Math.round(forcaMediaTitulares + FM_TETO_EXTRA_NOS_ATRIBUTOS));
  const roll = (lo, hi) =>
    Math.min(teto, Math.max(1, intRng(rng, lo, hi) + shift));
  if (pos === POSITIONS.GOLEIRO) {
    const def = roll(55, 92);
    const atq = roll(12, 45);
    return { ataque: atq, defesa: def };
  }
  if (pos === POSITIONS.ZAGUEIRO) {
    const def = roll(58, 90);
    const atq = roll(28, 72);
    return { ataque: atq, defesa: def };
  }
  if (pos === POSITIONS.MEIA) {
    const atq = roll(48, 88);
    const def = roll(42, 82);
    return { ataque: atq, defesa: def };
  }
  const atq = roll(58, 94);
  const def = roll(28, 72);
  return { ataque: atq, defesa: def };
}

/** @param {import('./constants.js').Position[]} posicoes @param {() => number} rng */
function embaralharPosicoes(posicoes, rng) {
  const a = [...posicoes];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Distribuição semelhante ao pool grande, reduzida para ~32 jogadores. */
function distribuirPosicoesConvocacaoExtra(n) {
  let g = Math.max(4, Math.round(n * 0.1));
  let z = Math.max(8, Math.round(n * 0.28));
  let m = Math.max(8, Math.round(n * 0.32));
  let a = n - g - z - m;
  while (a < 6) {
    a++;
    if (m > 8) m--;
    else if (z > 8) z--;
    else if (g > 4) g--;
  }
  let guarda = 0;
  while (g + z + m + a > n && guarda++ < n * 2) {
    if (a > 6) a--;
    else if (m > 8) m--;
    else if (z > 8) z--;
    else if (g > 4) g--;
  }
  while (g + z + m + a < n) a++;
  /** @type {import('./constants.js').Position[]} */
  const out = [];
  for (let i = 0; i < g; i++) out.push(POSITIONS.GOLEIRO);
  for (let i = 0; i < z; i++) out.push(POSITIONS.ZAGUEIRO);
  for (let i = 0; i < m; i++) out.push(POSITIONS.MEIA);
  for (let i = 0; i < a; i++) out.push(POSITIONS.ATACANTE);
  return out;
}

/**
 * @param {string[]} prenomes
 * @param {string[]} sobrenomes
 * @param {() => number} rng
 */
function nomesCompletosEmbaralhados(prenomes, sobrenomes, rng) {
  /** @type {string[]} */
  const nomes = [];
  for (let pi = 0; pi < prenomes.length; pi++) {
    for (let si = 0; si < sobrenomes.length; si++) {
      nomes.push(`${prenomes[pi]} ${sobrenomes[si]}`);
    }
  }
  for (let i = nomes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [nomes[i], nomes[j]] = [nomes[j], nomes[i]];
  }
  return nomes;
}

/**
 * @param {JogadorDef[]} titulares
 */
export function forcaMediaTitularesDefs(titulares) {
  if (!titulares.length) return FM_ANCORA_TITULARES;
  let s = 0;
  for (const j of titulares) s += j.ataque + j.defesa;
  return s / (titulares.length * 2);
}

/**
 * Gera 32 jogadores fictícios adicionais para a lista de convocação (além dos 11+12 fixos).
 * @param {string} selecaoId
 * @param {JogadorDef[]} titulares
 * @returns {JogadorDef[]}
 */
export function gerarConvocacaoExtraDefs(selecaoId, titulares) {
  const n = 32;
  const seed = hashStringToSeedConvExtra(`convExtra:v1:${selecaoId}`);
  const rng = criarRng(seed);
  const forcaMediaTitulares = forcaMediaTitularesDefs(titulares);
  const { prenomes, sobrenomes } = listasNomesCampanha(selecaoId);
  const nomesPool = nomesCompletosEmbaralhados(prenomes, sobrenomes, rng);
  const posicoes = embaralharPosicoes(distribuirPosicoesConvocacaoExtra(n), rng);
  /** @type {JogadorDef[]} */
  const out = [];
  for (let i = 0; i < n; i++) {
    const pos = posicoes[i];
    const { ataque, defesa } = statsPorPosicaoExtra(pos, rng, forcaMediaTitulares);
    const nome = nomesPool[i % nomesPool.length];
    out.push({ nome, posicao: pos, ataque, defesa });
  }
  return out;
}
