/**
 * Modo Copa do Mundo: sorteio em 8 grupos, classificação (critérios FIFA simplificados)
 * e chave do mata-mata (oitavas → final) com cruzamento FIFA nas quartas (1×3, 2×4, 5×7, 6×8).
 */

/**
 * @typedef {{ home: string, away: string, gh: number, ga: number }} ResultadoPartida
 */

/** @param {() => number} rng 0..1 */
function poisson(lambda, rng) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L && k < 12);
  return k - 1;
}

/** @param {unknown[]} arr @param {() => number} rng */
export function embaralhar(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Semente determinística (reproduzível). Expõe estado para salvar/carregar a Copa. */
export function criarRng(seed) {
  let t = seed >>> 0;
  function rng() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  }
  rng.getState = () => t >>> 0;
  rng.setState = (u) => {
    t = u >>> 0;
  };
  return rng;
}

const GRUPOS_LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** Soma (ataque+defesa) onde a curva de peso é ancorada; times abaixo ainda entram, mas raro. */
const COPA_PESO_SOM_REF = 1280;
/**
 * Escala em “pontos de soma” por unidade de expoente. Valores maiores = sorteio mais uniforme;
 * ~50 deixa seleções elite (Brasil, Alemanha, Espanha, etc.) com chance ~75% de vaga vs. pool atual.
 */
const COPA_PESO_ESCALA_EXP = 50;

/**
 * Peso para o sorteio das 32 vagas na Copa (maior = mais provável de entrar).
 * Curva exponencial na soma ataque+defesa dos titulares: elite domina muito mais que no modelo linear.
 * @param {{ titulares: { ataque: number, defesa: number }[] }} s
 */
export function pesoInscricaoCopa(s) {
  let sum = 0;
  for (const p of s.titulares) sum += p.ataque + p.defesa;
  const x = (sum - COPA_PESO_SOM_REF) / COPA_PESO_ESCALA_EXP;
  const clamped = Math.max(-8, Math.min(14, x));
  return Math.exp(clamped);
}

/**
 * Escolhe 32 seleções: a do jogador entra sempre; as outras 31 são sorteadas
 * sem reposição com probabilidade proporcional a `pesoInscricaoCopa`.
 * @param {{ id: string, titulares: { ataque: number, defesa: number }[] }[]} todasSelecoes
 * @param {string} playerTeamId
 * @param {() => number} rng
 * @returns {string[]}
 */
export function sortear32IdsCopa(todasSelecoes, playerTeamId, rng) {
  if (todasSelecoes.length < 32) {
    throw new Error("Copa: são necessárias pelo menos 32 seleções no total.");
  }
  if (!todasSelecoes.some((s) => s.id === playerTeamId)) {
    throw new Error("Copa: seleção do jogador não está no elenco mundial.");
  }
  /** @type {Set<string>} */
  const ids = new Set([playerTeamId]);
  while (ids.size < 32) {
    const candidatas = todasSelecoes.filter((s) => !ids.has(s.id));
    const pesos = candidatas.map((s) => pesoInscricaoCopa(s));
    const total = pesos.reduce((a, b) => a + b, 0);
    let r = rng() * total;
    let pick = candidatas.length - 1;
    for (let i = 0; i < candidatas.length; i++) {
      r -= pesos[i];
      if (r < 0) {
        pick = i;
        break;
      }
    }
    ids.add(candidatas[pick].id);
  }
  return Array.from(ids);
}

/**
 * @param {string[]} ids32 exatamente 32 ids de seleção
 * @param {() => number} rng
 * @returns {Record<string, string[]>}
 */
export function sortearGrupos(ids32, rng) {
  if (ids32.length !== 32) {
    throw new Error("Copa: são necessárias 32 seleções.");
  }
  const misturados = embaralhar(ids32, rng);
  /** @type {Record<string, string[]>} */
  const g = {};
  for (let i = 0; i < 8; i++) {
    g[GRUPOS_LETRAS[i]] = misturados.slice(i * 4, i * 4 + 4);
  }
  return g;
}

/**
 * Estado inicial do modo Copa com 32 seleções já definidas (ex.: classificados da campanha).
 * @param {string[]} ids32
 * @param {string} playerTeamId
 * @param {number} seed
 */
