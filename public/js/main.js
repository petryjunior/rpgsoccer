import { ZONE_LABEL, ZONES } from "./constants.js";
import {
  textoChuteParaForaAposDuelo,
  textoContextoPrimario,
  textoDueloGoleiro,
  textoResultadoPrimario,
  textoTransicaoGoleiro,
} from "./narrative.js";
import {
  chanceErrarFinalizacaoAposVencerGoleiro,
  escolherDuelistas,
  metricasDuelo,
  proximaZonaEPosse,
  proximoIntervaloMinutos,
  sortearAcrescimosTempo,
  sortearGoleiro,
  sortearZona,
  tipoFinalizacaoGoleiro,
} from "./match.js";
import { parametrosLetra } from "./qte.js";
import { ordenarPorPosicao } from "./squadSort.js";
import { gerarTime, validarElenco } from "./squad.js";

const els = {
  timeJogadorTit: document.getElementById("time-jogador-tit"),
  timeJogadorRes: document.getElementById("time-jogador-res"),
  timeCpuTit: document.getElementById("time-cpu-tit"),
  timeCpuRes: document.getElementById("time-cpu-res"),
  relogio: document.getElementById("relogio"),
  etapaTempo: document.getElementById("etapa-tempo"),
  placar: document.getElementById("placar"),
  subsInfo: document.getElementById("subs-info"),
  zonaBola: document.getElementById("zona-bola"),
  campoMarcadores: document.querySelectorAll(".campo-zona .marcador"),
  log: document.getElementById("log"),
  btnCentroRodada: document.getElementById("btn-centro-rodada"),
  dueloOverlay: document.getElementById("duelo-overlay"),
  faseIntroDuelo: document.getElementById("fase-intro-duelo"),
  faseAcaoInicioDuelo: document.getElementById("fase-acao-inicio-duelo"),
  btnIniciarDueloCampo: document.getElementById("btn-iniciar-duelo-campo"),
  faseTransicao: document.getElementById("fase-transicao"),
  faseQte: document.getElementById("fase-qte"),
  faseResultado: document.getElementById("fase-resultado"),
  dueloTitulo: document.getElementById("duelo-titulo"),
  dueloTexto: document.getElementById("duelo-texto"),
  dueloDetalhe: document.getElementById("duelo-detalhe"),
  transicaoTexto: document.getElementById("transicao-texto"),
  transicaoPar: document.getElementById("transicao-par"),
  btnEncararGoleiro: document.getElementById("btn-encarar-goleiro"),
  resultadoTexto: document.getElementById("resultado-texto"),
  qteReacao: document.getElementById("qte-reacao"),
  qteReacaoLabel: document.getElementById("qte-reacao-label"),
  qteReacaoSub: document.getElementById("qte-reacao-sub"),
  qteDica: document.getElementById("qte-dica"),
  btnFecharLance: document.getElementById("btn-fechar-lance"),
  golOverlay: document.getElementById("gol-overlay"),
  golTitulo: document.getElementById("gol-titulo"),
  golSub: document.getElementById("gol-sub"),
  btnGolOk: document.getElementById("btn-gol-ok"),
  intervaloBanner: document.getElementById("intervalo-banner"),
  dueloRpgStrip: document.getElementById("duelo-rpg-strip"),
  btnPausa: document.getElementById("btn-pausa"),
  pausePanel: document.getElementById("pause-panel"),
  pauseStats: document.getElementById("pause-stats"),
  btnContinuarPausa: document.getElementById("btn-continuar-pausa"),
};

const CANSACO_DUELO = 3;
const ATTR_MIN = 1;
const ATTR_MAX = 99;
const BONUS_STREAK_DUELO = 10;

/** @type {Map<string, { ataque: number, defesa: number }>} */
const statsBasePartida = new Map();
/** @type {Map<string, { ataque: number, defesa: number }>} vitórias seguidas por papel (ataque/defesa) */
const streakDueloPorJogador = new Map();
/** Tempo com o feedback na tela antes de seguir para o resultado (falha: tecla errada ou fim do tempo). */
const QTE_FEEDBACK_FALHA_MS = 1150;
const QTE_FEEDBACK_ACERTO_MS = 280;
/** Intervalo entre 3→2→1: um único valor sorteado por lance (mesmo tempo nos 3 passos). */
const QTE_COUNTDOWN_MS_MIN = 260;
const QTE_COUNTDOWN_MS_MAX = 2600;

function sortearIntervaloContagemQte() {
  const a = QTE_COUNTDOWN_MS_MIN;
  const b = QTE_COUNTDOWN_MS_MAX;
  return a + Math.floor(Math.random() * (b - a + 1));
}

/** Ex.: 800 ms → "0,8" para texto do QTE. */
function fmtSegundosAproximados(ms) {
  return (ms / 1000).toFixed(1).replace(".", ",");
}

/**
 * @param {object} jogador seu titular no lance
 * @param {object} adversario titular da CPU
 * @param {boolean} jogadorComBola
 */
function aplicarCansacoDueloCampo(jogador, adversario, jogadorComBola) {
  if (jogadorComBola) {
    jogador.ataque = Math.max(ATTR_MIN, jogador.ataque - CANSACO_DUELO);
    adversario.defesa = Math.max(ATTR_MIN, adversario.defesa - CANSACO_DUELO);
  } else {
    jogador.defesa = Math.max(ATTR_MIN, jogador.defesa - CANSACO_DUELO);
    adversario.ataque = Math.max(ATTR_MIN, adversario.ataque - CANSACO_DUELO);
  }
}

/** @param {object} atacante @param {object} goleiro */
function aplicarCansacoDueloGoleiro(atacante, goleiro) {
  atacante.ataque = Math.max(ATTR_MIN, atacante.ataque - CANSACO_DUELO);
  goleiro.defesa = Math.max(ATTR_MIN, goleiro.defesa - CANSACO_DUELO);
}

function snapshotStatsInicioPartida() {
  statsBasePartida.clear();
  streakDueloPorJogador.clear();
  for (const j of [
    ...timeJogador.titulares,
    ...timeJogador.reservas,
    ...timeCpu.titulares,
    ...timeCpu.reservas,
  ]) {
    statsBasePartida.set(j.id, { ataque: j.ataque, defesa: j.defesa });
  }
}

/**
 * @param {object} jogador
 * @param {"ataque" | "defesa"} papel stat usada na vitória
 */
