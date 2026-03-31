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

/**
 * Monta 11 titulares: mínimo 1 GOL, 3 ZAG, 2 MEI, 1 ATA; demais sorteados entre linha de campo.
 * @returns {ReturnType<typeof criarJogador>[]}
 */
function montarTitulares() {
  const titulares = [];
  titulares.push(criarJogador(POSITIONS.GOLEIRO));
  for (let i = 0; i < 3; i++) titulares.push(criarJogador(POSITIONS.ZAGUEIRO));
  for (let i = 0; i < 2; i++) titulares.push(criarJogador(POSITIONS.MEIA));
  titulares.push(criarJogador(POSITIONS.ATACANTE));

  const linha = [POSITIONS.ZAGUEIRO, POSITIONS.MEIA, POSITIONS.ATACANTE];
  while (titulares.length < 11) {
    titulares.push(criarJogador(pick(linha)));
  }
  return shuffle(titulares);
}

function countPos(arr, pos) {
  return arr.filter((j) => j.posicao === pos).length;
}

/**
 * 11 reservas: pelo menos 1 de cada posição; no máximo 2 goleiros no banco.
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
  while (reservas.length < 11) {
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
 */
export function validarElenco(titulares, reservas) {
  const count = (arr, pos) => arr.filter((j) => j.posicao === pos).length;
  const t = titulares;
  const r = reservas;

  if (t.length !== 11 || r.length !== 11) {
    return { ok: false, msg: "Cada time precisa de 11 titulares e 11 reservas." };
  }
  if (count(t, POSITIONS.GOLEIRO) < 1) {
    return { ok: false, msg: "Titulares: pelo menos 1 goleiro." };
  }
  if (count(t, POSITIONS.ZAGUEIRO) < 3) {
    return { ok: false, msg: "Titulares: pelo menos 3 zagueiros." };
  }
  if (count(t, POSITIONS.MEIA) < 2) {
    return { ok: false, msg: "Titulares: pelo menos 2 meias." };
  }
  if (count(t, POSITIONS.ATACANTE) < 1) {
    return { ok: false, msg: "Titulares: pelo menos 1 atacante." };
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
