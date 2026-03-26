import { ZONE_LABEL } from "./constants.js";
import {
  textoContextoPrimario,
  textoDueloGoleiro,
  textoResultadoPrimario,
  textoTransicaoGoleiro,
} from "./narrative.js";
import {
  atualizarPosse,
  escolherDuelistas,
  metricasDuelo,
  proximoIntervaloMinutos,
  sortearGoleiro,
  sortearZona,
  tipoFinalizacaoGoleiro,
} from "./match.js";
import { parametrosLetra } from "./qte.js";
import { ordenarPorPosicao } from "./squadSort.js";
import { gerarTime, validarElenco } from "./squad.js";

/** @typedef {import('./match.js').Postura} Postura */

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
  btnNovoTime: document.getElementById("btn-novo-time"),
  btnIniciar: document.getElementById("btn-iniciar"),
  dueloOverlay: document.getElementById("duelo-overlay"),
  fasePostura: document.getElementById("fase-postura"),
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
  posturaBotoes: document.querySelectorAll("[data-postura]"),
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
  btnSegundoTempo: document.getElementById("btn-segundo-tempo"),
};

let timeJogador = gerarTime();
let timeCpu = gerarTime();
let partidaAtiva = false;
let substituicoesUsadas = 0;
let substituicoesCpuUsadas = 0;
/** Após o 1º tempo, só avança o relógio para o 2º quando o jogador confirmar */
let segundoTempoAutorizado = false;
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

/** @type {{ minuto: number, posseJogador: boolean }} */
let estadoGlobal = { minuto: 0, posseJogador: true };

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

/** @param {{ nome: string }} j */
function spanNomeJogador(j) {
  const humano =
    timeJogador.titulares.includes(j) ||
    timeJogador.reservas.includes(j);
  const cls = humano ? "nm-time-jogador" : "nm-time-cpu";
  return `<span class="${cls}">${escapeHtml(j.nome)}</span>`;
}

function formatMinuto(m) {
  return `${Math.floor(m)}′`;
}