export function montarEstadoCopaCom32Ids(ids32, playerTeamId, seed) {
  if (ids32.length !== 32) {
    throw new Error("Copa: são necessárias 32 seleções.");
  }
  if (!ids32.includes(playerTeamId)) {
    throw new Error("Copa: a sua seleção tem de estar entre as 32.");
  }
  const rng = criarRng(seed >>> 0);
  const grupos = sortearGrupos(ids32, rng);
  /** @type {Record<string, ResultadoPartida[]>} */
  const partidasPorGrupo = {};
  for (const L of Object.keys(grupos)) {
    partidasPorGrupo[L] = partidasDoGrupo(grupos[L]);
  }
  let grupoPlayer = "A";
  for (const L of Object.keys(grupos)) {
    if (grupos[L].includes(playerTeamId)) {
      grupoPlayer = L;
      break;
    }
  }
  const quatro = grupos[grupoPlayer];
  const adversariosGrupo = adversariosNasRodadas(quatro, playerTeamId);
  return {
    rng,
    seed: seed >>> 0,
    grupos,
    partidasPorGrupo,
    playerTeamId,
    grupoPlayer,
    adversariosGrupo,
    idxAdversarioGrupo: 0,
    faseCopa: "grupos",
    ordemGrupos: {},
    jogosEliminatorios: [],
    idxJogoEliminatorio: 0,
    campeaoId: null,
    artilheiros: {},
    lesoesHumano: {},
    jogosSuspensao: {},
    amarelosAcumulado: {},
    eliminatoria: null,
  };
}

/**
 * @param {string[]} quatroIds
 * @returns {ResultadoPartida[]}
 */
export function partidasDoGrupo(quatroIds) {
  const [a, b, c, d] = quatroIds;
  return [
    { home: a, away: b, gh: -1, ga: -1 },
    { home: a, away: c, gh: -1, ga: -1 },
    { home: a, away: d, gh: -1, ga: -1 },
    { home: b, away: c, gh: -1, ga: -1 },
    { home: b, away: d, gh: -1, ga: -1 },
    { home: c, away: d, gh: -1, ga: -1 },
  ];
}

/**
 * Índices em `partidasDoGrupo([t0,t1,t2,t3])` por rodada (1ª a 3ª).
 * Rodada 1: t0×t1, t2×t3 | Rodada 2: t0×t2, t1×t3 | Rodada 3: t0×t3, t1×t2
 */
export const PARTIDAS_GRUPO_POR_RODADA = [
  [0, 5],
  [1, 4],
  [2, 3],
];

/**
 * Ordem dos 3 adversários na fase de grupos conforme as rodadas (mesmo calendário para todos).
 * @param {string[]} quatroIds ordem fixa do grupo no sorteio
 * @param {string} playerId
 * @returns {[string, string, string]}
 */
export function adversariosNasRodadas(quatroIds, playerId) {
  const i = quatroIds.indexOf(playerId);
  if (i < 0) {
    throw new Error("Copa: seleção do jogador não está no grupo.");
  }
  const r1 = { 0: 1, 1: 0, 2: 3, 3: 2 };
  const r2 = { 0: 2, 1: 3, 2: 0, 3: 1 };
  const r3 = { 0: 3, 1: 2, 2: 1, 3: 0 };
  return [quatroIds[r1[i]], quatroIds[r2[i]], quatroIds[r3[i]]];
}

/**
 * Simula todos os jogos da rodada (1–3) em todos os grupos, exceto partidas ainda não disputadas
 * que envolvem o time humano (no grupo dele).
 * @param {Record<string, string[]>} grupos
 * @param {Record<string, ResultadoPartida[]>} partidasPorGrupo
 * @param {number} numeroRodada 1, 2 ou 3
 */
export function simularRodadaGruposExcetoJogoHumano(
  grupos,
  partidasPorGrupo,
  grupoPlayer,
  playerTeamId,
  numeroRodada,
  forcaFn,
  rng,
  /** @type {((grupo: string, homeId: string, awayId: string, gh: number, ga: number) => void) | undefined} */
  aoSimularPartida,
) {
  if (numeroRodada < 1 || numeroRodada > 3) return;
  const rodadaIdx = PARTIDAS_GRUPO_POR_RODADA[numeroRodada - 1];
  const letters = Object.keys(grupos).sort();
  for (const L of letters) {
    const lista = partidasPorGrupo[L];
    if (!lista) continue;
    for (const pi of rodadaIdx) {
      const p = lista[pi];
      if (!p || p.gh >= 0) continue;
      if (L === grupoPlayer && (p.home === playerTeamId || p.away === playerTeamId)) continue;
      const { gh, ga } = simularPlacar(forcaFn(p.home), forcaFn(p.away), rng);
      aplicarResultadoNaLista(lista, p.home, p.away, gh, ga);
      if (aoSimularPartida) aoSimularPartida(L, p.home, p.away, gh, ga);
    }
  }
}