function aplicarVitoriaStreak(jogador, papel) {
  let s = streakDueloPorJogador.get(jogador.id);
  if (!s) s = { ataque: 0, defesa: 0 };
  if (papel === "ataque") {
    s.defesa = 0;
    s.ataque += 1;
    if (s.ataque >= 2) {
      jogador.ataque = Math.min(ATTR_MAX, jogador.ataque + BONUS_STREAK_DUELO);
      s.ataque = 0;
    }
  } else {
    s.ataque = 0;
    s.defesa += 1;
    if (s.defesa >= 2) {
      jogador.defesa = Math.min(ATTR_MAX, jogador.defesa + BONUS_STREAK_DUELO);
      s.defesa = 0;
    }
  }
  streakDueloPorJogador.set(jogador.id, s);
}

/** @param {object} jogador */
function aplicarDerrotaStreak(jogador) {
  streakDueloPorJogador.delete(jogador.id);
}

/**
 * @param {object} eu
 * @param {object} ele
 * @param {boolean} euVenceu
 * @param {boolean} jogadorComBola perspectiva de `eu`: com bola usa ataque no duelo (campo ou chute ao gol).
 */
function registrarResultadoDuelo(eu, ele, euVenceu, jogadorComBola) {
  if (euVenceu) {
    aplicarDerrotaStreak(ele);
    aplicarVitoriaStreak(eu, jogadorComBola ? "ataque" : "defesa");
  } else {
    aplicarDerrotaStreak(eu);
    aplicarVitoriaStreak(ele, jogadorComBola ? "defesa" : "ataque");
  }
}

/**
 * @param {object} j
 * @param {"ataque" | "defesa"} attr
 */
function htmlStatVersusPartida(j, attr) {
  const v = j[attr];
  if (!partidaAtiva) return String(v);
  const b = statsBasePartida.get(j.id);
  if (!b) return String(v);
  const base = b[attr];
  const d = v - base;
  if (d === 0) return String(v);
  const cls = d < 0 ? "stat-delta-neg" : "stat-delta-pos";
  const par = d > 0 ? `+${d}` : String(d);
  return `${v}<span class="${cls}">(${par})</span>`;
}

let timeJogador = gerarTime();
let timeCpu = gerarTime();
let partidaAtiva = false;
let substituicoesUsadas = 0;
let substituicoesCpuUsadas = 0;
/** Após o 1º tempo, só avança o relógio para o 2º quando o jogador confirmar */
let segundoTempoAutorizado = false;
/** Acréscimos sorteados por partida: 1º tempo até 45+ap1; 2º até 90+ap2 */
let acrescimosPrimeiroTempo = 0;
let acrescimosSegundoTempo = 0;
/** No intervalo, relógio parado mas substituições liberadas */
let aguardandoSegundoTempo = false;
/** @type {(() => void) | null} */
let resolveSegundoTempo = null;
/** @type {ReturnType<typeof setTimeout> | null} */
let bannerEsconderTimer = null;
/** @type {{ id: string, lista: "tit" | "res" } | null} */
let selecaoSub = null;

let golsJogador = 0;
let golsCpu = 0;

/** @type {ReturnType<typeof setTimeout> | null} */
let qteTimerLate = null;
let tempoAnimando = false;
/** Pausa manual: relógio entre lances para; substituições e painel de stats */
let jogoPausado = false;

/** @type {{ minuto: number, posseJogador: boolean, proximaZona: string | null }} */
let estadoGlobal = { minuto: 0, posseJogador: true, proximaZona: null };

/** @type {object | null} */
let ctx = null;

/** Cancela listeners/timers do QTE se o modal fechar no meio do teste */
let cancelarInputQte = /** @type {null | (() => void)} */ (null);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlParaTextoLog(html) {
  const d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || "").replace(/\s+/g, " ").trim();
}

/** @param {{ nome: string }} j */
function spanNomeJogador(j) {
  const humano =
    timeJogador.titulares.includes(j) ||
    timeJogador.reservas.includes(j);
  const cls = humano ? "nm-time-jogador" : "nm-time-cpu";
  return `<span class="${cls}">${escapeHtml(j.nome)}</span>`;
}

/**
 * @param {object} jogador
 * @param {object} adversario
 * @param {boolean} jogadorComBola
 */
function pintarDueloRpgPrimario(jogador, adversario, jogadorComBola) {
  const el = els.dueloRpgStrip;
  el.hidden = false;
  if (jogadorComBola) {
    el.innerHTML = `
      <p class="duelo-rpg-contexto">Com a bola, o duelo compara seu <strong>ataque</strong> com a <strong>defesa</strong> do rival.</p>
      <div class="duelo-rpg-linhas">
        <div class="duelo-rpg-card seu">
          <div class="duelo-rpg-tag">Seu jogador</div>
          <div class="duelo-rpg-nome">${spanNomeJogador(jogador)} <span class="duelo-rpg-stat-sec">(${sigla(jogador.posicao)})</span></div>
          <div class="duelo-rpg-stat-destaque"><span class="lbl">Ataque (vale no lance)</span>${jogador.ataque}</div>
          <div class="duelo-rpg-stat-sec">Defesa ${jogador.defesa} (fora deste duelo)</div>
        </div>
        <div class="duelo-rpg-vs">×</div>
        <div class="duelo-rpg-card rival">
          <div class="duelo-rpg-tag">Adversário</div>
          <div class="duelo-rpg-nome">${spanNomeJogador(adversario)} <span class="duelo-rpg-stat-sec">(${sigla(adversario.posicao)})</span></div>
          <div class="duelo-rpg-stat-destaque"><span class="lbl">Defesa (vale no lance)</span>${adversario.defesa}</div>
          <div class="duelo-rpg-stat-sec">Ataque ${adversario.ataque}</div>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <p class="duelo-rpg-contexto">Sem a bola, o duelo compara sua <strong>defesa</strong> com o <strong>ataque</strong> do rival.</p>
      <div class="duelo-rpg-linhas">
        <div class="duelo-rpg-card seu">
          <div class="duelo-rpg-tag">Seu jogador</div>
          <div class="duelo-rpg-nome">${spanNomeJogador(jogador)} <span class="duelo-rpg-stat-sec">(${sigla(jogador.posicao)})</span></div>
          <div class="duelo-rpg-stat-destaque"><span class="lbl">Defesa (vale no lance)</span>${jogador.defesa}</div>
          <div class="duelo-rpg-stat-sec">Ataque ${jogador.ataque}</div>
        </div>
        <div class="duelo-rpg-vs">×</div>
        <div class="duelo-rpg-card rival">
          <div class="duelo-rpg-tag">Adversário</div>
          <div class="duelo-rpg-nome">${spanNomeJogador(adversario)} <span class="duelo-rpg-stat-sec">(${sigla(adversario.posicao)})</span></div>
          <div class="duelo-rpg-stat-destaque"><span class="lbl">Ataque (vale no lance)</span>${adversario.ataque}</div>
          <div class="duelo-rpg-stat-sec">Defesa ${adversario.defesa}</div>
        </div>
      </div>`;
  }
}

