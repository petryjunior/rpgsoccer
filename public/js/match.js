import { POSITIONS, ZONES } from "./constants.js";

/**
 * @param {number} min
 * @param {number} max
 */
function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
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
 */
export function calcularProbDuelo(eu, ele, jogadorComBola) {
  const oA = ele.ataque;
  const oD = ele.defesa;

  let meuPeso;
  let pesoOponente;
  if (jogadorComBola) {
    meuPeso = eu.ataque;
    pesoOponente = oD;
  } else {
    meuPeso = eu.defesa;
    pesoOponente = oA;
  }

  const total = meuPeso + pesoOponente;
  const probBase = total > 0 ? meuPeso / total : 0.5;
  const probJogador = comRuido(probBase);
  return { probJogador };
}

/**
 * Pesos do duelo — usado no QTE (tempo da letra).
 * Com a posse, `eu` usa ataque × defesa do rival; sem posse, defesa × ataque.
 * @param {{ ataque: number, defesa: number }} eu
 * @param {{ ataque: number, defesa: number }} ele
 */
export function metricasDuelo(eu, ele, jogadorComBola) {
  const oA = ele.ataque;
  const oD = ele.defesa;

  let meuPeso;
  let pesoOponente;
  if (jogadorComBola) {
    meuPeso = eu.ataque;
    pesoOponente = oD;
  } else {
    meuPeso = eu.defesa;
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

/** Minutos de acréscimo (0–9) por tempo; sorteados ao iniciar cada partida. */
export function sortearAcrescimosTempo() {
  return randomInt(0, 9);
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

/**
 * Próximo setor do lance e posse após duelo de campo (sem finalização com goleiro).
 * Meio-campo: quem vence leva a bola ao seu ataque.
 * @param {string} zona
 * @param {boolean} jogadorVenceu
 * @param {boolean} jogadorComBola
 */
export function proximaZonaEPosse(zona, jogadorVenceu, jogadorComBola) {
  const posseJogador = atualizarPosse(jogadorComBola, jogadorVenceu);
  if (zona === ZONES.MEIO_CAMPO) {
    return {
      posseJogador,
      proximaZona: jogadorVenceu ? ZONES.ATAQUE_JOGADOR : ZONES.DEFESA_JOGADOR,
    };
  }
  if (zona === ZONES.ATAQUE_JOGADOR) {
    if (jogadorVenceu) {
      return { posseJogador, proximaZona: ZONES.MEIO_CAMPO };
    }
    return { posseJogador, proximaZona: ZONES.DEFESA_JOGADOR };
  }
  if (zona === ZONES.DEFESA_JOGADOR) {
    if (jogadorVenceu) {
      return { posseJogador, proximaZona: ZONES.MEIO_CAMPO };
    }
    return { posseJogador, proximaZona: ZONES.ATAQUE_JOGADOR };
  }
  return { posseJogador, proximaZona: ZONES.MEIO_CAMPO };
}

/**
 * Chance do atacante errar o chute mesmo após vencer o goleiro no QTE (0–1).
 * Mais ataque ⇒ menos erro.
 */
export function chanceErrarFinalizacaoAposVencerGoleiro(ataque) {
  const a = Number(ataque);
  return Math.min(0.28, Math.max(0.035, (86 - a) / 200));
}
