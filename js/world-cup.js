/**
 * Modo Copa do Mundo — formato FIFA 2026 (48 seleções):
 * 12 grupos de 4; classificam os 2 primeiros + os 8 melhores terceiros (32 no mata-mata);
 * dezesseis-avos (16 jogos) → oitavas (8) → quartas → semifinais → final.
 * Critérios dos terceiros entre grupos: pontos, saldo, gols marcados, gols sofridos, “ranking” (força média).
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

/** Total de seleções na fase final; 12×4. */
export const COPA_TOTAL_EQUIPES = 48;

/** Letras dos 12 grupos (Copa 2026). */
export const COPA_GRUPOS_LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const GRUPOS_LETRAS = COPA_GRUPOS_LETRAS;

/** Soma (ataque+defesa) onde a curva de peso é ancorada; times abaixo ainda entram, mas raro. */
const COPA_PESO_SOM_REF = 1280;
/**
 * Escala em “pontos de soma” por unidade de expoente. Valores maiores = sorteio mais uniforme;
 * ~50 deixa seleções elite (Brasil, Alemanha, Espanha, etc.) com chance ~75% de vaga vs. pool atual.
 */
const COPA_PESO_ESCALA_EXP = 50;

/**
 * Peso para o sorteio das 48 vagas na Copa (maior = mais provável de entrar).
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

/** Ordem de preenchimento das vagas por confederação (alinhada à campanha / `finalizarClassificadosCopaMundial`). */
const ORDEM_CONFED_COPA_48 = /** @type {const} */ ([
  "UEFA",
  "CONMEBOL",
  "CONCACAF",
  "CAF",
  "AFC",
  "OFC",
]);

/**
 * Uma seleção com peso exponencial por força dos titulares.
 * @param {{ id: string, titulares: { ataque: number, defesa: number }[] }[]} candidatas
 * @param {() => number} rng
 */
function escolherUmaSelecaoPesoInscricao(candidatas, rng) {
  if (!candidatas.length) {
    throw new Error("Copa: não há candidatos para o sorteio.");
  }
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
  return candidatas[pick];
}

/**
 * @param {{ id: string, titulares: { ataque: number, defesa: number }[] }[]} todasSelecoes
 * @param {Record<string, number>} vagasPorConfederacao
 * @param {(id: string) => string} confederacaoDeId
 */
function sortear48IdsCopaComQuotasInterno(todasSelecoes, playerTeamId, rng, vagasPorConfederacao, confederacaoDeId) {
  let somaVagas = 0;
  for (const k of ORDEM_CONFED_COPA_48) {
    somaVagas += vagasPorConfederacao[k] ?? 0;
  }
  if (somaVagas !== COPA_TOTAL_EQUIPES) {
    throw new Error(
      `Copa: as cotas por confederação devem somar ${COPA_TOTAL_EQUIPES} (soma atual: ${somaVagas}).`,
    );
  }
  /** @type {Record<string, { id: string, titulares: { ataque: number, defesa: number }[] }[]>} */
  const porConf = {};
  for (const k of ORDEM_CONFED_COPA_48) porConf[k] = [];
  for (const s of todasSelecoes) {
    const ck = confederacaoDeId(s.id);
    if (!porConf[ck]) porConf[ck] = [];
    porConf[ck].push(s);
  }
  /** @type {Record<string, number>} */
  const restante = {};
  for (const k of ORDEM_CONFED_COPA_48) {
    restante[k] = vagasPorConfederacao[k] ?? 0;
  }
  const pConf = confederacaoDeId(playerTeamId);
  if (restante[pConf] == null || restante[pConf] < 1) {
    throw new Error(`Copa: cota inválida para a confederação da sua seleção (${pConf}).`);
  }
  /** @type {Set<string>} */
  const ids = new Set([playerTeamId]);
  restante[pConf]--;

  for (const k of ORDEM_CONFED_COPA_48) {
    const need = restante[k];
    for (let n = 0; n < need; n++) {
      const pool = (porConf[k] ?? []).filter((s) => !ids.has(s.id));
      if (!pool.length) {
        throw new Error(
          `Copa: não há seleções suficientes na confederação ${k} para preencher a cota (${need - n} vaga(s) em falta).`,
        );
      }
      const esc = escolherUmaSelecaoPesoInscricao(pool, rng);
      ids.add(esc.id);
    }
  }
  return Array.from(ids);
}

