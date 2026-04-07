/**
 * Recalibra ataque/defesa de todos os elencos de seleção:
 * piores → primários ~35–50; elite ~78–95; transição linear por ranking (100 degraus).
 * Uso: node scripts/rescale-national-squads.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const jsDir = join(root, "public", "js");

const ntMod = await import(pathToFileURL(join(jsDir, "national-teams.js")).href);

/** @param {{ id: string, nome: string, sigla: string, iso: string, titulares: unknown[], reservas: unknown[] }} t */
function stripConvocacaoExtra(t) {
  return {
    id: t.id,
    nome: t.nome,
    sigla: t.sigla,
    iso: t.iso,
    titulares: t.titulares,
    reservas: t.reservas,
  };
}

const SELECOES_CORE = ntMod.SELECOES_CORE.map(stripConvocacaoExtra);
const SELECOES_EXPAND_RAW = ntMod.SELECOES_EXPAND.map(stripConvocacaoExtra);

const PMAP = {
  goleiro: "P.GOLEIRO",
  zagueiro: "P.ZAGUEIRO",
  meia: "P.MEIA",
  atacante: "P.ATACANTE",
};

function sumTitulares(team) {
  let s = 0;
  for (const p of team.titulares) s += p.ataque + p.defesa;
  return s;
}

function clamp01(t) {
  return Math.max(0, Math.min(1, t));
}

function roundStat(x) {
  return Math.min(99, Math.max(1, Math.round(x)));
}

/** Primário (ATA/ZAG defesa / ATA ataque): piores ~35–50, elite ~78–95 */
function bandaPrimario(tier) {
  const t = clamp01(tier);
  return { low: 35 + 43 * t, high: 50 + 45 * t };
}

/** Secundário (pior atributo da posição): bem menor nas fracas */
function bandaSecundario(tier) {
  const t = clamp01(tier);
  return { low: 14 + 24 * t, high: 30 + 42 * t };
}

/** Meias: faixa intermediária entre “linha” e elite */
function bandaMeia(tier) {
  const t = clamp01(tier);
  return { low: 32 + 32 * t, high: 46 + 42 * t };
}

/** Goleiros: defesa como “principal” */
function bandaGoleiroDef(tier) {
  const t = clamp01(tier);
  return { low: 40 + 32 * t, high: 52 + 40 * t };
}

function bandaGoleiroAtk(tier) {
  const t = clamp01(tier);
  return { low: 10 + 10 * t, high: 20 + 14 * t };
}

/**
 * Mapeia valores relativos para [low, high] sem colar no mínimo/máximo absolutos
 * (evita dois atacantes em exatamente 75 e 95 em todo time forte).
 */
function remapSoft(oldVals, low, high, margin = 0.11) {
  const mn = Math.min(...oldVals);
  const mx = Math.max(...oldVals);
  const band = high - low;
  const lo = low + margin * band;
  const hi = high - margin * band;
  if (mx === mn) {
    const n = oldVals.length;
    return oldVals.map((_, i) => lo + ((i + 0.5) / n) * (hi - lo));
  }
  const span = mx - mn;
  return oldVals.map((v) => lo + ((v - mn) / span) * (hi - lo));
}

/** 1 GOL + linha: z∈[3,5], m∈[2,5], a∈[1,4], z+m+a=10 (igual a squad.js). */
function formacoesTitularesValidas() {
  /** @type {{ z: number, m: number, a: number }[]} */
  const out = [];
  for (let z = 3; z <= 5; z++) {
    for (let m = 2; m <= 5; m++) {
      const a = 10 - z - m;
      if (a >= 1 && a <= 4) out.push({ z, m, a });
    }
  }
  return out;
}

const FORMACOES = formacoesTitularesValidas();

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(h, 31) + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Redistribui posições dos titulares (stats inalterados) para variar 4-3-3, 5-4-1, etc.
 * Regras: 1 GOL; 3–5 ZAG; 2–5 MEI; 1–4 ATA.
 * @param {{ nome: string, posicao: string, ataque: number, defesa: number }[]} titulares
 */
