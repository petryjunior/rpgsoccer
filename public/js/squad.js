import { POSITIONS } from "./constants.js";

const FIRST = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Rodrigues",
  "Ferreira",
  "Alves",
  "Pereira",
  "Lima",
  "Gomes",
  "Ribeiro",
  "Carvalho",
  "Almeida",
  "Martins",
  "Rocha",
  "Mendes",
  "Nunes",
  "Teixeira",
  "Dias",
  "Monteiro",
  "Barbosa",
  "Cardoso",
  "Correia",
  "Cavalcanti",
  "Duarte",
  "Freitas",
  "Farias",
  "Guimarães",
  "Henrique",
  "Machado",
  "Moraes",
  "Moreira",
  "Nascimento",
  "Pinto",
  "Queiroz",
  "Rezende",
  "Siqueira",
  "Tavares",
  "Vieira",
  "Xavier",
  "Araújo",
  "Batista",
  "Campos",
  "Coelho",
  "Costa",
  "Cunha",
  "Dantas",
  "Esteves",
  "Fonseca",
  "Franco",
  "Garcia",
  "Lopes",
  "Macedo",
  "Miranda",
  "Neves",
  "Pacheco",
  "Ramos",
  "Sales",
  "Vasconcelos",
];

const NICK = [
  "Juninho",
  "Pedrinho",
  "Guga",
  "Tuta",
  "Beto",
  "Dudu",
  "Léo",
  "Rafa",
  "Gui",
  "Thi",
  "Kiko",
  "Nenê",
  "Cacá",
  "Pepe",
  "Teco",
  "Buiú",
  "Cadu",
  "Digo",
  "Fê",
  "Iuri",
  "Jota",
  "Kauã",
  "Lipe",
  "Muca",
  "Nico",
  "Piu",
  "Tiquinho",
  "Vitinho",
  "Xande",
  "Yuri",
  "Zeca",
  "Bambam",
  "Ceará",
  "Dedé",
  "Foguinho",
  "Galinho",
  "Ita",
  "Jajá",
  "Keké",
  "Lulinha",
  "Marquinhos",
  "Negueba",
  "Pipoca",
  "Russo",
  "Tinga",
  "Wesley",
  "Yago",
  "Zizão",
  "Aranha",
  "Bruxo",
  "China",
  "Dentinho",
  "Elías",
  "Formiga",
  "Ganso",
  "Helinho",
  "Índio",
  "Jairzinho",
  "Klebinho",
  "Luquinhas",
  "Mengão",
  "Naldo",
  "Pitbull",
  "Rômulo",
  "Sapo",
  "Tchê",
  "Vampeta",
  "Xexéu",
];

const SOBRENOME2 = [
  "Neto",
  "Filho",
  "Júnior",
  "Costa",
  "Pereira",
  "Santos",
  "",
  "",
  "",
];

let idSeq = 0;

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function randomName() {
  const s2 = pick(SOBRENOME2);
  const base = `${pick(NICK)} ${pick(FIRST)}`;
  return s2 ? `${base} ${s2}` : base;
}

/**
 * @param {import('./constants.js').Position} position
 * @returns {{ ataque: number, defesa: number }}
 */
function sortearStatsPorPosicao(position) {
  let ataque = randomInt(35, 92);
  let defesa = randomInt(35, 92);

  if (position === POSITIONS.GOLEIRO) {
    ataque = randomInt(15, 45);
    defesa = randomInt(70, 96);
  } else if (position === POSITIONS.ZAGUEIRO) {
    ataque = randomInt(30, 70);
    defesa = randomInt(55, 92);
  } else if (position === POSITIONS.MEIA) {
    ataque = randomInt(50, 88);
    defesa = randomInt(45, 85);
  } else if (position === POSITIONS.ATACANTE) {
    ataque = randomInt(60, 94);
    defesa = randomInt(25, 75);
  }

  return { ataque, defesa };
}

/**
 * @param {import('./constants.js').Position} position
 * @returns {{ id: string, nome: string, posicao: import('./constants.js').Position, ataque: number, defesa: number }}
 */
export function criarJogador(position) {
  const id = `p${++idSeq}`;
  const { ataque, defesa } = sortearStatsPorPosicao(position);
  return {
    id,
    nome: randomName(),
    posicao: position,
    ataque,
    defesa,
  };
}

/**
 * Jogador com atributos fixos (elencos de seleção). `ataque` e `defesa` em 1–99.
 * @param {string} nome
 * @param {import('./constants.js').Position} posicao
 * @param {number} ataque
 * @param {number} defesa
 */