function pintarDueloRpgGoleiro(atacante, goleiro, chuteJogador) {
  const el = els.dueloRpgStrip;
  el.hidden = false;
  if (chuteJogador) {
    el.innerHTML = `
      <p class="duelo-rpg-contexto"><strong>Chute:</strong> ataque do finalizador × defesa do goleiro.</p>
      <div class="duelo-rpg-linhas">
        <div class="duelo-rpg-card seu">
          <div class="duelo-rpg-tag">Finalização</div>
          <div class="duelo-rpg-nome">${spanNomeJogador(atacante)}</div>
          <div class="duelo-rpg-stat-destaque"><span class="lbl">Ataque</span>${atacante.ataque}</div>
          <div class="duelo-rpg-stat-sec">Defesa ${atacante.defesa}</div>
        </div>
        <div class="duelo-rpg-vs">×</div>
        <div class="duelo-rpg-card rival">
          <div class="duelo-rpg-tag">Goleiro</div>
          <div class="duelo-rpg-nome">${spanNomeJogador(goleiro)}</div>
          <div class="duelo-rpg-stat-destaque"><span class="lbl">Defesa</span>${goleiro.defesa}</div>
          <div class="duelo-rpg-stat-sec">Ataque ${goleiro.ataque}</div>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <p class="duelo-rpg-contexto"><strong>Defesa do gol:</strong> sua defesa de goleiro × ataque do chutador.</p>
      <div class="duelo-rpg-linhas">
        <div class="duelo-rpg-card seu">
          <div class="duelo-rpg-tag">Seu goleiro</div>
          <div class="duelo-rpg-nome">${spanNomeJogador(goleiro)}</div>
          <div class="duelo-rpg-stat-destaque"><span class="lbl">Defesa</span>${goleiro.defesa}</div>
          <div class="duelo-rpg-stat-sec">Ataque ${goleiro.ataque}</div>
        </div>
        <div class="duelo-rpg-vs">×</div>
        <div class="duelo-rpg-card rival">
          <div class="duelo-rpg-tag">Atacante</div>
          <div class="duelo-rpg-nome">${spanNomeJogador(atacante)}</div>
          <div class="duelo-rpg-stat-destaque"><span class="lbl">Ataque</span>${atacante.ataque}</div>
          <div class="duelo-rpg-stat-sec">Defesa ${atacante.defesa}</div>
        </div>
      </div>`;
  }
}

function formatMinuto(m) {
  return `${Math.floor(m)}′`;
}

function labelEtapa(/** @type {number} */ _minuto) {
  if (!segundoTempoAutorizado) return "1º tempo";
  return "2º tempo";
}

function minutoFimPrimeiroTempo() {
  return 45 + acrescimosPrimeiroTempo;
}

function minutoFimJogo() {
  return 90 + acrescimosSegundoTempo;
}

function sigla(pos) {
  const m = { goleiro: "GOL", zagueiro: "ZAG", meia: "MEI", atacante: "ATA" };
  return m[pos] || pos;
}

/**
 * @param {boolean} listaDoTimeHumano — true = painel esquerdo (seu time)
 */
function renderLista(ul, jogadores, destaqueId, listaDoTimeHumano) {
  ul.innerHTML = "";
  const ord = ordenarPorPosicao(jogadores);
  const clsNome = listaDoTimeHumano ? "nm-time-jogador" : "nm-time-cpu";
  for (const j of ord) {
    const li = document.createElement("li");
    li.dataset.id = j.id;
    if (j.id === destaqueId) li.classList.add("em-lance");
    const stA = htmlStatVersusPartida(j, "ataque");
    const stD = htmlStatVersusPartida(j, "defesa");
    li.innerHTML = `<span class="sigla">${sigla(j.posicao)}</span> <span class="nome ${clsNome}">${escapeHtml(j.nome)}</span><span class="stats"> ${stA}/${stD}</span>`;
    ul.appendChild(li);
  }
}

function renderEscalacoes(destaque) {
  renderLista(els.timeJogadorTit, timeJogador.titulares, destaque?.jogador, true);
  renderLista(els.timeJogadorRes, timeJogador.reservas, null, true);
  renderLista(els.timeCpuTit, timeCpu.titulares, destaque?.adversario, false);
  renderLista(els.timeCpuRes, timeCpu.reservas, null, false);
  atualizarSubsHud();
}

function atualizarSubsHud() {
  if (!partidaAtiva) {
    els.subsInfo.textContent = "Pré-jogo: escalação livre";
    return;
  }
  els.subsInfo.textContent = `Você ${substituicoesUsadas}/5 · CPU ${substituicoesCpuUsadas}/5`;
}

function atualizarBtnCentroRodada() {
  const el = els.btnCentroRodada;
  if (!partidaAtiva) {
    el.hidden = false;
    el.disabled = false;
    el.textContent = "Iniciar partida";
    el.classList.remove("sec");
    el.classList.add("pri");
    return;
  }
  if (aguardandoSegundoTempo && resolveSegundoTempo) {
    el.hidden = false;
    el.disabled = false;
    el.textContent = "Começar 2º tempo";
    el.classList.add("pri");
    return;
  }
  el.hidden = true;
  el.disabled = true;
}

function setZonaVisual(zona) {
  els.campoMarcadores.forEach((el) => {
    el.classList.toggle("ativo", Boolean(zona) && el.dataset.zona === zona);
  });
  els.zonaBola.textContent = zona ? ZONE_LABEL[zona] : "—";
}

function appendLog(html) {
  const p = document.createElement("p");
  p.innerHTML = html;
  els.log.prepend(p);
  while (els.log.children.length > 14) {
    els.log.removeChild(els.log.lastChild);
  }
}

/**
 * @param {"campo_pre_qte" | "qte_campo" | "qte" | "transicao" | "resultado" | "reset"} fase
 */
