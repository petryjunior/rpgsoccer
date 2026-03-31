import { POSITIONS as P } from "./constants.js";
import { criarJogadorFixo } from "./squad.js";

/**
 * @param {string} nome
 * @param {import('./constants.js').Position} posicao
 * @param {number} ataque
 * @param {number} defesa
 */
function j(nome, posicao, ataque, defesa) {
  return { nome, posicao, ataque, defesa };
}

/**
 * @typedef {{ nome: string, posicao: import('./constants.js').Position, ataque: number, defesa: number }} JogadorDef
 */

/**
 * @typedef {{ id: string, nome: string, sigla: string, iso: string, titulares: JogadorDef[], reservas: JogadorDef[] }} SelecaoDef
 */

/** Bandeira (PNG). `iso` em minúsculas, ex.: br, ar, gb. */
export function urlBandeira(iso, largura = 120) {
  return `https://flagcdn.com/w${largura}/${iso}.png`;
}

/** @type {SelecaoDef[]} */
export const SELECOES = [
  {
    id: "bra",
    nome: "Brasil",
    sigla: "BRA",
    iso: "br",
    titulares: [
      j("Rafael Mendes", P.GOLEIRO, 27, 89),
      j("Bruno Costa", P.ZAGUEIRO, 51, 84),
      j("Felipe Rocha", P.ZAGUEIRO, 49, 86),
      j("Gustavo Almeida", P.ZAGUEIRO, 47, 83),
      j("Iago Ferreira", P.ZAGUEIRO, 53, 82),
      j("Lucas Henrique", P.MEIA, 77, 69),
      j("Mateus Duarte", P.MEIA, 73, 71),
      j("Nicolas Silva", P.MEIA, 79, 65),
      j("Otávio Santos", P.MEIA, 75, 73),
      j("Pedro Augusto", P.ATACANTE, 89, 47),
      j("Renan Cardoso", P.ATACANTE, 87, 45),
    ],
    reservas: [
      j("Tiago Nunes", P.GOLEIRO, 25, 84),
      j("Vitor Oliveira", P.GOLEIRO, 23, 82),
      j("Caio Mendes", P.ZAGUEIRO, 46, 79),
      j("Danilo Rocha", P.ZAGUEIRO, 44, 80),
      j("Elton Silva", P.ZAGUEIRO, 48, 77),
      j("Fabio Costa", P.MEIA, 70, 66),
      j("Gabriel Lima", P.MEIA, 68, 68),
      j("Hugo Martins", P.MEIA, 72, 63),
      j("Igor Alves", P.ATACANTE, 82, 42),
      j("João Pedro Souza", P.ATACANTE, 80, 44),
      j("Kleber Nascimento", P.ATACANTE, 84, 41),
    ],
  },
  {
    id: "arg",
    nome: "Argentina",
    sigla: "ARG",
    iso: "ar",
    titulares: [
      j("Matías Romero", P.GOLEIRO, 30, 87),
      j("Nicolás Pérez", P.ZAGUEIRO, 50, 85),
      j("Sebastián Gómez", P.ZAGUEIRO, 48, 87),
      j("Diego Morales", P.ZAGUEIRO, 46, 84),
      j("Lucas Fernández", P.ZAGUEIRO, 52, 83),
      j("Emiliano Rodríguez", P.MEIA, 78, 68),
      j("Franco Martínez", P.MEIA, 76, 70),
      j("Javier Sánchez", P.MEIA, 80, 64),
      j("Martín Acosta", P.MEIA, 74, 72),
      j("Christian López", P.ATACANTE, 92, 46),
      j("Maximiliano Díaz", P.ATACANTE, 90, 43),
    ],
    reservas: [
      j("Agustín Ruiz", P.GOLEIRO, 26, 83),
      j("Bruno Torres", P.GOLEIRO, 24, 81),
      j("Carlos Vega", P.ZAGUEIRO, 45, 80),
      j("Daniel Herrera", P.ZAGUEIRO, 43, 78),
      j("Esteban Castro", P.ZAGUEIRO, 47, 76),
      j("Facundo Ríos", P.MEIA, 71, 65),
      j("Gonzalo Mena", P.MEIA, 69, 67),
      j("Hernán Ibáñez", P.MEIA, 73, 62),
      j("Ignacio Flores", P.ATACANTE, 85, 41),
      j("Juan Cruz", P.ATACANTE, 83, 43),
      j("Leandro Paz", P.ATACANTE, 86, 40),
    ],
  },
  {
    id: "ale",
    nome: "Alemanha",
    sigla: "GER",
    iso: "de",
    titulares: [
      j("Tim Berger", P.GOLEIRO, 24, 91),
      j("Jonas Schneider", P.ZAGUEIRO, 49, 88),
      j("Lukas Weber", P.ZAGUEIRO, 47, 89),
      j("Felix Hoffmann", P.ZAGUEIRO, 45, 90),
      j("Maximilian Koch", P.ZAGUEIRO, 51, 87),
      j("Leon Fischer", P.MEIA, 74, 74),
      j("Niklas Werner", P.MEIA, 72, 76),
      j("Paul Richter", P.MEIA, 76, 70),
      j("Simon Braun", P.MEIA, 70, 78),
      j("Felix Hartmann", P.ATACANTE, 86, 48),
      j("Jonas Zimmermann", P.ATACANTE, 84, 46),
    ],
    reservas: [
      j("Moritz Lang", P.GOLEIRO, 22, 86),
      j("Noah Krüger", P.GOLEIRO, 21, 84),
      j("Tom Schulz", P.ZAGUEIRO, 44, 84),
      j("Ben Vogel", P.ZAGUEIRO, 42, 85),
      j("Jan Neumann", P.ZAGUEIRO, 46, 83),
      j("Finn Otto", P.MEIA, 68, 69),
      j("Elias Hahn", P.MEIA, 66, 71),
      j("David Wolf", P.MEIA, 70, 66),
      j("Luis Brandt", P.ATACANTE, 81, 44),
      j("Marco Peters", P.ATACANTE, 79, 45),
      j("Oliver Stein", P.ATACANTE, 82, 42),
    ],
  },
  {
    id: "fra",
    nome: "França",
    sigla: "FRA",
    iso: "fr",
    titulares: [
      j("Hugo Martin", P.GOLEIRO, 28, 88),
      j("Antoine Durand", P.ZAGUEIRO, 52, 84),
      j("Lucas Bernard", P.ZAGUEIRO, 50, 85),
      j("Pierre Leroy", P.ZAGUEIRO, 48, 83),
      j("Thomas Moreau", P.ZAGUEIRO, 54, 82),
      j("Jules Fontaine", P.MEIA, 79, 71),
      j("Nicolas Garnier", P.MEIA, 77, 73),
      j("Olivier Rousseau", P.MEIA, 81, 67),
      j("Rémi Vincent", P.MEIA, 75, 75),
      j("Étienne Blanc", P.ATACANTE, 88, 48),
      j("François Mercier", P.ATACANTE, 86, 46),
    ],
    reservas: [
      j("Alexandre Petit", P.GOLEIRO, 25, 83),
      j("Baptiste Rolland", P.GOLEIRO, 23, 81),
      j("Charles Fabre", P.ZAGUEIRO, 47, 79),
      j("Denis Caron", P.ZAGUEIRO, 45, 80),
      j("Émile Dupont", P.ZAGUEIRO, 49, 78),
      j("Gabriel Masson", P.MEIA, 72, 68),
      j("Henri Colin", P.MEIA, 70, 70),
      j("Julien Girard", P.MEIA, 74, 65),
      j("Louis Bonnet", P.ATACANTE, 83, 43),
      j("Mathieu Roche", P.ATACANTE, 81, 44),
      j("Quentin Perrin", P.ATACANTE, 84, 42),
    ],
  },
  {
    id: "esp",
    nome: "Espanha",
    sigla: "ESP",
    iso: "es",
    titulares: [
      j("Iker Ramos", P.GOLEIRO, 29, 88),
      j("Carlos Navarro", P.ZAGUEIRO, 50, 85),
      j("Dani Ortega", P.ZAGUEIRO, 48, 86),
      j("Javier Molina", P.ZAGUEIRO, 46, 84),
      j("Miguel Herrera", P.ZAGUEIRO, 52, 83),
      j("Álvaro Jiménez", P.MEIA, 80, 70),
      j("Pablo Iglesias", P.MEIA, 78, 72),
      j("Raúl Castro", P.MEIA, 82, 66),
      j("Sergio Vázquez", P.MEIA, 76, 74),
      j("Fernando Cortés", P.ATACANTE, 87, 47),
      j("Jorge Delgado", P.ATACANTE, 85, 45),
    ],
    reservas: [
      j("Ángel Prieto", P.GOLEIRO, 26, 83),
      j("Borja Campos", P.GOLEIRO, 24, 81),
      j("César Rubio", P.ZAGUEIRO, 45, 80),
      j("Diego Fuentes", P.ZAGUEIRO, 43, 81),
      j("Enrique Soto", P.ZAGUEIRO, 47, 79),
      j("Francisco León", P.MEIA, 73, 67),
      j("Gabriel Moya", P.MEIA, 71, 69),
      j("Héctor Peña", P.MEIA, 75, 64),
      j("Iván Torres", P.ATACANTE, 82, 42),
      j("Jaime Núñez", P.ATACANTE, 80, 43),
      j("Luis Bravo", P.ATACANTE, 84, 41),
    ],
  },
  {
    id: "ing",
    nome: "Inglaterra",
    sigla: "ENG",
    iso: "gb",
    titulares: [
      j("James Walker", P.GOLEIRO, 27, 89),
      j("Harry Mitchell", P.ZAGUEIRO, 51, 84),
      j("Oliver Thompson", P.ZAGUEIRO, 49, 85),
      j("Sam Cooper", P.ZAGUEIRO, 47, 83),
      j("Tom Hughes", P.ZAGUEIRO, 53, 82),
      j("Ben Richardson", P.MEIA, 76, 72),
      j("Charlie Morgan", P.MEIA, 74, 74),
      j("Daniel Parker", P.MEIA, 78, 68),
      j("Jack Foster", P.MEIA, 72, 76),
      j("Luke Edwards", P.ATACANTE, 88, 47),
      j("Ryan Williams", P.ATACANTE, 86, 45),
    ],
    reservas: [
      j("Adam Clarke", P.GOLEIRO, 24, 84),
      j("Callum Brooks", P.GOLEIRO, 22, 82),
      j("Ethan Powell", P.ZAGUEIRO, 46, 79),
      j("George Turner", P.ZAGUEIRO, 44, 80),
      j("Henry Ward", P.ZAGUEIRO, 48, 78),
      j("Isaac Bell", P.MEIA, 70, 69),
      j("Joe Murphy", P.MEIA, 68, 71),
      j("Max Kelly", P.MEIA, 72, 66),
      j("Nathan Price", P.ATACANTE, 83, 42),
      j("Oscar Reed", P.ATACANTE, 81, 43),
      j("Will Scott", P.ATACANTE, 85, 41),
    ],
  },
  {
    id: "ita",
    nome: "Itália",
    sigla: "ITA",
    iso: "it",
    titulares: [
      j("Marco Ferretti", P.GOLEIRO, 26, 90),
      j("Alessandro Ricci", P.ZAGUEIRO, 48, 88),
      j("Davide Romano", P.ZAGUEIRO, 46, 89),
      j("Giuseppe Martini", P.ZAGUEIRO, 44, 90),
      j("Lorenzo Conti", P.ZAGUEIRO, 50, 87),
      j("Andrea Lombardi", P.MEIA, 75, 73),
      j("Francesco Galli", P.MEIA, 73, 75),
      j("Giovanni Esposito", P.MEIA, 77, 69),
      j("Matteo Costa", P.MEIA, 71, 77),
      j("Paolo Rossetti", P.ATACANTE, 85, 48),
      j("Simone Bianchi", P.ATACANTE, 83, 46),
    ],
    reservas: [
      j("Alberto Fontana", P.GOLEIRO, 23, 85),
      j("Claudio Marchetti", P.GOLEIRO, 21, 83),
      j("Domenico Sala", P.ZAGUEIRO, 43, 84),
      j("Enrico Vitale", P.ZAGUEIRO, 41, 85),
      j("Fabio Grimaldi", P.ZAGUEIRO, 45, 83),
      j("Giacomo Leone", P.MEIA, 69, 70),
      j("Luca Piras", P.MEIA, 67, 72),
      j("Roberto Serra", P.MEIA, 71, 67),
      j("Stefano Mura", P.ATACANTE, 80, 44),
      j("Umberto De Luca", P.ATACANTE, 78, 45),
      j("Vincenzo Caruso", P.ATACANTE, 82, 43),
    ],
  },
  {
    id: "por",
    nome: "Portugal",
    sigla: "POR",
    iso: "pt",
    titulares: [
      j("Ricardo Matos", P.GOLEIRO, 28, 88),
      j("Bruno Carvalho", P.ZAGUEIRO, 50, 84),
      j("Diogo Ferreira", P.ZAGUEIRO, 48, 85),
      j("Gonçalo Pires", P.ZAGUEIRO, 46, 83),
      j("João Monteiro", P.ZAGUEIRO, 52, 82),
      j("Luís Correia", P.MEIA, 78, 70),
      j("Miguel Santos", P.MEIA, 76, 72),
      j("Pedro Nunes", P.MEIA, 80, 66),
      j("Tiago Ribeiro", P.MEIA, 74, 74),
      j("Carlos Afonso", P.ATACANTE, 89, 46),
      j("Francisco Teixeira", P.ATACANTE, 87, 44),
    ],
    reservas: [
      j("André Lopes", P.GOLEIRO, 25, 83),
      j("Filipe Moura", P.GOLEIRO, 23, 81),
      j("Hugo Seabra", P.ZAGUEIRO, 45, 79),
      j("Ivo Machado", P.ZAGUEIRO, 43, 80),
      j("Jorge Coelho", P.ZAGUEIRO, 47, 78),
      j("Manuel Duarte", P.MEIA, 71, 67),
      j("Nuno Barros", P.MEIA, 69, 69),
      j("Rui Fidalgo", P.MEIA, 73, 64),
      j("Sérgio Pinto", P.ATACANTE, 84, 41),
      j("Tomás Lourenço", P.ATACANTE, 82, 42),
      j("Vasco Henriques", P.ATACANTE, 86, 40),
    ],
  },
];

/**
 * @param {string} id
 * @returns {SelecaoDef | undefined}
 */
export function selecaoPorId(id) {
  return SELECOES.find((s) => s.id === id);
}

/**
 * Monta elenco com IDs novos; ataque/defesa vêm dos dados da seleção (fixos).
 * @param {string} id
 */
export function elencoDaSelecao(id) {
  const s = selecaoPorId(id);
  if (!s) {
    throw new Error(`Seleção desconhecida: ${id}`);
  }
  const titulares = s.titulares.map((r) =>
    criarJogadorFixo(r.nome, r.posicao, r.ataque, r.defesa),
  );
  const reservas = s.reservas.map((r) =>
    criarJogadorFixo(r.nome, r.posicao, r.ataque, r.defesa),
  );
  return { titulares, reservas };
}
