/**
 * Persistência da Copa (localStorage): serialização do estado + lista de saves.
 */

import { criarRng } from "./world-cup.js";

/** Mantém o prefixo legado para não invalidar saves já gravados no navegador. */
const STORAGE_KEY = "rpgsoccer-copa-saves-v1";
const FORMAT_VERSION = 1;
const MAX_SAVES = 14;

/**
 * Garante que `jogosEliminatorios` aponta para o array da fase correta (mesmas refs que em `eliminatoria`).
 * @param {Record<string, unknown>} est
 */
export function anexarJogosEliminatoriosAoEstado(est) {
  const f = est.faseCopa;
  const e = est.eliminatoria;
  if (f === "grupos" || !e) {
    est.jogosEliminatorios = [];
    return;
  }
  if (f === "oitavas") {
    est.jogosEliminatorios = e.oitavas;
    return;
  }
  if (f === "quartas" && e.quartas) {
    est.jogosEliminatorios = e.quartas;
    return;
  }
  if (f === "semi" && e.semi) {
    est.jogosEliminatorios = e.semi;
    return;
  }
  if ((f === "final" || f === "campeao") && e.final) {
    est.jogosEliminatorios = e.final;
    return;
  }
  if (f === "eliminado") {
    const idx = est.idxJogoEliminatorio ?? 0;
    if (e.oitavas && idx < e.oitavas.length) {
      est.jogosEliminatorios = e.oitavas;
      return;
    }
    if (e.quartas && idx < e.quartas.length) {
      est.jogosEliminatorios = e.quartas;
      return;
    }
    if (e.semi && idx < e.semi.length) {
      est.jogosEliminatorios = e.semi;
      return;
    }
    if (e.final?.length) {
      est.jogosEliminatorios = e.final;
      return;
    }
    est.jogosEliminatorios = [];
    return;
  }
  est.jogosEliminatorios = Array.isArray(est.jogosEliminatorios) ? est.jogosEliminatorios : [];
}

/**
 * @param {object} est copaEstado em memória (com `rng` vivo)
 * @returns {{ seed: number, rngT: number, plain: object }}
 */
export function serializarCopaEstadoParaJson(est) {
  if (!est?.rng || typeof est.rng.getState !== "function") {
    throw new Error("Estado da Copa inválido para salvar.");
  }
  const rngT = est.rng.getState();
  const { rng: _r, ...rest } = est;
  const plain = JSON.parse(JSON.stringify(rest));
  return { seed: est.seed, rngT, plain };
}

/**
 * @param {{ seed: number, rngT: number, plain: object }} block
 */
export function deserializarCopaEstadoDeJson(block) {
  const rng = criarRng(block.seed);
  if (block.rngT != null) rng.setState(block.rngT);
  const est = { ...block.plain, seed: block.seed, rng };
  anexarJogosEliminatoriosAoEstado(est);
  return est;
}

function readDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: FORMAT_VERSION, saves: [] };
    const d = JSON.parse(raw);
    if (!d || !Array.isArray(d.saves)) return { version: FORMAT_VERSION, saves: [] };
    return d;
  } catch {
    return { version: FORMAT_VERSION, saves: [] };
  }
}

function writeDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function listarSavesCopaOrdenados() {
  const db = readDb();
  return [...db.saves].sort((a, b) => String(b.savedAt || "").localeCompare(String(a.savedAt || "")));
}

/**
 * @param {string} nomeExibicao
 * @param {{ seed: number, rngT: number, plain: object }} block
 */
export function gravarNovoSaveCopa(nomeExibicao, block) {
  const db = readDb();
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `save-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const entry = {
    id,
    name: nomeExibicao.trim().slice(0, 48),
    savedAt: new Date().toISOString(),
    formatVersion: FORMAT_VERSION,
    payload: block,
  };
  db.saves.unshift(entry);
  while (db.saves.length > MAX_SAVES) db.saves.pop();
  writeDb(db);
  return entry;
}

/**
 * @param {string} id
 * @param {string} nomeExibicao
 * @param {{ seed: number, rngT: number, plain: object }} block
 */
export function substituirSaveCopa(id, nomeExibicao, block) {
  const db = readDb();
  const i = db.saves.findIndex((s) => s.id === id);
  if (i < 0) return null;
  db.saves[i] = {
    ...db.saves[i],
    name: nomeExibicao.trim().slice(0, 48),
    savedAt: new Date().toISOString(),
    formatVersion: FORMAT_VERSION,
    payload: block,
  };
  writeDb(db);
  return db.saves[i];
}

/** @param {string} id */
export function removerSaveCopa(id) {
  const db = readDb();
  db.saves = db.saves.filter((s) => s.id !== id);
  writeDb(db);
}

/** @param {string} id */
export function obterSaveCopaPorId(id) {
  return readDb().saves.find((s) => s.id === id) ?? null;
}

/**
 * @param {{ payload?: { seed: number, rngT: number, plain: object } }} entry
 */
export function carregarEstadoDoSave(entry) {
  if (!entry?.payload?.plain || entry.payload.seed == null) {
    throw new Error("Arquivo de save inválido ou corrompido.");
  }
  return deserializarCopaEstadoDeJson(entry.payload);
}
