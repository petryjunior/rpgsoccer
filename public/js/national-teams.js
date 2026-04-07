import { POSITIONS as P } from "./constants.js";
import { criarJogadorFixo } from "./squad.js";
import { criarRng } from "./world-cup.js";
import { SELECOES_EXPAND_RAW } from "./national-teams-expand.js";
import {
  gerarConvocacaoExtraDefs,
  forcaMediaTitularesDefs,
  hashStringToSeedConvExtra,
} from "./national-teams-convocacao-extra.js";

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
 * @typedef {{ id: string, nome: string, sigla: string, iso: string, titulares: JogadorDef[], reservas: JogadorDef[], convocacaoExtra?: JogadorDef[] }} SelecaoDef
 */

/** Larguras que o flagcdn.com realmente serve (outros valores → 404). */
const FLAGCDN_LARGURAS = [20, 40, 80, 160, 320, 640, 1280, 2560];

function larguraBandeiraFlagcdn(largura) {
  const n = Number(largura);
  if (!Number.isFinite(n) || n < 10) return 80;
  let best = FLAGCDN_LARGURAS[0];
  let bestD = Math.abs(n - best);
  for (const w of FLAGCDN_LARGURAS) {
    const d = Math.abs(n - w);
    if (d < bestD || (d === bestD && w < best)) {
      best = w;
      bestD = d;
    }
  }
  return best;
}

/** Bandeira (PNG). `iso` em minúsculas, ex.: br, ar, gb. `largura` é ajustada ao conjunto suportado pelo CDN. */
export function urlBandeira(iso, largura = 80) {
  const w = larguraBandeiraFlagcdn(largura);
  const code = String(iso ?? "xx").toLowerCase();
  return `https://flagcdn.com/w${w}/${code}.png`;
}

