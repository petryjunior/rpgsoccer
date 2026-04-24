/**
 * Pool de jogadores por seleção (modo Campanha): geração determinística 50–100 por país.
 * Atributos ancorados na força média dos titulares da seleção (elenco nacional), para
 * Letônia, Andorra, etc. não gerarem o mesmo teto que Brasil ou França.
 */

import { POSITIONS } from "./constants.js";
import { criarRng, forcaMediaSelecao } from "./world-cup.js";
import { listasNomesCampanha } from "./campaign-names.js";
import { elencoDaSelecao } from "./national-teams.js";

/** Incrementar ao mudar lógica de geração (invalida saves antigos só se checagem explícita). */
export const POOL_DATA_VERSION = 9;

/** Média de (ataque+defesa)/2 dos titulares: seleção “média” no jogo (~esta força). */
const FM_ANCORA_TITULARES = 68;

/** Pontos de deslocamento por ponto de força acima/abaixo da âncora. */
const FM_SHIFT_POR_PONTO = 1.08;

/** Teto por jogador: força média + este valor (depois do deslocamento), até 99. */
const FM_TETO_EXTRA_NOS_ATRIBUTOS = 19;

/**
 * @param {string} s
 * @returns {number}
 */
export function hashStringToSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * @param {() => number} rng
 * @param {number} lo
 * @param {number} hi
 */
function intRng(rng, lo, hi) {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/**
 * Embaralha todos os pares (prenome × sobrenome) e devolve nomes completos únicos na ordem do sorteio.
 * @param {string[]} prenomes
 * @param {string[]} sobrenomes
 * @param {() => number} rng
 * @returns {string[]}
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
 * Força média dos titulares da seleção (mesma métrica da Copa / simulações).
 * @param {string} selecaoId
 */
export function forcaMediaTitularesSelecao(selecaoId) {
  const { titulares } = elencoDaSelecao(selecaoId);
  return forcaMediaSelecao({ titulares });
}

/**
 * Stats base por posição (campanha), escalados pela força do elenco nacional.
 * @param {import('./constants.js').Position} pos
 * @param {() => number} rng
 * @param {number} forcaMediaTitulares média (ataque+defesa)/2 dos 11 titulares
 */
export function statsPorPosicaoCampanha(pos, rng, forcaMediaTitulares) {
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

/**
 * Distribuição aproximada em um elenco de tamanho n.
 * @param {number} n
 * @returns {import('./constants.js').Position[]}
 */
function distribuirPosicoes(n) {
  let g = Math.max(4, Math.round(n * 0.1));
  let z = Math.max(10, Math.round(n * 0.28));
  let m = Math.max(12, Math.round(n * 0.32));
  let a = n - g - z - m;
  while (a < 8) {
    a++;
    if (m > 12) m--;
    else if (z > 10) z--;
    else if (g > 4) g--;
  }
  let guarda = 0;
  while (g + z + m + a > n && guarda++ < n * 2) {
    if (a > 8) a--;
    else if (m > 12) m--;
    else if (z > 10) z--;
    else if (g > 4) g--;
  }
  while (g + z + m + a < n) a++;
  const out = [];
  for (let i = 0; i < g; i++) out.push(POSITIONS.GOLEIRO);
  for (let i = 0; i < z; i++) out.push(POSITIONS.ZAGUEIRO);
  for (let i = 0; i < m; i++) out.push(POSITIONS.MEIA);
  for (let i = 0; i < a; i++) out.push(POSITIONS.ATACANTE);
  return out;
}

/**
 * @param {string} selecaoId
 * @returns {number} tamanho do pool (50–100)
 */
export function tamanhoPoolCampanha(selecaoId) {
  const h = hashStringToSeed(`${POOL_DATA_VERSION}:${selecaoId}`);
  return 50 + (h % 51);
}

/**
 * @typedef {{
 *   id: string,
 *   nome: string,
 *   posicao: import('./constants.js').Position,
 *   ataque: number,
 *   defesa: number,
 *   idade: number,
 *   potencial: number,
 *   forma: number,
 *   refAtaqueTemporada?: number,
 *   refDefesaTemporada?: number,
 *   refAtaqueCampanha?: number,
 *   refDefesaCampanha?: number,
 * }} JogadorCampanha
 */

/**
 * Gera elenco completo para uma seleção (determinístico).
 * @param {string} selecaoId
 * @returns {JogadorCampanha[]}
 */
export function gerarPoolCampanha(selecaoId) {
  const seed = hashStringToSeed(`${POOL_DATA_VERSION}:pool:${selecaoId}`);
  const rng = criarRng(seed);
  const n = tamanhoPoolCampanha(selecaoId);
  const forcaMediaTitulares = forcaMediaTitularesSelecao(selecaoId);
  const tetoPotencial = Math.min(
    99,
    Math.max(
      Math.max(1, Math.round(forcaMediaTitulares + 8)),
      Math.round(forcaMediaTitulares + 14 + intRng(rng, 0, 16)),
    ),
  );
  const { prenomes, sobrenomes } = listasNomesCampanha(selecaoId);
  const nomesPool = nomesCompletosEmbaralhados(prenomes, sobrenomes, rng);
  const posicoes = distribuirPosicoes(n);
  for (let i = posicoes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [posicoes[i], posicoes[j]] = [posicoes[j], posicoes[i]];
  }
  /** @type {JogadorCampanha[]} */
  const jogadores = [];
  for (let i = 0; i < n; i++) {
    const pos = posicoes[i];
    const { ataque, defesa } = statsPorPosicaoCampanha(pos, rng, forcaMediaTitulares);
    const idade = intRng(rng, 18, 35);
    const basePot = Math.max(ataque, defesa);
    const potencial = intRng(rng, basePot, Math.max(basePot, tetoPotencial));
    const nome = nomesPool[i % nomesPool.length];
    const id = `camp-${selecaoId}-${String(i).padStart(4, "0")}`;
    jogadores.push({
      id,
      nome,
      posicao: pos,
      ataque,
      defesa,
      idade,
      potencial,
      forma: 100,
    });
  }
  return jogadores;
}
