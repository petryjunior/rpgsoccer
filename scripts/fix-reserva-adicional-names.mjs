/**
 * Substitui "Reserva adicional {id}" por um nome fictício coerente com a seleção.
 * Uso: node scripts/fix-reserva-adicional-names.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsDir = join(__dirname, "..", "public", "js");

const { SELECOES } = await import(pathToFileURL(join(jsDir, "national-teams.js")).href);
const { listasNomesCampanha } = await import(pathToFileURL(join(jsDir, "campaign-names.js")).href);

function hashId(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** @param {string} nome */
function esc(nome) {
  return nome.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * @param {string} id
 * @param {Set<string>} used lowercased nomes
 */
function pickTwelfthName(id, used) {
  const { prenomes, sobrenomes } = listasNomesCampanha(id);
  const h = hashId(`banco12:${id}`);
  for (let a = 0; a < 800; a++) {
    const nome = `${prenomes[(h + a * 17) % prenomes.length]} ${sobrenomes[(h + a * 11) % sobrenomes.length]}`;
    if (!used.has(nome.toLowerCase())) return nome;
  }
  return `${prenomes[h % prenomes.length]} ${sobrenomes[(h >> 8) % sobrenomes.length]}`;
}

/** @type {Map<string, string>} */
const nameById = new Map();
for (const s of SELECOES) {
  const used = new Set();
  for (const p of [...s.titulares, ...s.reservas]) {
    used.add(String(p.nome).toLowerCase());
  }
  nameById.set(s.id, pickTwelfthName(s.id, used));
}

for (const path of [join(jsDir, "national-teams.js"), join(jsDir, "national-teams-expand.js")]) {
  let text = readFileSync(path, "utf8");
  const next = text.replace(
    /j\("Reserva adicional (\w+)", (P\.\w+), (\d+), (\d+)\),/g,
    (/** @type {string} */ _m, id, pos, atq, def) => {
      const nome = nameById.get(id);
      if (!nome) throw new Error(`Seleção desconhecida no placeholder: ${id}`);
      return `j("${esc(nome)}", ${pos}, ${atq}, ${def}),`;
    },
  );
  if (next === text) {
    console.warn("Nenhuma substituição em", path);
  } else {
    writeFileSync(path, next, "utf8");
    console.log("OK:", path);
  }
}

for (const [id, nome] of nameById) {
  if (id === "ind" || id === "bra" || id === "chn") console.log(id, "→", nome);
}