function labelEtapa(minuto) {
  if (minuto <= 45) return "1º tempo";
  return "2º tempo";
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
    li.innerHTML = `<span class="sigla">${sigla(j.posicao)}</span> <span class="nome ${clsNome}">${escapeHtml(j.nome)}</span><span class="stats"> ${j.ataque}/${j.defesa}</span>`;
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
  els.subsInfo.textContent = `Você ${substituicoesUsadas}/5 · CPU ${substituicoesCpuUsadas}/5`;
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

/** @param {"postura" | "transicao" | "qte" | "resultado"} fase */
function mostrarFaseModal(fase) {
  els.fasePostura.hidden = fase !== "postura";
  els.faseTransicao.hidden = fase !== "transicao";
  els.faseQte.hidden = fase !== "qte";
  els.faseResultado.hidden = fase !== "resultado";
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
 */
function iniciarQteLetra(params, onFim) {
  pararQte();
  const { letra, tempoLimiteMs } = params;
  const alvo = letra.toLowerCase();
  const painel = els.qteReacao;
  const label = els.qteReacaoLabel;
  const sub = els.qteReacaoSub;
  let resolvido = false;

  painel.classList.remove("falha");
  label.textContent = letra;
  painel.setAttribute("aria-label", `Pressione a tecla ${letra} no teclado.`);
  sub.textContent = `Pressione essa letra (${(tempoLimiteMs / 1000).toFixed(1)} s).`;
  painel.focus();

  function detachListeners() {
    window.removeEventListener("keydown", keyHandler, true);
  }

  cancelarInputQte = () => {
    if (resolvido) return;
    resolvido = true;
    detachListeners();
    pararQte();
    cancelarInputQte = null;
  };

  function finalizar(acertou) {
    if (resolvido) return;
    resolvido = true;
    detachListeners();
    pararQte();
    cancelarInputQte = null;
    onFim(acertou);
  }

  function keyHandler(e) {
    if (resolvido) return;
    if (e.repeat) return;
    const k = e.key;
    if (k.length !== 1) return;
    const ch = k.toLowerCase();
    if (ch < "a" || ch > "z") return;
    e.preventDefault();
    e.stopPropagation();
    if (ch === alvo) {
      finalizar(true);
      return;
    }
    label.textContent = letra;
    sub.textContent = "Tecla errada.";
    painel.classList.add("falha");
    finalizar(false);
  }

  window.addEventListener("keydown", keyHandler, true);

  qteTimerLate = setTimeout(() => {
    if (resolvido) return;
    sub.textContent = "Tempo esgotado.";
    painel.classList.add("falha");
    finalizar(false);
  }, tempoLimiteMs);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
  els.btnSegundoTempo.hidden = true;
  if (bannerEsconderTimer !== null) {
    clearTimeout(bannerEsconderTimer);
    bannerEsconderTimer = null;
  }
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
  tentarSubstituicaoCpu();
  mostrarBannerIntervalo();
  appendLog(
    "<strong>Intervalo.</strong> O relógio está parado — faça substituições e, quando quiser, clique em <strong>Começar 2º tempo</strong> abaixo do placar.",
  );
  els.btnSegundoTempo.hidden = false;
  return new Promise((resolve) => {
    resolveSegundoTempo = resolve;
  });
}

/**
 * @param {number} de minuto atual (relógio parado no lance)
 * @param {number} ate próximo minuto do lance
 */
async function animarTempoJogo(de, ate) {
  tempoAnimando = true;
  let m = Math.floor(de);
  const alvo = Math.min(90, Math.floor(ate));
  const msPorMinuto = 1200;

  while (m < alvo) {
    if (m === 45 && alvo >= 46 && !segundoTempoAutorizado) {
      tempoAnimando = false;
      await aguardarSegundoTempo();
      segundoTempoAutorizado = true;
      aguardandoSegundoTempo = false;
      tempoAnimando = true;
      tentarSubstituicaoCpu();
    }
    m++;
    els.relogio.textContent = formatMinuto(m);
    els.etapaTempo.textContent = labelEtapa(m);
    await sleep(msPorMinuto);
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

      const relogioCorrendo = tempoAnimando && !aguardandoSegundoTempo;
      if (partidaAtiva && (!els.dueloOverlay.hidden || relogioCorrendo)) return;
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
        atualizarSubsHud();
      }
      limparSelecaoSub();
      renderEscalacoes(null);
      appendLog(`Substituição: ${res.nome} entra no lugar de ${tit.nome}.`);
    });
  });
}

els.btnSegundoTempo.addEventListener("click", () => {
  if (!resolveSegundoTempo) return;
  const r = resolveSegundoTempo;
  resolveSegundoTempo = null;
  els.btnSegundoTempo.hidden = true;
  aguardandoSegundoTempo = false;
  tentarSubstituicaoCpu();
  appendLog("2º tempo autorizado — o relógio volta a correr.");
  r();
});

function posturaNome(p) {
  return { equilibrado: "Equilíbrio", arrojado: "Arrojado", cauteloso: "Cauteloso" }[p];
}