export function criarJogadorFixo(nome, posicao, ataque, defesa) {
  const id = `p${++idSeq}`;
  const a = Math.min(99, Math.max(1, Math.round(ataque)));
  const d = Math.min(99, Math.max(1, Math.round(defesa)));
  return {
    id,
    nome,
    posicao,
    ataque: a,
    defesa: d,
  };
}

/** Formações titulares válidas: 1 GOL + z+m+a = 10, z∈[3,5], m∈[2,5], a∈[1,4]. */
export const TITULAR_FORMACOES_VALIDAS = (() => {
  /** @type {{ z: number, m: number, a: number }[]} */
  const out = [];
  for (let z = 3; z <= 5; z++) {
    for (let m = 2; m <= 5; m++) {
      const a = 10 - z - m;
      if (a >= 1 && a <= 4) out.push({ z, m, a });
    }
  }
  return out;
})();

/**
 * Monta 11 titulares: 1 goleiro + uma formação aleatória válida (3–5 zagueiros, 2–5 meias, 1–4 atacantes).
 * @returns {ReturnType<typeof criarJogador>[]}
 */
function montarTitulares() {
  const f =
    TITULAR_FORMACOES_VALIDAS[
      Math.floor(Math.random() * TITULAR_FORMACOES_VALIDAS.length)
    ];
  const titulares = [criarJogador(POSITIONS.GOLEIRO)];
  for (let i = 0; i < f.z; i++) titulares.push(criarJogador(POSITIONS.ZAGUEIRO));
  for (let i = 0; i < f.m; i++) titulares.push(criarJogador(POSITIONS.MEIA));
  for (let i = 0; i < f.a; i++) titulares.push(criarJogador(POSITIONS.ATACANTE));
  return shuffle(titulares);
}

function countPos(arr, pos) {
  return arr.filter((j) => j.posicao === pos).length;
}

/**
 * 12 reservas: pelo menos 1 de cada posição; no máximo 2 goleiros no banco.
 */
function montarReservas() {
  const reservas = [
    criarJogador(POSITIONS.GOLEIRO),
    criarJogador(POSITIONS.ZAGUEIRO),
    criarJogador(POSITIONS.MEIA),
    criarJogador(POSITIONS.ATACANTE),
  ];
  const semGolExcesso = [POSITIONS.ZAGUEIRO, POSITIONS.MEIA, POSITIONS.ATACANTE];
  const todas = [POSITIONS.GOLEIRO, ...semGolExcesso];
  while (reservas.length < 12) {
    const gols = countPos(reservas, POSITIONS.GOLEIRO);
    const pool = gols >= 2 ? semGolExcesso : todas;
    reservas.push(criarJogador(pick(pool)));
  }
  return shuffle(reservas);
}

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * @returns {{ titulares: ReturnType<typeof criarJogador>[], reservas: ReturnType<typeof criarJogador>[] }}
 */
export function gerarTime() {
  return {
    titulares: montarTitulares(),
    reservas: montarReservas(),
  };
}

/**
 * @param {ReturnType<typeof criarJogador>[]} titulares
 * @param {ReturnType<typeof criarJogador>[]} reservas
 * @param {{ numReservas?: number }} [opcoes] padrão 12 reservas.
 */
export function validarElenco(titulares, reservas, opcoes) {
  const count = (arr, pos) => arr.filter((j) => j.posicao === pos).length;
  const t = titulares;
  const r = reservas;
  const nRes = opcoes?.numReservas ?? 12;

  if (t.length !== 11 || r.length !== nRes) {
    return {
      ok: false,
      msg: `Cada time precisa de 11 titulares e ${nRes} reservas.`,
    };
  }
  if (count(t, POSITIONS.GOLEIRO) < 1) {
    return { ok: false, msg: "Titulares: pelo menos 1 goleiro." };
  }
  if (count(t, POSITIONS.GOLEIRO) > 1) {
    return { ok: false, msg: "Titulares: só pode haver um goleiro em campo." };
  }
  const nz = count(t, POSITIONS.ZAGUEIRO);
  const nm = count(t, POSITIONS.MEIA);
  const na = count(t, POSITIONS.ATACANTE);
  if (nz < 3) {
    return { ok: false, msg: "Titulares: pelo menos 3 zagueiros." };
  }
  if (nz > 5) {
    return { ok: false, msg: "Titulares: no máximo 5 zagueiros." };
  }
  if (nm < 2) {
    return { ok: false, msg: "Titulares: pelo menos 2 meias." };
  }
  if (nm > 5) {
    return { ok: false, msg: "Titulares: no máximo 5 meias." };
  }
  if (na < 1) {
    return { ok: false, msg: "Titulares: pelo menos 1 atacante." };
  }
  if (na > 4) {
    return { ok: false, msg: "Titulares: no máximo 4 atacantes." };
  }
  for (const pos of Object.values(POSITIONS)) {
    if (count(r, pos) < 1) {
      return { ok: false, msg: `Reservas: pelo menos 1 jogador na posição ${pos}.` };
    }
  }
  if (count(r, POSITIONS.GOLEIRO) > 2) {
    return { ok: false, msg: "Reservas: no máximo 2 goleiros no banco." };
  }
  return { ok: true, msg: "" };
}