function assignTitularesFormation(titulares, teamId) {
  if (titulares.length !== 11) return titulares;

  const gks = titulares.filter((p) => p.posicao === "goleiro");
  const field = titulares.filter((p) => p.posicao !== "goleiro");
  if (gks.length !== 1 || field.length !== 10) return titulares;

  const { z, m, a } = FORMACOES[hashId(teamId) % FORMACOES.length];

  const byDef = [...field].sort((p1, p2) => p2.defesa - p1.defesa);
  const zags = byDef.slice(0, z);
  const rest = byDef.slice(z);
  const byAtk = [...rest].sort((p1, p2) => p2.ataque - p1.ataque);
  const atas = byAtk.slice(0, a);
  const meias = byAtk.slice(a);

  const out = [
    { ...gks[0], posicao: "goleiro" },
    ...zags.map((p) => ({ ...p, posicao: "zagueiro" })),
    ...meias.map((p) => ({ ...p, posicao: "meia" })),
    ...atas.map((p) => ({ ...p, posicao: "atacante" })),
  ];
  return out;
}

function rescaleRoster(players, tier) {
  const ph = bandaPrimario(tier);
  const sh = bandaSecundario(tier);
  const mh = bandaMeia(tier);
  const ghD = bandaGoleiroDef(tier);
  const ghA = bandaGoleiroAtk(tier);

  const newPlayers = players.map((p) => ({
    nome: p.nome,
    posicao: p.posicao,
    ataque: p.ataque,
    defesa: p.defesa,
  }));

  const positions = ["goleiro", "zagueiro", "meia", "atacante"];
  for (const pos of positions) {
    const indices = players.map((p, i) => (p.posicao === pos ? i : -1)).filter((i) => i >= 0);
    if (indices.length === 0) continue;

    if (pos === "goleiro") {
      const oldDefs = indices.map((i) => players[i].defesa);
      const oldAtks = indices.map((i) => players[i].ataque);
      const newDefs = remapSoft(oldDefs, ghD.low, ghD.high);
      const newAtks = remapSoft(oldAtks, ghA.low, ghA.high);
      indices.forEach((i, j) => {
        newPlayers[i].defesa = roundStat(newDefs[j]);
        newPlayers[i].ataque = roundStat(newAtks[j]);
      });
    } else if (pos === "zagueiro") {
      const oldDefs = indices.map((i) => players[i].defesa);
      const oldAtks = indices.map((i) => players[i].ataque);
      const newDefs = remapSoft(oldDefs, ph.low, ph.high);
      const newAtks = remapSoft(oldAtks, sh.low, sh.high);
      indices.forEach((i, j) => {
        newPlayers[i].defesa = roundStat(newDefs[j]);
        newPlayers[i].ataque = roundStat(newAtks[j]);
      });
    } else if (pos === "atacante") {
      const oldAtks = indices.map((i) => players[i].ataque);
      const oldDefs = indices.map((i) => players[i].defesa);
      const newAtks = remapSoft(oldAtks, ph.low, ph.high);
      const newDefs = remapSoft(oldDefs, sh.low, sh.high);
      indices.forEach((i, j) => {
        newPlayers[i].ataque = roundStat(newAtks[j]);
        newPlayers[i].defesa = roundStat(newDefs[j]);
      });
    } else if (pos === "meia") {
      const oldAtks = indices.map((i) => players[i].ataque);
      const oldDefs = indices.map((i) => players[i].defesa);
      const newAtks = remapSoft(oldAtks, mh.low, mh.high);
      const newDefs = remapSoft(oldDefs, mh.low, mh.high);
      indices.forEach((i, j) => {
        newPlayers[i].ataque = roundStat(newAtks[j]);
        newPlayers[i].defesa = roundStat(newDefs[j]);
      });
    }
  }

  return newPlayers;
}

