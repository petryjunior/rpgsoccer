/**
 * Histórico persistido de campeões: Copa do Mundo + todos os torneios continentais por ano.
 */

import {
  selecoesPorConfederacao,
  anoComEdicaoContinental,
  dadosTorneioContinental,
  nomeCompeticaoContinentalConfed,
} from "./campaign-confederation.js";
import { elencoDaSelecao } from "./national-teams.js";
import { criarRng, embaralhar, forcaMediaSelecao, simularPlacar } from "./world-cup.js";

/**
 * @typedef {{
 *   chave: string,
 *   ano: number,
 *   competicao: string,
 *   vencedorId: string,
 * }} RegistroCampeaoCampanha
 */

/**
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {string} chave
 */
function jaTemRegistroCampeao(estado, chave) {
  const h = estado.historicoCampeoes;
  return Array.isArray(h) && h.some((x) => x.chave === chave);
}

/**
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {{ chave: string, ano: number, competicao: string, vencedorId: string }} r
 */
export function registrarCampeaoCampanha(estado, r) {
  if (!r?.vencedorId || !r.chave) return;
  if (!Array.isArray(estado.historicoCampeoes)) estado.historicoCampeoes = [];
  if (jaTemRegistroCampeao(estado, r.chave)) return;
  estado.historicoCampeoes.push({ ...r });
}

/**
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {number} anoMundial ano do Mundial (ex.: 2030)
 * @param {string} vencedorSelecaoId
 */
export function registrarCampeaoCopaMundialCampanha(estado, anoMundial, vencedorSelecaoId) {
  if (!vencedorSelecaoId || !Number.isFinite(anoMundial)) return;
  const chave = `${anoMundial}-mundial`;
  registrarCampeaoCampanha(estado, {
    chave,
    ano: anoMundial,
    competicao: `Copa do Mundo ${anoMundial}`,
    vencedorId: vencedorSelecaoId,
  });
}

/**
 * @param {string[]} pool ids de seleções
 * @param {() => number} rng
 * @returns {string | null}
 */
function simularCampeaoMiniTorneio(pool, rng) {
  if (!pool.length) return null;
  if (pool.length === 1) return pool[0];
  let alive = embaralhar([...pool], rng);
  for (let guard = 0; guard < 24 && alive.length > 1; guard++) {
    const next = [];
    for (let i = 0; i < alive.length; i += 2) {
      if (i + 1 >= alive.length) {
        next.push(alive[i]);
        break;
      }
      const h = alive[i];
      const a = alive[i + 1];
      const fh = forcaMediaSelecao(elencoDaSelecao(h));
      const fa = forcaMediaSelecao(elencoDaSelecao(a));
      const { gh, ga } = simularPlacar(fh, fa, rng);
      let win;
      if (gh > ga) win = h;
      else if (ga > gh) win = a;
      else win = rng() < fh / (fh + fa + 1e-9) ? h : a;
      next.push(win);
    }
    alive = next;
  }
  return alive[0] ?? null;
}

/**
 * Ao encerrar o ano: um campeão por confederação que teve edição do torneio continental.
 * A confederação do jogador usa `torneioContinental.campeaoContinentalId` quando a fase terminou;
 * as demais são simuladas (CPU).
 *
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @param {number} anoCivil
 * @param {string[]} idsTodos
 * @param {number} seedBase
 */
export function registrarCampeoesContinentaisAnoCampanha(estado, anoCivil, idsTodos, seedBase) {
  if (!Number.isFinite(anoCivil) || !idsTodos.length) return;
  const por = selecoesPorConfederacao(idsTodos);
  const { key: playerKey } = dadosTorneioContinental(estado.selecaoId);
  let salt = 0;

  for (const confKey of /** @type {const} */ ([
    "UEFA",
    "CONMEBOL",
    "CAF",
    "CONCACAF",
    "AFC",
    "OFC",
  ])) {
    if (!anoComEdicaoContinental(confKey, anoCivil)) continue;
    const chave = `${anoCivil}-continental-${confKey}`;
    if (jaTemRegistroCampeao(estado, chave)) continue;

    const pool = por[confKey];
    if (!pool.length) continue;

    const nomeTorneio = nomeCompeticaoContinentalConfed(confKey);
    const competicao = `${nomeTorneio} ${anoCivil}`;

    /** @type {string | null} */
    let vencedorId = null;

    if (confKey === playerKey) {
      const T = estado.torneioContinental;
      if (T?.fase === "fim" && T.campeaoContinentalId && pool.includes(T.campeaoContinentalId)) {
        vencedorId = T.campeaoContinentalId;
      }
    }

    if (!vencedorId) {
      const rng = criarRng((seedBase ^ 0xc0ffee ^ salt++ * 0x10001) >>> 0);
      vencedorId = simularCampeaoMiniTorneio(pool, rng);
    }

    if (vencedorId) {
      registrarCampeaoCampanha(estado, {
        chave,
        ano: anoCivil,
        competicao,
        vencedorId,
      });
    }
  }
}

/**
 * Lista para o hub: mais recente primeiro, desempate por nome da competição.
 * @param {import('./campaign-storage.js').CampanhaEstadoPersistido} estado
 * @returns {RegistroCampeaoCampanha[]}
 */
export function listarCampeoesCampanhaOrdenados(estado) {
  const h = estado.historicoCampeoes;
  if (!Array.isArray(h) || !h.length) return [];
  return [...h].sort((a, b) => {
    if (b.ano !== a.ano) return b.ano - a.ano;
    return String(a.competicao).localeCompare(String(b.competicao), "pt-BR");
  });
}