/**
 * @typedef {{ pts: number, pj: number, vit: number, emp: number, der: number, gf: number, gc: number, sg: number }} LinhaGrupo
 */

/** @param {string[]} teamIds @param {ResultadoPartida[]} matches só jogos já disputados (gh/ga válidos) */
export function agregarClassificacao(teamIds, matches) {
  /** @type {Record<string, LinhaGrupo>} */
  const m = {};
  for (const id of teamIds) {
    m[id] = { pts: 0, pj: 0, vit: 0, emp: 0, der: 0, gf: 0, gc: 0, sg: 0 };
  }
  for (const r of matches) {
    if (r.gh < 0 || r.ga < 0) continue;
    const h = m[r.home];
    const a = m[r.away];
    if (!h || !a) continue;
    h.pj++;
    a.pj++;
    h.gf += r.gh;
    h.gc += r.ga;
    a.gf += r.ga;
    a.gc += r.gh;
    if (r.gh > r.ga) {
      h.pts += 3;
      h.vit++;
      a.der++;
    } else if (r.gh < r.ga) {
      a.pts += 3;
      a.vit++;
      h.der++;
    } else {
      h.pts++;
      a.pts++;
      h.emp++;
      a.emp++;
    }
  }
  for (const id of teamIds) {
    m[id].sg = m[id].gf - m[id].gc;
  }
  return m;
}

function linhasIguaisFifa(L1, L2) {
  return L1.pts === L2.pts && L1.sg === L2.sg && L1.gf === L2.gf;
}

/**
 * Ordena times do grupo (1º ao 4º) conforme FIFA:
 * pontos, saldo de gols, gols marcados; desempate por confronto direto (mini-tabela);
 * sorteio se ainda empatar.
 * @param {string[]} teamIds
 * @param {ResultadoPartida[]} todasPartidasGrupo
 * @param {() => number} rng
 */
export function ordenarGrupoFifa(teamIds, todasPartidasGrupo, rng) {
  const full = agregarClassificacao(teamIds, todasPartidasGrupo);
  const ordenado = [...teamIds].sort((x, y) => {
    const a = full[x];
    const b = full[y];
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.sg !== a.sg) return b.sg - a.sg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return 0;
  });

  const resultado = [];
  let i = 0;
  while (i < ordenado.length) {
    let j = i + 1;
    while (
      j < ordenado.length &&
      linhasIguaisFifa(full[ordenado[i]], full[ordenado[j]])
    ) {
      j++;
    }
    const bloco = ordenado.slice(i, j);
    if (bloco.length === 1) {
      resultado.push(bloco[0]);
    } else {
      const miniJogos = todasPartidasGrupo.filter(
        (p) => bloco.includes(p.home) && bloco.includes(p.away) && p.gh >= 0,
      );
      const mini = agregarClassificacao(bloco, miniJogos);
      bloco.sort((x, y) => {
        const a = mini[x];
        const b = mini[y];
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.sg !== a.sg) return b.sg - a.sg;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return rng() < 0.5 ? -1 : 1;
      });
      resultado.push(...bloco);
    }
    i = j;
  }
  return resultado;
}

/**
 * @param {{ titulares: { ataque: number, defesa: number }[] }} selecao
 */
export function forcaMediaSelecao(selecao) {
  const t = selecao.titulares;
  if (!t.length) return 50;
  let s = 0;
  for (const p of t) {
    s += (p.ataque + p.defesa) / 2;
  }
  return s / t.length;
}

/**
 * @param {number} fCasa @param {number} fFora
 * @param {() => number} rng
 */
export function simularPlacar(fCasa, fFora, rng) {
  const diff = (fCasa - fFora) / 22;
  const base = 1.05;
  const lc = Math.max(0.2, base + diff * 0.38);
  const lv = Math.max(0.2, base - diff * 0.38);
  return { gh: poisson(lc, rng), ga: poisson(lv, rng) };
}

