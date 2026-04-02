/**
 * Confederações para modo Campanha (nome do torneio continental por região).
 *
 * Cobertura: **cada** `id` presente em `SELECOES` (national-teams + expand) deve ter
 * entrada aqui. Ao acrescentar uma seleção nova ao jogo, inclua o par `id: ConfKey`
 * no bloco certo; o carregamento deste módulo avisa no consola se faltar algum.
 */

import { SELECOES } from "./national-teams.js";

/** @typedef {'UEFA' | 'CONMEBOL' | 'CAF' | 'CONCACAF' | 'AFC' | 'OFC'} ConfedKey */

/** @type {Record<string, ConfedKey>} */
const ID_PARA_CONFED = {
  // CONMEBOL
  bra: "CONMEBOL",
  arg: "CONMEBOL",
  uru: "CONMEBOL",
  col: "CONMEBOL",
  ecu: "CONMEBOL",
  chi: "CONMEBOL",
  par: "CONMEBOL",
  bol: "CONMEBOL",
  per: "CONMEBOL",
  ven: "CONMEBOL",
  // UEFA
  ale: "UEFA",
  fra: "UEFA",
  esp: "UEFA",
  ing: "UEFA",
  ita: "UEFA",
  por: "UEFA",
  ned: "UEFA",
  bel: "UEFA",
  cro: "UEFA",
  cze: "UEFA",
  ukr: "UEFA",
  lva: "UEFA",
  swe: "UEFA",
  nor: "UEFA",
  pol: "UEFA",
  irl: "UEFA",
  sco: "UEFA",
  wal: "UEFA",
  den: "UEFA",
  hun: "UEFA",
  svk: "UEFA",
  che: "UEFA",
  aut: "UEFA",
  bih: "UEFA",
  mkd: "UEFA",
  gre: "UEFA",
  tur: "UEFA",
  geo: "UEFA",
  // CAF
  nga: "CAF",
  cmr: "CAF",
  mar: "CAF",
  gha: "CAF",
  cod: "CAF",
  sen: "CAF",
  mli: "CAF",
  // CONCACAF
  mex: "CONCACAF",
  usa: "CONCACAF",
  crc: "CONCACAF",
  jam: "CONCACAF",
  pan: "CONCACAF",
  tto: "CONCACAF",
  cuw: "CONCACAF",
  hti: "CONCACAF",
  can: "CONCACAF",
  // AFC
  jpn: "AFC",
  kor: "AFC",
  ksa: "AFC",
  irn: "AFC",
  uzb: "AFC",
  qat: "AFC",
  irq: "AFC",
  jor: "AFC",
  // OFC
  aus: "OFC",
  nzl: "OFC",
};

/** @type {Record<ConfedKey, { nomeTorneio: string }>} */
const INFO_CONFED = {
  UEFA: { nomeTorneio: "Eurocopa" },
  CONMEBOL: { nomeTorneio: "Copa América" },
  CAF: { nomeTorneio: "Copa Africana de Nações" },
  CONCACAF: { nomeTorneio: "Copa Ouro" },
  AFC: { nomeTorneio: "Copa Asiática" },
  OFC: { nomeTorneio: "Copa das Nações da Oceania" },
};

/**
 * @param {string} selecaoId
 * @returns {ConfedKey}
 */
export function confederacaoId(selecaoId) {
  const k = String(selecaoId).toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(ID_PARA_CONFED, k)) {
    console.warn(
      `[rpgsoccer/campanha] Seleção "${selecaoId}" sem entrada em ID_PARA_CONFED — trate como bug e adicione a confederação correta.`,
    );
    return "UEFA";
  }
  return ID_PARA_CONFED[k];
}

/**
 * Seleções explicitamente mapeadas (não usa o fallback UEFA de `confederacaoId`).
 * @param {string} selecaoId
 */
export function idConstaNoMapaConfed(selecaoId) {
  return Object.prototype.hasOwnProperty.call(ID_PARA_CONFED, String(selecaoId).toLowerCase());
}

/**
 * Participantes do torneio continental: mesma confederação, **apenas** seleções com
 * entrada explícita em `ID_PARA_CONFED` (ou seja, todas as do jogo, se o mapa estiver completo).
 * @param {string} selecaoPlayerId
 * @param {string[]} idsTodos
 */
export function idsCompeticaoContinental(selecaoPlayerId, idsTodos) {
  if (!idConstaNoMapaConfed(selecaoPlayerId)) {
    console.warn(
      `[rpgsoccer/campanha] Sua seleção "${selecaoPlayerId}" não está em ID_PARA_CONFED — torneio continental inválido até corrigir.`,
    );
    return [selecaoPlayerId];
  }
  const ck = ID_PARA_CONFED[String(selecaoPlayerId).toLowerCase()];
  return idsTodos.filter(
    (id) => idConstaNoMapaConfed(id) && ID_PARA_CONFED[String(id).toLowerCase()] === ck,
  );
}

/**
 * @param {string[]} idsTodos
 * @returns {Record<ConfedKey, string[]>}
 */
export function selecoesPorConfederacao(idsTodos) {
  /** @type {Record<ConfedKey, string[]>} */
  const out = {
    UEFA: [],
    CONMEBOL: [],
    CAF: [],
    CONCACAF: [],
    AFC: [],
    OFC: [],
  };
  for (const id of idsTodos) {
    if (!idConstaNoMapaConfed(id)) continue;
    const k = confederacaoId(id);
    out[k].push(id);
  }
  return out;
}

/**
 * @param {string} selecaoId
 * @returns {{ key: ConfedKey, nomeTorneio: string }}
 */
export function dadosTorneioContinental(selecaoId) {
  const key = confederacaoId(selecaoId);
  return { key, nomeTorneio: INFO_CONFED[key].nomeTorneio };
}

/**
 * Há fase final da competição continental da confederação nesse ano civil,
 * em linha com o calendário real (aproximação; atualize listas/regras quando a FIFA/CONMEBOL/etc. mudarem).
 * @param {ConfedKey} confKey
 * @param {number} ano
 */
export function anoComEdicaoContinental(confKey, ano) {
  if (!Number.isFinite(ano)) return false;
  switch (confKey) {
    case "UEFA":
      return ano >= 2024 && (ano - 2024) % 4 === 0;
    case "CONMEBOL":
      // Copa América principal a cada 4 anos em ano bissexto civil (2024, 2028, 2032…), alinhado ao calendário
      // divulgado (próxima após 2024 ≈ 2028). Não coincide com os anos de Copa do Mundo do modo campanha (2030, 2034…).
      return ano >= 2024 && ano % 4 === 0;
    case "CAF":
      return ano >= 2023 && ano % 2 === 1;
    case "CONCACAF":
      return ano >= 2023 && (ano - 2023) % 2 === 0;
    case "AFC":
      return ano >= 2027 && (ano - 2027) % 4 === 0;
    case "OFC":
      return ano >= 2024 && (ano - 2024) % 4 === 0;
    default:
      return false;
  }
}

/**
 * @param {string} a
 * @param {string} b
 */
export function mesmaConfederacao(a, b) {
  return confederacaoId(a) === confederacaoId(b);
}

for (const { id } of SELECOES) {
  if (!Object.prototype.hasOwnProperty.call(ID_PARA_CONFED, id)) {
    console.warn(
      `[rpgsoccer/campanha] Seleção "${id}" está em SELECOES mas falta em ID_PARA_CONFED (campaign-confederation.js).`,
    );
  }
}