/**
 * Soma ataque+defesa para ordenar qualidade do jogador.
 * @param {{ ataque: number, defesa: number }} j
 */
function somaStats(j) {
  return j.ataque + j.defesa;
}

/**
 * Monta 11+12 a partir dos 23 convocados (melhor goleiro titular + formação válida que caiba no elenco).
 * @param {ReturnType<typeof criarJogadorFixo>[]} vinteETres
 * @returns {{ titulares: typeof vinteETres, reservas: typeof vinteETres }}
 */
export function escalaçãoInicialDeConvocados23(vinteETres) {
  if (vinteETres.length !== 23) {
    throw new Error("Convocação precisa ter exatamente 23 jogadores.");
  }
  const by = (/** @type {import('./constants.js').Position} */ pos) =>
    vinteETres.filter((j) => j.posicao === pos);
  const gol = by(POSITIONS.GOLEIRO);
  const zag = by(POSITIONS.ZAGUEIRO);
  const mei = by(POSITIONS.MEIA);
  const ata = by(POSITIONS.ATACANTE);
  const ord = (/** @type {typeof vinteETres} */ arr) =>
    [...arr].sort((a, b) => somaStats(b) - somaStats(a));

  const formacoes = [...TITULAR_FORMACOES_VALIDAS].sort(
    (a, b) => a.z - b.z || a.m - b.m || a.a - b.a,
  );
  for (const f of formacoes) {
    if (gol.length < 1 || zag.length < f.z || mei.length < f.m || ata.length < f.a) continue;
    /** @type {typeof vinteETres} */
    const tit = [];
    const used = new Set();
    const pushUnique = (/** @type {typeof vinteETres[0]} */ j) => {
      if (used.has(j.id)) return false;
      tit.push(j);
      used.add(j.id);
      return true;
    };
    pushUnique(ord(gol)[0]);
    let nz = 0;
    for (const j of ord(zag)) {
      if (nz >= f.z) break;
      if (pushUnique(j)) nz++;
    }
    if (nz < f.z) continue;
    let nm = 0;
    for (const j of ord(mei)) {
      if (nm >= f.m) break;
      if (pushUnique(j)) nm++;
    }
    if (nm < f.m) continue;
    let na = 0;
    for (const j of ord(ata)) {
      if (na >= f.a) break;
      if (pushUnique(j)) na++;
    }
    if (na < f.a || tit.length !== 11) continue;
    const res = vinteETres.filter((j) => !used.has(j.id));
    if (res.length !== 12) continue;
    const vBench = validarElenco(tit, res, { numReservas: 12 });
    if (!vBench.ok) continue;
    return { titulares: tit, reservas: res };
  }
  throw new Error(
    "Estes 23 não permitem montar 11 titulares em formação válida (1 goleiro; 3–5 zagueiros; 2–5 meias; 1–4 atacantes) e 12 reservas com pelo menos um de cada posição no banco e no máximo 2 goleiros reservas.",
  );
}

/**
 * Verifica se os 23 permitem titulares + banco conforme as regras do jogo.
 * @param {ReturnType<typeof criarJogadorFixo>[]} vinteETres
 * @returns {{ ok: true } | { ok: false, msg: string }}
 */
export function podeMontarEscalaçãoCompleta23(vinteETres) {
  try {
    escalaçãoInicialDeConvocados23(vinteETres);
    return { ok: true };
  } catch (e) {
    const msg =
      typeof e === "object" && e && "message" in e && typeof e.message === "string"
        ? e.message
        : "Convocação não permite escalação válida.";
    return { ok: false, msg };
  }
}