/**
 * Opções do sorteio das 48 vagas (modo Copa avulsa com cotas por confederação).
 * @typedef {{ vagasPorConfederacao: Record<string, number>, confederacaoDeId: (id: string) => string }} Sorteio48QuotasOpts
 */

/**
 * Escolhe 48 seleções: a do jogador entra sempre; as outras obedecem ao critério indicado em `opts`.
 *
 * - **Com `opts`**: cotas por confederação (ex.: mesmas da campanha); dentro de cada confederação,
 *   sorteio sem reposição com probabilidade proporcional a `pesoInscricaoCopa` (força dos titulares).
 * - **Sem `opts`**: legado — 47 vagas globais só por peso (não garante distribuição por confederação).
 *
 * @param {{ id: string, titulares: { ataque: number, defesa: number }[] }[]} todasSelecoes
 * @param {string} playerTeamId
 * @param {() => number} rng
 * @param {Sorteio48QuotasOpts} [opts]
 * @returns {string[]}
 */
export function sortear48IdsCopa(todasSelecoes, playerTeamId, rng, opts) {
  if (todasSelecoes.length < COPA_TOTAL_EQUIPES) {
    throw new Error(`Copa: são necessárias pelo menos ${COPA_TOTAL_EQUIPES} seleções no total.`);
  }
  if (!todasSelecoes.some((s) => s.id === playerTeamId)) {
    throw new Error("Copa: seleção do jogador não está no elenco mundial.");
  }
  if (opts?.vagasPorConfederacao && typeof opts.confederacaoDeId === "function") {
    return sortear48IdsCopaComQuotasInterno(
      todasSelecoes,
      playerTeamId,
      rng,
      opts.vagasPorConfederacao,
      opts.confederacaoDeId,
    );
  }
  /** @type {Set<string>} */
  const ids = new Set([playerTeamId]);
  while (ids.size < COPA_TOTAL_EQUIPES) {
    const candidatas = todasSelecoes.filter((s) => !ids.has(s.id));
    const esc = escolherUmaSelecaoPesoInscricao(candidatas, rng);
    ids.add(esc.id);
  }
  return Array.from(ids);
}

/**
 * Completa até {@link COPA_TOTAL_EQUIPES} seleções (mesmo peso que o sorteio da Copa), útil p.ex. para saves de campanha com 32 classificados.
 * @param {string[]} idsParciais
 * @param {{ id: string, titulares: { ataque: number, defesa: number }[] }[]} todasSelecoes
 * @param {() => number} rng
 * @returns {string[]}
 */