function abrirModalLance(lance) {
  ctx = {
    minuto: lance.minuto,
    zona: lance.zona,
    jogador: lance.jogador,
    adversario: lance.adversario,
    jogadorComBola: lance.jogadorComBola,
    postura: "equilibrado",
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
  mostrarFaseModal("postura");
  const ctxo = textoContextoPrimario(
    {
      zona: lance.zona,
      jogador: lance.jogador,
      adversario: lance.adversario,
      jogadorComBola: lance.jogadorComBola,
      venceu: false,
      posturaNome: "",
    },
    spanNomeJogador,
  );
  els.dueloTexto.innerHTML = `<strong>${formatMinuto(lance.minuto)}</strong> — ${ctxo}`;
  els.dueloDetalhe.innerHTML = `${spanNomeJogador(lance.jogador)} (${sigla(lance.jogador.posicao)}) × ${spanNomeJogador(lance.adversario)} (${sigla(lance.adversario.posicao)})`;
  setZonaVisual(lance.zona);
  renderEscalacoes({ jogador: lance.jogador.id, adversario: lance.adversario.id });
}

function fecharModalLance() {
  if (cancelarInputQte) cancelarInputQte();
  els.dueloOverlay.hidden = true;
  mostrarFaseModal("postura");
  pararQte();
  ctx = null;
}

/**
 * @param {Postura} postura
 */
function escolherPostura(postura) {
  if (!ctx || !partidaAtiva) return;
  ctx.postura = postura;
  mostrarFaseModal("qte");
  const met = metricasDuelo(ctx.jogador, ctx.adversario, ctx.jogadorComBola, postura);
  const letraParams = parametrosLetra(met.ratio);
  els.qteDica.textContent = `Letra no teclado (${posturaNome(postura)}). Peso no lance: ${met.meuPeso.toFixed(0)} × ${met.pesoOponente.toFixed(0)} (${(met.ratio * 100).toFixed(0)}% seu) → ~${(letraParams.tempoLimiteMs / 1000).toFixed(1)} s para acertar.`;

  iniciarQteLetra(letraParams, (acertou) => {
    ctx.venceuPrim = acertou;
    ctx.linhasResultado = [];
    ctx.linhasResultado.push(
      textoContextoPrimario(
        {
          zona: ctx.zona,
          jogador: ctx.jogador,
          adversario: ctx.adversario,
          jogadorComBola: ctx.jogadorComBola,
          venceu: acertou,
          posturaNome: posturaNome(postura),
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

      renderEscalacoes({
        jogador: tipo === "jogador_chuta" ? ctx.forwardChute.id : ctx.goleiroDefesa.id,
        adversario: tipo === "jogador_chuta" ? ctx.goleiroDefesa.id : ctx.forwardChute.id,
      });
      mostrarFaseModal("transicao");
      return;
    }

    estadoGlobal.posseJogador = atualizarPosse(ctx.jogadorComBola, acertou);
    mostrarResultadoFinal(false, false);
  });
}

function iniciarQteGoleiro() {
  if (!ctx || !ctx.tipoGol) return;
  mostrarFaseModal("qte");
  const chuteJogador = ctx.tipoGol === "jogador_chuta";
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
  const met = metricasDuelo(eu, ele, comBola, ctx.postura);
  const letraParams = parametrosLetra(met.ratio);
  els.qteDica.textContent = chuteJogador
    ? `Chute: ${met.meuPeso.toFixed(0)} × ${met.pesoOponente.toFixed(0)} (${(met.ratio * 100).toFixed(0)}% seu) → ~${(letraParams.tempoLimiteMs / 1000).toFixed(1)} s.`
    : `Defesa: ${met.meuPeso.toFixed(0)} × ${met.pesoOponente.toFixed(0)} (${(met.ratio * 100).toFixed(0)}% seu) → ~${(letraParams.tempoLimiteMs / 1000).toFixed(1)} s.`;

  iniciarQteLetra(letraParams, (acertou) => {
    ctx.linhasResultado.push(
      textoDueloGoleiro(
        {
          venceu: acertou,
          chuteJogador,
          atacante: ctx.forwardChute,
          goleiro: ctx.goleiroDefesa,
        },
        spanNomeJogador,
      ),
    );

    let teveGol = false;
    if (chuteJogador && acertou) {
      golsJogador++;
      teveGol = true;
      ctx.golParaJogador = true;
      estadoGlobal.posseJogador = false;
    } else if (chuteJogador && !acertou) {
      ctx.golParaJogador = false;
      estadoGlobal.posseJogador = false;
    } else if (!chuteJogador && acertou) {
      ctx.golParaJogador = false;
      estadoGlobal.posseJogador = true;
    } else {
      golsCpu++;
      teveGol = true;
      ctx.golParaJogador = false;
      estadoGlobal.posseJogador = true;
    }

    mostrarResultadoFinal(teveGol, ctx.golParaJogador);
  });
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
  mostrarFaseModal("resultado");
  els.resultadoTexto.innerHTML = ctx.linhasResultado.map((t) => `<p>${t}</p>`).join("");
}

function encerrarComErro(msg) {
  appendLog(msg);
  fecharModalLance();
  encerrarPartida();
}

els.posturaBotoes.forEach((btn) => {
  btn.addEventListener("click", () => {
    const p = /** @type {Postura} */ (btn.dataset.postura);
    escolherPostura(p);
  });
});

els.btnEncararGoleiro.addEventListener("click", () => {
  iniciarQteGoleiro();
});

els.btnFecharLance.addEventListener("click", async () => {
  const golParaJogador = ctx?.golParaJogador === true;
  const teveGol = ctx?._teveGol === true;
  const minutoLance = ctx?.minuto ?? estadoGlobal.minuto;

  appendLog(
    `<strong>${formatMinuto(minutoLance)}</strong> — Lance encerrado.${teveGol ? " <strong>Bola na rede.</strong>" : ""}`,
  );

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
  await continuarRodadaAposLance();
});

async function continuarRodadaAposLance() {
  tentarSubstituicaoCpu();
  const de = estadoGlobal.minuto;
  const salto = proximoIntervaloMinutos();
  const prox = de + salto;
  if (prox > 90) {
    estadoGlobal.minuto = Math.min(de, 90);
    els.relogio.textContent = formatMinuto(90);
    els.etapaTempo.textContent = "Fim";
    encerrarPartida();
    return;
  }
  await animarTempoJogo(de, prox);
  estadoGlobal.minuto = prox;
  dispararLance();
}

function dispararLance() {
  const zona = sortearZona();
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
  aguardandoSegundoTempo = false;
  resolveSegundoTempo = null;
  esconderUiIntervalo();
  estadoGlobal.minuto = Math.min(estadoGlobal.minuto, 90);
  els.relogio.textContent = formatMinuto(90);
  els.etapaTempo.textContent = "Fim";
  els.btnIniciar.disabled = false;
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
  substituicoesUsadas = 0;
  substituicoesCpuUsadas = 0;
  segundoTempoAutorizado = false;
  aguardandoSegundoTempo = false;
  resolveSegundoTempo = null;
  esconderUiIntervalo();
  els.placar.textContent = "0 × 0";
  els.log.innerHTML = "";
  partidaAtiva = true;
  estadoGlobal = {
    minuto: 0,
    posseJogador: Math.random() < 0.5,
  };
  els.relogio.textContent = "0′";
  els.etapaTempo.textContent = "1º tempo";
  setZonaVisual(null);
  els.btnIniciar.disabled = true;
  atualizarSubsHud();
  appendLog(
    "Apito inicial. Entre lances o relógio corre devagar; no intervalo ele para até você clicar em <strong>Começar 2º tempo</strong>.",
  );

  const primeiro = proximoIntervaloMinutos();
  await animarTempoJogo(0, primeiro);
  estadoGlobal.minuto = primeiro;
  dispararLance();
}

els.btnNovoTime.addEventListener("click", () => {
  if (partidaAtiva) return;
  timeJogador = gerarTime();
  timeCpu = gerarTime();
  substituicoesUsadas = 0;
  substituicoesCpuUsadas = 0;
  limparSelecaoSub();
  atualizarSubsHud();
  renderEscalacoes(null);
});

els.btnIniciar.addEventListener("click", iniciarPartida);

ligarCliquesSubstituicao();
renderEscalacoes(null);
els.relogio.textContent = "0′";
els.etapaTempo.textContent = "—";
els.placar.textContent = "0 × 0";
atualizarSubsHud();
