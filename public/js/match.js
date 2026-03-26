import { POSITIONS, ZONES } from "./constants.js";

/**
 * @typedef {'equilibrado' | 'arrojado' | 'cauteloso'} Postura
 */

/**
 * @param {number} min
 * @param {number} max
 */
function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** @param {{ ataque: number, defesa: number }} jogador @param {Postura} postura */
function aplicarPostura(jogador, postura) {
  let ataque = jogador.ataque;
  let defesa = jogador.defesa;
  if (postura === "arrojado") {
    ataque *= 1.22;
    defesa *= 0.88;
  } else if (postura === "cauteloso") {
    ataque *= 0.9;
    defesa *= 1.22;
  }
  return { ataque, defesa };
}

/**
 * Pequena variação na probabilidade exibida / usada no QTE.
 * @param {number} p
 */
function comRuido(p) {
  const noise = (Math.random() - 0.5) * 0.08;
  return Math.min(0.97, Math.max(0.03, p + noise));
}

/** @param {object[]} titulares @param {string} pos */
function sortearPorPosicao(titulares, pos) {
  const pool = titulares.filter((j) => j.posicao === pos);
  if (pool.length === 0) return null;
  return pool[randomInt(0, pool.length - 1)];
}

/** @param {object[]} titulares */
export function sortearGoleiro(titulares) {
  return sortearPorPosicao(titulares, POSITIONS.GOLEIRO);
}

/** @param {string} zona @param {object[]} titPlayer @param {object[]} titCpu */
export function escolherDuelistas(zona, titPlayer, titCpu) {
  if (zona === ZONES.DEFESA_JOGADOR) {
    return {
      jogador: sortearPorPosicao(titPlayer, POSITIONS.ZAGUEIRO),
      adversario: sortearPorPosicao(titCpu, POSITIONS.ATACANTE),
    };
  }
  if (zona === ZONES.MEIO_CAMPO) {
    return {
      jogador: sortearPorPosicao(titPlayer, POSITIONS.MEIA),
      adversario: sortearPorPosicao(titCpu, POSITIONS.MEIA),
    };
  }
  if (zona === ZONES.ATAQUE_JOGADOR) {
    return {
      jogador: sortearPorPosicao(titPlayer, POSITIONS.ATACANTE),
      adversario: sortearPorPosicao(titCpu, POSITIONS.ZAGUEIRO),
    };
  }
  return { jogador: null, adversario: null };
}

/**
 * Probabilidade de vitória do jogador humano no duelo (base do tamanho/velocidade do QTE).
 * @param {{ ataque: number, defesa: number }} eu
 * @param {{ ataque: number, defesa: number }} ele
 * @param {Postura} postura
 */
export function calcularProbDuelo(eu, ele, jogadorComBola, postura) {
  const mod = aplicarPostura(eu, postura);
  const oA = ele.ataque;
  const oD = ele.defesa;

  let meuPeso;
  let pesoOponente;
  if (jogadorComBola) {
    meuPeso = mod.ataque;
    pesoOponente = oD;
  } else {
    meuPeso = mod.defesa;
    pesoOponente = oA;
  }

  const total = meuPeso + pesoOponente;
  const probBase = total > 0 ? meuPeso / total : 0.5;
  const probJogador = comRuido(probBase);
  return { probJogador };
}

/**
 * Pesos do duelo sem ruído — usado no QTE para a dificuldade refletir os atributos de verdade.
 * @param {{ ataque: number, defesa: number }} eu
 * @param {{ ataque: number, defesa: number }} ele
 * @param {Postura} postura
 */
export function metricasDuelo(eu, ele, jogadorComBola, postura) {
  const mod = aplicarPostura(eu, postura);
  const oA = ele.ataque;
  const oD = ele.defesa;

  let meuPeso;
  let pesoOponente;
  if (jogadorComBola) {
    meuPeso = mod.ataque;
    pesoOponente = oD;
  } else {
    meuPeso = mod.defesa;
    pesoOponente = oA;
  }

  const total = meuPeso + pesoOponente;
  const ratio = total > 0 ? meuPeso / total : 0.5;
  return { ratio, meuPeso, pesoOponente };
}

export function sortearZona() {
  const keys = [ZONES.DEFESA_JOGADOR, ZONES.MEIO_CAMPO, ZONES.ATAQUE_JOGADOR];
  return keys[randomInt(0, keys.length - 1)];
}

export function proximoIntervaloMinutos() {
  return randomInt(1, 10);
}

/**
 * Após zagueiro × atacante na área: ataque vencedor enfrenta o goleiro.
 * @returns {'jogador_chuta' | 'cpu_chuta' | null}
 */
export function tipoFinalizacaoGoleiro(zona, jogadorVenceuPrimario) {
  if (zona === ZONES.ATAQUE_JOGADOR && jogadorVenceuPrimario) return "jogador_chuta";
  if (zona === ZONES.DEFESA_JOGADOR && !jogadorVenceuPrimario) return "cpu_chuta";
  return null;
}

/**
 * @param {boolean} jogadorComBola
 * @param {boolean} jogadorVenceu
 */
export function atualizarPosse(jogadorComBola, jogadorVenceu) {
  if (jogadorVenceu) return true;
  return false;
}