/**
 * Marca resultado numa lista de partidas do grupo (template).
 * @param {ResultadoPartida[]} lista
 */
export function aplicarResultadoNaLista(lista, home, away, gh, ga) {
  const p = lista.find((x) => x.home === home && x.away === away);
  if (p) {
    p.gh = gh;
    p.ga = ga;
    return;
  }
  const rev = lista.find((x) => x.home === away && x.away === home);
  if (rev) {
    rev.gh = ga;
    rev.ga = gh;
  }
}

/** Oitavas: por par de grupos (A,B), (C,D)… → A1×B2 e B1×A2 */
const PARES_OITAVAS = [
  ["A", "B"],
  ["C", "D"],
  ["E", "F"],
  ["G", "H"],
];

/** Mesma ordem dos jogos gerados por `montarOitavas` (para legendas do chaveamento). */
export const ROTULOS_OITAVAS_FIFA = [
  "1.ºA × 2.ºB",
  "1.ºB × 2.ºA",
  "1.ºC × 2.ºD",
  "1.ºD × 2.ºC",
  "1.ºE × 2.ºF",
  "1.ºF × 2.ºE",
  "1.ºG × 2.ºH",
  "1.ºH × 2.ºG",
];

/** Quartas na ordem de `montarQuartasFifa` (cruzamento FIFA a partir das oitavas 1–8). */
export const ROTULOS_QUARTAS_FIFA = [
  "Oitavas 1 × Oitavas 3",
  "Oitavas 2 × Oitavas 4",
  "Oitavas 5 × Oitavas 7",
  "Oitavas 6 × Oitavas 8",
];

export const ROTULOS_SEMI_FIFA = ["Quartas 1 × Quartas 2", "Quartas 3 × Quartas 4"];

export const ROTULO_FINAL_FIFA = "Semifinal 1 × Semifinal 2";

/**
 * @param {Record<string, string[]>} ordemGrupos id do 1º e 2º por letra: [ouro, prata]
 */
export function montarOitavas(ordemGrupos) {
  const jogos = [];
  for (const [g1, g2] of PARES_OITAVAS) {
    const o1 = ordemGrupos[g1];
    const o2 = ordemGrupos[g2];
    if (!o1 || !o2 || o1.length < 2 || o2.length < 2) continue;
    jogos.push({ fase: "oitavas", homeId: o1[0], awayId: o2[1], winnerId: null });
    jogos.push({ fase: "oitavas", homeId: o2[0], awayId: o1[1], winnerId: null });
  }
  return jogos;
}

/**
 * Chave FIFA: oitavas na ordem de `montarOitavas` (índices 0–7).
 * Quartas: 0×2, 1×3, 4×6, 5×7 (mesma metade da chave que na Copa do Mundo).
 * @param {string[]} vencedoresOitavas oito ids, na ordem dos jogos de oitavas
 */
export function montarQuartasFifa(vencedoresOitavas) {
  if (vencedoresOitavas.length !== 8) return [];
  const v = vencedoresOitavas;
  return [
    { fase: "quartas", homeId: v[0], awayId: v[2], winnerId: null },
    { fase: "quartas", homeId: v[1], awayId: v[3], winnerId: null },
    { fase: "quartas", homeId: v[4], awayId: v[6], winnerId: null },
    { fase: "quartas", homeId: v[5], awayId: v[7], winnerId: null },
  ];
}

/**
 * Semifinais: vencedores das quartas na ordem [Q1,Q2,Q3,Q4] → Q1×Q2 e Q3×Q4.
 * @param {string[]} vencedoresQuartas quatro ids na ordem dos jogos de quartas
 */
export function montarSemiFifa(vencedoresQuartas) {
  if (vencedoresQuartas.length !== 4) return [];
  const v = vencedoresQuartas;
  return [
    { fase: "semi", homeId: v[0], awayId: v[1], winnerId: null },
    { fase: "semi", homeId: v[2], awayId: v[3], winnerId: null },
  ];
}

/**
 * @param {string} idA @param {string} idB
 */
export function montarFinal(idA, idB) {
  return [{ fase: "final", homeId: idA, awayId: idB, winnerId: null }];
}
