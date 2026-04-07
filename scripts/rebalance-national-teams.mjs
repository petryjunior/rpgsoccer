/**
 * Reescala ataque/defesa dos titulares e reservas para aproximar forcaMediaSelecao
 * de alvos inspirados no pelotão real (~2024–2026). Executar na raiz:
 *   node scripts/rebalance-national-teams.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SELECOES_CORE,
  SELECOES_EXPAND,
} from "../public/js/national-teams.js";
import { forcaMediaSelecao } from "../public/js/world-cup.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FILE_CORE = path.join(ROOT, "public/js/national-teams.js");
const FILE_EXPAND = path.join(ROOT, "public/js/national-teams-expand.js");

/** @type {Record<string, number>} — média alvo (titulares) por id */
const TARGET_FORCA = {
  alb: 44,
  ale: 69.0,
  alg: 59.5,
  arg: 71.2,
  aus: 64.2,
  aut: 64.0,
  bel: 68.4,
  bfa: 46,
  bih: 56.8,
  bol: 36.5,
  bra: 70.8,
  bul: 50.5,
  can: 63.4,
  che: 67.3,
  chi: 64.7,
  chn: 48,
  civ: 58,
  cmr: 62.8,
  cod: 62.5,
  col: 65.9,
  cpv: 44.5,
  crc: 60.7,
  cro: 68.0,
  cuw: 42,
  cze: 64.8,
  den: 67.0,
  dom: 34,
  ecu: 64.5,
  egy: 61.3,
  esp: 70.5,
  est: 40,
  fij: 33,
  fin: 61.8,
  fra: 70.8,
  gab: 42,
  geo: 60.2,
  gha: 63.0,
  gre: 57.8,
  gua: 36,
  hon: 47.5,
  hti: 38,
  hun: 62.9,
  ind: 32,
  irl: 60.0,
  irn: 63.6,
  irq: 49.5,
  isl: 59.5,
  ita: 68.4,
  jam: 50,
  jor: 42,
  jpn: 65.5,
  kaz: 41,
  kor: 65.5,
  ksa: 61.6,
  lbn: 38,
  ltu: 39,
  lva: 56.0,
  mar: 65.6,
  mex: 65.9,
  mkd: 60.9,
  mli: 55.5,
  mne: 48,
  nca: 34,
  ned: 68.8,
  nga: 64.4,
  nor: 63.2,
  nzl: 58.5,
  oma: 45,
  pan: 48.5,
  par: 63.7,
  per: 52.5,
  png: 33,
  pol: 66.2,
  por: 69.3,
  qat: 58,
  rou: 60.7,
  rsa: 58.5,
  sco: 63.9,
  sen: 65.4,
  slv: 41,
  srb: 66.5,
  sur: 36,
  svk: 60.4,
  svn: 62.0,
  swe: 63.3,
  tah: 32,
  tha: 46,
  tto: 40,
  tun: 61.5,
  tur: 65.0,
  uae: 55,
  ukr: 65.2,
  uru: 67.6,
  usa: 65.8,
  uzb: 50,
  ven: 50,
  vie: 44,
  wal: 63.5,
  zam: 40,
  ing: 70.4,
};

const POS_TO_P = {
  goleiro: "P.GOLEIRO",
  zagueiro: "P.ZAGUEIRO",
  meia: "P.MEIA",
  atacante: "P.ATACANTE",
};

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/** @param {import('../public/js/national-teams.js').SelecaoDef} s */
function cloneBareTeam(s) {
  return {
    id: s.id,
    nome: s.nome,
    sigla: s.sigla,
    iso: s.iso,
    titulares: s.titulares.map((p) => ({ ...p })),
    reservas: s.reservas.map((p) => ({ ...p })),
  };
}

/** @param {import('../public/js/national-teams.js').SelecaoDef} t */
function tuneToTarget(t, target, atkLo, atkHi, defLo, defHi) {
  for (let iter = 0; iter < 18; iter++) {
    const cur = forcaMediaSelecao(t);
    if (Math.abs(cur - target) < 0.035) break;
    const sc = target / cur;
    for (const arr of [t.titulares, t.reservas]) {
      for (const p of arr) {
        p.ataque = clamp(Math.round(p.ataque * sc), atkLo, atkHi);
        p.defesa = clamp(Math.round(p.defesa * sc), defLo, defHi);
      }
    }
  }
}