function mostrarFaseModal(fase) {
  const intro = els.faseIntroDuelo;
  const acaoInicio = els.faseAcaoInicioDuelo;
  const qte = els.faseQte;
  const trans = els.faseTransicao;
  const res = els.faseResultado;
  if (fase === "campo_pre_qte") {
    intro.hidden = false;
    acaoInicio.hidden = false;
    qte.hidden = true;
    trans.hidden = true;
    res.hidden = true;
    return;
  }
  if (fase === "qte_campo") {
    intro.hidden = false;
    acaoInicio.hidden = true;
    qte.hidden = false;
    trans.hidden = true;
    res.hidden = true;
    return;
  }
  if (fase === "qte") {
    intro.hidden = true;
    acaoInicio.hidden = true;
    qte.hidden = false;
    trans.hidden = true;
    res.hidden = true;
    return;
  }
  if (fase === "transicao") {
    intro.hidden = true;
    acaoInicio.hidden = true;
    qte.hidden = true;
    trans.hidden = false;
    res.hidden = true;
    return;
  }
  if (fase === "resultado") {
    intro.hidden = true;
    acaoInicio.hidden = true;
    qte.hidden = true;
    trans.hidden = true;
    res.hidden = false;
    return;
  }
  intro.hidden = false;
  acaoInicio.hidden = true;
  qte.hidden = true;
  trans.hidden = true;
  res.hidden = true;
}

function pararQte() {
  if (qteTimerLate !== null) {
    clearTimeout(qteTimerLate);
    qteTimerLate = null;
  }
}

/**
 * QTE: letra aleatória A–Z; acertar a tecla no prazo (tempo depende dos atributos).
 * @param {{ letra: string, tempoLimiteMs: number }} params
 * @param {(acertou: boolean) => void} onFim
 * @param {{ indice: number, total: number } | undefined} opts sequência (ex.: 2 de 3)
 */
function iniciarQteLetra(params, onFim, opts) {
  pararQte();
  const { letra, tempoLimiteMs } = params;
  const alvo = letra.toLowerCase();
  const painel = els.qteReacao;
  const label = els.qteReacaoLabel;
  const sub = els.qteReacaoSub;
  let resolvido = false;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let feedbackTimer = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let countdownLate = null;

  const pularContagem =
    opts != null && opts.total > 1 && opts.indice > 1;
  const intervaloContagemMs = pularContagem ? 0 : sortearIntervaloContagemQte();
  const seg = (tempoLimiteMs / 1000).toFixed(1);
  const textoInstrucao =
    opts != null && opts.total > 1
      ? `Letra ${opts.indice} de ${opts.total} — ${seg} s para acertar.`
      : `Pressione essa letra (${seg} s).`;

  painel.classList.remove("falha", "qte-feedback-acerto", "qte-countdown");
  label.textContent = "";
  sub.textContent = pularContagem ? textoInstrucao : "Prepare-se…";
  painel.setAttribute(
    "aria-label",
    pularContagem
      ? `Pressione a tecla ${letra} no teclado.`
      : "Contagem regressiva antes da letra.",
  );
  painel.focus();

  function detachListeners() {
    window.removeEventListener("keydown", keyHandler, true);
  }

  function limparContagem() {
    if (countdownLate !== null) {
      clearTimeout(countdownLate);
      countdownLate = null;
    }
  }

  function limparFeedbackAgendado() {
    if (feedbackTimer !== null) {
      clearTimeout(feedbackTimer);
      feedbackTimer = null;
    }
  }

  cancelarInputQte = () => {
    if (resolvido) return;
    limparContagem();
    limparFeedbackAgendado();
    resolvido = true;
    detachListeners();
    pararQte();
    painel.classList.remove("falha", "qte-feedback-acerto", "qte-countdown");
    cancelarInputQte = null;
  };

  function finalizar(acertou) {
    if (resolvido) return;
    resolvido = true;
    limparContagem();
    limparFeedbackAgendado();
    detachListeners();
    pararQte();
    painel.classList.remove("falha", "qte-feedback-acerto", "qte-countdown");
    cancelarInputQte = null;
    onFim(acertou);
  }

  function agendarFeedbackFinal(acertou) {
    limparFeedbackAgendado();
    const espera = acertou ? QTE_FEEDBACK_ACERTO_MS : QTE_FEEDBACK_FALHA_MS;
    feedbackTimer = setTimeout(() => {
      feedbackTimer = null;
      finalizar(acertou);
    }, espera);
  }

  function keyHandler(e) {
    if (resolvido || feedbackTimer !== null) return;
    if (e.repeat) return;
    const k = e.key;
    if (k.length !== 1) return;
    const ch = k.toLowerCase();
    if (ch < "a" || ch > "z") return;
    e.preventDefault();
    e.stopPropagation();
    if (ch === alvo) {
      detachListeners();
      pararQte();
      painel.classList.remove("falha", "qte-countdown");
      painel.classList.add("qte-feedback-acerto");
      sub.textContent = "Acerto!";
      label.textContent = letra;
      agendarFeedbackFinal(true);
      return;
    }
    detachListeners();
    pararQte();
    label.textContent = letra;
    sub.textContent = "Errado!";
    painel.classList.add("falha");
    painel.classList.remove("qte-feedback-acerto", "qte-countdown");
    agendarFeedbackFinal(false);
  }

  function comecarFaseTecla() {
    if (resolvido) return;
    limparContagem();
    painel.classList.remove("qte-countdown");
    label.textContent = letra;
    painel.setAttribute("aria-label", `Pressione a tecla ${letra} no teclado.`);
    sub.textContent = textoInstrucao;

    window.addEventListener("keydown", keyHandler, true);

    qteTimerLate = setTimeout(() => {
      if (resolvido || feedbackTimer !== null) return;
      detachListeners();
      sub.textContent = "Tempo esgotado!";
      painel.classList.add("falha");
      painel.classList.remove("qte-feedback-acerto", "qte-countdown");
      agendarFeedbackFinal(false);
    }, tempoLimiteMs);
  }

  function tickContagem(n) {
    if (resolvido) return;
    if (n <= 0) {
      comecarFaseTecla();
      return;
    }
    painel.classList.add("qte-countdown");
    label.textContent = String(n);
    sub.textContent = "Prepare-se…";
    painel.setAttribute("aria-label", `Contagem: ${n}.`);
    countdownLate = setTimeout(() => {
      countdownLate = null;
      tickContagem(n - 1);
    }, intervaloContagemMs);
  }

  if (pularContagem) {
    label.textContent = letra;
    comecarFaseTecla();
  } else {
    tickContagem(3);
  }
}

/**
 * Vários QTEs em sequência; só chama onFim(true) se todos forem acertados.
 * @param {{ letra: string, tempoLimiteMs: number }[]} paramsArr
 * @param {(acertou: boolean) => void} onFim
 */