export function completarIdsCopaAte48(idsParciais, todasSelecoes, rng) {
  const ids = new Set(idsParciais);
  if (ids.size !== idsParciais.length) {
    throw new Error("Copa: lista de classificados com ids duplicados.");
  }
  while (ids.size < COPA_TOTAL_EQUIPES) {
    const candidatas = todasSelecoes.filter((s) => !ids.has(s.id));
    if (!candidatas.length) {
      throw new Error(`Copa: faltam seleções no elenco mundial para completar ${COPA_TOTAL_EQUIPES} vagas.`);
    }
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
 * @param {string[]} ids48 exatamente 48 ids de seleção
 * @param {() => number} rng
 * @returns {Record<string, string[]>}
 */
export function sortearGrupos(ids48, rng) {
  if (ids48.length !== COPA_TOTAL_EQUIPES) {
    throw new Error(`Copa: são necessárias exatamente ${COPA_TOTAL_EQUIPES} seleções.`);
  }
  const misturados = embaralhar(ids48, rng);
  /** @type {Record<string, string[]>} */
  const g = {};
  for (let i = 0; i < COPA_GRUPOS_LETRAS.length; i++) {
    const L = COPA_GRUPOS_LETRAS[i];
    g[L] = misturados.slice(i * 4, i * 4 + 4);
  }
  return g;
}

/**
 * Estado inicial do modo Copa com 48 seleções já definidas (ex.: classificados da campanha).
 * @param {string[]} ids48
 * @param {string} playerTeamId
 * @param {number} seed
 * @param {{ campanhaSelecaoId?: string | null, rng?: () => number }} [opts] se `campanhaSelecaoId` não estiver nas 48, entra em modo espectador (acompanhar a competição). Passe `rng` já consumido após o sorteio das 48 vagas para manter o mesmo fluxo aleatório.
 */
export function montarEstadoCopaCom48Ids(ids48, playerTeamId, seed, opts) {
  opts = opts ?? {};
  if (ids48.length !== COPA_TOTAL_EQUIPES) {
    throw new Error(`Copa: são necessárias exatamente ${COPA_TOTAL_EQUIPES} seleções.`);
  }
  /** @type {boolean} */
  let copaEspectadorCampanha = false;
  /** @type {string} */
  let effectivePlayerId = playerTeamId;
  if (opts.campanhaSelecaoId != null && opts.campanhaSelecaoId !== "") {
    const sid = opts.campanhaSelecaoId;
    if (ids48.includes(sid)) {
      effectivePlayerId = sid;
    } else {
      copaEspectadorCampanha = true;
      effectivePlayerId = ids48[0];
    }
  } else if (!ids48.includes(playerTeamId)) {
    throw new Error(`Copa: sua seleção precisa estar entre as ${COPA_TOTAL_EQUIPES}.`);
  }
  const rng = opts.rng ?? criarRng(seed >>> 0);
  const grupos = sortearGrupos(ids48, rng);
  /** @type {Record<string, ResultadoPartida[]>} */
  const partidasPorGrupo = {};
  for (const L of Object.keys(grupos)) {
    partidasPorGrupo[L] = partidasDoGrupo(grupos[L]);
  }
  let grupoPlayer = "A";
  for (const L of Object.keys(grupos)) {
    if (grupos[L].includes(effectivePlayerId)) {
      grupoPlayer = L;
      break;
    }
  }
  const quatro = grupos[grupoPlayer];
  const adversariosGrupo = adversariosNasRodadas(quatro, effectivePlayerId);
  return {
    rng,
    seed: seed >>> 0,
    grupos,
    partidasPorGrupo,
    playerTeamId: effectivePlayerId,
    copaEspectadorCampanha,
    selecaoCampanhaOrigem: opts.campanhaSelecaoId ?? effectivePlayerId,
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
    detalheEliminacaoCopa: null,
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
  /** @type {(fCasa: number, fFora: number, rng: () => number, bonusCasa?: number) => { gh: number, ga: number }} */
  simPlacarFn = simularPlacar,
  bonusMandanteGrupo = 0,
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
      const { gh, ga } = simPlacarFn(forcaFn(p.home), forcaFn(p.away), rng, bonusMandanteGrupo);
      aplicarResultadoNaLista(lista, p.home, p.away, gh, ga);
      if (aoSimularPartida) aoSimularPartida(L, p.home, p.away, gh, ga);
    }
  }
}

/**
 * Simula todos os jogos da rodada (1–3) em todos os grupos (ex.: modo espectador na Copa).
 * @param {Record<string, string[]>} grupos
 * @param {Record<string, ResultadoPartida[]>} partidasPorGrupo
 * @param {number} numeroRodada 1, 2 ou 3
 */
export function simularRodadaGruposCopaTodasAsPartidas(
  grupos,
  partidasPorGrupo,
  numeroRodada,
  forcaFn,
  rng,
  /** @type {((grupo: string, homeId: string, awayId: string, gh: number, ga: number) => void) | undefined} */
  aoSimularPartida,
  /** @type {(fCasa: number, fFora: number, rng: () => number, bonusCasa?: number) => { gh: number, ga: number }} */
  simPlacarFn = simularPlacar,
  bonusMandanteGrupo = 0,
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
      const { gh, ga } = simPlacarFn(forcaFn(p.home), forcaFn(p.away), rng, bonusMandanteGrupo);
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

/** Copa do Mundo: campo neutro — sem bônus ao “mandante” (slot casa só organiza a UI / chave). */
export const COPA_BONUS_MANDANTE_GRUPO = 0;

export const COPA_BONUS_MANDANTE_KO = 0;

export const COPA_BONUS_MANDANTE_FINAL = 0;

/**
 * Abaixo disto a força na simulação = valor linear (seleções mais fracas).
 * Acima: curva potência para separar melhor médios vs elites sem alterar a média mostrada ao jogador.
 */
const COPA_SIM_FORCA_REF = 52;

/** Expoente > 1 amplifica diferenças entre forças acima de `COPA_SIM_FORCA_REF`. */
const COPA_SIM_FORCA_POW = 1.17;

/**
 * Força efetiva na fórmula de λ da Copa. Valores menores → mais impacto da diferença (fCasa − fFora).
 */
const COPA_SIM_DIVISOR_FORCA = 7.25;

/**
 * Peso da diferença normalizada nas λ da Copa.
 */
const COPA_SIM_K_LAMBDA = 1.14;

/**
 * Mapeia a média de força do elenco (como em `forcaMediaSelecao`) para o eixo usado nas λ da Copa.
 * @param {number} f
 */
export function forcaEfetivaSimulacaoCopa(f) {
  if (f <= COPA_SIM_FORCA_REF) return f;
  return COPA_SIM_FORCA_REF + Math.pow(f - COPA_SIM_FORCA_REF, COPA_SIM_FORCA_POW);
}

/**
 * Copa do Mundo (simulação CPU): lambdas (Poisson) com diferença de qualidade bem marcada — mata-mata
 * em jogo único com λ baixos empurra seleções médias longe demais; base e divisor calibrados para
 * reduzir “árvores” improváveis sem campo neutro artificial.
 * @param {number} bonusCasa somado à força do slot “casa” (0 na Copa: neutro)
 */
export function simularPlacarCopaMundial(fCasa, fFora, rng, bonusCasa = 0) {
  const fc = forcaEfetivaSimulacaoCopa(fCasa) + bonusCasa;
  const fa = forcaEfetivaSimulacaoCopa(fFora);
  const diff = (fc - fa) / COPA_SIM_DIVISOR_FORCA;
  const base = 1.08;
  const lc = Math.max(0.14, base + diff * COPA_SIM_K_LAMBDA);
  const lv = Math.max(0.14, base - diff * COPA_SIM_K_LAMBDA);
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

/** Conjuntos de grupos cujo 3.º pode ocupar cada vaga na chave (Copa 2026, ordem dos jogos R32). */
const R32_SLOTS_TERCEIROS = [
  "ABCDEF",
  "CDFGH",
  "CEFHI",
  "EHIJK",
  "AEHIJ",
  "BEFIJ",
  "EFGIJ",
  "DEIJL",
].map((s) => new Set(s.split("")));

/** Legendas alinhadas ao calendário oficial da R32 (dezesseis-avos). */
export const ROTULOS_R32_FIFA_2026 = [
  "2.ºA × 2.ºB",
  "1.ºC × 2.ºF",
  "1.ºE × 3.º (A/B/C/D/E/F)",
  "1.ºF × 2.ºC",
  "2.ºE × 2.ºI",
  "1.ºI × 3.º (C/D/F/G/H)",
  "1.ºA × 3.º (C/E/F/H/I)",
  "1.ºL × 3.º (E/H/I/J/K)",
  "1.ºG × 3.º (A/E/H/I/J)",
  "1.ºD × 3.º (B/E/F/I/J)",
  "1.ºH × 2.ºJ",
  "2.ºK × 2.ºL",
  "1.ºB × 3.º (E/F/G/I/J)",
  "2.ºD × 2.ºG",
  "1.ºJ × 2.ºH",
  "1.ºK × 3.º (D/E/I/J/L)",
];

/**
 * Compara dois terceiros de grupos distintos (melhor = retorno positivo se `a` melhor que `b`).
 * @param {{ pts: number, sg: number, gf: number, gc: number, teamId: string }} a
 * @param {{ pts: number, sg: number, gf: number, gc: number, teamId: string }} b
 * @param {(id: string) => number} forcaFn “ranking FIFA” de desempate (usa força média do elenco).
 */
export function compararTerceiroEntreGruposFifa(a, b, forcaFn) {
  if (a.pts !== b.pts) return a.pts - b.pts;
  if (a.sg !== b.sg) return a.sg - b.sg;
  if (a.gf !== b.gf) return a.gf - b.gf;
  if (a.gc !== b.gc) return b.gc - a.gc;
  return forcaFn(a.teamId) - forcaFn(b.teamId);
}

/**
 * @param {{ letter: string, teamId: string, pts: number, sg: number, gf: number, gc: number }[]} qualificados8
 * @returns {string[]} teamId por índice de slot (0–7), na ordem usada em `montarPartidasRodada32`.
 */
function atribuirTerceirosAosSlotsR32(qualificados8) {
  if (qualificados8.length !== 8) {
    throw new Error("Copa: são necessários exatamente 8 terceiros classificados.");
  }
  const slotOrder = R32_SLOTS_TERCEIROS.map((set, i) => ({ i, size: set.size })).sort(
    (a, b) => a.size - b.size || a.i - b.i,
  );
  /** @type {(string | null)[]} */
  const assign = Array(8).fill(null);
  const used = new Set();

  function dfs(depth) {
    if (depth === 8) return true;
    const slotIdx = slotOrder[depth].i;
    const allow = R32_SLOTS_TERCEIROS[slotIdx];
    for (const t of qualificados8) {
      if (used.has(t.teamId)) continue;
      if (!allow.has(t.letter)) continue;
      used.add(t.teamId);
      assign[slotIdx] = t.teamId;
      if (dfs(depth + 1)) return true;
      used.delete(t.teamId);
      assign[slotIdx] = null;
    }
    return false;
  }

  if (!dfs(0)) {
    used.clear();
    assign.fill(null);
    for (let s = 0; s < 8; s++) {
      const allow = R32_SLOTS_TERCEIROS[s];
      const pick = qualificados8.find((t) => !used.has(t.teamId) && allow.has(t.letter));
      if (!pick) break;
      assign[s] = pick.teamId;
      used.add(pick.teamId);
    }
  }
  for (let i = 0; i < 8; i++) {
    if (!assign[i]) {
      throw new Error(`Copa 2026: impossível mapear os 8 terceiros aos lugares da chave (slot ${i}).`);
    }
  }
  return /** @type {string[]} */ (assign.slice());
}

/**
 * @param {Record<string, string[]>} ordemGrupos 1.º–4.º por letra (ids)
 * @param {string[]} terceirosPorSlot 8 ids na ordem dos slots R32
 */
export function montarPartidasRodada32(ordemGrupos, terceirosPorSlot) {
  const T = (/** @type {string} */ g, /** @type {1 | 2 | 3} */ p) => {
    const arr = ordemGrupos[g];
    return arr[p - 1];
  };
  const S = (/** @type {number} */ i) => terceirosPorSlot[i];
  return [
    { fase: /** @type {const} */ ("r32"), homeId: T("A", 2), awayId: T("B", 2), winnerId: null },
    { fase: "r32", homeId: T("C", 1), awayId: T("F", 2), winnerId: null },
    { fase: "r32", homeId: T("E", 1), awayId: S(0), winnerId: null },
    { fase: "r32", homeId: T("F", 1), awayId: T("C", 2), winnerId: null },
    { fase: "r32", homeId: T("E", 2), awayId: T("I", 2), winnerId: null },
    { fase: "r32", homeId: T("I", 1), awayId: S(1), winnerId: null },
    { fase: "r32", homeId: T("A", 1), awayId: S(2), winnerId: null },
    { fase: "r32", homeId: T("L", 1), awayId: S(3), winnerId: null },
    { fase: "r32", homeId: T("G", 1), awayId: S(4), winnerId: null },
    { fase: "r32", homeId: T("D", 1), awayId: S(5), winnerId: null },
    { fase: "r32", homeId: T("H", 1), awayId: T("J", 2), winnerId: null },
    { fase: "r32", homeId: T("K", 2), awayId: T("L", 2), winnerId: null },
    { fase: "r32", homeId: T("B", 1), awayId: S(6), winnerId: null },
    { fase: "r32", homeId: T("D", 2), awayId: T("G", 2), winnerId: null },
    { fase: "r32", homeId: T("J", 1), awayId: T("H", 2), winnerId: null },
    { fase: "r32", homeId: T("K", 1), awayId: S(7), winnerId: null },
  ];
}

/**
 * Monta classificação final dos grupos, escolhe os 8 melhores 3.ºs e gera os 16 jogos da rodada de 32.
 * @param {Record<string, string[]>} grupos
 * @param {Record<string, ResultadoPartida[]>} partidasPorGrupo
 * @param {() => number} rng
 * @param {(id: string) => number} forcaFn
 */
export function construirEliminatoriaCopa48(grupos, partidasPorGrupo, rng, forcaFn) {
  /** @type {Record<string, string[]>} */
  const ordemGrupos = {};
  /** @type {{ letter: string, teamId: string, pts: number, sg: number, gf: number, gc: number }[]} */
  const terceiros12 = [];
  for (const L of COPA_GRUPOS_LETRAS) {
    const ids = grupos[L];
    const lista = partidasPorGrupo[L] ?? [];
    const partidas = lista.filter((x) => x.gh >= 0);
    const o = ordenarGrupoFifa(ids, partidas, rng);
    ordemGrupos[L] = o;
    const tid = o[2];
    const agg = agregarClassificacao(ids, partidas)[tid];
    terceiros12.push({
      letter: L,
      teamId: tid,
      pts: agg.pts,
      sg: agg.sg,
      gf: agg.gf,
      gc: agg.gc,
    });
  }
  terceiros12.sort((a, b) => compararTerceiroEntreGruposFifa(b, a, forcaFn));
  const qual8 = terceiros12.slice(0, 8);
  const terceirosPorSlot = atribuirTerceirosAosSlotsR32(qual8);
  const r32 = montarPartidasRodada32(ordemGrupos, terceirosPorSlot);
  return { ordemGrupos, r32, terceirosClassificados: qual8, terceirosPorSlot };
}

/**
 * @param {Record<string, string[]>} grupos
 * @param {Record<string, ResultadoPartida[]>} partidasPorGrupo
 * @param {string} playerTeamId
 * @param {string} grupoPlayer
 * @param {() => number} rng
 * @param {(id: string) => number} forcaFn
 */
export function jogadorQualificaParaMataMata48(
  grupos,
  partidasPorGrupo,
  playerTeamId,
  grupoPlayer,
  rng,
  forcaFn,
) {
  const ids = grupos[grupoPlayer];
  const lista = (partidasPorGrupo[grupoPlayer] ?? []).filter((x) => x.gh >= 0);
  const ord = ordenarGrupoFifa(ids, lista, rng);
  const pos = ord.indexOf(playerTeamId);
  if (pos < 0) return false;
  if (pos <= 1) return true;
  if (pos >= 3) return false;
  /** @type {{ letter: string, teamId: string, pts: number, sg: number, gf: number, gc: number }[]} */
  const terceiros12 = [];
  for (const L of COPA_GRUPOS_LETRAS) {
    const gIds = grupos[L];
    const gList = (partidasPorGrupo[L] ?? []).filter((x) => x.gh >= 0);
    const o = ordenarGrupoFifa(gIds, gList, rng);
    const tid = o[2];
    const agg = agregarClassificacao(gIds, gList)[tid];
    terceiros12.push({
      letter: L,
      teamId: tid,
      pts: agg.pts,
      sg: agg.sg,
      gf: agg.gf,
      gc: agg.gc,
    });
  }
  terceiros12.sort((a, b) => compararTerceiroEntreGruposFifa(b, a, forcaFn));
  const top8 = new Set(terceiros12.slice(0, 8).map((t) => t.teamId));
  return top8.has(playerTeamId);
}

/**
 * Oitavas de final (16 seleções): vencedores da R32 em ordem dos jogos → 8 partidas.
 * @param {string[]} vencedoresR32 16 ids
 */
export function montarOitavasDezesseisAvos(vencedoresR32) {
  if (vencedoresR32.length !== 16) return [];
  /** @type {{ fase: "oitavas", homeId: string, awayId: string, winnerId: null }[]} */
  const out = [];
  for (let i = 0; i < 8; i++) {
    out.push({
      fase: "oitavas",
      homeId: vencedoresR32[i * 2],
      awayId: vencedoresR32[i * 2 + 1],
      winnerId: null,
    });
  }
  return out;
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

/** Quartas na ordem de `montarQuartasFifa` (cruzamento a partir das oitavas 1–8). */
export const ROTULOS_QUARTAS_FIFA = [
  "16-avos 1 × 16-avos 3",
  "16-avos 2 × 16-avos 4",
  "16-avos 5 × 16-avos 7",
  "16-avos 6 × 16-avos 8",
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