function escapeStr(nome) {
  return nome.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** @param {{ nome: string, posicao: string, ataque: number, defesa: number }} p */
function formatPlayerLine(p) {
  const pc = POS_TO_P[/** @type {keyof typeof POS_TO_P} */ (p.posicao)];
  if (!pc) throw new Error(`Posição desconhecida: ${p.posicao}`);
  return `      j("${escapeStr(p.nome)}", ${pc}, ${p.ataque}, ${p.defesa})`;
}

/** @param {ReturnType<typeof cloneBareTeam>} s */
function formatTeamBlock(s) {
  const tit = s.titulares.map(formatPlayerLine).join(",\n");
  const res = s.reservas.map(formatPlayerLine).join(",\n");
  return [
    "  {",
    `    id: "${s.id}",`,
    `    nome: "${escapeStr(s.nome)}",`,
    `    sigla: "${s.sigla}",`,
    `    iso: "${s.iso}",`,
    "    titulares: [",
    tit,
    "    ],",
    "    reservas: [",
    res,
    "    ],",
    "  }",
  ].join("\n");
}

function findArraySlice(src, marker) {
  const i = src.indexOf(marker);
  if (i < 0) throw new Error(`Marcador não encontrado: ${marker}`);
  const open = src.indexOf("[", i + marker.length - 1);
  if (open < 0) throw new Error(`[ não encontrado após ${marker}`);
  let depth = 0;
  let q = null;
  for (let k = open; k < src.length; k++) {
    const c = src[k];
    if (q) {
      if (c === "\\" && q === '"') {
        k++;
        continue;
      }
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      q = c;
      continue;
    }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) return { open, close: k, before: src.slice(0, open + 1), after: src.slice(k) };
    }
  }
  throw new Error("Bracket não fechado");
}

function rebuildFile(filePath, marker, teams) {
  const src = fs.readFileSync(filePath, "utf8");
  const { before, after } = findArraySlice(src, marker);
  const inner = teams.map(formatTeamBlock).join(",\n");
  fs.writeFileSync(filePath, `${before}\n${inner}\n${after}`, "utf8");
}

function main() {
  const missing = [];
  for (const s of [...SELECOES_CORE, ...SELECOES_EXPAND]) {
    if (TARGET_FORCA[s.id] === undefined) missing.push(s.id);
  }
  if (missing.length) {
    console.error("Ids sem alvo:", missing.join(", "));
    process.exit(1);
  }

  const extra = Object.keys(TARGET_FORCA).filter(
    (id) =>
      !SELECOES_CORE.some((s) => s.id === id) &&
      !SELECOES_EXPAND.some((s) => s.id === id),
  );
  if (extra.length) {
    console.error("Alvos órfãos:", extra.join(", "));
    process.exit(1);
  }

  const scaledCore = SELECOES_CORE.map((s) => {
    const t = cloneBareTeam(s);
    const target = TARGET_FORCA[s.id];
    tuneToTarget(t, target, 14, 96, 14, 96);
    return t;
  });

  const scaledExp = SELECOES_EXPAND.map((s) => {
    const t = cloneBareTeam(s);
    const target = TARGET_FORCA[s.id];
    tuneToTarget(t, target, 14, 96, 14, 96);
    return t;
  });

  rebuildFile(FILE_CORE, "const SELECOES_CORE_BASE = [", scaledCore);
  rebuildFile(FILE_EXPAND, "export const SELECOES_EXPAND_RAW = [", scaledExp);

  console.log("Atualizado:", FILE_CORE);
  console.log("Atualizado:", FILE_EXPAND);
  console.log("Verifique com: node --input-type=module -e \"import { SELECOES } from './public/js/national-teams.js'; import { forcaMediaSelecao } from './public/js/world-cup.js'; ...\"");
}

main();