function iniciarQteLetraSequencia(paramsArr, onFim) {
  if (paramsArr.length === 0) {
    onFim(false);
    return;
  }
  if (paramsArr.length === 1) {
    iniciarQteLetra(paramsArr[0], onFim);
    return;
  }
  const total = paramsArr.length;
  let i = 0;
  function proximo(acertou) {
    if (!acertou) {
      onFim(false);
      return;
    }
    i++;
    if (i >= total) {
      onFim(true);
      return;
    }
    iniciarQteLetra(paramsArr[i], proximo, { indice: i + 1, total });
  }
  iniciarQteLetra(paramsArr[0], proximo, { indice: 1, total });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Avança o tempo de jogo só enquanto não pausado e a partida segue ativa. */
async function sleepRespeitandoPausa(ms) {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {
    while (jogoPausado && partidaAtiva) {
      await sleep(40);
    }
    if (!partidaAtiva) return;
    const resta = fim - Date.now();
    if (resta <= 0) break;
    await sleep(Math.min(80, resta));
  }
}

/** @param {{ ataque: number, defesa: number }[]} titulares */
function mediasTitulares(titulares) {
  const n = titulares.length || 1;
  let a = 0;
  let d = 0;
  for (const j of titulares) {
    a += j.ataque;
    d += j.defesa;
  }
  return { atq: a / n, def: d / n, somaAtq: a, somaDef: d };
}

function pintarEstatisticasPausa() {
  const sj = mediasTitulares(timeJogador.titulares);
  const sc = mediasTitulares(timeCpu.titulares);
  const posseQuem = estadoGlobal.posseJogador ? "Você" : "Adversário";
  const minTxt = formatMinuto(estadoGlobal.minuto);
  const etapa = labelEtapa(estadoGlobal.minuto);
  els.pauseStats.innerHTML = `
    <table>
      <tbody>
        <tr><th scope="row">Minuto</th><td class="num">${minTxt}</td></tr>
        <tr><th scope="row">Etapa</th><td>${escapeHtml(etapa)}</td></tr>
        <tr><th scope="row">Placar</th><td class="num">${golsJogador} × ${golsCpu}</td></tr>
        <tr><th scope="row">Posse (próximo lance)</th><td>${escapeHtml(posseQuem)}</td></tr>
        <tr><th scope="row">Substituições</th><td class="num">${substituicoesUsadas} / 5 (você) · ${substituicoesCpuUsadas} / 5 (CPU)</td></tr>
      </tbody>
    </table>
    <p class="pause-stats-elenco"><strong>Seus titulares</strong> — média ataque ${sj.atq.toFixed(1)}, média defesa ${sj.def.toFixed(1)} (soma ${sj.somaAtq}/${sj.somaDef}).</p>
    <p class="pause-stats-elenco"><strong>Titulares do adversário</strong> — média ataque ${sc.atq.toFixed(1)}, média defesa ${sc.def.toFixed(1)} (soma ${sc.somaAtq}/${sc.somaDef}).</p>
  `;
}

function sincronizarUiPausa() {
  els.pausePanel.hidden = !jogoPausado;
  const podePausar =
    partidaAtiva &&
    els.dueloOverlay.hidden &&
    !jogoPausado &&
    !aguardandoSegundoTempo &&
    els.golOverlay.hidden;
  els.btnPausa.hidden = !podePausar;
}

function mostrarBannerIntervalo() {
  els.intervaloBanner.hidden = false;
  if (bannerEsconderTimer !== null) {
    clearTimeout(bannerEsconderTimer);
    bannerEsconderTimer = null;
  }
  bannerEsconderTimer = setTimeout(() => {
    els.intervaloBanner.hidden = true;
    bannerEsconderTimer = null;
  }, 10000);
}

function esconderUiIntervalo() {
  els.intervaloBanner.hidden = true;
  if (bannerEsconderTimer !== null) {
    clearTimeout(bannerEsconderTimer);
    bannerEsconderTimer = null;
  }
  atualizarBtnCentroRodada();
}

function tentarSubstituicaoCpu() {
  if (substituicoesCpuUsadas >= 5) return;
  if (Math.random() > 0.42) return;
  for (let k = 0; k < 45; k++) {
    const ti = Math.floor(Math.random() * 11);
    const ri = Math.floor(Math.random() * 11);
    const tit = timeCpu.titulares[ti];
    const res = timeCpu.reservas[ri];
    [timeCpu.titulares[ti], timeCpu.reservas[ri]] = [timeCpu.reservas[ri], timeCpu.titulares[ti]];
    const v = validarElenco(timeCpu.titulares, timeCpu.reservas);
    if (v.ok) {
      substituicoesCpuUsadas++;
      appendLog(`Substituição do adversário: ${res.nome} entra no lugar de ${tit.nome}.`);
      atualizarSubsHud();
      renderEscalacoes(null);
      return;
    }
    [timeCpu.titulares[ti], timeCpu.reservas[ri]] = [timeCpu.reservas[ri], timeCpu.titulares[ti]];
  }
}

/**
 * Pausa o relógio até o jogador clicar em “Começar 2º tempo” (fora de qualquer pop-up).
 */
function aguardarSegundoTempo() {
  aguardandoSegundoTempo = true;
  sincronizarUiPausa();
  tentarSubstituicaoCpu();
  mostrarBannerIntervalo();
  appendLog(
    "<strong>Intervalo.</strong> O relógio está parado — faça substituições e use o botão <strong>Começar 2º tempo</strong> no centro da tela.",
  );
  return new Promise((resolve) => {
    resolveSegundoTempo = resolve;
    atualizarBtnCentroRodada();
  });
}

/**
 * @param {number} de minuto atual (relógio parado no lance)
 * @param {number} ate próximo minuto do lance
 */
async function animarTempoJogo(de, ate) {
  tempoAnimando = true;
  let m = Math.floor(de);
  const alvoBruto = Math.floor(ate);
  const teto2 = minutoFimJogo();
  const alvo =
    segundoTempoAutorizado ? Math.min(alvoBruto, teto2) : alvoBruto;
  const fim1 = minutoFimPrimeiroTempo();
  const msPorMinuto = 1200;

  while (m < alvo) {
    if (m === fim1 && alvo > fim1 && !segundoTempoAutorizado) {
      tempoAnimando = false;
      await aguardarSegundoTempo();
      segundoTempoAutorizado = true;
      aguardandoSegundoTempo = false;
      tempoAnimando = true;
      tentarSubstituicaoCpu();
      atualizarBtnCentroRodada();
      m = 45;
    }
    m++;
    els.relogio.textContent = formatMinuto(m);
    els.etapaTempo.textContent = labelEtapa(m);
    await sleepRespeitandoPausa(msPorMinuto);
  }

  tempoAnimando = false;
}

function limparSelecaoSub() {
  document.querySelectorAll(".lista-jogadores li.sel-sub").forEach((li) => li.classList.remove("sel-sub"));
  selecaoSub = null;
}

function ligarCliquesSubstituicao() {
  [els.timeJogadorTit, els.timeJogadorRes].forEach((ul) => {
    ul.addEventListener("click", (ev) => {
      const li = ev.target.closest("li");
      if (!li) return;

      if (!jogoPausado && partidaAtiva && !els.dueloOverlay.hidden) return;
      if (partidaAtiva && substituicoesUsadas >= 5) return;

      const id = li.dataset.id;
      const lista = ul === els.timeJogadorTit ? "tit" : "res";

      if (!selecaoSub) {
        selecaoSub = { id, lista };
        li.classList.add("sel-sub");
        return;
      }

      if (selecaoSub.id === id && selecaoSub.lista === lista) {
        li.classList.remove("sel-sub");
        selecaoSub = null;
        return;
      }

      if (selecaoSub.lista === lista) {
        limparSelecaoSub();
        selecaoSub = { id, lista };
        li.classList.add("sel-sub");
        return;
      }

      const titId = selecaoSub.lista === "tit" ? selecaoSub.id : id;
      const resId = selecaoSub.lista === "res" ? selecaoSub.id : id;
      const ti = timeJogador.titulares.findIndex((j) => j.id === titId);
      const ri = timeJogador.reservas.findIndex((j) => j.id === resId);
      if (ti < 0 || ri < 0) {
        limparSelecaoSub();
        return;
      }

      const tit = timeJogador.titulares[ti];
      const res = timeJogador.reservas[ri];
      [timeJogador.titulares[ti], timeJogador.reservas[ri]] = [timeJogador.reservas[ri], timeJogador.titulares[ti]];

      const v = validarElenco(timeJogador.titulares, timeJogador.reservas);
      if (!v.ok) {
        [timeJogador.titulares[ti], timeJogador.reservas[ri]] = [timeJogador.reservas[ri], timeJogador.titulares[ti]];
        alert(v.msg);
        limparSelecaoSub();
        return;
      }

      if (partidaAtiva) {
        substituicoesUsadas++;
      }
      atualizarSubsHud();
      if (jogoPausado) pintarEstatisticasPausa();
      limparSelecaoSub();
      renderEscalacoes(null);
      appendLog(`Substituição: ${res.nome} entra no lugar de ${tit.nome}.`);
    });
  });
}

els.btnCentroRodada.addEventListener("click", () => {
  if (resolveSegundoTempo) {
    const r = resolveSegundoTempo;
    resolveSegundoTempo = null;
    aguardandoSegundoTempo = false;
    tentarSubstituicaoCpu();
    appendLog("2º tempo autorizado — o relógio volta a correr.");
    sincronizarUiPausa();
    atualizarBtnCentroRodada();
    r();
    return;
  }
  if (!partidaAtiva) {
    iniciarPartida();
  }
});

function alternarPausaPorTecla() {
  if (jogoPausado) {
    jogoPausado = false;
    sincronizarUiPausa();
    return;
  }
  if (
    !partidaAtiva ||
    !els.dueloOverlay.hidden ||
    aguardandoSegundoTempo ||
    !els.golOverlay.hidden
  ) {
    return;
  }
  jogoPausado = true;
  pintarEstatisticasPausa();
  sincronizarUiPausa();
}

els.btnPausa.addEventListener("click", () => {
  jogoPausado = true;
  pintarEstatisticasPausa();
  sincronizarUiPausa();
});

els.btnContinuarPausa.addEventListener("click", () => {
  jogoPausado = false;
  sincronizarUiPausa();
});

window.addEventListener("keydown", (e) => {
  if (e.code !== "Escape") return;
  if (!partidaAtiva) return;
  if (!jogoPausado && (!els.dueloOverlay.hidden || aguardandoSegundoTempo || !els.golOverlay.hidden)) {
    return;
  }
  e.preventDefault();
  alternarPausaPorTecla();
}, true);

function abrirModalLance(lance) {
  ctx = {
    minuto: lance.minuto,
    zona: lance.zona,
    jogador: lance.jogador,
    adversario: lance.adversario,
    jogadorComBola: lance.jogadorComBola,
    venceuPrim: false,
    tipoGol: null,
    forwardChute: null,
    goleiroDefesa: null,
    linhasResultado: [],
    _teveGol: false,
    golParaJogador: false,
  };

  els.dueloOverlay.hidden = false;
  els.dueloTitulo.textContent = "Lance importante";
  const ctxo = textoContextoPrimario(
    {
      zona: lance.zona,
      jogador: lance.jogador,
      adversario: lance.adversario,
      jogadorComBola: lance.jogadorComBola,
    },
    spanNomeJogador,
  );
  els.dueloTexto.innerHTML = `<strong>${formatMinuto(lance.minuto)}</strong> — ${ctxo}`;
  els.dueloDetalhe.innerHTML = `${spanNomeJogador(lance.jogador)} (${sigla(lance.jogador.posicao)}) × ${spanNomeJogador(lance.adversario)} (${sigla(lance.adversario.posicao)})`;
  pintarDueloRpgPrimario(lance.jogador, lance.adversario, lance.jogadorComBola);
  setZonaVisual(lance.zona);
  renderEscalacoes({ jogador: lance.jogador.id, adversario: lance.adversario.id });
  sincronizarUiPausa();

  mostrarFaseModal("campo_pre_qte");
  const metCampo = metricasDuelo(ctx.jogador, ctx.adversario, ctx.jogadorComBola);
  const letraParamsCampo = parametrosLetra(metCampo.ratio);
  els.qteDica.textContent = `Você tem ~${fmtSegundosAproximados(letraParamsCampo.tempoLimiteMs)} s para pressionar a tecla certa.`;

  ctx.iniciarQteCampo = () => {
    mostrarFaseModal("qte_campo");
    iniciarQteLetra(letraParamsCampo, (acertou) => {
    aplicarCansacoDueloCampo(ctx.jogador, ctx.adversario, ctx.jogadorComBola);
    registrarResultadoDuelo(ctx.jogador, ctx.adversario, acertou, ctx.jogadorComBola);
    ctx.venceuPrim = acertou;
    ctx.linhasResultado = [];
    ctx.linhasResultado.push(
      textoContextoPrimario(
        {
          zona: ctx.zona,
          jogador: ctx.jogador,
          adversario: ctx.adversario,
          jogadorComBola: ctx.jogadorComBola,
        },
        spanNomeJogador,
      ),
    );
    ctx.linhasResultado.push(
      textoResultadoPrimario(
        {
          zona: ctx.zona,
          jogador: ctx.jogador,
          adversario: ctx.adversario,
          venceu: acertou,
          jogadorComBola: ctx.jogadorComBola,
        },
        spanNomeJogador,
      ),
    );

    const tipo = tipoFinalizacaoGoleiro(ctx.zona, acertou);
    if (tipo) {
      ctx.tipoGol = tipo;
      if (tipo === "jogador_chuta") {
        ctx.forwardChute = ctx.jogador;
        ctx.goleiroDefesa = sortearGoleiro(timeCpu.titulares);
      } else {
        ctx.forwardChute = ctx.adversario;
        ctx.goleiroDefesa = sortearGoleiro(timeJogador.titulares);
      }
      if (!ctx.goleiroDefesa) {
        encerrarComErro("Sem goleiro titular para o duelo na área.");
        return;
      }

      ctx.linhasResultado.push(textoTransicaoGoleiro(tipo === "jogador_chuta"));
      els.dueloTitulo.textContent = "Finalização";
      els.transicaoTexto.textContent = textoTransicaoGoleiro(tipo === "jogador_chuta");
      els.transicaoPar.innerHTML =
        tipo === "jogador_chuta"
          ? `${spanNomeJogador(ctx.forwardChute)} × ${spanNomeJogador(ctx.goleiroDefesa)}`
          : `${spanNomeJogador(ctx.goleiroDefesa)} × ${spanNomeJogador(ctx.forwardChute)}`;
      els.btnEncararGoleiro.textContent =
        tipo === "jogador_chuta" ? "Encarar o goleiro" : "Defender";

      renderEscalacoes({
        jogador: tipo === "jogador_chuta" ? ctx.forwardChute.id : ctx.goleiroDefesa.id,
        adversario: tipo === "jogador_chuta" ? ctx.goleiroDefesa.id : ctx.forwardChute.id,
      });
      pintarDueloRpgGoleiro(ctx.forwardChute, ctx.goleiroDefesa, tipo === "jogador_chuta");
      mostrarFaseModal("transicao");
      return;
    }

    const nz = proximaZonaEPosse(ctx.zona, acertou, ctx.jogadorComBola);
    estadoGlobal.posseJogador = nz.posseJogador;
    estadoGlobal.proximaZona = nz.proximaZona;
    mostrarResultadoFinal(false, false);
  });
  };

  requestAnimationFrame(() => {
    els.btnIniciarDueloCampo.focus();
  });
}

function fecharModalLance() {
  if (cancelarInputQte) cancelarInputQte();
  els.dueloOverlay.hidden = true;
  els.dueloRpgStrip.hidden = true;
  els.dueloRpgStrip.innerHTML = "";
  mostrarFaseModal("reset");
  pararQte();
  ctx = null;
  sincronizarUiPausa();
}

function iniciarQteGoleiro() {
  if (!ctx || !ctx.tipoGol) return;
  mostrarFaseModal("qte");
  const chuteJogador = ctx.tipoGol === "jogador_chuta";
  pintarDueloRpgGoleiro(ctx.forwardChute, ctx.goleiroDefesa, chuteJogador);
  let eu;
  let ele;
  let comBola;
  if (chuteJogador) {
    eu = ctx.forwardChute;
    ele = ctx.goleiroDefesa;
    comBola = true;
  } else {
    eu = ctx.goleiroDefesa;
    ele = ctx.forwardChute;
    comBola = false;
  }
  const met = metricasDuelo(eu, ele, comBola);

  function aoFimGoleiro(/** @type {boolean} */ acertou) {
    aplicarCansacoDueloGoleiro(ctx.forwardChute, ctx.goleiroDefesa);
    registrarResultadoDuelo(eu, ele, acertou, comBola);
    const fmt = spanNomeJogador;
    const pBase = {
      chuteJogador,
      atacante: ctx.forwardChute,
      goleiro: ctx.goleiroDefesa,
    };
    const erraAposVencerGoleiro = (atacante) =>
      Math.random() < chanceErrarFinalizacaoAposVencerGoleiro(atacante.ataque);

    let teveGol = false;

    if (chuteJogador && acertou) {
      if (erraAposVencerGoleiro(ctx.forwardChute)) {
        ctx.linhasResultado.push(textoChuteParaForaAposDuelo(ctx.forwardChute, fmt));
        ctx.golParaJogador = false;
        estadoGlobal.posseJogador = false;
      } else {
        ctx.linhasResultado.push(textoDueloGoleiro({ ...pBase, venceu: true }, fmt));
        golsJogador++;
        teveGol = true;
        ctx.golParaJogador = true;
        estadoGlobal.posseJogador = false;
      }
    } else if (chuteJogador && !acertou) {
      ctx.linhasResultado.push(textoDueloGoleiro({ ...pBase, venceu: false }, fmt));
      ctx.golParaJogador = false;
      estadoGlobal.posseJogador = false;
    } else if (!chuteJogador && acertou) {
      ctx.linhasResultado.push(textoDueloGoleiro({ ...pBase, venceu: true }, fmt));
      ctx.golParaJogador = false;
      estadoGlobal.posseJogador = true;
    } else {
      if (erraAposVencerGoleiro(ctx.forwardChute)) {
        ctx.linhasResultado.push(textoChuteParaForaAposDuelo(ctx.forwardChute, fmt));
        ctx.golParaJogador = false;
        estadoGlobal.posseJogador = true;
      } else {
        ctx.linhasResultado.push(textoDueloGoleiro({ ...pBase, venceu: false }, fmt));
        golsCpu++;
        teveGol = true;
        ctx.golParaJogador = false;
        estadoGlobal.posseJogador = true;
      }
    }

    estadoGlobal.proximaZona = ZONES.MEIO_CAMPO;
    mostrarResultadoFinal(teveGol, ctx.golParaJogador);
  }

  if (chuteJogador) {
    const seq = [
      parametrosLetra(met.ratio),
      parametrosLetra(met.ratio),
      parametrosLetra(met.ratio),
    ];
    const msPorLetra = seq.reduce((a, p) => a + p.tempoLimiteMs, 0) / 3;
    els.qteDica.textContent = `Você tem ~${fmtSegundosAproximados(msPorLetra)} s por letra para pressionar cada tecla certa.`;
    iniciarQteLetraSequencia(seq, aoFimGoleiro);
  } else {
    const seq = [parametrosLetra(met.ratio), parametrosLetra(met.ratio)];
    const msPorLetra = seq.reduce((a, p) => a + p.tempoLimiteMs, 0) / 2;
    els.qteDica.textContent = `Você tem ~${fmtSegundosAproximados(msPorLetra)} s por letra para pressionar cada tecla certa.`;
    iniciarQteLetraSequencia(seq, aoFimGoleiro);
  }
}

/**
 * @param {boolean} teveGol
 * @param {boolean} golParaJogador
 */
function mostrarResultadoFinal(teveGol, golParaJogador) {
  if (!ctx) return;
  ctx._teveGol = teveGol;
  ctx.golParaJogador = golParaJogador;
  els.placar.textContent = `${golsJogador} × ${golsCpu}`;
  els.dueloRpgStrip.hidden = true;
  let destaque = { jogador: ctx.jogador?.id, adversario: ctx.adversario?.id };
  if (ctx.tipoGol && ctx.forwardChute && ctx.goleiroDefesa) {
    const chuteJogador = ctx.tipoGol === "jogador_chuta";
    destaque = {
      jogador: chuteJogador ? ctx.forwardChute.id : ctx.goleiroDefesa.id,
      adversario: chuteJogador ? ctx.goleiroDefesa.id : ctx.forwardChute.id,
    };
  }
  renderEscalacoes(destaque);
  mostrarFaseModal("resultado");
  els.resultadoTexto.innerHTML = ctx.linhasResultado.map((t) => `<p>${t}</p>`).join("");
}

function encerrarComErro(msg) {
  appendLog(msg);
  fecharModalLance();
  encerrarPartida();
}

els.btnIniciarDueloCampo.addEventListener("click", () => {
  const fn = ctx?.iniciarQteCampo;
  if (!fn) return;
  ctx.iniciarQteCampo = null;
  fn();
});

els.btnEncararGoleiro.addEventListener("click", () => {
  iniciarQteGoleiro();
});

els.btnFecharLance.addEventListener("click", async () => {
  const golParaJogador = ctx?.golParaJogador === true;
  const teveGol = ctx?._teveGol === true;
  const minutoLance = ctx?.minuto ?? estadoGlobal.minuto;
  const blocos = ctx?.linhasResultado ?? [];
  const resumo = blocos.map(htmlParaTextoLog).filter(Boolean).join(" ");

  appendLog(`<strong>${formatMinuto(minutoLance)}</strong> — ${resumo || "Lance concluído."}`);

  fecharModalLance();
  renderEscalacoes(null);

  if (teveGol) {
    mostrarPopupGol(golParaJogador);
    return;
  }

  await continuarRodadaAposLance();
});

function mostrarPopupGol(golAFavor) {
  els.golOverlay.hidden = false;
  sincronizarUiPausa();
  if (golAFavor) {
    els.golTitulo.textContent = "GOL!";
    els.golSub.textContent = "A torcida explode — seu time marca.";
  } else {
    els.golTitulo.textContent = "GOL DO ADVERSÁRIO";
    els.golSub.textContent = "O adversário converte e muda o placar.";
  }
}

els.btnGolOk.addEventListener("click", async () => {
  els.golOverlay.hidden = true;
  sincronizarUiPausa();
  await continuarRodadaAposLance();
});

async function continuarRodadaAposLance() {
  tentarSubstituicaoCpu();
  const de = estadoGlobal.minuto;
  const salto = proximoIntervaloMinutos();
  const prox = de + salto;
  const fim = minutoFimJogo();
  if (prox > fim) {
    estadoGlobal.minuto = fim;
    els.relogio.textContent = formatMinuto(fim);
    els.etapaTempo.textContent = "Fim";
    encerrarPartida();
    return;
  }
  await animarTempoJogo(de, prox);
  estadoGlobal.minuto = prox;
  dispararLance();
}

function dispararLance() {
  let zona = estadoGlobal.proximaZona;
  if (!zona) {
    zona = sortearZona();
  }
  estadoGlobal.proximaZona = null;
  const { jogador, adversario } = escolherDuelistas(zona, timeJogador.titulares, timeCpu.titulares);
  if (!jogador || !adversario) {
    appendLog("Erro ao escalar duelo — verifique posições.");
    encerrarPartida();
    return;
  }
  const jogadorComBola = estadoGlobal.posseJogador;
  els.relogio.textContent = formatMinuto(estadoGlobal.minuto);
  els.etapaTempo.textContent = labelEtapa(estadoGlobal.minuto);
  abrirModalLance({
    minuto: estadoGlobal.minuto,
    zona,
    jogador,
    adversario,
    jogadorComBola,
  });
}

function encerrarPartida() {
  partidaAtiva = false;
  jogoPausado = false;
  els.pausePanel.hidden = true;
  aguardandoSegundoTempo = false;
  resolveSegundoTempo = null;
  esconderUiIntervalo();
  const fim = minutoFimJogo();
  estadoGlobal.minuto = Math.min(estadoGlobal.minuto, fim);
  els.relogio.textContent = formatMinuto(estadoGlobal.minuto);
  els.etapaTempo.textContent = "Fim";
  sincronizarUiPausa();
  atualizarBtnCentroRodada();
  appendLog(`<strong>Fim de jogo.</strong> ${golsJogador} × ${golsCpu}`);
}

async function iniciarPartida() {
  const vj = validarElenco(timeJogador.titulares, timeJogador.reservas);
  const vc = validarElenco(timeCpu.titulares, timeCpu.reservas);
  if (!vj.ok) {
    alert(vj.msg);
    return;
  }
  if (!vc.ok) {
    alert("Time do computador inválido (bug).");
    return;
  }
  golsJogador = 0;
  golsCpu = 0;
  jogoPausado = false;
  els.pausePanel.hidden = true;
  substituicoesUsadas = 0;
  substituicoesCpuUsadas = 0;
  segundoTempoAutorizado = false;
  aguardandoSegundoTempo = false;
  resolveSegundoTempo = null;
  esconderUiIntervalo();
  acrescimosPrimeiroTempo = sortearAcrescimosTempo();
  acrescimosSegundoTempo = sortearAcrescimosTempo();
  snapshotStatsInicioPartida();
  els.placar.textContent = "0 × 0";
  els.log.innerHTML = "";
  partidaAtiva = true;
  estadoGlobal = {
    minuto: 0,
    posseJogador: Math.random() < 0.5,
    proximaZona: null,
  };
  els.relogio.textContent = "0′";
  els.etapaTempo.textContent = "1º tempo";
  setZonaVisual(null);
  atualizarSubsHud();
  sincronizarUiPausa();
  atualizarBtnCentroRodada();
  appendLog(
    "Apito inicial. Entre lances o relógio corre devagar; use <strong>Pausar</strong> (ou Esc) para ver números e trocar jogadores; no intervalo use o botão central <strong>Começar 2º tempo</strong>.",
  );

  const primeiro = proximoIntervaloMinutos();
  await animarTempoJogo(0, primeiro);
  estadoGlobal.minuto = primeiro;
  dispararLance();
}

ligarCliquesSubstituicao();
renderEscalacoes(null);
els.relogio.textContent = "0′";
els.etapaTempo.textContent = "—";
els.placar.textContent = "0 × 0";
atualizarSubsHud();
sincronizarUiPausa();
atualizarBtnCentroRodada();