function esc(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatPlayers(arr) {
  return (
    arr
      .map(
        (p) =>
          `      j("${esc(p.nome)}", ${PMAP[p.posicao]}, ${p.ataque}, ${p.defesa}),`,
      )
      .join("\n") + "\n"
  );
}

function formatTeam(team) {
  return `  {
    id: "${team.id}",
    nome: "${esc(team.nome)}",
    sigla: "${esc(team.sigla)}",
    iso: "${team.iso}",
    titulares: [
${formatPlayers(team.titulares)}    ],
    reservas: [
${formatPlayers(team.reservas)}    ],
  }`;
}

const all = [...SELECOES_CORE, ...SELECOES_EXPAND_RAW];
const rankSorted = [...all].sort((a, b) => sumTitulares(b) - sumTitulares(a));
const rankById = new Map(rankSorted.map((t, i) => [t.id, i]));
const n = all.length;

/** Um degrau por posição no ranking (0 = pior, 1 = melhor), sem comprimir o meio. */
function tierForRank(r) {
  if (n <= 1) return 1;
  return clamp01(1 - r / (n - 1));
}

function tierForId(id) {
  const r = rankById.get(id) ?? n - 1;
  return tierForRank(r);
}

const coreRescaled = SELECOES_CORE.map((t) => {
  const tierTit = tierForId(t.id);
  const tierRes = clamp01(tierTit - 0.09);
  return {
    ...t,
    titulares: assignTitularesFormation(rescaleRoster(t.titulares, tierTit), t.id),
    reservas: rescaleRoster(t.reservas, tierRes),
  };
});

const expandRescaled = SELECOES_EXPAND_RAW.map((t) => {
  const tierTit = tierForId(t.id);
  const tierRes = clamp01(tierTit - 0.09);
  return {
    ...t,
    titulares: assignTitularesFormation(rescaleRoster(t.titulares, tierTit), t.id),
    reservas: rescaleRoster(t.reservas, tierRes),
  };
});

const expandPath = join(jsDir, "national-teams-expand.js");
const expandOut = `import { POSITIONS as P } from "./constants.js";

function j(nome, posicao, ataque, defesa) {
  return { nome, posicao, ataque, defesa };
}

/**
 * Seleções adicionais ao pool mundial (Copa sorteia 32 com peso por força).
 * Oceania: Fiji, Papua-Nova Guiné e Tahiti (com NZL no core) = 4 na OFC; Austrália está na AFC.
 * Segunda leva: UEFA (10), CAF (8), AFC (6), CONCACAF (6) — ver lista no repositório / pedido do autor.
 * Mais: Lituânia (LTU), Índia (IND), Burkina Faso (BFA) — 100 seleções no total com o core.
 * Chile já existe em \`national-teams.js\` (id chi).
 * @type {import("./national-teams.js").SelecaoDef[]}
 * \`convocacaoExtra\` é acrescentado em \`national-teams.js\`.
 */
export const SELECOES_EXPAND_RAW = [
${expandRescaled.map(formatTeam).join(",\n")}
];
`;
writeFileSync(expandPath, expandOut, "utf8");

const corePath = join(jsDir, "national-teams.js");
const coreSrc = readFileSync(corePath, "utf8");
const coreBody = `const SELECOES_CORE_BASE = [\n${coreRescaled.map(formatTeam).join(",\n")}\n];`;
const coreReplaced = coreSrc.replace(
  /const SELECOES_CORE_BASE = \[[\s\S]*?\n\];(?=\s*\n\/\*\*\n \* Acrescenta)/,
  coreBody,
);
if (coreReplaced === coreSrc) {
  throw new Error("national-teams.js: não achei o bloco SELECOES_CORE_BASE para substituir.");
}
writeFileSync(corePath, coreReplaced, "utf8");

const bol = expandRescaled.find((t) => t.id === "bol");
const bra = coreRescaled.find((t) => t.id === "bra");
const fra = coreRescaled.find((t) => t.id === "fra");
const worstId = rankSorted[n - 1].id;
const wTeam =
  expandRescaled.find((t) => t.id === worstId) ?? coreRescaled.find((t) => t.id === worstId);
console.log(
  "Formações (Z/M/A):",
  coreRescaled.slice(0, 5).map((t) => {
    const c = (pos) => t.titulares.filter((p) => p.posicao === pos).length;
    return `${t.id} ${c("zagueiro")}-${c("meia")}-${c("atacante")}`;
  }),
);
console.log("Pior ranking tit primários (ATA atk):", wTeam.id, wTeam.titulares.filter((p) => p.posicao === "atacante").map((p) => p.ataque));
console.log("Bolívia ATA tit:", bol.titulares.filter((p) => p.posicao === "atacante").map((p) => p.ataque));
console.log("Brasil ATA tit:", bra?.titulares.filter((p) => p.posicao === "atacante").map((p) => p.ataque));
console.log("França ATA tit:", fra?.titulares.filter((p) => p.posicao === "atacante").map((p) => p.ataque));
console.log("OK: national-teams-expand.js e national-teams.js atualizados.");