/** @type {SelecaoDef[]} */
const SELECOES_CORE_BASE = [
  {
    id: "bra",
    nome: "Brasil",
    sigla: "BRA",
    iso: "br",
    titulares: [
      j("Rafael Mendes", P.GOLEIRO, 26, 81),
      j("Felipe Rocha", P.ZAGUEIRO, 40, 91),
      j("Iago Ferreira", P.ZAGUEIRO, 65, 85),
      j("Otávio Santos", P.ZAGUEIRO, 65, 84),
      j("Gustavo Almeida", P.ZAGUEIRO, 65, 83),
      j("Bruno Costa", P.ZAGUEIRO, 51, 81),
      j("Renan Cardoso", P.MEIA, 83, 79),
      j("Nicolas Silva", P.MEIA, 83, 65),
      j("Lucas Henrique", P.MEIA, 78, 79),
      j("Mateus Duarte", P.MEIA, 58, 77),
      j("Pedro Augusto", P.ATACANTE, 84, 53)
    ],
    reservas: [
      j("Tiago Nunes", P.GOLEIRO, 31, 84),
      j("Vitor Oliveira", P.GOLEIRO, 20, 70),
      j("Caio Mendes", P.ZAGUEIRO, 51, 82),
      j("Danilo Rocha", P.ZAGUEIRO, 37, 86),
      j("Elton Silva", P.ZAGUEIRO, 62, 73),
      j("Fabio Costa", P.MEIA, 72, 76),
      j("Gabriel Lima", P.MEIA, 62, 79),
      j("Hugo Martins", P.MEIA, 79, 68),
      j("Igor Alves", P.ATACANTE, 80, 45),
      j("João Pedro Souza", P.ATACANTE, 73, 62),
      j("Kleber Nascimento", P.ATACANTE, 86, 37),
      j("Guilherme Siqueira", P.MEIA, 63, 62)
    ],
  },
  {
    id: "arg",
    nome: "Argentina",
    sigla: "ARG",
    iso: "ar",
    titulares: [
      j("Matías Romero", P.GOLEIRO, 28, 85),
      j("Sebastián Gómez", P.ZAGUEIRO, 42, 95),
      j("Franco Martínez", P.ZAGUEIRO, 87, 87),
      j("Martín Acosta", P.ZAGUEIRO, 50, 85),
      j("Javier Sánchez", P.ZAGUEIRO, 68, 85),
      j("Maximiliano Díaz", P.MEIA, 81, 56),
      j("Darío Morales", P.MEIA, 68, 83),
      j("Nicolás Pérez", P.MEIA, 46, 81),
      j("Cristian Ledesma", P.ATACANTE, 95, 42),
      j("Lucas Fernández", P.ATACANTE, 82, 68),
      j("Emiliano Rodríguez", P.ATACANTE, 82, 68)
    ],
    reservas: [
      j("Agustín Ruiz", P.GOLEIRO, 33, 89),
      j("Bruno Torres", P.GOLEIRO, 21, 73),
      j("Carlos Vega", P.ZAGUEIRO, 52, 91),
      j("Daniel Herrera", P.ZAGUEIRO, 39, 83),
      j("Esteban Castro", P.ZAGUEIRO, 65, 77),
      j("Facundo Ríos", P.MEIA, 78, 77),
      j("Gonzalo Mena", P.MEIA, 74, 83),
      j("Hernán Ibáñez", P.MEIA, 83, 67),
      j("Ignacio Flores", P.ATACANTE, 86, 48),
      j("Juan Cruz", P.ATACANTE, 77, 65),
      j("Leandro Paz", P.ATACANTE, 91, 39),
      j("Mateo Sánchez", P.MEIA, 65, 65)
    ],
  },
  {
    id: "ale",
    nome: "Alemanha",
    sigla: "GER",
    iso: "de",
    titulares: [
      j("Tim Berger", P.GOLEIRO, 26, 79),
      j("Felix Hoffmann", P.ZAGUEIRO, 40, 90),
      j("Niklas Werner", P.ZAGUEIRO, 65, 82),
      j("Simon Braun", P.ZAGUEIRO, 69, 82),
      j("Jonas Schneider", P.ZAGUEIRO, 64, 79),
      j("Jonas Zimmermann", P.MEIA, 82, 75),
      j("Paul Richter", P.MEIA, 81, 64),
      j("Leon Fischer", P.MEIA, 74, 76),
      j("Maximilian Koch", P.MEIA, 55, 78),
      j("Lukas Weber", P.MEIA, 45, 77),
      j("Felix Hartmann", P.ATACANTE, 83, 53)
    ],
    reservas: [
      j("Moritz Lang", P.GOLEIRO, 30, 83),
      j("Noah Krüger", P.GOLEIRO, 20, 69),
      j("Tom Schulz", P.ZAGUEIRO, 50, 80),
      j("Ben Vogel", P.ZAGUEIRO, 37, 86),
      j("Jan Neumann", P.ZAGUEIRO, 62, 73),
      j("Finn Otto", P.MEIA, 70, 76),
      j("Elias Hahn", P.MEIA, 63, 79),
      j("David Wolf", P.MEIA, 79, 72),
      j("Luis Brandt", P.ATACANTE, 81, 53),
      j("Marco Peters", P.ATACANTE, 73, 62),
      j("Oliver Stein", P.ATACANTE, 86, 37),
      j("Serge Kaiser", P.MEIA, 61, 61)
    ],
  },
  {
    id: "fra",
    nome: "França",
    sigla: "FRA",
    iso: "fr",
    titulares: [
      j("Hugo Martin", P.GOLEIRO, 28, 84),
      j("Lucas Bernard", P.ZAGUEIRO, 42, 95),
      j("Thomas Moreau", P.ZAGUEIRO, 69, 83),
      j("Pierre Leroy", P.ZAGUEIRO, 68, 83),
      j("Antoine Durand", P.ZAGUEIRO, 50, 80),
      j("Jules Fontaine", P.MEIA, 80, 62),
      j("Rémi Vincent", P.MEIA, 57, 80),
      j("Olivier Rousseau", P.ATACANTE, 95, 69),
      j("Étienne Blanc", P.ATACANTE, 93, 42),
      j("Nicolas Garnier", P.ATACANTE, 87, 72),
      j("François Mercier", P.ATACANTE, 85, 54)
    ],
    reservas: [
      j("Alexandre Petit", P.GOLEIRO, 32, 88),
      j("Baptiste Rolland", P.GOLEIRO, 21, 73),
      j("Charles Fabre", P.ZAGUEIRO, 52, 84),
      j("Denis Caron", P.ZAGUEIRO, 39, 90),
      j("Émile Dupont", P.ZAGUEIRO, 65, 76),
      j("Gabriel Masson", P.MEIA, 76, 80),
      j("Henri Colin", P.MEIA, 71, 83),
      j("Julien Girard", P.MEIA, 83, 77),
      j("Louis Bonnet", P.ATACANTE, 86, 52),
      j("Mathieu Roche", P.ATACANTE, 76, 65),
      j("Quentin Perrin", P.ATACANTE, 90, 39),
      j("David Mercier", P.MEIA, 65, 65)
    ],
  },
  {
    id: "esp",
    nome: "Espanha",
    sigla: "ESP",
    iso: "es",
    titulares: [
      j("Iván Salcedo", P.GOLEIRO, 27, 83),
      j("Dani Osorio", P.ZAGUEIRO, 48, 93),
      j("Miguel Herrera", P.ZAGUEIRO, 68, 86),
      j("Pablo Ortega", P.ZAGUEIRO, 67, 86),
      j("Carlos Navarro", P.ZAGUEIRO, 54, 85),
      j("Sergio Vázquez", P.ZAGUEIRO, 60, 85),
      j("Fernando Cortés", P.MEIA, 80, 41),
      j("Álvaro Jiménez", P.MEIA, 74, 78),
      j("Javier Molina", P.MEIA, 41, 80),
      j("Raúl Vidal", P.ATACANTE, 93, 68),
      j("Jorge Delgado", P.ATACANTE, 86, 67)
    ],
    reservas: [
      j("Ángel Prieto", P.GOLEIRO, 32, 87),
      j("Borja Campos", P.GOLEIRO, 21, 71),
      j("César Rubio", P.ZAGUEIRO, 51, 83),
      j("Diego Fuentes", P.ZAGUEIRO, 39, 89),
      j("Enrique Soto", P.ZAGUEIRO, 64, 76),
      j("Francisco León", P.MEIA, 77, 79),
      j("Gabriel Moya", P.MEIA, 71, 82),
      j("Héctor Peña", P.MEIA, 82, 74),
      j("Iván Torres", P.ATACANTE, 83, 51),
      j("Jaime Núñez", P.ATACANTE, 76, 64),
      j("Luis Bravo", P.ATACANTE, 89, 39),
      j("Juan Sánchez", P.MEIA, 64, 64)
    ],
  },
  {
    id: "ing",
    nome: "Inglaterra",
    sigla: "ENG",
    iso: "gb-eng",
    titulares: [
      j("James Walker", P.GOLEIRO, 27, 81),
      j("Oliver Thompson", P.ZAGUEIRO, 40, 92),
      j("Jack Foster", P.ZAGUEIRO, 77, 84),
      j("Hugh Mitchell", P.ZAGUEIRO, 65, 84),
      j("Charlie Morgan", P.ZAGUEIRO, 65, 83),
      j("Sam Cooper", P.ZAGUEIRO, 54, 83),
      j("Ryan Williams", P.MEIA, 78, 40),
      j("Ben Richardson", P.MEIA, 67, 80),
      j("Tom Hughes", P.MEIA, 62, 78),
      j("Luke Edwards", P.ATACANTE, 92, 67),
      j("Daniel Parker", P.ATACANTE, 84, 65)
    ],
    reservas: [
      j("Adam Clarke", P.GOLEIRO, 31, 85),
      j("Callum Brooks", P.GOLEIRO, 20, 70),
      j("Ethan Powell", P.ZAGUEIRO, 51, 82),
      j("George Turner", P.ZAGUEIRO, 38, 88),
      j("Henry Ward", P.ZAGUEIRO, 63, 75),
      j("Isaac Bell", P.MEIA, 76, 77),
      j("Joe Murphy", P.MEIA, 72, 80),
      j("Max Kelly", P.MEIA, 80, 73),
      j("Nathan Price", P.ATACANTE, 82, 51),
      j("Oscar Reed", P.ATACANTE, 75, 63),
      j("Will Scott", P.ATACANTE, 88, 38),
      j("Declan Green", P.MEIA, 62, 62)
    ],
  },
  {
    id: "ita",
    nome: "Itália",
    sigla: "ITA",
    iso: "it",
    titulares: [
      j("Marco Ferretti", P.GOLEIRO, 26, 79),
      j("Giuseppe Martini", P.ZAGUEIRO, 40, 89),
      j("Matteo Costa", P.ZAGUEIRO, 76, 81),
      j("Davide Romano", P.ZAGUEIRO, 64, 81),
      j("Francesco Galli", P.ZAGUEIRO, 61, 80),
      j("Alessandro Ricci", P.ZAGUEIRO, 53, 80),
      j("Simone Bianchi", P.MEIA, 77, 40),
      j("Andrea Lombardi", P.MEIA, 65, 78),
      j("Lorenzo Conti", P.MEIA, 58, 77),
      j("Paolo Rossetti", P.ATACANTE, 89, 65),
      j("Giovanni Esposito", P.ATACANTE, 81, 64)
    ],
    reservas: [
      j("Alberto Fontana", P.GOLEIRO, 30, 82),
      j("Claudio Marchetti", P.GOLEIRO, 19, 68),
      j("Domenico Sala", P.ZAGUEIRO, 49, 80),
      j("Enrico Vitale", P.ZAGUEIRO, 38, 85),
      j("Fabio Grimaldi", P.ZAGUEIRO, 61, 73),
      j("Giacomo Leone", P.MEIA, 71, 76),
      j("Luca Piras", P.MEIA, 64, 78),
      j("Roberto Serra", P.MEIA, 78, 72),
      j("Stefano Mura", P.ATACANTE, 80, 49),
      j("Umberto De Luca", P.ATACANTE, 73, 61),
      j("Vincenzo Caruso", P.ATACANTE, 85, 38),
      j("Davide Moretti", P.MEIA, 61, 61)
    ],
  },
  {
    id: "por",
    nome: "Portugal",
    sigla: "POR",
    iso: "pt",
    titulares: [
      j("Ricardo Matos", P.GOLEIRO, 26, 82),
      j("Dinis Ferreira", P.ZAGUEIRO, 41, 93),
      j("Tiago Ribeiro", P.ZAGUEIRO, 66, 85),
      j("Gonçalo Pires", P.ZAGUEIRO, 55, 83),
      j("Baltazar Carvalho", P.ZAGUEIRO, 46, 81),
      j("Luís Correia", P.ZAGUEIRO, 67, 81),
      j("Pedro Nunes", P.MEIA, 79, 60),
      j("João Monteiro", P.MEIA, 64, 79),
      j("Carlos Afonso", P.ATACANTE, 93, 41),
      j("Francisco Teixeira", P.ATACANTE, 86, 67),
      j("Miguel Santos", P.ATACANTE, 85, 66)
    ],
    reservas: [
      j("André Lopes", P.GOLEIRO, 32, 86),
      j("Filipe Moura", P.GOLEIRO, 20, 71),
      j("Hugo Seabra", P.ZAGUEIRO, 50, 83),
      j("Ivo Machado", P.ZAGUEIRO, 39, 89),
      j("Jorge Coelho", P.ZAGUEIRO, 64, 75),
      j("Manuel Duarte", P.MEIA, 74, 78),
      j("Nuno Barros", P.MEIA, 65, 82),
      j("Rui Fidalgo", P.MEIA, 82, 74),
      j("Sérgio Pinto", P.ATACANTE, 83, 50),
      j("Tomás Lourenço", P.ATACANTE, 75, 64),
      j("Vasco Henriques", P.ATACANTE, 89, 39),
      j("Rúben Leal", P.MEIA, 63, 63)
    ],
  },
  {
    id: "uru",
    nome: "Uruguai",
    sigla: "URU",
    iso: "uy",
    titulares: [
      j("Rodrigo Benítez", P.GOLEIRO, 26, 77),
      j("Nahuel Ferreira", P.ZAGUEIRO, 39, 87),
      j("Bruno Duarte", P.ZAGUEIRO, 74, 81),
      j("Martín Delgado", P.ZAGUEIRO, 63, 81),
      j("Nicolás Lemos", P.ZAGUEIRO, 62, 80),
      j("Facundo Prado", P.ZAGUEIRO, 52, 79),
      j("Leandro Costa", P.MEIA, 75, 39),
      j("Rodrigo Bianchi", P.MEIA, 64, 78),
      j("Gonzalo Varela", P.MEIA, 61, 75),
      j("Santiago Peralta", P.ATACANTE, 87, 64),
      j("Gastón Marelli", P.ATACANTE, 81, 63)
    ],
    reservas: [
      j("Esteban Salazar", P.GOLEIRO, 29, 81),
      j("Facundo López", P.GOLEIRO, 19, 68),
      j("Javier Correa", P.ZAGUEIRO, 46, 84),
      j("Ramón Fuentes", P.ZAGUEIRO, 61, 75),
      j("Matías Benítez", P.ZAGUEIRO, 37, 71),
      j("Manuel Prieto", P.MEIA, 70, 75),
      j("Lucas Mendoza", P.MEIA, 67, 77),
      j("Federico Casas", P.MEIA, 77, 68),
      j("Eduardo Rivas", P.ATACANTE, 84, 48),
      j("Maximiliano Sosa", P.ATACANTE, 78, 61),
      j("Facundo Miranda", P.ATACANTE, 71, 37),
      j("Maximiliano Ramírez", P.MEIA, 60, 60)
    ],
  },
  {
    id: "col",
    nome: "Colômbia",
    sigla: "COL",
    iso: "co",
    titulares: [
      j("Camilo Restrepo", P.GOLEIRO, 25, 78),
      j("Dario Sánchez", P.ZAGUEIRO, 38, 88),
      j("Wilmar Tesillo", P.ZAGUEIRO, 53, 82),
      j("Jefferson López", P.ZAGUEIRO, 63, 81),
      j("Juan Córdoba", P.ZAGUEIRO, 64, 76),
      j("Yeferson Murillo", P.ZAGUEIRO, 48, 75),
      j("Jaime Roldán", P.MEIA, 75, 64),
      j("Luis Parra", P.MEIA, 72, 66),
      j("Stefan Cárdenas", P.MEIA, 60, 75),
      j("Rafael Fuentes", P.ATACANTE, 88, 38),
      j("Duván Mejía", P.ATACANTE, 81, 63)
    ],
    reservas: [
      j("Óscar Vargas", P.GOLEIRO, 29, 82),
      j("Álvaro Montoya", P.GOLEIRO, 19, 68),
      j("Carlos Correa", P.ZAGUEIRO, 49, 84),
      j("Jhon Villada", P.ZAGUEIRO, 60, 79),
      j("Darío Muñoz", P.ZAGUEIRO, 36, 71),
      j("Mateo Urrea", P.MEIA, 77, 63),
      j("Wilson Barrios", P.MEIA, 66, 77),
      j("Gustavo Pineda", P.MEIA, 69, 60),
      j("Jorge Andrade", P.ATACANTE, 81, 49),
      j("Rafael Borja", P.ATACANTE, 71, 60),
      j("Julián Donoso", P.ATACANTE, 84, 36),
      j("Yeferson Mejía", P.MEIA, 60, 63)
    ],
  },
  {
    id: "mex",
    nome: "México",
    sigla: "MEX",
    iso: "mx",
    titulares: [
      j("Guillermo Ortega", P.GOLEIRO, 26, 77),
      j("Johan Valdés", P.ZAGUEIRO, 38, 87),
      j("Jesús Galván", P.ZAGUEIRO, 62, 81),
      j("Óscar Parra", P.ZAGUEIRO, 61, 80),
      j("Edson Almaraz", P.MEIA, 74, 71),
      j("Héctor Huerta", P.MEIA, 73, 58),
      j("César Montoya", P.MEIA, 49, 73),
      j("Raúl Jaimes", P.ATACANTE, 87, 38),
      j("Luis Cárdenas", P.ATACANTE, 81, 53),
      j("Irving Lozada", P.ATACANTE, 80, 61),
      j("Néstor Arriaga", P.ATACANTE, 79, 62)
    ],
    reservas: [
      j("Alfredo Tamayo", P.GOLEIRO, 30, 81),
      j("Rodolfo Casas", P.GOLEIRO, 19, 66),
      j("Gerardo Arriola", P.ZAGUEIRO, 46, 75),
      j("Kevin Almonte", P.ZAGUEIRO, 35, 83),
      j("Jorge Salinas", P.ZAGUEIRO, 58, 69),
      j("Carlos Rojas", P.MEIA, 69, 72),
      j("Erick Guzmán", P.MEIA, 63, 75),
      j("Uriel Acosta", P.MEIA, 75, 63),
      j("Enrique Martín", P.ATACANTE, 75, 43),
      j("Santiago Gil", P.ATACANTE, 83, 35),
      j("Jesús Cordero", P.ATACANTE, 69, 58),
      j("Bruno Domínguez", P.MEIA, 58, 58)
    ],
  },
  {
    id: "ecu",
    nome: "Equador",
    sigla: "ECU",
    iso: "ec",
    titulares: [
      j("Hernán Gálvez", P.GOLEIRO, 26, 78),
      j("Félix Tobar", P.ZAGUEIRO, 37, 86),
      j("Angelo Páez", P.ZAGUEIRO, 51, 80),
      j("Carlos Guerrero", P.ZAGUEIRO, 62, 80),
      j("Jeremy Salazar", P.ZAGUEIRO, 62, 76),
      j("Pedro Hinojosa", P.ZAGUEIRO, 44, 74),
      j("Gonzalo Páez", P.MEIA, 74, 52),
      j("Pablo Estrella", P.MEIA, 60, 74),
      j("Enrique Valencia", P.ATACANTE, 86, 37),
      j("Moisés Calderón", P.ATACANTE, 80, 62),
      j("Miguel Estrada", P.ATACANTE, 77, 62)
    ],
    reservas: [
      j("Alexis Domínguez", P.GOLEIRO, 30, 81),
      j("Moisés Rivas", P.GOLEIRO, 19, 67),
      j("William Pacheco", P.ZAGUEIRO, 46, 82),
      j("Roberto Andino", P.ZAGUEIRO, 58, 77),
      j("Diego Peña", P.ZAGUEIRO, 35, 69),
      j("Álvaro Franco", P.MEIA, 71, 69),
      j("José Cevallos", P.MEIA, 66, 76),
      j("João Rojas", P.MEIA, 76, 59),
      j("Daniel Reasco", P.ATACANTE, 77, 46),
      j("Kevin Ramírez", P.ATACANTE, 69, 58),
      j("Román Ibarra", P.ATACANTE, 82, 35),
      j("Ramón Peña", P.MEIA, 59, 60)
    ],
  },
  {
    id: "chi",
    nome: "Chile",
    sigla: "CHI",
    iso: "cl",
    titulares: [
      j("Claudio Barra", P.GOLEIRO, 25, 76),
      j("Gustavo Medel", P.ZAGUEIRO, 38, 86),
      j("Paulo Delgado", P.ZAGUEIRO, 61, 79),
      j("Mauricio Ibarra", P.ZAGUEIRO, 50, 77),
      j("Arturo Villarroel", P.ZAGUEIRO, 62, 76),
      j("Guillermo Marín", P.ZAGUEIRO, 55, 76),
      j("Carlos Arancibia", P.MEIA, 73, 72),
      j("Alexis Salazar", P.MEIA, 73, 38),
      j("Erick Pizarro", P.MEIA, 46, 73),
      j("Diego Vargas", P.ATACANTE, 86, 62),
      j("Benjamín Briceño", P.ATACANTE, 79, 61)
    ],
    reservas: [
      j("Gael Andrade", P.GOLEIRO, 29, 80),
      j("Brayan Cuevas", P.GOLEIRO, 19, 66),
      j("Francisco Sierra", P.ZAGUEIRO, 47, 82),
      j("Óscar Ortega", P.ZAGUEIRO, 35, 75),
      j("Nicolás Duarte", P.ZAGUEIRO, 58, 69),
      j("Marcelino Navarro", P.MEIA, 69, 68),
      j("Víctor Mella", P.MEIA, 62, 75),
      j("Darío Ovalle", P.MEIA, 75, 60),
      j("Eduardo Vidal", P.ATACANTE, 82, 47),
      j("Jean Miranda", P.ATACANTE, 75, 58),
      j("Marcos Bolaños", P.ATACANTE, 69, 35),
      j("Leonardo Vidal", P.MEIA, 58, 58)
    ],
  },
  {
    id: "par",
    nome: "Paraguai",
    sigla: "PAR",
    iso: "py",
    titulares: [
      j("Antonio Silva", P.GOLEIRO, 25, 76),
      j("Gustavo Giménez", P.ZAGUEIRO, 44, 86),
      j("Mathías Villalba", P.ZAGUEIRO, 60, 78),
      j("Santiago Arce", P.ZAGUEIRO, 78, 78),
      j("Júnior Almeida", P.ZAGUEIRO, 36, 77),
      j("Omar Aldana", P.MEIA, 61, 61),
      j("Andrés Cubillas", P.MEIA, 54, 72),
      j("Miguel Almada", P.ATACANTE, 86, 51),
      j("Ángel Riveros", P.ATACANTE, 84, 36),
      j("Hernán Paredes", P.ATACANTE, 74, 60),
      j("Adrián Bareiro", P.ATACANTE, 72, 51)
    ],
    reservas: [
      j("Carlos Cabrera", P.GOLEIRO, 29, 81),
      j("Juan Escobar", P.GOLEIRO, 19, 66),
      j("Fabián Benítez", P.ZAGUEIRO, 45, 82),
      j("Roberto Rojas", P.ZAGUEIRO, 57, 75),
      j("Blás Rivero", P.ZAGUEIRO, 34, 68),
      j("Ricardo Sánchez", P.MEIA, 58, 74),
      j("Diego Godoy", P.MEIA, 66, 63),
      j("Matías Ríos", P.MEIA, 74, 58),
      j("Antonio Salinas", P.ATACANTE, 82, 45),
      j("Óscar Cárdenas", P.ATACANTE, 75, 57),
      j("Lorenzo Mora", P.ATACANTE, 68, 34),
      j("Nelson Martínez", P.MEIA, 62, 64)
    ],
  },
  {
    id: "usa",
    nome: "Estados Unidos",
    sigla: "USA",
    iso: "us",
    titulares: [
      j("Mason Turner", P.GOLEIRO, 25, 77),
      j("Trevor Reams", P.ZAGUEIRO, 37, 87),
      j("Wyatt Zimmerman", P.ZAGUEIRO, 40, 81),
      j("Anthony Robinson", P.ZAGUEIRO, 62, 80),
      j("Tyler Anderson", P.ZAGUEIRO, 47, 79),
      j("Gregory Reynard", P.ZAGUEIRO, 62, 79),
      j("Franklin Baldwin", P.MEIA, 80, 62),
      j("Christopher Price", P.MEIA, 80, 50),
      j("Samuel Dent", P.MEIA, 69, 73),
      j("Yuri Musgrave", P.MEIA, 49, 74),
      j("Wesley McKenzie", P.ATACANTE, 80, 76)
    ],
    reservas: [
      j("Scott Jennings", P.GOLEIRO, 29, 81),
      j("Evan Hartman", P.GOLEIRO, 19, 66),
      j("Cole Richardson", P.ZAGUEIRO, 48, 83),
      j("Marcus Robson", P.ZAGUEIRO, 58, 77),
      j("Joel Scanlon", P.ZAGUEIRO, 35, 69),
      j("Luke Delatorre", P.MEIA, 61, 76),
      j("Brandon Ackerman", P.MEIA, 68, 72),
      j("Thomas Webb", P.MEIA, 76, 69),
      j("Ryan Phelps", P.ATACANTE, 83, 48),
      j("Jesse Ferraro", P.ATACANTE, 77, 58),
      j("Jordan Meyers", P.ATACANTE, 69, 35),
      j("Nathan Clark", P.MEIA, 59, 59)
    ],
  },
  {
    id: "nga",
    nome: "Nigéria",
    sigla: "NGA",
    iso: "ng",
    titulares: [
      j("Femi Adeyemi", P.GOLEIRO, 26, 77),
      j("Seye Ajayi", P.ZAGUEIRO, 37, 86),
      j("Wilson Ndukwe", P.ZAGUEIRO, 79, 79),
      j("Alex Ibeh", P.ZAGUEIRO, 62, 75),
      j("Chidi Bassey", P.MEIA, 73, 62),
      j("Zuberu Sani", P.MEIA, 62, 62),
      j("Wale Okafor", P.MEIA, 42, 73),
      j("Victor Okonkwo", P.ATACANTE, 86, 37),
      j("Kelechi Eze", P.ATACANTE, 81, 49),
      j("Samuel Chukwu", P.ATACANTE, 78, 46),
      j("Jide Aribisala", P.ATACANTE, 76, 71)
    ],
    reservas: [
      j("Daniel Akintola", P.GOLEIRO, 30, 80),
      j("Malik Okoro", P.GOLEIRO, 18, 67),
      j("Lekan Babalola", P.ZAGUEIRO, 46, 76),
      j("Kenechi Omeruo", P.ZAGUEIRO, 35, 82),
      j("Olu Adeyinka", P.ZAGUEIRO, 58, 69),
      j("Frank Onyekachi", P.MEIA, 66, 74),
      j("Raphael Obi", P.MEIA, 60, 75),
      j("Moses Suleiman", P.MEIA, 75, 69),
      j("Adedayo Lawal", P.ATACANTE, 82, 46),
      j("Taiwo Awe", P.ATACANTE, 76, 58),
      j("Paul Okoro", P.ATACANTE, 69, 35),
      j("Samuel Iroegbu", P.MEIA, 58, 58)
    ],
  },
  {
    id: "cmr",
    nome: "Camarões",
    sigla: "CMR",
    iso: "cm",
    titulares: [
      j("André Nguessi", P.GOLEIRO, 24, 73),
      j("Jean-Charles Castel", P.ZAGUEIRO, 35, 82),
      j("Olivier Nkam", P.ZAGUEIRO, 75, 75),
      j("Martin Houmba", P.ZAGUEIRO, 71, 73),
      j("Norbert Ndzie", P.MEIA, 71, 70),
      j("Eric Mballa", P.MEIA, 69, 57),
      j("Collins Faye", P.MEIA, 58, 66),
      j("Francis Amba", P.MEIA, 57, 71),
      j("Nicolas Nkolo", P.MEIA, 38, 69),
      j("Vincent Nkolo", P.ATACANTE, 82, 35),
      j("Karl Mbarga", P.ATACANTE, 75, 58)
    ],
    reservas: [
      j("Denis Epesse", P.GOLEIRO, 28, 77),
      j("Simon Omos", P.GOLEIRO, 18, 63),
      j("Christopher Wou", P.ZAGUEIRO, 44, 73),
      j("Enzo Eboua", P.ZAGUEIRO, 32, 78),
      j("Olivier Mbarga", P.ZAGUEIRO, 54, 65),
      j("Samuel Gouet", P.MEIA, 55, 72),
      j("Patrick Kum", P.MEIA, 64, 67),
      j("Brice Mbarga", P.MEIA, 72, 63),
      j("Jean-Pierre Nsang", P.ATACANTE, 78, 47),
      j("Stéphane Bahoya", P.ATACANTE, 73, 54),
      j("Farid Melki", P.ATACANTE, 65, 32),
      j("Samuel Choupo", P.MEIA, 57, 55)
    ],
  },
  {
    id: "mar",
    nome: "Marrocos",
    sigla: "MAR",
    iso: "ma",
    titulares: [
      j("Yassine Benali", P.GOLEIRO, 25, 77),
      j("Nabil Agourram", P.ZAGUEIRO, 38, 87),
      j("Nassim Mazouzi", P.ZAGUEIRO, 62, 80),
      j("Rachid Saïdi", P.ZAGUEIRO, 47, 79),
      j("Amine Harouch", P.MEIA, 74, 58),
      j("Sofiane Amrani", P.MEIA, 63, 74),
      j("Ashraf Halim", P.MEIA, 62, 73),
      j("Youssef El Mansouri", P.ATACANTE, 87, 38),
      j("Aziz Ouhaddou", P.ATACANTE, 80, 63),
      j("Sofiane Bouchaib", P.ATACANTE, 80, 62),
      j("Kamel Zeroual", P.ATACANTE, 80, 56)
    ],
    reservas: [
      j("Mounir Mohand", P.GOLEIRO, 29, 81),
      j("Ahmed Tazi", P.GOLEIRO, 19, 67),
      j("Jawad Yamani", P.ZAGUEIRO, 47, 76),
      j("Badr Benjelloun", P.ZAGUEIRO, 36, 83),
      j("Yahia Attar", P.ZAGUEIRO, 59, 70),
      j("Salim Amrani", P.MEIA, 72, 72),
      j("Ilias Cherkaoui", P.MEIA, 65, 76),
      j("Abdel Zouhair", P.MEIA, 76, 68),
      j("Walid Chakir", P.ATACANTE, 78, 47),
      j("Rachid Hamdani", P.ATACANTE, 70, 59),
      j("Zakaria Abouzid", P.ATACANTE, 83, 36),
      j("Jamal El Mansouri", P.MEIA, 59, 59)
    ],
  },
  {
    id: "gha",
    nome: "Gana",
    sigla: "GHA",
    iso: "gh",
    titulares: [
      j("Kwame Attah", P.GOLEIRO, 24, 74),
      j("Alex Djamba", P.ZAGUEIRO, 35, 83),
      j("Theo Paintsil", P.ZAGUEIRO, 67, 76),
      j("Daniel Amoah", P.ZAGUEIRO, 59, 76),
      j("Gideon Mensim", P.ZAGUEIRO, 51, 74),
      j("Kamal Suleiman", P.MEIA, 69, 57),
      j("André Asante", P.MEIA, 59, 71),
      j("Mohammed Sule", P.MEIA, 57, 69),
      j("Mohammed Kofi", P.ATACANTE, 83, 59),
      j("Jordan Adu", P.ATACANTE, 76, 59),
      j("Isaac Wilson", P.ATACANTE, 74, 35)
    ],
    reservas: [
      j("Richard Owusu", P.GOLEIRO, 28, 78),
      j("Joseph Wiafe", P.GOLEIRO, 19, 64),
      j("Jonas Adu", P.ZAGUEIRO, 44, 73),
      j("Alidu Sow", P.ZAGUEIRO, 33, 79),
      j("Terence Laryea", P.ZAGUEIRO, 55, 65),
      j("Eli Kwakye", P.MEIA, 56, 73),
      j("Salis Abdul", P.MEIA, 64, 69),
      j("Daniel Kyere", P.MEIA, 73, 63),
      j("Antoine Sarpong", P.ATACANTE, 79, 44),
      j("Osman Barwuah", P.ATACANTE, 73, 55),
      j("Felix Ampadu", P.ATACANTE, 65, 33),
      j("William Poku", P.MEIA, 64, 56)
    ],
  },
  {
    id: "ned",
    nome: "Holanda",
    sigla: "NED",
    iso: "nl",
    titulares: [
      j("Lars Noordijk", P.GOLEIRO, 27, 81),
      j("Victor van den Berg", P.ZAGUEIRO, 42, 90),
      j("Daan Dumont", P.ZAGUEIRO, 83, 84),
      j("Freek de Vries", P.ZAGUEIRO, 67, 80),
      j("Wim Wagenaar", P.MEIA, 78, 52),
      j("Niels Akkerman", P.MEIA, 71, 73),
      j("Dirk Blom", P.MEIA, 65, 65),
      j("Dave Klaver", P.MEIA, 41, 78),
      j("Coen Gerritsen", P.ATACANTE, 90, 67),
      j("Mees Dijkstra", P.ATACANTE, 88, 41),
      j("Sven Berends", P.ATACANTE, 84, 73)
    ],
    reservas: [
      j("Joost Brouwer", P.GOLEIRO, 31, 85),
      j("Rens Postma", P.GOLEIRO, 20, 70),
      j("Jurre Timmer", P.ZAGUEIRO, 51, 83),
      j("Stefan de Wit", P.ZAGUEIRO, 38, 87),
      j("Tycho Mulder", P.ZAGUEIRO, 63, 74),
      j("Teun Koster", P.MEIA, 74, 78),
      j("Maarten Roon", P.MEIA, 63, 80),
      j("Xander Smit", P.MEIA, 80, 73),
      j("Noah Lans", P.ATACANTE, 87, 51),
      j("Stijn Bergman", P.ATACANTE, 79, 63),
      j("Luuk Jansen", P.ATACANTE, 74, 38),
      j("Henk De Graaf", P.MEIA, 62, 62)
    ],
  },
  {
    id: "bel",
    nome: "Bélgica",
    sigla: "BEL",
    iso: "be",
    titulares: [
      j("Thierry Courbet", P.GOLEIRO, 27, 80),
      j("Tom Alders", P.ZAGUEIRO, 40, 91),
      j("Jan Vermeulen", P.ZAGUEIRO, 46, 84),
      j("Timothy Castel", P.ZAGUEIRO, 65, 83),
      j("Yuri Thielmans", P.ZAGUEIRO, 66, 82),
      j("Alex Wouters", P.ZAGUEIRO, 58, 80),
      j("Dries Marchal", P.MEIA, 77, 63),
      j("Arthur Thibaut", P.MEIA, 57, 77),
      j("Romain Lemaire", P.ATACANTE, 91, 40),
      j("Koen De Smet", P.ATACANTE, 83, 65),
      j("Yves Caron", P.ATACANTE, 82, 66)
    ],
    reservas: [
      j("Simon Mercier", P.GOLEIRO, 31, 84),
      j("Kurt Casteels", P.GOLEIRO, 20, 70),
      j("Wout Favre", P.ZAGUEIRO, 49, 87),
      j("Zeno Dubois", P.ZAGUEIRO, 38, 81),
      j("Thomas Marchal", P.ZAGUEIRO, 62, 73),
      j("Hans Vanacker", P.MEIA, 79, 74),
      j("Amadou Nkosi", P.MEIA, 66, 79),
      j("Charles De Wilde", P.MEIA, 73, 72),
      j("Michel Bastien", P.ATACANTE, 81, 49),
      j("Leandro Tassin", P.ATACANTE, 87, 38),
      j("Jérémy Dupont", P.ATACANTE, 73, 62),
      j("Lars De Bruyne", P.MEIA, 62, 62)
    ],
  },
  {
    id: "cro",
    nome: "Croácia",
    sigla: "CRO",
    iso: "hr",
    titulares: [
      j("Dominik Horvat", P.GOLEIRO, 26, 80),
      j("Josip Grubić", P.ZAGUEIRO, 52, 90),
      j("Mateo Kralj", P.ZAGUEIRO, 77, 82),
      j("Borna Soldo", P.ZAGUEIRO, 64, 82),
      j("Josip Jurić", P.ZAGUEIRO, 64, 81),
      j("Tomislav Marinović", P.MEIA, 76, 60),
      j("Marcelo Brozić", P.MEIA, 58, 79),
      j("Dejan Lovrić", P.MEIA, 39, 76),
      j("Ivan Perko", P.ATACANTE, 90, 43),
      j("Andrej Kraljić", P.ATACANTE, 82, 64),
      j("Mario Pavlović", P.ATACANTE, 78, 52)
    ],
    reservas: [
      j("Ivo Gregurić", P.GOLEIRO, 31, 84),
      j("Ivica Ivković", P.GOLEIRO, 20, 70),
      j("Martin Erceg", P.ZAGUEIRO, 48, 76),
      j("Domagoj Vidak", P.ZAGUEIRO, 37, 85),
      j("Josip Stanić", P.ZAGUEIRO, 61, 73),
      j("Nikola Vuković", P.MEIA, 79, 64),
      j("Luka Sušak", P.MEIA, 72, 71),
      j("Kristijan Jurić", P.MEIA, 65, 79),
      j("Marko Livak", P.ATACANTE, 85, 48),
      j("Bruno Petrović", P.ATACANTE, 73, 61),
      j("Mislav Orešković", P.ATACANTE, 79, 37),
      j("Hrvoje Mandić", P.MEIA, 61, 61)
    ],
  },
  {
    id: "cze",
    nome: "Tchéquia",
    sigla: "CZE",
    iso: "cz",
    titulares: [
      j("Tomáš Vacek", P.GOLEIRO, 24, 75),
      j("David Zelenka", P.ZAGUEIRO, 36, 83),
      j("Jan Borák", P.ZAGUEIRO, 72, 77),
      j("Alex Kraus", P.ZAGUEIRO, 71, 77),
      j("Jan Kučera", P.MEIA, 70, 59),
      j("Vladimír Čech", P.MEIA, 64, 68),
      j("Tomáš Kalaš", P.MEIA, 59, 77),
      j("Tomáš Soukup", P.MEIA, 59, 73),
      j("Jakub Janák", P.MEIA, 55, 70),
      j("Patrik Šimek", P.ATACANTE, 83, 36),
      j("Adam Holub", P.ATACANTE, 77, 59)
    ],
    reservas: [
      j("Jiří Sládek", P.GOLEIRO, 29, 78),
      j("Matěj Novák", P.GOLEIRO, 18, 64),
      j("Jakub Brabenec", P.ZAGUEIRO, 43, 79),
      j("Ondřej Černý", P.ZAGUEIRO, 55, 73),
      j("Aleš Marek", P.ZAGUEIRO, 33, 66),
      j("Michal Sedlák", P.MEIA, 56, 73),
      j("Antonín Bartoš", P.MEIA, 64, 69),
      j("Vladimír Dvořák", P.MEIA, 73, 63),
      j("Michal Kříž", P.ATACANTE, 79, 43),
      j("Václav Novotný", P.ATACANTE, 73, 55),
      j("Tomáš Chalupa", P.ATACANTE, 66, 33),
      j("Václav Soukup", P.MEIA, 69, 56)
    ],
  },
  {
    id: "ukr",
    nome: "Ucrânia",
    sigla: "UKR",
    iso: "ua",
    titulares: [
      j("Andriy Lysenko", P.GOLEIRO, 25, 77),
      j("Illia Zadorozhnyi", P.ZAGUEIRO, 37, 87),
      j("Mykola Marchenko", P.ZAGUEIRO, 43, 79),
      j("Viktor Tykhonov", P.ZAGUEIRO, 58, 79),
      j("Oleksandr Zinenko", P.ZAGUEIRO, 71, 79),
      j("Taras Stelmashenko", P.ZAGUEIRO, 53, 75),
      j("Artem Dubovyk", P.MEIA, 73, 37),
      j("Ruslan Malynovskyi", P.MEIA, 62, 73),
      j("Vitaliy Melnyk", P.MEIA, 62, 73),
      j("Mykhailo Moroz", P.ATACANTE, 87, 62),
      j("Roman Yaroslavskyi", P.ATACANTE, 79, 62)
    ],
    reservas: [
      j("Anatoliy Trofymenko", P.GOLEIRO, 30, 81),
      j("Dmytro Rudenko", P.GOLEIRO, 19, 67),
      j("Serhiy Kryvosheia", P.ZAGUEIRO, 46, 75),
      j("Valeriy Bondarenko", P.ZAGUEIRO, 35, 82),
      j("Oleksandr Kovalenko", P.ZAGUEIRO, 58, 70),
      j("Oleksandr Zozulya", P.MEIA, 68, 70),
      j("Heorhiy Savchenko", P.MEIA, 76, 64),
      j("Oleksandr Pylypenko", P.MEIA, 59, 76),
      j("Andriy Yavorskyi", P.ATACANTE, 82, 58),
      j("Vladyslav Voronin", P.ATACANTE, 75, 46),
      j("Danylo Sydorenko", P.ATACANTE, 70, 35),
      j("Pylyp Kulyk", P.MEIA, 64, 59)
    ],
  },
  {
    id: "lva",
    nome: "Letônia",
    sigla: "LVA",
    iso: "lv",
    titulares: [
      j("Rolands Ozoliņš", P.GOLEIRO, 22, 68),
      j("Antons Čerņakovs", P.ZAGUEIRO, 32, 75),
      j("Edgars Eglītis", P.ZAGUEIRO, 69, 69),
      j("Jānis Ikstens", P.ZAGUEIRO, 52, 68),
      j("Krišs Kļaviņš", P.ZAGUEIRO, 38, 63),
      j("Raitis Jurisons", P.MEIA, 54, 54),
      j("Rihards Savickis", P.MEIA, 48, 63),
      j("Roberts Upmalis", P.ATACANTE, 75, 51),
      j("Vladislavs Gūtmanis", P.ATACANTE, 71, 32),
      j("Andris Cīrulis", P.ATACANTE, 67, 52),
      j("Raimonds Krastiņš", P.ATACANTE, 63, 43)
    ],
    reservas: [
      j("Pāvels Strautiņš", P.GOLEIRO, 26, 71),
      j("Kristaps Zālītis", P.GOLEIRO, 16, 58),
      j("Kaspars Dambis", P.ZAGUEIRO, 38, 64),
      j("Mārcis Osis", P.ZAGUEIRO, 29, 71),
      j("Vladislavs Freimanis", P.ZAGUEIRO, 49, 59),
      j("Alvis Jansons", P.MEIA, 59, 57),
      j("Daniils Holsts", P.MEIA, 54, 66),
      j("Renārs Riekstiņš", P.MEIA, 66, 51),
      j("Dāvis Irbītis", P.ATACANTE, 71, 38),
      j("Mārtiņš Kļaviņš", P.ATACANTE, 64, 49),
      j("Rūdolfs Miķelsons", P.ATACANTE, 59, 29),
      j("Ilmārs Birznieks", P.MEIA, 51, 60)
    ],
  },
  {
    id: "swe",
    nome: "Suécia",
    sigla: "SWE",
    iso: "se",
    titulares: [
      j("Robin Holm", P.GOLEIRO, 24, 75),
      j("Marcus Dahl", P.ZAGUEIRO, 36, 84),
      j("Mattias Svahn", P.ZAGUEIRO, 59, 77),
      j("Ludvig Andersson", P.ZAGUEIRO, 60, 77),
      j("Victor Lindberg", P.ZAGUEIRO, 41, 74),
      j("Viktor Gustafsson", P.MEIA, 75, 60),
      j("Emil Kraft", P.MEIA, 71, 67),
      j("Dennis Kullberg", P.MEIA, 71, 59),
      j("Karl Olsson", P.MEIA, 48, 71),
      j("Alexander Isholm", P.ATACANTE, 84, 36),
      j("Emil Fredriksson", P.ATACANTE, 77, 67)
    ],
    reservas: [
      j("Kristoffer Norling", P.GOLEIRO, 29, 78),
      j("Jakob Rask", P.GOLEIRO, 18, 64),
      j("Per Jansson", P.ZAGUEIRO, 45, 72),
      j("Carl Ström", P.ZAGUEIRO, 34, 80),
      j("Hjalmar Ek", P.ZAGUEIRO, 56, 67),
      j("Simon Lundqvist", P.MEIA, 57, 73),
      j("Jens Carlsson", P.MEIA, 65, 68),
      j("Anton Ellgren", P.MEIA, 73, 57),
      j("Robin Qvist", P.ATACANTE, 80, 45),
      j("Johan Larsson", P.ATACANTE, 72, 56),
      j("Jonas Gidlund", P.ATACANTE, 67, 34),
      j("Magnus Pettersson", P.MEIA, 60, 57)
    ],
  },
  {
    id: "nor",
    nome: "Noruega",
    sigla: "NOR",
    iso: "no",
    titulares: [
      j("Øyvind Nymoen", P.GOLEIRO, 24, 74),
      j("Stian Gregersen", P.ZAGUEIRO, 36, 84),
      j("Fredrik Bjørnstad", P.ZAGUEIRO, 59, 76),
      j("Fredrik Aune", P.ZAGUEIRO, 59, 74),
      j("Kristian Aasen", P.ZAGUEIRO, 44, 71),
      j("Mohamed Elmi", P.MEIA, 73, 66),
      j("Alexander Sørensen", P.MEIA, 73, 59),
      j("Martin Øverland", P.MEIA, 70, 59),
      j("Sander Bergesen", P.MEIA, 54, 70),
      j("Erik Halvorsen", P.ATACANTE, 84, 36),
      j("Julian Rystad", P.ATACANTE, 76, 66)
    ],
    reservas: [
      j("Anders Hansen", P.GOLEIRO, 29, 77),
      j("Per Bråten", P.GOLEIRO, 18, 64),
      j("Leo Østby", P.ZAGUEIRO, 45, 73),
      j("Marcus Holm", P.ZAGUEIRO, 34, 80),
      j("Birger Moe", P.ZAGUEIRO, 56, 66),
      j("Patrick Bergh", P.MEIA, 65, 68),
      j("Ola Brynildsen", P.MEIA, 57, 72),
      j("Jens Haugen", P.MEIA, 72, 63),
      j("Jonas Konge", P.ATACANTE, 80, 45),
      j("Aron Dahl", P.ATACANTE, 73, 56),
      j("Ola Solheim", P.ATACANTE, 66, 34),
      j("Jørgen Haugland", P.MEIA, 56, 56)
    ],
  },
  {
    id: "pol",
    nome: "Polônia",
    sigla: "POL",
    iso: "pl",
    titulares: [
      j("Wojciech Słowik", P.GOLEIRO, 26, 77),
      j("Jan Bednarski", P.ZAGUEIRO, 38, 87),
      j("Grzegorz Krawiec", P.ZAGUEIRO, 63, 80),
      j("Bartosz Bereza", P.ZAGUEIRO, 63, 79),
      j("Arkadiusz Miler", P.MEIA, 74, 63),
      j("Sebastian Szwed", P.MEIA, 74, 63),
      j("Piotr Zawisza", P.MEIA, 74, 45),
      j("Kamil Górski", P.MEIA, 47, 74),
      j("Bogusz Nowak", P.ATACANTE, 87, 38),
      j("Przemysław Franek", P.ATACANTE, 80, 73),
      j("Nikodem Zawada", P.ATACANTE, 75, 75)
    ],
    reservas: [
      j("Łukasz Skóra", P.GOLEIRO, 30, 81),
      j("Kamil Grabowski", P.GOLEIRO, 20, 67),
      j("Jakub Kita", P.ZAGUEIRO, 48, 76),
      j("Mateusz Wieczorek", P.ZAGUEIRO, 36, 83),
      j("Tomasz Kaczmarek", P.ZAGUEIRO, 59, 70),
      j("Karol Świrski", P.MEIA, 76, 62),
      j("Jakub Kalinowski", P.MEIA, 71, 67),
      j("Damian Szymała", P.MEIA, 65, 76),
      j("Krzysztof Pawlak", P.ATACANTE, 83, 48),
      j("Adam Borkowski", P.ATACANTE, 76, 59),
      j("Karol Lis", P.ATACANTE, 70, 36),
      j("Mateusz Tomaszewski", P.MEIA, 60, 60)
    ],
  },
  {
    id: "jpn",
    nome: "Japão",
    sigla: "JPN",
    iso: "jp",
    titulares: [
      j("Shūichi Gotō", P.GOLEIRO, 25, 78),
      j("Kōji Nakamura", P.ZAGUEIRO, 38, 87),
      j("Hidemasa Murata", P.ZAGUEIRO, 80, 80),
      j("Takehiro Tanaka", P.ZAGUEIRO, 42, 78),
      j("Wataru Enomoto", P.ZAGUEIRO, 49, 78),
      j("Ritsu Okada", P.ZAGUEIRO, 56, 78),
      j("Ayase Fujimoto", P.MEIA, 73, 62),
      j("Yūta Yamamoto", P.MEIA, 62, 76),
      j("Kaoru Matsui", P.MEIA, 62, 73),
      j("Takumi Hayashi", P.ATACANTE, 87, 38),
      j("Hiroki Inoue", P.ATACANTE, 79, 62)
    ],
    reservas: [
      j("Daiki Sasaki", P.GOLEIRO, 29, 81),
      j("Riku Suzuki", P.GOLEIRO, 19, 67),
      j("Makoto Yamada", P.ZAGUEIRO, 46, 76),
      j("Shōgo Takahashi", P.ZAGUEIRO, 35, 83),
      j("Miki Watanabe", P.ZAGUEIRO, 58, 69),
      j("Aoi Nakajima", P.MEIA, 65, 76),
      j("Junpei Kobayashi", P.MEIA, 72, 66),
      j("Takeshi Kondō", P.MEIA, 76, 60),
      j("Daiki Mori", P.ATACANTE, 69, 46),
      j("Kyōhei Fujita", P.ATACANTE, 83, 58),
      j("Takuma Ishikawa", P.ATACANTE, 73, 35),
      j("Tatsuya Saito", P.MEIA, 59, 59)
    ],
  },
  {
    id: "kor",
    nome: "Coreia do Sul",
    sigla: "KOR",
    iso: "kr",
    titulares: [
      j("Kim Seong-ho", P.GOLEIRO, 25, 77),
      j("Kim Min-soo", P.ZAGUEIRO, 38, 87),
      j("Hwang In-soo", P.ZAGUEIRO, 72, 79),
      j("Kim Young-ho", P.ZAGUEIRO, 62, 75),
      j("Kim Moon-sik", P.MEIA, 76, 64),
      j("Hwang Tae-jun", P.MEIA, 75, 62),
      j("Lee Kang-ho", P.MEIA, 73, 62),
      j("Hwang Hee-jun", P.MEIA, 62, 73),
      j("Kim Jin-ho", P.MEIA, 41, 73),
      j("Cho Min-ho", P.ATACANTE, 87, 38),
      j("Seo Hyun-woo", P.ATACANTE, 79, 62)
    ],
    reservas: [
      j("Jo Min-woo", P.GOLEIRO, 29, 82),
      j("Song Ji-hun", P.GOLEIRO, 19, 67),
      j("Jung Seong-min", P.ZAGUEIRO, 47, 76),
      j("Kwon Tae-ho", P.ZAGUEIRO, 36, 83),
      j("Yoon Seok-jin", P.ZAGUEIRO, 59, 69),
      j("Baek Seung-ho", P.MEIA, 64, 76),
      j("Jeong Min-gi", P.MEIA, 76, 73),
      j("Hong Hyun-woo", P.MEIA, 72, 70),
      j("Oh Tae-min", P.ATACANTE, 83, 36),
      j("Lee Jae-ho", P.ATACANTE, 76, 59),
      j("Eom Won-ho", P.ATACANTE, 69, 47),
      j("Yoon-seok Pang", P.MEIA, 59, 59)
    ],
  },
  {
    id: "aus",
    nome: "Austrália",
    sigla: "AUS",
    iso: "au",
    titulares: [
      j("Mitchell Ryan", P.GOLEIRO, 25, 76),
      j("Kyle Rowlands", P.ZAGUEIRO, 39, 85),
      j("Harrison Southwell", P.ZAGUEIRO, 41, 79),
      j("Adrian Hurst", P.ZAGUEIRO, 44, 79),
      j("Corey Goddard", P.ZAGUEIRO, 60, 79),
      j("Jack Irwin", P.ZAGUEIRO, 70, 79),
      j("Mitchell Dunn", P.MEIA, 79, 48),
      j("Aaron Moody", P.MEIA, 76, 73),
      j("Nathan Atkins", P.MEIA, 61, 71),
      j("Adam Beaumont", P.MEIA, 37, 72),
      j("Matthew Leeson", P.ATACANTE, 79, 61)
    ],
    reservas: [
      j("Lewis Thomas", P.GOLEIRO, 29, 80),
      j("Daniel Voss", P.GOLEIRO, 19, 67),
      j("Tom Derrick", P.ZAGUEIRO, 33, 73),
      j("Milo Dvorak", P.ZAGUEIRO, 45, 81),
      j("Frank Kovač", P.ZAGUEIRO, 57, 68),
      j("Riley McGregor", P.MEIA, 68, 68),
      j("Dennis Grant", P.MEIA, 58, 74),
      j("Marcus Tilley", P.MEIA, 74, 58),
      j("James McAllister", P.ATACANTE, 81, 45),
      j("Jason Collins", P.ATACANTE, 73, 57),
      j("Gavin Koole", P.ATACANTE, 68, 33),
      j("Declan Parker", P.MEIA, 69, 59)
    ],
  },
  {
    id: "nzl",
    nome: "Nova Zelândia",
    sigla: "NZL",
    iso: "nz",
    titulares: [
      j("Oliver Sailsbury", P.GOLEIRO, 24, 72),
      j("Nathan Pinkerton", P.ZAGUEIRO, 33, 79),
      j("Michael Baxter", P.ZAGUEIRO, 56, 73),
      j("Liam Callow", P.ZAGUEIRO, 54, 68),
      j("Sanjay Patel", P.MEIA, 66, 46),
      j("Tommy Sinclair", P.MEIA, 60, 56),
      j("Mark Stevenson", P.MEIA, 49, 66),
      j("Craig Worthington", P.ATACANTE, 79, 33),
      j("Matthew Garnett", P.ATACANTE, 74, 54),
      j("Joseph Bellamy", P.ATACANTE, 73, 56),
      j("Ben Wallace", P.ATACANTE, 68, 47)
    ],
    reservas: [
      j("Max Crawford", P.GOLEIRO, 27, 75),
      j("Alex Pearson", P.GOLEIRO, 17, 62),
      j("Tim Parry", P.ZAGUEIRO, 40, 67),
      j("Francis Devereux", P.ZAGUEIRO, 30, 75),
      j("Callum Elliott", P.ZAGUEIRO, 51, 62),
      j("Clayton Lowe", P.MEIA, 62, 62),
      j("Alex Rutherford", P.MEIA, 53, 70),
      j("Ben Olson", P.MEIA, 70, 53),
      j("Myles Beaumont", P.ATACANTE, 75, 40),
      j("Logan Robertson", P.ATACANTE, 67, 51),
      j("Matthew Shaw", P.ATACANTE, 62, 30),
      j("Harrison Cooper", P.MEIA, 62, 61)
    ],
  }
];

/**
 * Acrescenta `convocacaoExtra` (32 fictícios) para Copa/Campanha — titulares+reservas
 * continuam os 11+12 usados em amistoso / elenco padrão.
 * @param {SelecaoDef} s
 */
function enriquecerConvocacao(s) {
  return {
    ...s,
    convocacaoExtra: gerarConvocacaoExtraDefs(s.id, s.titulares),
  };
}

export const SELECOES_CORE = SELECOES_CORE_BASE.map(enriquecerConvocacao);
export const SELECOES_EXPAND = SELECOES_EXPAND_RAW.map(enriquecerConvocacao);

/** Todas as seleções (base + expansão), ordenadas por nome para listas no jogo. */
export const SELECOES = [...SELECOES_CORE, ...SELECOES_EXPAND].sort((a, b) =>
  a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }),
);

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

/**
 * Titulares + reservas + extras de convocação no formato da campanha (ids estáveis por índice).
 * @param {string} selecaoId
 * @returns {import('./campaign-pool.js').JogadorCampanha[]}
 */
export function jogadoresNacionaisParaPoolCampanha(selecaoId) {
  const s = selecaoPorId(selecaoId);
  if (!s) return [];
  const fm = forcaMediaTitularesDefs(s.titulares);
  const defs = [...s.titulares, ...s.reservas, ...(s.convocacaoExtra ?? [])];
  return defs.map((r, i) => {
    const seed = hashStringToSeedConvExtra(`natpool:v1:${selecaoId}:${i}:${r.nome}`);
    const rng = criarRng(seed);
    const basePot = Math.max(r.ataque, r.defesa);
    const tetoPotencial = Math.min(
      99,
      Math.max(
        Math.max(1, Math.round(fm + 8)),
        Math.round(fm + 14 + Math.floor(rng() * 17)),
      ),
    );
    const hiPot = Math.max(basePot, tetoPotencial);
    const potencial = basePot + Math.floor(rng() * (hiPot - basePot + 1));
    const idade = 18 + Math.floor(rng() * 18);
    return {
      id: `nat-${selecaoId}-${String(i).padStart(3, "0")}`,
      nome: r.nome,
      posicao: r.posicao,
      ataque: r.ataque,
      defesa: r.defesa,
      idade,
      potencial,
      forma: 100,
    };
  });
}

/**
 * Elenco com pelo menos 12 no banco: os dados da seleção já são 11+12; se por algum
 * motivo houver menos de 12 reservas, completa clonando o pior de linha (evita 3º GR).
 * @param {string} id
 */
export function elencoSelecaoCom12Reservas(id) {
  const { titulares, reservas } = elencoDaSelecao(id);
  if (reservas.length >= 12) return { titulares, reservas };
  const benchField = reservas.filter((j) => j.posicao !== P.GOLEIRO);
  const base =
    benchField.length > 0
      ? benchField.reduce((a, b) =>
          a.ataque + a.defesa <= b.ataque + b.defesa ? a : b,
        )
      : reservas[reservas.length - 1];
  const extra = criarJogadorFixo(
    `${base.nome} (banco+)`,
    base.posicao,
    base.ataque,
    base.defesa,
  );
  return { titulares, reservas: [...reservas, extra] };
}
