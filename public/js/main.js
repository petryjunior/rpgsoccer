import { POSITIONS, ZONE_LABEL, ZONES } from "./constants.js";
import {
  textoCartaoAmarelo,
  textoChuteParaForaAposDuelo,
  textoContextoPrimario,
  textoDueloGoleiro,
  textoExpulsao,
  textoFaltaMarcada,
  textoLesaoPorFalta,
  textoPronosticoLesaoCopa,
  textoPenaltiMarcadoPorFalta,
  textoResultadoPrimario,
  textoTransicaoGoleiro,
} from "./narrative.js";
import {
  chanceErrarFinalizacaoAposVencerGoleiro,
  escolherDuelistas,
  metricasDuelo,
  proximaZonaEPosse,
  proximoIntervaloMinutos,
  sortearAcrescimosProrrogacao,
  sortearAcrescimosTempo,
  sortearAtacanteTitular,
  sortearGoleiro,
  sortearZona,
  tipoFinalizacaoGoleiro,
} from "./match.js";
import { parametrosLetra } from "./qte.js";
import { SELECOES, elencoDaSelecao, selecaoPorId, urlBandeira } from "./national-teams.js";
import {
  adversariosNasRodadas,
  agregarClassificacao,
  aplicarResultadoNaLista,
  criarRng,
  embaralhar,
  forcaMediaSelecao,
  montarFinal,
  montarOitavas,
  montarQuartasFifa,
  montarSemiFifa,
  ordenarGrupoFifa,
  partidasDoGrupo,
  ROTULO_FINAL_FIFA,
  ROTULOS_OITAVAS_FIFA,
  ROTULOS_QUARTAS_FIFA,
  ROTULOS_SEMI_FIFA,
  simularPlacar,
  simularRodadaGruposExcetoJogoHumano,
  sortearGrupos,
} from "./world-cup.js";
import {
  carregarEstadoDoSave,
  gravarNovoSaveCopa,
  listarSavesCopaOrdenados,
  obterSaveCopaPorId,
  removerSaveCopa,
  serializarCopaEstadoParaJson,
  substituirSaveCopa,
} from "./copa-storage.js";
import { ordenarPorPosicao } from "./squadSort.js";
import { validarElenco } from "./squad.js";

const els = {
  jogoRoot: document.getElementById("jogo-root"),
  telaInicio: document.getElementById("tela-inicio"),
  telaCarregarCopa: document.getElementById("tela-carregar-copa"),
  carregarCopaLista: document.getElementById("carregar-copa-lista"),
  carregarCopaVazio: document.getElementById("carregar-copa-vazio"),
  btnCarregarCopaVoltar: document.getElementById("btn-carregar-copa-voltar"),
  telaAmistoso: document.getElementById("tela-amistoso"),
  btnMenuAmistoso: document.getElementById("btn-menu-amistoso"),
  amistosoCardsJogador: document.getElementById("amistoso-cards-jogador"),
  amistosoCardsCpu: document.getElementById("amistoso-cards-cpu"),
  btnConfirmarAmistoso: document.getElementById("btn-confirmar-amistoso"),
  btnVoltarMenu: document.getElementById("btn-voltar-menu"),
  telaCopa: document.getElementById("tela-copa"),
  copaPassoSelecao: document.getElementById("copa-passo-selecao"),
  copaPassoGrupos: document.getElementById("copa-passo-grupos"),
  copaCardsJogador: document.getElementById("copa-cards-jogador"),
  btnCopaSortearGrupos: document.getElementById("btn-copa-sortear-grupos"),
  copaGruposIntro: document.getElementById("copa-grupos-intro"),
  copaGruposGrid: document.getElementById("copa-grupos-grid"),
  copaClassificacaoWrap: document.getElementById("copa-classificacao-wrap"),
  copaClassificacaoTodosWrap: document.getElementById("copa-classificacao-todos-wrap"),
  copaTabelasTodosGrupos: document.getElementById("copa-tabelas-todos-grupos"),
  copaTabelaGrupo: document.getElementById("copa-tabela-grupo"),
  copaHubMsg: document.getElementById("copa-hub-msg"),
  copaCelebracao: document.getElementById("copa-celebracao"),
  copaCelebracaoBandeira: document.getElementById("copa-celebracao-bandeira"),
  copaCelebracaoNome: document.getElementById("copa-celebracao-nome"),
  copaResultadosRodadaWrap: document.getElementById("copa-resultados-rodada-wrap"),
  copaResultadosRodadaTitulo: document.getElementById("copa-resultados-rodada-titulo"),
  copaResultadosRodadaLista: document.getElementById("copa-resultados-rodada-lista"),
  copaChaveWrap: document.getElementById("copa-chave-wrap"),
  copaChave: document.getElementById("copa-chave"),
  copaSalvarNome: document.getElementById("copa-salvar-nome"),
  copaSalvarSobrescrever: document.getElementById("copa-salvar-sobrescrever"),
  btnCopaSalvar: document.getElementById("btn-copa-salvar"),
  copaSalvarFeedback: document.getElementById("copa-salvar-feedback"),
  copaHubSavesLista: document.getElementById("copa-hub-saves-lista"),
  btnCopaProximoJogo: document.getElementById("btn-copa-proximo-jogo"),
  btnCopaVerTabela: document.getElementById("btn-copa-ver-tabela"),
  btnCopaVerArtilheiros: document.getElementById("btn-copa-ver-artilheiros"),
  btnCopaVoltarInicioHub: document.getElementById("btn-copa-voltar-inicio-hub"),
  copaArtilheirosWrap: document.getElementById("copa-artilheiros-wrap"),
  copaArtilheirosLista: document.getElementById("copa-artilheiros-lista"),
  copaPenaltisOverlay: document.getElementById("copa-penaltis-overlay"),
  copaPenaltisTitulo: document.getElementById("copa-penaltis-titulo"),
  copaPenaltisTexto: document.getElementById("copa-penaltis-texto"),
  copaPenaltisEscolha: document.getElementById("copa-penaltis-escolha"),
  copaPenaltisLista: document.getElementById("copa-penaltis-lista"),
  copaPenaltisOrdem: document.getElementById("copa-penaltis-ordem"),
  copaPenaltisConfirmar: document.getElementById("copa-penaltis-confirmar"),
  copaPenaltisPlacar: document.getElementById("copa-penaltis-placar"),
  copaPenaltisHud: document.getElementById("copa-penaltis-hud"),
  copaPenaltisHudPlacar: document.getElementById("copa-penaltis-hud-placar"),
  copaPenaltisHudAcao: document.getElementById("copa-penaltis-hud-acao"),
  copaPenaltisHudQte: document.getElementById("copa-penaltis-hud-qte"),
  copaPenaltisHudQtePlacar: document.getElementById("copa-penaltis-hud-qte-placar"),
  copaPenaltisHudQteAcao: document.getElementById("copa-penaltis-hud-qte-acao"),
  amistosoErro: document.getElementById("amistoso-erro"),
  bandeiraJogadorPainel: document.getElementById("bandeira-jogador-painel"),
  nomeSelecaoJogadorPainel: document.getElementById("nome-selecao-jogador-painel"),
  bandeiraCpuPainel: document.getElementById("bandeira-cpu-painel"),
  nomeSelecaoCpuPainel: document.getElementById("nome-selecao-cpu-painel"),
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
  btnVoltarMenuJogo: document.getElementById("btn-voltar-menu-jogo"),
  dueloOverlay: document.getElementById("duelo-overlay"),
  modalDuelo: document.getElementById("modal-duelo"),
  faseIntroDuelo: document.getElementById("fase-intro-duelo"),
  faseAcaoInicioDuelo: document.getElementById("fase-acao-inicio-duelo"),
  btnIniciarDueloCampo: document.getElementById("btn-iniciar-duelo-campo"),
  faseTransicao: document.getElementById("fase-transicao"),
  faseQte: document.getElementById("fase-qte"),
  faseResultado: document.getElementById("fase-resultado"),
  dueloTitulo: document.getElementById("duelo-titulo"),
  dueloTexto: document.getElementById("duelo-texto"),
  dueloDetalhe: document.getElementById("duelo-detalhe"),
  transicaoResumoCampo: document.getElementById("transicao-resumo-campo"),
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
  penaltisResultadoOverlay: document.getElementById("penaltis-resultado-overlay"),
  penaltisResultadoCartao: document.getElementById("penaltis-resultado-cartao"),
  penaltisResultadoTitulo: document.getElementById("penaltis-resultado-titulo"),
  penaltisResultadoSub: document.getElementById("penaltis-resultado-sub"),
  btnPenaltisResultadoOk: document.getElementById("btn-penaltis-resultado-ok"),
  fimJogoOverlay: document.getElementById("fim-jogo-overlay"),
  fimJogoTitulo: document.getElementById("fim-jogo-titulo"),
  fimJogoPlacar: document.getElementById("fim-jogo-placar"),
  btnFimJogoOk: document.getElementById("btn-fim-jogo-ok"),
  intervaloBanner: document.getElementById("intervalo-banner"),
  dueloRpgStrip: document.getElementById("duelo-rpg-strip"),
  btnPausa: document.getElementById("btn-pausa"),
  pausePanel: document.getElementById("pause-panel"),
  pauseStats: document.getElementById("pause-stats"),
  btnContinuarPausa: document.getElementById("btn-continuar-pausa"),
};

const CANSACO_DUELO = 4;
const ATTR_MIN = 1;
const ATTR_MAX = 99;
const BONUS_STREAK_DUELO = 10;
/** Chance do adversário “cometer falta” após vitória no duelo de campo (sem QTE). */
const CPU_PROB_FALTA = 0.3;
const FATOR_DEBUFF_EXPULSAO = 0.93;
/** Chance de o jogador faltado (quem sofre a falta) se lesionar. */
const PROB_LESAO_APOS_FALTA = 0.1;
/** Menos que isto em campo (titulares não expulsos) = jogo encerrado por W.O. 3×0. */
const MIN_JOGADORES_EM_CAMPO = 7;

/** @type {Map<string, { ataque: number, defesa: number }>} */
const statsBasePartida = new Map();
/** Stats ao entrar no jogo (amistoso) — restauradas a cada nova partida. */
const statsElencoLimpo = new Map();
/** @type {Map<string, number>} faltas no jogo por id do jogador */
const faltasPorJogador = new Map();
/** @type {Map<string, { ataque: number, defesa: number }>} vitórias seguidas por papel (ataque/defesa) */
const streakDueloPorJogador = new Map();
/** Após expulsar titular/reserva seu, pausa ao fechar o lance para ajustar escalação. */
let aguardandoPausaPorExpulsaoHumana = false;
/** Tempo com o feedback na tela antes de seguir para o resultado (falha: tecla errada ou fim do tempo). */
const QTE_FEEDBACK_FALHA_MS = 1150;
const QTE_FEEDBACK_ACERTO_MS = 280;
/** Intervalo entre 3→2→1: um único valor sorteado por lance (mesmo tempo nos 3 passos). */
const QTE_COUNTDOWN_MS_MIN = 260;
const QTE_COUNTDOWN_MS_MAX = 1800;
/** Pausa entre cada minuto exibido no relógio (entre lances). Menor = partida “corre” mais rápido. */
const RELOGIO_MS_POR_MINUTO = 400;
/** Quantos jogadores a tabela de artilheiros do hub da Copa exibe. */
const COPA_ARTILHEIROS_HUB_MAX = 10;

function sortearIntervaloContagemQte() {
  const a = QTE_COUNTDOWN_MS_MIN;
  const b = QTE_COUNTDOWN_MS_MAX;
  return a + Math.floor(Math.random() * (b - a + 1));
}

/** ms → segundos para texto do QTE (3 casas decimais, vírgula decimal pt-BR). */
function fmtSegundosExatos(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n)) return "0,000";
  const s = n / 1000;
  return s.toLocaleString("pt-BR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
    useGrouping: false,
  });
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

function snapshotElencoLimpo() {
  statsElencoLimpo.clear();
  for (const j of [
    ...timeJogador.titulares,
    ...timeJogador.reservas,
    ...timeCpu.titulares,
    ...timeCpu.reservas,
  ]) {
    statsElencoLimpo.set(j.id, { ataque: j.ataque, defesa: j.defesa });
  }
}

function restaurarElencoParaNovaPartida() {
  for (const j of [
    ...timeJogador.titulares,
    ...timeJogador.reservas,
    ...timeCpu.titulares,
    ...timeCpu.reservas,
  ]) {
    const s = statsElencoLimpo.get(j.id);
    if (s) {
      j.ataque = s.ataque;
      j.defesa = s.defesa;
    }
    delete j.expulso;
    delete j.lesionado;
    delete j.copaLesaoPartidasFora;
  }
  faltasPorJogador.clear();
  timeJogador._debuffExpulsaoAplicado = false;
  timeCpu._debuffExpulsaoAplicado = false;
}

/** @param {{ titulares: object[], reservas: object[] }} time */
function aplicarDebuffPrimeiraExpulsao(time) {
  if (time._debuffExpulsaoAplicado) return;
  time._debuffExpulsaoAplicado = true;
  for (const j of [...time.titulares, ...time.reservas]) {
    j.ataque = Math.max(ATTR_MIN, Math.round(j.ataque * FATOR_DEBUFF_EXPULSAO));
    j.defesa = Math.max(ATTR_MIN, Math.round(j.defesa * FATOR_DEBUFF_EXPULSAO));
  }
}

/** @param {object} j */
function timeDoElenco(j) {
  if (timeJogador.titulares.includes(j) || timeJogador.reservas.includes(j)) return timeJogador;
  return timeCpu;
}

/** Titular na Copa: lesão ou suspensão ativa no seu time. */
function jogadorHumanoBloqueadoTitularCopa(nome) {
  if (tipoModoJogo !== "copa" || !copaEstado || !metaSelecaoJogador) return false;
  const k = chaveArtilheiroCopa(metaSelecaoJogador.id, nome);
  const les = copaEstado.lesoesHumano?.[k]?.partidasFora ?? 0;
  const sus = copaEstado.jogosSuspensao?.[k] ?? 0;
  return les > 0 || sus > 0;
}

/**
 * @param {object} j
 * @param {"amarelo" | "vermelho"} tipo
 */
function registrarDisciplinaCopaHumanoAposCartao(j, tipo) {
  if (tipoModoJogo !== "copa" || !copaEstado || !metaSelecaoJogador) return;
  if (timeDoElenco(j) !== timeJogador) return;
  const k = chaveArtilheiroCopa(metaSelecaoJogador.id, j.nome);
  if (!copaEstado.amarelosAcumulado) copaEstado.amarelosAcumulado = {};
  if (!copaEstado.jogosSuspensao) copaEstado.jogosSuspensao = {};
  if (!copaEstado.suspensaoRelatorioFim) copaEstado.suspensaoRelatorioFim = [];
  if (tipo === "vermelho") {
    copaEstado.amarelosAcumulado[k] = 0;
    copaEstado.jogosSuspensao[k] = 1;
    copaEstado.suspensaoRelatorioFim.push({ nome: j.nome, motivo: "vermelho" });
    return;
  }
  const ac = (copaEstado.amarelosAcumulado[k] ?? 0) + 1;
  copaEstado.amarelosAcumulado[k] = ac;
  if (ac >= 2) {
    copaEstado.amarelosAcumulado[k] = 0;
    copaEstado.jogosSuspensao[k] = 1;
    copaEstado.suspensaoRelatorioFim.push({ nome: j.nome, motivo: "dois amarelos" });
  }
}

function aplicarRestricoesCopaNoElencoHumano() {
  if (tipoModoJogo !== "copa" || !copaEstado || !metaSelecaoJogador) return;
  let mudou = true;
  let guarda = 0;
  while (mudou && guarda < 80) {
    guarda++;
    mudou = false;
    for (let i = 0; i < timeJogador.titulares.length; i++) {
      const t = timeJogador.titulares[i];
      if (!jogadorHumanoBloqueadoTitularCopa(t.nome)) continue;
      for (let r = 0; r < timeJogador.reservas.length; r++) {
        const res = timeJogador.reservas[r];
        if (jogadorHumanoBloqueadoTitularCopa(res.nome)) continue;
        [timeJogador.titulares[i], timeJogador.reservas[r]] = [
          timeJogador.reservas[r],
          timeJogador.titulares[i],
        ];
        const v = validarElenco(timeJogador.titulares, timeJogador.reservas);
        if (!v.ok) {
          [timeJogador.titulares[i], timeJogador.reservas[r]] = [
            timeJogador.reservas[r],
            timeJogador.titulares[i],
          ];
          continue;
        }
        appendLog(
          `<strong>Copa.</strong> ${escapeHtml(res.nome)} assume a titular no lugar de ${escapeHtml(t.nome)} (lesão ou suspensão).`,
        );
        mudou = true;
        break;
      }
    }
  }
}

function sortearPartidasForaLesaoCopa(rng) {
  const t = rng();
  if (t < 0.42) return 0;
  if (t < 0.78) return 1;
  return 2;
}

function consumirLesaoESuspensaoCopaAposPartida() {
  if (!copaEstado?._snapCopaInicioPartida) return;
  const snap = copaEstado._snapCopaInicioPartida;
  if (!copaEstado.jogosSuspensao) copaEstado.jogosSuspensao = {};
  if (!copaEstado.lesoesHumano) copaEstado.lesoesHumano = {};
  for (const k of Object.keys(snap.jogosSuspensao ?? {})) {
    if ((copaEstado.jogosSuspensao[k] ?? 0) > 0) {
      copaEstado.jogosSuspensao[k]--;
      if (copaEstado.jogosSuspensao[k] <= 0) delete copaEstado.jogosSuspensao[k];
    }
  }
  for (const k of Object.keys(snap.lesoesHumano ?? {})) {
    const cur = copaEstado.lesoesHumano[k];
    if (cur && cur.partidasFora > 0) {
      cur.partidasFora--;
      if (cur.partidasFora <= 0) delete copaEstado.lesoesHumano[k];
    }
  }
  delete copaEstado._snapCopaInicioPartida;
}

function processarLesoesFinaisCopaHumano() {
  if (!copaEstado || !metaSelecaoJogador || tipoModoJogo !== "copa") return;
  if (!copaEstado.lesoesHumano) copaEstado.lesoesHumano = {};
  const sid = metaSelecaoJogador.id;
  const vistos = new Set();
  for (const j of [...timeJogador.titulares, ...timeJogador.reservas]) {
    if (!j.lesionado) continue;
    const k = chaveArtilheiroCopa(sid, j.nome);
    if (vistos.has(k)) continue;
    vistos.add(k);
    const n =
      j.copaLesaoPartidasFora !== undefined
        ? j.copaLesaoPartidasFora
        : sortearPartidasForaLesaoCopa(copaEstado.rng);
    delete j.copaLesaoPartidasFora;
    if (n > 0) {
      copaEstado.lesoesHumano[k] = { partidasFora: n };
    }
    const nm = escapeHtml(j.nome);
    appendLog(
      `<strong>Copa — lesão.</strong> ${textoPronosticoLesaoCopa(n, nm)}`,
    );
  }
}

function logSuspensaoRelatorioFimCopa() {
  if (!copaEstado?.suspensaoRelatorioFim?.length) return;
  for (const x of copaEstado.suspensaoRelatorioFim) {
    const m =
      x.motivo === "vermelho" ? "cartão vermelho" : "segundo cartão amarelo (acumulado)";
    appendLog(
      `<strong>Copa — disciplina.</strong> ${escapeHtml(x.nome)} cumprirá suspensão no próximo jogo (${m}).`,
    );
  }
  copaEstado.suspensaoRelatorioFim = [];
}

/** Após o apito final (tempo regulamentar, prorrogação ou pênaltis). */
function aplicarEfeitosPosJogoCopaLesaoDisciplina() {
  consumirLesaoESuspensaoCopaAposPartida();
  processarLesoesFinaisCopaHumano();
  logSuspensaoRelatorioFimCopa();
}

/**
 * Registra falta, cartões e expulsão; devolve linhas HTML para o resultado.
 * @param {object} j
 */
function aplicarFaltaNoJogador(j) {
  const n = (faltasPorJogador.get(j.id) ?? 0) + 1;
  faltasPorJogador.set(j.id, n);
  const fmt = spanNomeJogador;
  const lines = [textoFaltaMarcada(j, fmt)];
  if (n === 2 && !j.expulso) {
    lines.push(textoCartaoAmarelo(j, fmt));
    registrarDisciplinaCopaHumanoAposCartao(j, "amarelo");
  }
  if (n >= 3) {
    j.expulso = true;
    lines.push(textoExpulsao(j, fmt));
    registrarDisciplinaCopaHumanoAposCartao(j, "vermelho");
    aplicarDebuffPrimeiraExpulsao(timeDoElenco(j));
    if (timeDoElenco(j) === timeJogador) aguardandoPausaPorExpulsaoHumana = true;
  }
  return lines;
}

/**
 * Quem sofre a falta pode se lesionar (não confundir com o infrator).
 * @param {object | null | undefined} vitima
 * @returns {string[]}
 */
function tentarLesaoJogadorFaltado(vitima) {
  if (!vitima || vitima.lesionado || vitima.expulso) return [];
  if (Math.random() >= PROB_LESAO_APOS_FALTA) return [];
  vitima.lesionado = true;
  if (tipoModoJogo === "copa" && copaEstado) {
    vitima.copaLesaoPartidasFora = sortearPartidasForaLesaoCopa(copaEstado.rng);
  }
  return [textoLesaoPorFalta(vitima, spanNomeJogador)];
}

function temTitularLesionadoHumano() {
  return timeJogador.titulares.some((j) => j.lesionado);
}

/** True enquanto o relógio não pode avançar até trocar o lesionado. */
let precisaResolverLesaoHumano = false;

function bloquearPorLesaoHumanoAposLance() {
  precisaResolverLesaoHumano = true;
  jogoPausado = true;
  pintarEstatisticasPausa();
  sincronizarUiPausa();
  appendLog(
    "<strong>Lesão.</strong> Substitua o titular lesionado (símbolo na escalação) por um reserva. Esta troca não conta nas 5 substituições.",
  );
  alert(
    "Um titular está lesionado. Use Pausar (se necessário), clique no titular lesionado e em um reserva para trocar. Essa substituição não consome uma das 5 trocas.",
  );
}

/** Troca automaticamente titulares lesionados do CPU por reservas válidas. */
function substituirLesionadosTitularCpu() {
  let mudou = false;
  for (let ti = 0; ti < timeCpu.titulares.length; ti++) {
    const tit = timeCpu.titulares[ti];
    if (!tit.lesionado) continue;
    let swapped = false;
    for (let k = 0; k < 120; k++) {
      const ri = Math.floor(Math.random() * timeCpu.reservas.length);
      const res = timeCpu.reservas[ri];
      if (jogadorJaSubstituidoNaoPodeVoltar(res.id)) continue;
      [timeCpu.titulares[ti], timeCpu.reservas[ri]] = [timeCpu.reservas[ri], timeCpu.titulares[ti]];
      const v = validarElenco(timeCpu.titulares, timeCpu.reservas);
      if (v.ok) {
        jogadoresSubstituidosForaIds.add(tit.id);
        appendLog(
          `Lesão no adversário: ${res.nome} entra no lugar de ${tit.nome}.`,
        );
        swapped = true;
        mudou = true;
        break;
      }
      [timeCpu.titulares[ti], timeCpu.reservas[ri]] = [timeCpu.reservas[ri], timeCpu.titulares[ti]];
    }
    if (!swapped) {
      appendLog(
        `O adversário não conseguiu substituir o lesionado ${tit.nome} mantendo o elenco válido.`,
      );
    }
  }
  if (mudou) {
    renderEscalacoes(null);
    atualizarSubsHud();
  }
}

/** Titulares que ainda estão em campo (não expulsos). Lesionados contam enquanto não são substituídos. */
function contarTitularesEmCampo(/** @type {{ titulares: object[] }} */ time) {
  return time.titulares.filter((/** @type {{ expulso?: boolean }} */ j) => !j.expulso).length;
}

/**
 * Regra FIFA: mínimo 7 em campo; com 6 ou menos o jogo acaba em W.O. 3×0 para o adversário.
 * @returns {boolean} true se encerrou a partida (W.O. ou empate anômalo).
 */
function tentarEncerrarPartidaPorMinimoJogadoresEmCampo() {
  const nHum = contarTitularesEmCampo(timeJogador);
  const nCpu = contarTitularesEmCampo(timeCpu);
  if (nHum >= MIN_JOGADORES_EM_CAMPO && nCpu >= MIN_JOGADORES_EM_CAMPO) return false;

  if (nHum < MIN_JOGADORES_EM_CAMPO && nCpu < MIN_JOGADORES_EM_CAMPO) {
    appendLog(
      "<strong>Jogo encerrado.</strong> Os dois times ficaram com menos de 7 jogadores em campo. Resultado: 0 × 0.",
    );
    golsJogador = 0;
    golsCpu = 0;
    atualizarPlacar();
    encerrarPartida();
    return true;
  }
  if (nHum < MIN_JOGADORES_EM_CAMPO) {
    appendLog(
      "<strong>Jogo encerrado (W.O.).</strong> Seu time ficou com menos de 7 jogadores em campo. Vitória do adversário por 3 × 0.",
    );
    golsJogador = 0;
    golsCpu = 3;
    atualizarPlacar();
    encerrarPartida();
    return true;
  }
  appendLog(
    "<strong>Jogo encerrado (W.O.).</strong> O adversário ficou com menos de 7 jogadores em campo. Vitória sua por 3 × 0.",
  );
  golsJogador = 3;
  golsCpu = 0;
  atualizarPlacar();
  encerrarPartida();
  return true;
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

/** @type {{ titulares: object[], reservas: object[] }} */
let timeJogador = { titulares: [], reservas: [] };
/** @type {{ titulares: object[], reservas: object[] }} */
let timeCpu = { titulares: [], reservas: [] };
/** Metadados da seleção escolhida (bandeira, nome, sigla do placar). */
/** @type {{ id: string, nome: string, sigla: string, iso: string } | null} */
let metaSelecaoJogador = null;
/** @type {{ id: string, nome: string, sigla: string, iso: string } | null} */
let metaSelecaoCpu = null;

/** @type {string | null} */
let idSelecaoJogadorEscolhida = null;
/** @type {string | null} */
let idSelecaoCpuEscolhida = null;

let amistosoCardsMontados = false;

let partidaAtiva = false;
/**
 * Fora de partida: primeira entrada no jogo | logo após fim (Nova partida) | ajustando elenco antes de reiniciar.
 * @type {"pre_jogo" | "pos_fim" | "nova_prep"}
 */
let fluxoForaDePartida = "pre_jogo";
let substituicoesUsadas = 0;
let substituicoesCpuUsadas = 0;
/** IDs de quem já saiu de campo por substituição nesta partida (não pode voltar). */
const jogadoresSubstituidosForaIds = new Set();

function jogadorJaSubstituidoNaoPodeVoltar(id) {
  return jogadoresSubstituidosForaIds.has(id);
}

/** Copa: após o apito final, o jogador fica na tela do jogo até clicar Continuar. */
let copaTransicaoHubPendente = /** @type {null | (() => void)} */ (null);

function agendarTransicaoCopaAposContinuar(fn) {
  copaTransicaoHubPendente = fn;
  atualizarBtnCentroRodada();
}

function executarTransicaoCopaAposContinuar() {
  if (!copaTransicaoHubPendente) return;
  const fn = copaTransicaoHubPendente;
  copaTransicaoHubPendente = null;
  fn();
  atualizarBtnCentroRodada();
}
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
/**
 * Após decisão por pênaltis na Copa: gols da disputa (para o texto de fim de jogo). null se não houve pênaltis nesta partida.
 * @type {{ jogador: number, cpu: number } | null}
 */
let placarPenaltisPosDecisao = null;
/** Gols marcados na partida atual por id de jogador (escalação). */
const golsPorJogadorNaPartida = new Map();

function registrarGolMarcadoNaPartida(/** @type {{ id: string }} | null | undefined */ j) {
  if (!j?.id) return;
  golsPorJogadorNaPartida.set(j.id, (golsPorJogadorNaPartida.get(j.id) ?? 0) + 1);
}

/** @type {"amistoso" | "copa"} */
let tipoModoJogo = "amistoso";

/**
 * @type {null | {
 *   rng: () => number,
 *   seed: number,
 *   grupos: Record<string, string[]>,
 *   partidasPorGrupo: Record<string, import('./world-cup.js').ResultadoPartida[]>,
 *   playerTeamId: string,
 *   grupoPlayer: string,
 *   adversariosGrupo: string[],
 *   idxAdversarioGrupo: number,
 *   faseCopa: string,
 *   ordemGrupos: Record<string, string[]>,
 *   jogosEliminatorios: { fase: string, homeId: string, awayId: string, winnerId: string | null, gh?: number, ga?: number, penGh?: number, penGa?: number }[],
 *   idxJogoEliminatorio: number,
 *   campeaoId: string | null,
 *   artilheiros: Record<string, { selecaoId: string, nome: string, gols: number }>,
 *   lesoesHumano?: Record<string, { partidasFora: number }>,
 *   jogosSuspensao?: Record<string, number>,
 *   amarelosAcumulado?: Record<string, number>,
 *   suspensaoRelatorioFim?: { nome: string, motivo: "vermelho" | "dois amarelos" }[],
 *   _snapCopaInicioPartida?: { jogosSuspensao: Record<string, number>, lesoesHumano: Record<string, { partidasFora: number }> },
 *   ultimaRodadaResultados?: { numero: number, partidas: { L: string, homeId: string, awayId: string, gh: number, ga: number }[] },
 *   eliminatoria?: null | {
 *     oitavas: { fase: string, homeId: string, awayId: string, winnerId: string | null, gh?: number, ga?: number, penGh?: number, penGa?: number }[],
 *     quartas: { fase: string, homeId: string, awayId: string, winnerId: string | null, gh?: number, ga?: number, penGh?: number, penGa?: number }[] | null,
 *     semi: { fase: string, homeId: string, awayId: string, winnerId: string | null, gh?: number, ga?: number, penGh?: number, penGa?: number }[] | null,
 *     final: { fase: string, homeId: string, awayId: string, winnerId: string | null, gh?: number, ga?: number, penGh?: number, penGa?: number }[] | null,
 *   },
 * }}
 */
let copaEstado = null;

/** Partida de mata-mata (permite prorrogação se empatar). */
let copaPartidaKnockout = false;
let copaProrrogaAtiva = false;
/** 1 = 1.º tempo de prorrogação, 2 = 2.º (minutos absolutos após o fim do 2.º tempo + acréscimos). */
let copaEtExtra = 0;
let acrescimosET1 = 0;
let acrescimosET2 = 0;
let copaAguardandoEt2 = false;
let copaEt2Liberado = false;
/** @type {(() => void) | null} */
let resolveInicioProrrogacao = null;
/** @type {(() => void) | null} */
let resolveInicioEt2 = null;
let aguardandoInicioProrrogacao = false;
let aguardandoInicioEt2 = false;
let copaCardsMontados = false;
/** @type {ReturnType<typeof setTimeout> | null} */
let copaSalvarFeedbackTimer = null;
/** @type {string | null} */
let idSelecaoCopaEscolhida = null;

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

function pintarDueloRpgGoleiro(atacante, goleiro, chuteJogador, penalti = false) {
  const el = els.dueloRpgStrip;
  el.hidden = false;
  const rotulo = penalti ? "Pênalti — " : "";
  const blocoContexto = penalti
    ? ""
    : chuteJogador
      ? `<p class="duelo-rpg-contexto"><strong>${rotulo}Cobrança:</strong> seu ataque na bola × defesa do goleiro rival.</p>`
      : `<p class="duelo-rpg-contexto"><strong>${rotulo}Defesa do gol:</strong> seu goleiro na linha × cobrança do adversário.</p>`;
  if (chuteJogador) {
    el.innerHTML = `
      ${blocoContexto}
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
      ${blocoContexto}
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

/**
 * Minuto exibido no relógio. Segundo tempo: após 90′ mostra acréscimos como 90+1, …
 * Prorrogação: 1.º suplementar começa em 90′ (não no minuto interno após 90+acrésc.); 2.º em 105′.
 * @param {number} m minuto interno da simulação (contínuo; 2.º tempo recomeça em 45).
 */
function formatMinuto(m) {
  const x = Number(m);
  if (!Number.isFinite(x)) return "—";
  const mi = Math.floor(x);
  const fimReg = minutoFimSegundoTempoRegulamentar();
  const fimEt1 = minutoFimPrimeiroTempoProrrogacao();

  if (copaProrrogaAtiva && copaEtExtra === 2 && copaEt2Liberado && mi <= fimEt1) {
    return "105′";
  }
  if (copaProrrogaAtiva && copaEtExtra === 2 && mi > fimEt1) {
    return `${105 + (mi - fimEt1 - 1)}′`;
  }
  if (copaProrrogaAtiva && copaEtExtra === 1 && mi > fimReg) {
    return `${90 + (mi - fimReg - 1)}′`;
  }
  if (segundoTempoAutorizado && mi > 90 && mi <= fimReg) {
    return `90+${mi - 90}′`;
  }
  return `${mi}′`;
}

function atualizarPlacar() {
  if (!metaSelecaoJogador || !metaSelecaoCpu) {
    els.placar.textContent = "0 × 0";
    return;
  }
  const j = metaSelecaoJogador.sigla;
  const c = metaSelecaoCpu.sigla;
  els.placar.textContent = `${j} ${golsJogador} × ${golsCpu} ${c}`;
}

function aplicarCabecalhosPainelSelecoes() {
  if (!metaSelecaoJogador || !metaSelecaoCpu) return;
  const bj = els.bandeiraJogadorPainel;
  const nj = els.nomeSelecaoJogadorPainel;
  const bc = els.bandeiraCpuPainel;
  const nc = els.nomeSelecaoCpuPainel;
  if (bj) {
    bj.src = urlBandeira(metaSelecaoJogador.iso, 80);
    bj.alt = `Bandeira de ${metaSelecaoJogador.nome}`;
  }
  if (nj) nj.textContent = metaSelecaoJogador.nome;
  if (bc) {
    bc.src = urlBandeira(metaSelecaoCpu.iso, 80);
    bc.alt = `Bandeira de ${metaSelecaoCpu.nome}`;
  }
  if (nc) nc.textContent = metaSelecaoCpu.nome;
}

function labelEtapa(/** @type {number} */ minuto) {
  if (copaProrrogaAtiva) {
    const fimReg = minutoFimSegundoTempoRegulamentar();
    if (copaEtExtra === 2 && copaEt2Liberado) return "Prorrogação — 2.º tempo";
    if (copaEtExtra === 1) {
      if (minuto <= fimReg) return "2º tempo";
      return "Prorrogação — 1.º tempo";
    }
  }
  if (!segundoTempoAutorizado) return "1º tempo";
  return "2º tempo";
}

function minutoFimPrimeiroTempo() {
  return 45 + acrescimosPrimeiroTempo;
}

/** Último minuto do 2.º tempo (inclui acréscimos). A prorrogação começa no minuto seguinte. */
function minutoFimSegundoTempoRegulamentar() {
  return 90 + acrescimosSegundoTempo;
}

/** Fim do 1.º tempo de prorrogação (15 min + acréscimos da prorrogação 1). */
function minutoFimPrimeiroTempoProrrogacao() {
  return minutoFimSegundoTempoRegulamentar() + 15 + acrescimosET1;
}

/** Fim do 2.º tempo de prorrogação. */
function minutoFimSegundoTempoProrrogacao() {
  return minutoFimPrimeiroTempoProrrogacao() + 15 + acrescimosET2;
}

function minutoFimJogo() {
  if (copaProrrogaAtiva) {
    if (copaEtExtra === 1) return minutoFimPrimeiroTempoProrrogacao();
    if (copaEtExtra === 2) return minutoFimSegundoTempoProrrogacao();
  }
  return minutoFimSegundoTempoRegulamentar();
}

function sigla(pos) {
  const m = { goleiro: "GOL", zagueiro: "ZAG", meia: "MEI", atacante: "ATA" };
  return m[pos] || pos;
}

/** Tooltip do ✚: quantos jogos da Copa ainda ficará indisponível como titular (`partidasFora` do estado ou previsão ao lesionar). */
function tituloTooltipLesaoCopaPartidas(n) {
  const k = Number(n);
  if (!Number.isFinite(k) || k <= 0) {
    return "Fora de ação só nesta partida; no próximo jogo da Copa pode voltar a ser titular.";
  }
  if (k === 1) return "Fora de ação por mais 1 jogo na Copa (não pode ser titular).";
  return `Fora de ação por mais ${k} jogos na Copa (não pode ser titular).`;
}

/**
 * Copa: lesão (partidas fora) ou suspensão — ao lado dos atributos, antes e durante a partida.
 * @param {object} j
 * @param {boolean} listaDoTimeHumano
 */
function htmlIndicadoresCopaPreJogo(j, listaDoTimeHumano) {
  if (tipoModoJogo !== "copa" || !copaEstado || !metaSelecaoJogador || !listaDoTimeHumano) return "";
  const k = chaveArtilheiroCopa(metaSelecaoJogador.id, j.nome);
  const les = copaEstado.lesoesHumano?.[k]?.partidasFora ?? 0;
  const sus = copaEstado.jogosSuspensao?.[k] ?? 0;
  if (les <= 0 && sus <= 0) return "";
  const bits = [];
  if (sus > 0 && !(partidaAtiva && j.expulso)) {
    bits.push(
      `<span class="lineup-disc" title="Suspenso — não pode ser titular nesta partida" aria-label="Suspenso"><span class="lineup-cartao lineup-cartao--vermelho"></span></span>`,
    );
  }
  if (les > 0 && !(partidaAtiva && j.lesionado)) {
    const tip = tituloTooltipLesaoCopaPartidas(les);
    bits.push(
      `<span class="lineup-disc lineup-lesao-wrap" title="${tip}" aria-label="${tip}"><span class="lineup-lesao">✚</span></span>`,
    );
  }
  return bits.join("");
}

/**
 * Mini-cartões na escalação (só com partida em andamento).
 * @param {object} j
 */
function htmlIndicadoresDisciplina(j) {
  if (!partidaAtiva) return "";
  const bits = [];
  if (j.lesionado) {
    const tip =
      tipoModoJogo === "copa" && copaEstado && j.copaLesaoPartidasFora !== undefined
        ? tituloTooltipLesaoCopaPartidas(j.copaLesaoPartidasFora)
        : "Lesionado — deve sair.";
    bits.push(
      `<span class="lineup-disc lineup-lesao-wrap" title="${tip}" aria-label="${tip}"><span class="lineup-lesao">✚</span></span>`,
    );
  }
  if (j.expulso) {
    bits.push(
      `<span class="lineup-disc" title="Expulso" aria-label="Expulso"><span class="lineup-cartao lineup-cartao--vermelho"></span></span>`,
    );
  } else {
    const f = faltasPorJogador.get(j.id) ?? 0;
    if (f >= 2) {
      bits.push(
        `<span class="lineup-disc" title="Cartão amarelo" aria-label="Cartão amarelo"><span class="lineup-cartao lineup-cartao--amarelo"></span></span>`,
      );
    }
  }
  return bits.join("");
}

/**
 * Bolas ao lado dos atributos: uma por gol nesta partida.
 * @param {object} j
 */
function htmlBolasGolsNaPartida(j) {
  if (!partidaAtiva) return "";
  const n = golsPorJogadorNaPartida.get(j.id) ?? 0;
  if (n <= 0) return "";
  const bolas = "⚽".repeat(n);
  return `<span class="lineup-gols-wrap" title="${n} gol${n > 1 ? "s" : ""} nesta partida" aria-label="${n} gol${n > 1 ? "s" : ""} na partida">${bolas}</span>`;
}

/**
 * @param {boolean} listaDoTimeHumano — true = painel esquerdo (seu time)
 * @param {boolean} [ehListaReservas] banco: destaca quem já foi substituído e não pode voltar
 */
function renderLista(ul, jogadores, destaqueId, listaDoTimeHumano, ehListaReservas = false) {
  ul.innerHTML = "";
  const ord = ordenarPorPosicao(jogadores);
  const clsNome = listaDoTimeHumano ? "nm-time-jogador" : "nm-time-cpu";
  for (const j of ord) {
    const li = document.createElement("li");
    li.dataset.id = j.id;
    if (j.id === destaqueId) li.classList.add("em-lance");
    if (j.expulso) li.classList.add("jogador-expulso");
    if (j.lesionado) li.classList.add("jogador-lesionado");
    if (ehListaReservas && partidaAtiva && jogadorJaSubstituidoNaoPodeVoltar(j.id)) {
      li.classList.add("jogador-fora-partida");
      li.title = "Substituído — não pode voltar a entrar nesta partida.";
    }
    const stA = htmlStatVersusPartida(j, "ataque");
    const stD = htmlStatVersusPartida(j, "defesa");
    const disc = htmlIndicadoresDisciplina(j);
    const bolas = htmlBolasGolsNaPartida(j);
    const copaPre = htmlIndicadoresCopaPreJogo(j, listaDoTimeHumano);
    const statsPrefix = [disc, bolas, copaPre].filter(Boolean).join(" ");
    li.innerHTML = `<span class="sigla">${sigla(j.posicao)}</span> <span class="nome ${clsNome}">${escapeHtml(j.nome)}</span><span class="stats">${statsPrefix ? `${statsPrefix} ` : ""}${stA}/${stD}</span>`;
    ul.appendChild(li);
  }
}

function renderEscalacoes(destaque) {
  if (!metaSelecaoJogador || !metaSelecaoCpu) return;
  renderLista(els.timeJogadorTit, timeJogador.titulares, destaque?.jogador, true, false);
  renderLista(els.timeJogadorRes, timeJogador.reservas, null, true, true);
  renderLista(els.timeCpuTit, timeCpu.titulares, destaque?.adversario, false, false);
  renderLista(els.timeCpuRes, timeCpu.reservas, null, false, true);
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
  const vol = els.btnVoltarMenuJogo;
  if (partidaAtiva && aguardandoInicioProrrogacao && resolveInicioProrrogacao) {
    el.hidden = false;
    el.disabled = false;
    el.textContent = "Iniciar prorrogação";
    el.classList.add("pri");
    if (vol) vol.hidden = true;
    return;
  }
  if (partidaAtiva && aguardandoInicioEt2 && resolveInicioEt2) {
    el.hidden = false;
    el.disabled = false;
    el.textContent = "Começar 2.º tempo da prorrogação";
    el.classList.add("pri");
    if (vol) vol.hidden = true;
    return;
  }
  if (!partidaAtiva) {
    el.hidden = false;
    el.disabled = false;
    if (tipoModoJogo === "copa" && copaTransicaoHubPendente) {
      el.textContent = "Continuar";
    } else {
      el.textContent = fluxoForaDePartida === "pos_fim" ? "Nova partida" : "Iniciar partida";
    }
    el.classList.remove("sec");
    el.classList.add("pri");
    if (vol) {
      const mostrarVoltar = fluxoForaDePartida === "pos_fim" || fluxoForaDePartida === "nova_prep";
      vol.hidden = !mostrarVoltar;
      vol.disabled = false;
    }
    return;
  }
  if (vol) vol.hidden = true;
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
  limparTransicaoResumoCampo();
}

/** Bloco “o que aconteceu no campo” antes do texto da finalização (faltas, cartões, pênalti marcado). */
function limparTransicaoResumoCampo() {
  const el = els.transicaoResumoCampo;
  if (!el) return;
  el.innerHTML = "";
  el.hidden = true;
}

/** @param {string[]} linhasHtml parágrafos já com markup (ex.: span de nome) */
function pintarTransicaoResumoCampo(linhasHtml) {
  const el = els.transicaoResumoCampo;
  if (!el) return;
  if (!linhasHtml.length) {
    limparTransicaoResumoCampo();
    return;
  }
  el.hidden = false;
  el.innerHTML = linhasHtml.map((t) => `<p class="transicao-resumo-par">${t}</p>`).join("");
}

function pararQte() {
  if (qteTimerLate !== null) {
    clearTimeout(qteTimerLate);
    qteTimerLate = null;
  }
}

/**
 * @typedef {{ acertou: boolean, falhaPorTeclaErrada?: boolean }} QteLetraOutcome
 * `falhaPorTeclaErrada` só é true quando o jogador pressionou outra letra (não por tempo esgotado).
 */

/**
 * QTE: letra aleatória A–Z; acertar a tecla no prazo (tempo depende dos atributos).
 * @param {{ letra: string, tempoLimiteMs: number }} params
 * @param {(o: QteLetraOutcome) => void} onFim
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
  const seg = fmtSegundosExatos(tempoLimiteMs);
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

  /** @param {QteLetraOutcome} outcome */
  function finalizar(outcome) {
    if (resolvido) return;
    resolvido = true;
    limparContagem();
    limparFeedbackAgendado();
    detachListeners();
    pararQte();
    painel.classList.remove("falha", "qte-feedback-acerto", "qte-countdown");
    cancelarInputQte = null;
    onFim(outcome);
  }

  /** @param {QteLetraOutcome} outcome */
  function agendarFeedbackFinal(outcome) {
    limparFeedbackAgendado();
    const espera = outcome.acertou ? QTE_FEEDBACK_ACERTO_MS : QTE_FEEDBACK_FALHA_MS;
    feedbackTimer = setTimeout(() => {
      feedbackTimer = null;
      finalizar(outcome);
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
      agendarFeedbackFinal({ acertou: true });
      return;
    }
    detachListeners();
    pararQte();
    label.textContent = letra;
    sub.textContent = "Errado!";
    painel.classList.add("falha");
    painel.classList.remove("qte-feedback-acerto", "qte-countdown");
    agendarFeedbackFinal({ acertou: false, falhaPorTeclaErrada: true });
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
      agendarFeedbackFinal({ acertou: false, falhaPorTeclaErrada: false });
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
 * Vários QTEs em sequência; só chama onFim com acertou true se todos forem acertados.
 * @param {{ letra: string, tempoLimiteMs: number }[]} paramsArr
 * @param {(o: QteLetraOutcome) => void} onFim
 */
function iniciarQteLetraSequencia(paramsArr, onFim) {
  if (paramsArr.length === 0) {
    onFim({ acertou: false, falhaPorTeclaErrada: false });
    return;
  }
  if (paramsArr.length === 1) {
    iniciarQteLetra(paramsArr[0], onFim);
    return;
  }
  const total = paramsArr.length;
  let i = 0;
  /** @param {QteLetraOutcome} outcome */
  function proximo(outcome) {
    if (!outcome.acertou) {
      onFim(outcome);
      return;
    }
    i++;
    if (i >= total) {
      onFim({ acertou: true });
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
  const fimJogoAberto = els.fimJogoOverlay && !els.fimJogoOverlay.hidden;
  const penaltisResAberto =
    els.penaltisResultadoOverlay && !els.penaltisResultadoOverlay.hidden;
  const podePausar =
    partidaAtiva &&
    els.dueloOverlay.hidden &&
    !jogoPausado &&
    !aguardandoSegundoTempo &&
    els.golOverlay.hidden &&
    !penaltisResAberto &&
    !fimJogoAberto;
  els.btnPausa.hidden = !podePausar;
}

/** Intervalo entre 1.º e 2.º tempo regulamentar (mensagens de prorrogação sobrescrevem e devem voltar a isto ao esconder). */
const INTERVALO_BANNER_HTML_TEMPO_REGULAR =
  "<strong>Fim do 1º tempo.</strong> Ajuste o time se quiser. O botão central passa a ser <strong>Começar 2º tempo</strong> — o relógio só volta depois do clique.";

function mostrarBannerIntervalo() {
  els.intervaloBanner.hidden = false;
  if (bannerEsconderTimer !== null) {
    clearTimeout(bannerEsconderTimer);
    bannerEsconderTimer = null;
  }
  bannerEsconderTimer = setTimeout(() => {
    bannerEsconderTimer = null;
    esconderUiIntervalo();
  }, 10000);
}

function esconderUiIntervalo() {
  els.intervaloBanner.hidden = true;
  if (els.intervaloBanner) els.intervaloBanner.innerHTML = INTERVALO_BANNER_HTML_TEMPO_REGULAR;
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
    if (jogadorJaSubstituidoNaoPodeVoltar(res.id)) continue;
    [timeCpu.titulares[ti], timeCpu.reservas[ri]] = [timeCpu.reservas[ri], timeCpu.titulares[ti]];
    const v = validarElenco(timeCpu.titulares, timeCpu.reservas);
    if (v.ok) {
      jogadoresSubstituidosForaIds.add(tit.id);
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
  if (els.intervaloBanner) els.intervaloBanner.innerHTML = INTERVALO_BANNER_HTML_TEMPO_REGULAR;
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
  const fimEt1 = minutoFimPrimeiroTempoProrrogacao();

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
    if (
      copaProrrogaAtiva &&
      copaEtExtra === 1 &&
      m === fimEt1 &&
      alvo > fimEt1 &&
      !copaEt2Liberado
    ) {
      tempoAnimando = false;
      await aguardarInicioEt2();
      copaEtExtra = 2;
      copaEt2Liberado = true;
      aguardandoInicioEt2 = false;
      tempoAnimando = true;
      atualizarBtnCentroRodada();
      m = minutoFimPrimeiroTempoProrrogacao();
      els.relogio.textContent = formatMinuto(m);
      els.etapaTempo.textContent = labelEtapa(m);
      continue;
    }
    m++;
    els.relogio.textContent = formatMinuto(m);
    els.etapaTempo.textContent = labelEtapa(m);
    await sleepRespeitandoPausa(RELOGIO_MS_POR_MINUTO);
  }

  tempoAnimando = false;
}

function aguardarInicioProrrogacao() {
  aguardandoInicioProrrogacao = true;
  sincronizarUiPausa();
  if (els.intervaloBanner) {
    els.intervaloBanner.hidden = false;
    els.intervaloBanner.innerHTML =
      "<strong>Empate no tempo regulamentar.</strong> Prorrogação (2 × 15 min) e, se preciso, pênaltis. Use o botão central: <strong>Iniciar prorrogação</strong>.";
  }
  appendLog(
    "<strong>Empate.</strong> Na Copa, o mata-mata segue com prorrogação e, se necessário, disputa de pênaltis.",
  );
  return new Promise((resolve) => {
    resolveInicioProrrogacao = resolve;
    atualizarBtnCentroRodada();
  });
}

function aguardarInicioEt2() {
  aguardandoInicioEt2 = true;
  sincronizarUiPausa();
  if (els.intervaloBanner) {
    els.intervaloBanner.hidden = false;
    els.intervaloBanner.innerHTML =
      "<strong>Fim da 1.ª prorrogação.</strong> Use o botão central: <strong>Começar 2.º tempo da prorrogação</strong>.";
  }
  appendLog("Intervalo antes da 2.ª prorrogação.");
  return new Promise((resolve) => {
    resolveInicioEt2 = resolve;
    atualizarBtnCentroRodada();
  });
}

function iniciarProrrogacaoAposClique() {
  copaProrrogaAtiva = true;
  copaEtExtra = 1;
  copaEt2Liberado = false;
  acrescimosET1 = sortearAcrescimosProrrogacao();
  esconderUiIntervalo();
}

function limparSelecaoSub() {
  document.querySelectorAll(".lista-jogadores li.sel-sub").forEach((li) => li.classList.remove("sel-sub"));
  selecaoSub = null;
}

function ligarCliquesSubstituicao() {
  [els.timeJogadorTit, els.timeJogadorRes].forEach((ul) => {
    if (!ul) return;
    ul.addEventListener("click", (ev) => {
      const li = ev.target.closest("li");
      if (!li) return;

      if (!jogoPausado && partidaAtiva && !els.dueloOverlay.hidden) return;

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
      if (tipoModoJogo === "copa" && jogadorHumanoBloqueadoTitularCopa(res.nome)) {
        limparSelecaoSub();
        alert("Esse jogador está suspenso ou em recuperação de lesão — não pode ser titular nesta partida.");
        return;
      }
      if (partidaAtiva && jogadorJaSubstituidoNaoPodeVoltar(res.id)) {
        limparSelecaoSub();
        alert("Quem já foi substituído não pode voltar a entrar na mesma partida.");
        return;
      }
      const trocaPorLesao = partidaAtiva && tit.lesionado;
      if (partidaAtiva && substituicoesUsadas >= 5 && !trocaPorLesao) {
        limparSelecaoSub();
        alert("Limite de 5 substituições atingido.");
        return;
      }

      [timeJogador.titulares[ti], timeJogador.reservas[ri]] = [timeJogador.reservas[ri], timeJogador.titulares[ti]];

      const v = validarElenco(timeJogador.titulares, timeJogador.reservas);
      if (!v.ok) {
        [timeJogador.titulares[ti], timeJogador.reservas[ri]] = [timeJogador.reservas[ri], timeJogador.titulares[ti]];
        alert(v.msg);
        limparSelecaoSub();
        return;
      }

      if (partidaAtiva) {
        jogadoresSubstituidosForaIds.add(tit.id);
        if (!trocaPorLesao) substituicoesUsadas++;
        appendLog(
          trocaPorLesao
            ? `Substituição por lesão: ${res.nome} entra no lugar de ${tit.nome}.`
            : `Substituição: ${res.nome} entra no lugar de ${tit.nome}.`,
        );
      }
      atualizarSubsHud();
      if (jogoPausado) pintarEstatisticasPausa();
      limparSelecaoSub();
      renderEscalacoes(null);
      if (precisaResolverLesaoHumano && !temTitularLesionadoHumano()) {
        precisaResolverLesaoHumano = false;
        jogoPausado = false;
        sincronizarUiPausa();
        void continuarRodadaAposLance();
      }
    });
  });
}

function esconderJogoMostrarCopa() {
  if (els.jogoRoot) {
    els.jogoRoot.setAttribute("hidden", "");
    els.jogoRoot.style.display = "none";
  }
  if (els.telaCopa) {
    els.telaCopa.style.removeProperty("display");
    els.telaCopa.removeAttribute("hidden");
  }
}

function htmlTabelaClassificacaoGrupoCopa(L, compact) {
  if (!copaEstado) return "";
  const ids = copaEstado.grupos[L];
  const partidas = copaEstado.partidasPorGrupo[L].filter((x) => x.gh >= 0);
  const ordem = ordenarGrupoFifa(ids, partidas, copaEstado.rng);
  const agg = agregarClassificacao(ids, partidas);
  const th = compact
    ? "<th>#</th><th>Seleção</th><th>PJ</th><th>PTS</th>"
    : "<th>#</th><th>Seleção</th><th>PJ</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>Pts</th>";
  let html = `<table><thead><tr>${th}</tr></thead><tbody>`;
  ordem.forEach((id, i) => {
    const s = SELECOES.find((x) => x.id === id);
    const r = agg[id];
    const cls = id === copaEstado.playerTeamId ? ' class="destaque-jogador"' : "";
    if (compact) {
      html += `<tr${cls}><td>${i + 1}</td><td>${escapeHtml(s?.nome ?? id)}</td><td>${r.pj}</td><td>${r.pts}</td></tr>`;
    } else {
      html += `<tr${cls}><td>${i + 1}</td><td>${escapeHtml(s?.nome ?? id)}</td><td>${r.pj}</td><td>${r.vit}</td><td>${r.emp}</td><td>${r.der}</td><td>${r.gf}</td><td>${r.gc}</td><td>${r.sg}</td><td>${r.pts}</td></tr>`;
    }
  });
  html += "</tbody></table>";
  return html;
}

function pintarTodasClassificacoesGruposCopa() {
  if (!copaEstado || !els.copaTabelasTodosGrupos) return;
  els.copaTabelasTodosGrupos.replaceChildren();
  const ordL = Object.keys(copaEstado.grupos).sort();
  for (const L of ordL) {
    const box = document.createElement("div");
    box.className = "copa-mini-tabela-grupo";
    if (L === copaEstado.grupoPlayer) box.classList.add("copa-mini-tabela-grupo--player");
    const h = document.createElement("h4");
    h.textContent = `Grupo ${L}`;
    const inner = document.createElement("div");
    inner.innerHTML = htmlTabelaClassificacaoGrupoCopa(L, true);
    box.append(h, inner);
    els.copaTabelasTodosGrupos.appendChild(box);
  }
}

function pintarTabelaGrupoCopa() {
  if (!copaEstado || !els.copaTabelaGrupo) return;
  els.copaTabelaGrupo.innerHTML = htmlTabelaClassificacaoGrupoCopa(copaEstado.grupoPlayer, false);
  pintarTodasClassificacoesGruposCopa();
}

function chaveArtilheiroCopa(selecaoId, nome) {
  return `${selecaoId}::${nome}`;
}

function registrarGolArtilheiroCopa(selecaoId, nome) {
  if (!copaEstado || !nome || !selecaoId) return;
  if (!copaEstado.artilheiros) copaEstado.artilheiros = {};
  const k = chaveArtilheiroCopa(selecaoId, nome);
  if (!copaEstado.artilheiros[k]) {
    copaEstado.artilheiros[k] = { selecaoId, nome, gols: 0 };
  }
  copaEstado.artilheiros[k].gols++;
}

/**
 * Escolhe um jogador do pool com probabilidade proporcional ao ataque × fator aleatório.
 * @param {object[]} pool
 * @param {() => number} rng
 */
function pickWeightedByAtaque(pool, rng) {
  if (!pool || pool.length === 0) return null;
  const pesos = pool.map((p) => {
    const base = Math.max(1, p.ataque);
    return base * (0.72 + 0.56 * rng());
  });
  const sum = pesos.reduce((a, b) => a + b, 0);
  let r = rng() * sum;
  for (let i = 0; i < pool.length; i++) {
    r -= pesos[i];
    if (r <= 0) return pool[i].nome;
  }
  return pool[pool.length - 1].nome;
}

/**
 * Autor simulado (Copa): setor 60% ataque / 30% meio / 10% defesa (zagueiros);
 * titular 80% / reserva 20% quando os dois existem no setor; peso crescente com atributo ataque.
 * @param {string} selecaoId
 * @param {() => number} rng
 */
function sortearNomeAutorGolSimulado(selecaoId, rng) {
  const s = selecaoPorId(selecaoId);
  if (!s) return null;
  const titOut = s.titulares.filter((p) => p.posicao !== POSITIONS.GOLEIRO);
  const resOut = s.reservas.filter((p) => p.posicao !== POSITIONS.GOLEIRO);
  if (titOut.length === 0 && resOut.length === 0) return null;

  const u = rng();
  const setor =
    u < 0.6 ? POSITIONS.ATACANTE : u < 0.9 ? POSITIONS.MEIA : POSITIONS.ZAGUEIRO;

  let poolTit = titOut.filter((p) => p.posicao === setor);
  let poolRes = resOut.filter((p) => p.posicao === setor);

  if (poolTit.length === 0 && poolRes.length === 0) {
    poolTit = titOut;
    poolRes = resOut;
  }

  let pool;
  if (poolTit.length === 0) pool = poolRes;
  else if (poolRes.length === 0) pool = poolTit;
  else pool = rng() < 0.8 ? poolTit : poolRes;

  return pickWeightedByAtaque(pool, rng);
}

function registrarGolsPartidaSimuladaCopa(homeId, awayId, gh, ga, rng) {
  for (let i = 0; i < gh; i++) {
    const n = sortearNomeAutorGolSimulado(homeId, rng);
    if (n) registrarGolArtilheiroCopa(homeId, n);
  }
  for (let i = 0; i < ga; i++) {
    const n = sortearNomeAutorGolSimulado(awayId, rng);
    if (n) registrarGolArtilheiroCopa(awayId, n);
  }
}

function pintarArtilheirosCopa() {
  if (!copaEstado || !els.copaArtilheirosLista) return;
  if (!copaEstado.artilheiros) copaEstado.artilheiros = {};
  const linhas = Object.values(copaEstado.artilheiros).sort((a, b) =>
    b.gols !== a.gols ? b.gols - a.gols : a.nome.localeCompare(b.nome, "pt-BR"),
  );
  if (linhas.length === 0) {
    els.copaArtilheirosLista.innerHTML =
      "<p class=\"tela-menu-sub\">Ainda não há gols registrados nesta Copa.</p>";
    return;
  }
  const pid = copaEstado.playerTeamId;
  const top = linhas.slice(0, COPA_ARTILHEIROS_HUB_MAX);
  let html =
    "<table><thead><tr><th></th><th>Jogador</th><th>Seleção</th><th>Gols</th></tr></thead><tbody>";
  top.forEach((row, idx) => {
    const sel = SELECOES.find((x) => x.id === row.selecaoId);
    const cls = row.selecaoId === pid ? ' class="destaque-jogador"' : "";
    html += `<tr${cls}><td class="artilheiro-pos">${idx + 1}</td><td>${escapeHtml(row.nome)}</td><td>${escapeHtml(sel?.nome ?? row.selecaoId)}</td><td class="artilheiro-gols">${row.gols}</td></tr>`;
  });
  html += "</tbody></table>";
  els.copaArtilheirosLista.innerHTML = html;
}

/** Lista de artilheiros visível no hub (fase de grupos ou mata-mata). */
function mostrarSecaoArtilheirosCopaNoHub() {
  if (!els.copaArtilheirosWrap || !els.btnCopaVerArtilheiros) return;
  els.copaArtilheirosWrap.hidden = false;
  pintarArtilheirosCopa();
  els.btnCopaVerArtilheiros.hidden = false;
}

function esconderSecaoArtilheirosCopaNoHub() {
  if (els.copaArtilheirosWrap) els.copaArtilheirosWrap.hidden = true;
  if (els.btnCopaVerArtilheiros) els.btnCopaVerArtilheiros.hidden = true;
}

/**
 * @returns {{ L: string, homeId: string, awayId: string, gh: number, ga: number }[]}
 */
function simularRodadaGruposCopa(/** @type {1 | 2 | 3} */ numeroRodada) {
  if (!copaEstado) return [];
  /** @type {{ L: string, homeId: string, awayId: string, gh: number, ga: number }[]} */
  const registradas = [];
  simularRodadaGruposExcetoJogoHumano(
    copaEstado.grupos,
    copaEstado.partidasPorGrupo,
    copaEstado.grupoPlayer,
    copaEstado.playerTeamId,
    numeroRodada,
    forcaSelecaoId,
    copaEstado.rng,
    (L, homeId, awayId, gh, ga) => {
      registradas.push({ L, homeId, awayId, gh, ga });
      registrarGolsPartidaSimuladaCopa(homeId, awayId, gh, ga, copaEstado.rng);
    },
  );
  return registradas;
}

function ordinalRodadaGruposPt(n) {
  if (n === 1) return "1.ª";
  if (n === 2) return "2.ª";
  if (n === 3) return "3.ª";
  return `${n}.ª`;
}

function siglaSelecaoIdCopa(id) {
  return SELECOES.find((x) => x.id === id)?.sigla ?? id;
}

function formatarDataSaveCopa(iso) {
  try {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return String(iso);
  }
}

function nomeFaseCopaCurta(f) {
  const m = {
    grupos: "Grupos",
    oitavas: "Oitavas",
    quartas: "Quartas",
    semi: "Semis",
    final: "Final",
    eliminado: "Eliminado",
    campeao: "Campeão",
  };
  return m[/** @type {keyof typeof m} */ (f)] ?? f;
}

/** @param {Record<string, string[]>} grupos */
function preencherGradeGruposCopa(grupos) {
  if (!els.copaGruposGrid) return;
  els.copaGruposGrid.replaceChildren();
  const ordL = Object.keys(grupos).sort();
  for (const L of ordL) {
    const box = document.createElement("div");
    box.className = "copa-mini-grupo";
    const h = document.createElement("h4");
    h.textContent = `Grupo ${L}`;
    const ul = document.createElement("ul");
    for (const id of grupos[L]) {
      const s = SELECOES.find((x) => x.id === id);
      const li = document.createElement("li");
      const im = document.createElement("img");
      im.src = urlBandeira(s?.iso ?? "xx", 40);
      im.alt = "";
      li.append(im, document.createTextNode(s?.nome ?? id));
      ul.appendChild(li);
    }
    box.append(h, ul);
    els.copaGruposGrid.appendChild(box);
  }
}

function sincronizarCardSelecaoCopaComEstado() {
  if (!els.copaCardsJogador || !idSelecaoCopaEscolhida) return;
  els.copaCardsJogador.querySelectorAll(".card-selecao").forEach((b) => {
    b.classList.toggle("card-selecao--ativa", b.dataset.selecaoId === idSelecaoCopaEscolhida);
  });
}

function atualizarSelectSobrescreverCopa() {
  const sel = els.copaSalvarSobrescrever;
  if (!sel) return;
  const cur = sel.value;
  sel.replaceChildren();
  const o0 = document.createElement("option");
  o0.value = "";
  o0.textContent = "Salvar como novo";
  sel.appendChild(o0);
  for (const s of listarSavesCopaOrdenados()) {
    const o = document.createElement("option");
    o.value = s.id;
    o.textContent = `${s.name} — ${formatarDataSaveCopa(s.savedAt)}`;
    sel.appendChild(o);
  }
  if ([...sel.options].some((o) => o.value === cur)) sel.value = cur;
  else sel.value = "";
}

function pintarListaSavesCopaHub() {
  if (!els.copaHubSavesLista) return;
  atualizarSelectSobrescreverCopa();
  els.copaHubSavesLista.replaceChildren();
  for (const s of listarSavesCopaOrdenados()) {
    els.copaHubSavesLista.appendChild(criarLinhaSaveCopa(s, "hub"));
  }
}

function pintarListaCarregarCopa() {
  if (!els.carregarCopaLista || !els.carregarCopaVazio) return;
  const saves = listarSavesCopaOrdenados();
  els.carregarCopaLista.replaceChildren();
  els.carregarCopaVazio.hidden = saves.length > 0;
  for (const s of saves) {
    els.carregarCopaLista.appendChild(criarLinhaSaveCopa(s, "carregar"));
  }
}

/**
 * @param {{ id: string, name: string, savedAt: string, payload: { plain?: { playerTeamId?: string, faseCopa?: string } } }} entry
 * @param {"hub" | "carregar"} modo
 */
function criarLinhaSaveCopa(entry, modo) {
  const row = document.createElement("div");
  row.className = "copa-save-row";
  row.setAttribute("role", "listitem");
  const meta = document.createElement("div");
  meta.className = "copa-save-row-meta";
  const vn = document.createElement("span");
  vn.className = "copa-save-row-nome";
  vn.textContent = entry.name || "(sem nome)";
  const vd = document.createElement("span");
  vd.className = "copa-save-row-data";
  const sel = SELECOES.find((x) => x.id === entry.payload?.plain?.playerTeamId);
  const fase = entry.payload?.plain?.faseCopa ?? "?";
  vd.textContent = `${formatarDataSaveCopa(entry.savedAt)} · ${sel?.nome ?? "?"} · ${nomeFaseCopaCurta(fase)}`;
  meta.append(vn, vd);
  const ac = document.createElement("div");
  ac.className = "copa-save-row-acoes";
  const bL = document.createElement("button");
  bL.type = "button";
  bL.className = modo === "carregar" ? "btn pri" : "btn sec";
  bL.textContent = "Carregar";
  bL.addEventListener("click", () => aplicarCarregarSavePorId(entry.id));
  const bX = document.createElement("button");
  bX.type = "button";
  bX.className = "btn sec";
  bX.textContent = "Excluir";
  bX.addEventListener("click", () => {
    if (confirm(`Excluir o save "${entry.name}"?`)) {
      removerSaveCopa(entry.id);
      pintarListaSavesCopaHub();
      pintarListaCarregarCopa();
    }
  });
  ac.append(bL, bX);
  row.append(meta, ac);
  return row;
}

function mostrarFeedbackSalvarCopa(msg) {
  if (!els.copaSalvarFeedback) return;
  if (copaSalvarFeedbackTimer) clearTimeout(copaSalvarFeedbackTimer);
  els.copaSalvarFeedback.hidden = false;
  els.copaSalvarFeedback.textContent = msg;
  copaSalvarFeedbackTimer = setTimeout(() => {
    if (els.copaSalvarFeedback) els.copaSalvarFeedback.hidden = true;
    copaSalvarFeedbackTimer = null;
  }, 3500);
}

function salvarProgressoCopaDaUi() {
  if (!copaEstado) {
    alert("Não há campeonato em andamento.");
    return;
  }
  const nome = (els.copaSalvarNome?.value ?? "").trim();
  if (!nome) {
    alert("Digite um nome para o save.");
    els.copaSalvarNome?.focus();
    return;
  }
  let block;
  try {
    block = serializarCopaEstadoParaJson(copaEstado);
  } catch (e) {
    console.error(e);
    alert("Erro ao preparar o save.");
    return;
  }
  const sobId = els.copaSalvarSobrescrever?.value ?? "";
  if (sobId) {
    substituirSaveCopa(sobId, nome, block);
    mostrarFeedbackSalvarCopa("Progresso atualizado.");
  } else {
    gravarNovoSaveCopa(nome, block);
    mostrarFeedbackSalvarCopa("Progresso salvo.");
  }
  if (els.copaSalvarNome) els.copaSalvarNome.value = "";
  pintarListaSavesCopaHub();
  pintarListaCarregarCopa();
}

/** @param {string} id */
function aplicarCarregarSavePorId(id) {
  if (copaEstado && !confirm("Substituir o campeonato atual pelo save selecionado?")) return;
  const entry = obterSaveCopaPorId(id);
  if (!entry) {
    alert("Save não encontrado.");
    return;
  }
  try {
    copaEstado = /** @type {typeof copaEstado} */ (carregarEstadoDoSave(entry));
  } catch (e) {
    console.error(e);
    alert("Não foi possível carregar este save.");
    return;
  }
  restaurarUiCopaCarregada();
}

function abrirTelaCarregarCopa() {
  if (els.telaInicio) {
    els.telaInicio.setAttribute("hidden", "");
    els.telaInicio.style.display = "none";
  }
  if (els.telaAmistoso) {
    els.telaAmistoso.setAttribute("hidden", "");
    els.telaAmistoso.style.display = "none";
  }
  if (els.telaCopa) {
    els.telaCopa.setAttribute("hidden", "");
    els.telaCopa.style.display = "none";
  }
  if (els.jogoRoot) {
    els.jogoRoot.setAttribute("hidden", "");
    els.jogoRoot.style.display = "none";
  }
  if (els.telaCarregarCopa) {
    els.telaCarregarCopa.removeAttribute("hidden");
    els.telaCarregarCopa.style.removeProperty("display");
  }
  pintarListaCarregarCopa();
  window.scrollTo(0, 0);
}

function fecharTelaCarregarCopa() {
  if (els.telaCarregarCopa) {
    els.telaCarregarCopa.setAttribute("hidden", "");
    els.telaCarregarCopa.style.display = "none";
  }
  if (els.telaInicio) {
    els.telaInicio.removeAttribute("hidden");
    els.telaInicio.style.removeProperty("display");
  }
  window.scrollTo(0, 0);
}

function restaurarUiCopaCarregada() {
  if (!copaEstado) return;
  if (els.jogoRoot) {
    els.jogoRoot.setAttribute("hidden", "");
    els.jogoRoot.style.display = "none";
  }
  if (els.telaInicio) {
    els.telaInicio.setAttribute("hidden", "");
    els.telaInicio.style.display = "none";
  }
  if (els.telaAmistoso) {
    els.telaAmistoso.setAttribute("hidden", "");
    els.telaAmistoso.style.display = "none";
  }
  if (els.telaCarregarCopa) {
    els.telaCarregarCopa.setAttribute("hidden", "");
    els.telaCarregarCopa.style.display = "none";
  }
  if (els.telaCopa) {
    els.telaCopa.removeAttribute("hidden");
    els.telaCopa.style.removeProperty("display");
  }
  tipoModoJogo = "copa";
  idSelecaoCopaEscolhida = copaEstado.playerTeamId;
  copaPartidaKnockout = false;
  resetFlagsProrrogacaoCopa();
  if (!copaCardsMontados) {
    montarCardsCopaSelecao();
    copaCardsMontados = true;
  }
  sincronizarCardSelecaoCopaComEstado();
  if (els.copaPassoSelecao) els.copaPassoSelecao.hidden = true;
  if (els.copaPassoGrupos) els.copaPassoGrupos.hidden = false;
  preencherGradeGruposCopa(copaEstado.grupos);
  const f = copaEstado.faseCopa;
  if (f === "grupos") {
    if (els.copaGruposGrid) els.copaGruposGrid.hidden = false;
    if (els.copaGruposIntro) {
      const sn = SELECOES.find((x) => x.id === copaEstado.playerTeamId)?.nome ?? "";
      els.copaGruposIntro.textContent = `Você comanda ${sn}, no grupo ${copaEstado.grupoPlayer}. Há 8 grupos (A–H) com 4 seleções.`;
      els.copaGruposIntro.hidden = false;
    }
  } else {
    if (els.copaGruposGrid) els.copaGruposGrid.hidden = true;
    if (els.copaGruposIntro) els.copaGruposIntro.hidden = true;
  }
  if (f === "grupos") {
    mostrarTelaCopaHubAposJogoGrupo();
  } else if (f === "oitavas" || f === "quartas" || f === "semi" || f === "final") {
    mostrarTelaCopaHubMataMata();
  } else if (f === "eliminado") {
    if (!copaEstado.eliminatoria?.oitavas) mostrarTelaCopaNaoClassificou();
    else mostrarTelaCopaEliminado();
  } else if (f === "campeao") {
    mostrarTelaCopaCampeao();
  } else {
    mostrarTelaCopaHubAposJogoGrupo();
  }
  window.scrollTo(0, 0);
}

function ocultarChaveamentoCopa() {
  if (els.copaChaveWrap) els.copaChaveWrap.hidden = true;
  if (els.copaChave) els.copaChave.replaceChildren();
}

const FASE_CHAVE_ORDER = /** @type {const} */ (["oitavas", "quartas", "semi", "final"]);

/**
 * Enquanto o seu jogo da fase atual ainda não tem resultado, não destacamos vencedor
 * nos outros jogos já simulados (CPU×CPU), para o chaveamento não parecer “decidido ao acaso”.
 */
function enfatizarResultadosColunaChave(faseCol, jogosCol) {
  if (!copaEstado || !jogosCol?.length) return true;
  const cur = copaEstado.faseCopa;
  if (cur === "campeao" || cur === "eliminado") return true;
  const iCol = FASE_CHAVE_ORDER.indexOf(faseCol);
  const iCur = FASE_CHAVE_ORDER.indexOf(cur);
  if (iCol < 0 || iCur < 0) return true;
  if (iCol < iCur) return true;
  if (iCol > iCur) return false;
  const pid = copaEstado.playerTeamId;
  const humanoPendente = jogosCol.some(
    (j) => j && !j.winnerId && (j.homeId === pid || j.awayId === pid),
  );
  return !humanoPendente;
}

/**
 * @param {string | null | undefined} id
 * @param {string | null | undefined} winnerId
 * @param {string} playerTeamId
 * @param {boolean} enfatizarResultado
 */
function criarCelulaTimeChave(id, winnerId, playerTeamId, enfatizarResultado) {
  const wrap = document.createElement("div");
  wrap.className = "copa-chave-time";
  if (id && playerTeamId && id === playerTeamId) wrap.classList.add("copa-chave-seu-time");
  if (!id) {
    wrap.classList.add("copa-chave-tbd", "copa-chave-tbd-celula");
    wrap.textContent = "—";
    wrap.title = "A definir";
    wrap.setAttribute("aria-label", "A definir");
    return wrap;
  }
  const s = SELECOES.find((x) => x.id === id);
  const nome = s?.nome ?? id;
  wrap.classList.add("copa-chave-time--bandeira");
  wrap.title = nome;
  wrap.setAttribute("aria-label", nome);
  const img = document.createElement("img");
  img.className = "copa-chave-bandeira-img";
  img.src = urlBandeira(s?.iso ?? "xx", 80);
  img.alt = nome;
  if (enfatizarResultado && winnerId != null && winnerId !== "") {
    if (id === winnerId) wrap.classList.add("copa-chave-vencedor");
    else wrap.classList.add("copa-chave-eliminado");
  }
  wrap.appendChild(img);
  return wrap;
}

/**
 * @param {{ homeId: string, awayId: string, winnerId: string | null }} jogo
 * @param {string} [legenda]
 * @param {string} playerTeamId
 * @param {boolean} enfatizarResultado
 */
function textoPlacarCardChaveCopa(/** @type {{ gh?: number, ga?: number, penGh?: number, penGa?: number }} */ jogo) {
  if (!Number.isFinite(jogo.gh) || !Number.isFinite(jogo.ga)) return "";
  let t = `${jogo.gh} × ${jogo.ga}`;
  if (Number.isFinite(jogo.penGh) && Number.isFinite(jogo.penGa)) {
    t += ` (${jogo.penGh} × ${jogo.penGa} pen.)`;
  }
  return t;
}

function criarCardJogoChave(jogo, legenda, playerTeamId, enfatizarResultado) {
  const card = document.createElement("div");
  card.className = "copa-chave-jogo";
  if (legenda) {
    const cap = document.createElement("div");
    cap.className = "copa-chave-jogo-legenda";
    cap.textContent = legenda;
    card.appendChild(cap);
  }
  const mid = document.createElement("div");
  mid.className = "copa-chave-jogo-meio";
  const vs = document.createElement("span");
  vs.className = "copa-chave-vs";
  vs.textContent = "×";
  mid.append(
    criarCelulaTimeChave(jogo.homeId, jogo.winnerId, playerTeamId, enfatizarResultado),
    vs,
    criarCelulaTimeChave(jogo.awayId, jogo.winnerId, playerTeamId, enfatizarResultado),
  );
  card.appendChild(mid);
  const pl = textoPlacarCardChaveCopa(jogo);
  if (pl) {
    const plEl = document.createElement("div");
    plEl.className = "copa-chave-jogo-placar";
    plEl.textContent = pl;
    card.appendChild(plEl);
  }
  return card;
}

/**
 * @param {string} titulo
 * @param {HTMLElement[]} cards
 */
function criarColunaRodadaChave(titulo, cards) {
  const col = document.createElement("div");
  col.className = "copa-chave-round";
  const h = document.createElement("h4");
  h.className = "copa-chave-round-titulo";
  h.textContent = titulo;
  col.appendChild(h);
  for (const c of cards) col.appendChild(c);
  return col;
}

function pintarChaveamentoCopa() {
  if (!els.copaChave || !els.copaChaveWrap || !copaEstado?.eliminatoria?.oitavas?.length) {
    ocultarChaveamentoCopa();
    return;
  }
  const pid = copaEstado.playerTeamId;
  const e = copaEstado.eliminatoria;
  const oit = e.oitavas;
  els.copaChave.replaceChildren();

  const empOit = enfatizarResultadosColunaChave("oitavas", oit);
  const mkOit = (/** @type {number} */ idx) =>
    criarCardJogoChave(oit[idx], ROTULOS_OITAVAS_FIFA[idx], pid, empOit);

  const bracket = document.createElement("div");
  bracket.className = "copa-chave-bracket";
  bracket.setAttribute("aria-label", "Chaveamento em duas metades até a final");

  const ladoEsq = document.createElement("div");
  ladoEsq.className = "copa-chave-lado copa-chave-lado--esq";
  const ladoDir = document.createElement("div");
  ladoDir.className = "copa-chave-lado copa-chave-lado--dir";
  const centro = document.createElement("div");
  centro.className = "copa-chave-centro";

  ladoEsq.appendChild(
    criarColunaRodadaChave("Oitavas", [mkOit(0), mkOit(1), mkOit(2), mkOit(3)]),
  );
  ladoDir.appendChild(
    criarColunaRodadaChave("Oitavas", [mkOit(4), mkOit(5), mkOit(6), mkOit(7)]),
  );

  if (e.quartas?.length === 4) {
    const empQ = enfatizarResultadosColunaChave("quartas", e.quartas);
    const q = e.quartas;
    const colQuaE = criarColunaRodadaChave("Quartas", [
      criarCardJogoChave(q[0], ROTULOS_QUARTAS_FIFA[0], pid, empQ),
      criarCardJogoChave(q[1], ROTULOS_QUARTAS_FIFA[1], pid, empQ),
    ]);
    const colQuaD = criarColunaRodadaChave("Quartas", [
      criarCardJogoChave(q[2], ROTULOS_QUARTAS_FIFA[2], pid, empQ),
      criarCardJogoChave(q[3], ROTULOS_QUARTAS_FIFA[3], pid, empQ),
    ]);
    ladoEsq.appendChild(colQuaE);
    ladoDir.insertBefore(colQuaD, ladoDir.firstChild);
  }

  if (e.semi?.length === 2) {
    const empS = enfatizarResultadosColunaChave("semi", e.semi);
    const s = e.semi;
    const colSemiE = criarColunaRodadaChave("Semifinal", [
      criarCardJogoChave(s[0], ROTULOS_SEMI_FIFA[0], pid, empS),
    ]);
    const colSemiD = criarColunaRodadaChave("Semifinal", [
      criarCardJogoChave(s[1], ROTULOS_SEMI_FIFA[1], pid, empS),
    ]);
    ladoEsq.appendChild(colSemiE);
    ladoDir.insertBefore(colSemiD, ladoDir.firstChild);
  }

  const hFin = document.createElement("h4");
  hFin.className = "copa-chave-round-titulo copa-chave-centro-titulo";
  hFin.textContent = "Final";
  centro.appendChild(hFin);
  if (e.final?.length === 1) {
    const empF = enfatizarResultadosColunaChave("final", e.final);
    centro.appendChild(
      criarCardJogoChave(e.final[0], ROTULO_FINAL_FIFA, pid, empF),
    );
  } else {
    const p = document.createElement("p");
    p.className = "copa-chave-centro-placeholder";
    p.textContent = "—";
    centro.appendChild(p);
  }

  bracket.append(ladoEsq, centro, ladoDir);
  els.copaChave.appendChild(bracket);
  els.copaChaveWrap.hidden = false;
}

function pintarResultadosRodadaCopa() {
  if (!els.copaResultadosRodadaWrap || !els.copaResultadosRodadaLista || !els.copaResultadosRodadaTitulo)
    return;
  const u = copaEstado?.ultimaRodadaResultados;
  if (!u?.partidas?.length) {
    els.copaResultadosRodadaWrap.hidden = true;
    els.copaResultadosRodadaLista.replaceChildren();
    return;
  }
  els.copaResultadosRodadaWrap.hidden = false;
  els.copaResultadosRodadaTitulo.textContent = `Resultados da ${ordinalRodadaGruposPt(u.numero)} rodada (fase de grupos)`;
  const ord = [...u.partidas].sort(
    (a, b) => a.L.localeCompare(b.L) || a.homeId.localeCompare(b.homeId),
  );
  els.copaResultadosRodadaLista.replaceChildren();
  for (const row of ord) {
    const div = document.createElement("div");
    div.className = "copa-res-rodada-linha";
    const sh = siglaSelecaoIdCopa(row.homeId);
    const sa = siglaSelecaoIdCopa(row.awayId);
    div.textContent = `Grupo ${row.L}: ${sh} ${row.gh} × ${row.ga} ${sa}`;
    els.copaResultadosRodadaLista.appendChild(div);
  }
}

function finalizarGruposCopa() {
  if (!copaEstado) return;
  const ordem = {};
  for (const L of Object.keys(copaEstado.grupos)) {
    const ids = copaEstado.grupos[L];
    const partidas = copaEstado.partidasPorGrupo[L].filter((x) => x.gh >= 0);
    ordem[L] = ordenarGrupoFifa(ids, partidas, copaEstado.rng);
  }
  copaEstado.ordemGrupos = ordem;
  const oit = montarOitavas(ordem);
  copaEstado.eliminatoria = { oitavas: oit, quartas: null, semi: null, final: null };
  copaEstado.jogosEliminatorios = oit;
  copaEstado.faseCopa = "oitavas";
  simularJogosCpuSemHumanoNaRodada();
  copaEstado.idxJogoEliminatorio = copaEstado.jogosEliminatorios.findIndex(
    (j) =>
      j.homeId === copaEstado.playerTeamId ||
      j.awayId === copaEstado.playerTeamId,
  );
  copaEstado.amarelosAcumulado = {};
}

function ocultarCelebracaoCopa() {
  if (els.copaCelebracao) els.copaCelebracao.hidden = true;
}

function mostrarTelaCopaHubAposJogoGrupo() {
  ocultarCelebracaoCopa();
  esconderJogoMostrarCopa();
  if (els.copaPassoSelecao) els.copaPassoSelecao.hidden = true;
  if (els.copaPassoGrupos) els.copaPassoGrupos.hidden = false;
  if (els.copaGruposGrid) els.copaGruposGrid.hidden = false;
  if (els.copaGruposIntro) els.copaGruposIntro.hidden = false;
  if (els.copaClassificacaoWrap) els.copaClassificacaoWrap.hidden = false;
  if (els.copaClassificacaoTodosWrap) els.copaClassificacaoTodosWrap.hidden = false;
  pintarTabelaGrupoCopa();
  pintarResultadosRodadaCopa();
  if (els.copaHubMsg) {
    els.copaHubMsg.hidden = false;
    if (copaEstado && copaEstado.idxAdversarioGrupo >= 3) {
      els.copaHubMsg.textContent =
        "Fase de grupos concluída para você. Os dois primeiros de cada grupo seguem para as oitavas de final.";
    } else {
      const rest = 3 - (copaEstado?.idxAdversarioGrupo ?? 0);
      els.copaHubMsg.textContent =
        rest > 0
          ? `Faltam ${rest} jogo(s) na fase de grupos. Cada rodada só fecha nos outros grupos depois do seu jogo; os placares da rodada aparecem acima.`
          : "";
    }
  }
  if (els.btnCopaProximoJogo) {
    const prontoOitavas = copaEstado && copaEstado.idxAdversarioGrupo >= 3;
    els.btnCopaProximoJogo.hidden = false;
    if (prontoOitavas) {
      els.btnCopaProximoJogo.textContent = "Ir às oitavas de final";
    } else if (copaEstado && copaEstado.idxAdversarioGrupo < 3) {
      const n = copaEstado.idxAdversarioGrupo + 1;
      els.btnCopaProximoJogo.textContent = `${n}.º jogo do grupo`;
    } else {
      els.btnCopaProximoJogo.textContent = "Próximo jogo";
    }
  }
  if (els.btnCopaVerTabela) els.btnCopaVerTabela.hidden = false;
  mostrarSecaoArtilheirosCopaNoHub();
  if (els.btnCopaVoltarInicioHub) els.btnCopaVoltarInicioHub.hidden = false;
  ocultarChaveamentoCopa();
  pintarListaSavesCopaHub();
}

function mostrarTelaCopaHubMataMata() {
  ocultarCelebracaoCopa();
  esconderJogoMostrarCopa();
  if (copaEstado) copaEstado.ultimaRodadaResultados = undefined;
  pintarResultadosRodadaCopa();
  if (els.copaPassoGrupos) els.copaPassoGrupos.hidden = false;
  if (els.copaGruposGrid) els.copaGruposGrid.hidden = true;
  if (els.copaGruposIntro) els.copaGruposIntro.hidden = true;
  if (els.copaClassificacaoWrap) els.copaClassificacaoWrap.hidden = true;
  if (els.copaClassificacaoTodosWrap) els.copaClassificacaoTodosWrap.hidden = true;
  if (els.copaHubMsg) {
    els.copaHubMsg.hidden = false;
    const f = copaEstado?.faseCopa ?? "";
    const nomes = {
      oitavas: "Oitavas de final",
      quartas: "Quartas de final",
      semi: "Semifinal",
      final: "Final",
    };
    els.copaHubMsg.textContent = `Fase: ${nomes[f] ?? f}. Pronto para o próximo jogo.`;
  }
  if (els.btnCopaProximoJogo) {
    els.btnCopaProximoJogo.hidden = false;
    els.btnCopaProximoJogo.textContent = "Entrar em campo";
  }
  if (els.btnCopaVerTabela) els.btnCopaVerTabela.hidden = true;
  mostrarSecaoArtilheirosCopaNoHub();
  if (els.btnCopaVoltarInicioHub) els.btnCopaVoltarInicioHub.hidden = false;
  pintarChaveamentoCopa();
  pintarListaSavesCopaHub();
}

function mostrarTelaCopaEliminado() {
  ocultarCelebracaoCopa();
  esconderJogoMostrarCopa();
  if (copaEstado) copaEstado.ultimaRodadaResultados = undefined;
  pintarResultadosRodadaCopa();
  if (els.copaPassoSelecao) els.copaPassoSelecao.hidden = true;
  if (els.copaPassoGrupos) els.copaPassoGrupos.hidden = false;
  if (els.copaClassificacaoWrap) els.copaClassificacaoWrap.hidden = true;
  if (els.copaClassificacaoTodosWrap) els.copaClassificacaoTodosWrap.hidden = true;
  if (els.copaGruposGrid) els.copaGruposGrid.hidden = true;
  if (els.copaGruposIntro) els.copaGruposIntro.hidden = true;
  mostrarSecaoArtilheirosCopaNoHub();
  if (els.copaHubMsg) {
    els.copaHubMsg.hidden = false;
    const nomeCamp =
      copaEstado?.campeaoId != null
        ? SELECOES.find((x) => x.id === copaEstado.campeaoId)?.nome ?? "—"
        : "—";
    els.copaHubMsg.textContent =
      `Sua seleção foi eliminada. Campeão mundial: ${nomeCamp}. A chave abaixo mostra os resultados até a final. Volte ao menu para uma nova Copa ou um amistoso.`;
  }
  if (els.btnCopaProximoJogo) els.btnCopaProximoJogo.hidden = true;
  if (els.btnCopaVerTabela) els.btnCopaVerTabela.hidden = true;
  if (els.btnCopaVoltarInicioHub) els.btnCopaVoltarInicioHub.hidden = false;
  pintarChaveamentoCopa();
  pintarListaSavesCopaHub();
}

function mostrarTelaCopaCampeao() {
  esconderJogoMostrarCopa();
  if (copaEstado) copaEstado.ultimaRodadaResultados = undefined;
  pintarResultadosRodadaCopa();
  if (els.copaPassoSelecao) els.copaPassoSelecao.hidden = true;
  if (els.copaPassoGrupos) els.copaPassoGrupos.hidden = false;
  if (els.copaClassificacaoWrap) els.copaClassificacaoWrap.hidden = true;
  if (els.copaClassificacaoTodosWrap) els.copaClassificacaoTodosWrap.hidden = true;
  if (els.copaGruposGrid) els.copaGruposGrid.hidden = true;
  if (els.copaGruposIntro) els.copaGruposIntro.hidden = true;
  mostrarSecaoArtilheirosCopaNoHub();
  const sel = SELECOES.find((x) => x.id === copaEstado?.campeaoId);
  const nome = sel?.nome ?? "Campeão";
  if (els.copaCelebracaoNome) els.copaCelebracaoNome.textContent = nome;
  if (els.copaCelebracaoBandeira && sel) {
    els.copaCelebracaoBandeira.src = urlBandeira(sel.iso, 160);
    els.copaCelebracaoBandeira.alt = `Bandeira de ${sel.nome}`;
  }
  if (els.copaCelebracao) els.copaCelebracao.hidden = false;
  if (els.copaHubMsg) {
    els.copaHubMsg.hidden = false;
    els.copaHubMsg.textContent =
      "Abaixo: chave completa, artilheiros da campanha e opção de salvar este título no dispositivo.";
  }
  if (els.btnCopaProximoJogo) els.btnCopaProximoJogo.hidden = true;
  if (els.btnCopaVerTabela) els.btnCopaVerTabela.hidden = true;
  if (els.btnCopaVoltarInicioHub) els.btnCopaVoltarInicioHub.hidden = false;
  pintarChaveamentoCopa();
  pintarListaSavesCopaHub();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarTelaCopaNaoClassificou() {
  ocultarCelebracaoCopa();
  esconderJogoMostrarCopa();
  if (copaEstado) copaEstado.ultimaRodadaResultados = undefined;
  pintarResultadosRodadaCopa();
  if (els.copaPassoSelecao) els.copaPassoSelecao.hidden = true;
  if (els.copaPassoGrupos) els.copaPassoGrupos.hidden = false;
  if (els.copaClassificacaoWrap) els.copaClassificacaoWrap.hidden = false;
  if (els.copaClassificacaoTodosWrap) els.copaClassificacaoTodosWrap.hidden = false;
  pintarTabelaGrupoCopa();
  if (els.copaHubMsg) {
    els.copaHubMsg.hidden = false;
    els.copaHubMsg.textContent =
      "Sua seleção não ficou entre as duas primeiras do grupo. Volte ao menu para tentar outra Copa.";
  }
  if (els.btnCopaProximoJogo) els.btnCopaProximoJogo.hidden = true;
  if (els.btnCopaVerTabela) els.btnCopaVerTabela.hidden = false;
  mostrarSecaoArtilheirosCopaNoHub();
  if (els.btnCopaVoltarInicioHub) els.btnCopaVoltarInicioHub.hidden = false;
  ocultarChaveamentoCopa();
  pintarListaSavesCopaHub();
}

function tentarAvancarDosGruposCopa() {
  if (!copaEstado || copaEstado.faseCopa !== "grupos") return;
  const L = copaEstado.grupoPlayer;
  const ids = copaEstado.grupos[L];
  const partidas = copaEstado.partidasPorGrupo[L].filter((x) => x.gh >= 0);
  const ordem = ordenarGrupoFifa(ids, partidas, copaEstado.rng);
  const pos = ordem.indexOf(copaEstado.playerTeamId);
  if (pos < 0 || pos > 1) {
    copaEstado.faseCopa = "eliminado";
    mostrarTelaCopaNaoClassificou();
    return;
  }
  finalizarGruposCopa();
  mostrarTelaCopaHubMataMata();
}

function handleCopaProximoJogo() {
  if (!copaEstado) return;
  if (copaEstado.faseCopa === "grupos") {
    if (copaEstado.idxAdversarioGrupo < 3) {
      const adv = copaEstado.adversariosGrupo[copaEstado.idxAdversarioGrupo];
      if (adv) entrarNoJogoCopaVersus(adv);
      return;
    }
    tentarAvancarDosGruposCopa();
    return;
  }
  if (
    copaEstado.faseCopa === "oitavas" ||
    copaEstado.faseCopa === "quartas" ||
    copaEstado.faseCopa === "semi" ||
    copaEstado.faseCopa === "final"
  ) {
    const jogo = copaEstado.jogosEliminatorios[copaEstado.idxJogoEliminatorio];
    if (!jogo || jogo.winnerId) return;
    const cpuId =
      jogo.homeId === copaEstado.playerTeamId ? jogo.awayId : jogo.homeId;
    entrarNoJogoCopaVersus(cpuId);
  }
}

function voltarMenuPrincipalDaCopa() {
  copaTransicaoHubPendente = null;
  copaEstado = null;
  tipoModoJogo = "amistoso";
  idSelecaoCopaEscolhida = null;
  copaPartidaKnockout = false;
  resetFlagsProrrogacaoCopa();
  if (els.telaCopa) {
    els.telaCopa.setAttribute("hidden", "");
    els.telaCopa.style.display = "none";
  }
  if (els.jogoRoot) {
    els.jogoRoot.setAttribute("hidden", "");
    els.jogoRoot.style.display = "none";
  }
  if (els.telaInicio) {
    els.telaInicio.removeAttribute("hidden");
    els.telaInicio.style.removeProperty("display");
  }
  if (els.copaPenaltisOverlay) els.copaPenaltisOverlay.hidden = true;
  esconderHudDisputaPenaltis();
  resetCopaUi();
}

function resetCopaUi() {
  idSelecaoCopaEscolhida = null;
  els.copaCardsJogador?.querySelectorAll(".card-selecao").forEach((b) => {
    b.classList.remove("card-selecao--ativa");
  });
  if (els.btnCopaSortearGrupos) {
    els.btnCopaSortearGrupos.disabled = true;
    els.btnCopaSortearGrupos.setAttribute("disabled", "");
  }
  if (els.copaPassoSelecao) els.copaPassoSelecao.hidden = false;
  if (els.copaPassoGrupos) els.copaPassoGrupos.hidden = true;
  if (els.copaClassificacaoWrap) els.copaClassificacaoWrap.hidden = true;
  if (els.copaClassificacaoTodosWrap) els.copaClassificacaoTodosWrap.hidden = true;
  if (els.copaHubMsg) {
    els.copaHubMsg.hidden = true;
    els.copaHubMsg.textContent = "";
  }
  ocultarCelebracaoCopa();
  if (els.btnCopaProximoJogo) els.btnCopaProximoJogo.hidden = true;
  if (els.btnCopaVerTabela) els.btnCopaVerTabela.hidden = true;
  if (els.btnCopaVerArtilheiros) els.btnCopaVerArtilheiros.hidden = true;
  esconderSecaoArtilheirosCopaNoHub();
  if (els.btnCopaVoltarInicioHub) els.btnCopaVoltarInicioHub.hidden = true;
  if (els.copaResultadosRodadaWrap) {
    els.copaResultadosRodadaWrap.hidden = true;
    els.copaResultadosRodadaLista?.replaceChildren();
  }
  ocultarChaveamentoCopa();
  if (els.copaSalvarFeedback) els.copaSalvarFeedback.hidden = true;
  if (els.copaSalvarNome) els.copaSalvarNome.value = "";
  if (els.copaHubSavesLista) els.copaHubSavesLista.replaceChildren();
  if (els.copaSalvarSobrescrever) {
    els.copaSalvarSobrescrever.replaceChildren();
    const o0 = document.createElement("option");
    o0.value = "";
    o0.textContent = "Salvar como novo";
    els.copaSalvarSobrescrever.appendChild(o0);
  }
}

function montarCardsCopaSelecao() {
  if (!els.copaCardsJogador) return;
  els.copaCardsJogador.replaceChildren();
  for (const s of SELECOES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card-selecao";
    btn.dataset.selecaoId = s.id;
    const img = document.createElement("img");
    img.src = urlBandeira(s.iso, 160);
    img.alt = `Bandeira de ${s.nome}`;
    img.width = 88;
    img.height = 66;
    img.loading = "lazy";
    const span = document.createElement("span");
    span.className = "card-selecao-nome";
    span.textContent = s.nome;
    btn.append(img, span);
    btn.addEventListener("click", () => {
      idSelecaoCopaEscolhida = s.id;
      els.copaCardsJogador?.querySelectorAll(".card-selecao").forEach((b) => {
        b.classList.toggle("card-selecao--ativa", b.dataset.selecaoId === s.id);
      });
      if (els.btnCopaSortearGrupos) {
        els.btnCopaSortearGrupos.disabled = false;
        els.btnCopaSortearGrupos.removeAttribute("disabled");
      }
    });
    els.copaCardsJogador.appendChild(btn);
  }
}

function iniciarCopaComSorteio() {
  if (!idSelecaoCopaEscolhida) return;
  const seed = Date.now() % 2147483647;
  const rng = criarRng(seed);
  const ids = SELECOES.map((s) => s.id);
  const grupos = sortearGrupos(ids, rng);
  /** @type {Record<string, import('./world-cup.js').ResultadoPartida[]>} */
  const partidasPorGrupo = {};
  for (const L of Object.keys(grupos)) {
    partidasPorGrupo[L] = partidasDoGrupo(grupos[L]);
  }
  let grupoPlayer = "A";
  for (const L of Object.keys(grupos)) {
    if (grupos[L].includes(idSelecaoCopaEscolhida)) {
      grupoPlayer = L;
      break;
    }
  }
  const quatro = grupos[grupoPlayer];
  const adversariosGrupo = adversariosNasRodadas(quatro, idSelecaoCopaEscolhida);
  copaEstado = {
    rng,
    seed,
    grupos,
    partidasPorGrupo,
    playerTeamId: idSelecaoCopaEscolhida,
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
  if (els.copaPassoSelecao) els.copaPassoSelecao.hidden = true;
  if (els.copaPassoGrupos) els.copaPassoGrupos.hidden = false;
  if (els.copaGruposIntro) {
    const sn = SELECOES.find((x) => x.id === idSelecaoCopaEscolhida)?.nome ?? "";
    els.copaGruposIntro.textContent = `Você comanda ${sn}, no grupo ${grupoPlayer}. Há 8 grupos (A–H) com 4 seleções.`;
  }
  if (els.copaGruposGrid) {
    preencherGradeGruposCopa(grupos);
    els.copaGruposGrid.hidden = false;
  }
  if (els.copaGruposIntro) els.copaGruposIntro.hidden = false;
  if (els.copaClassificacaoWrap) els.copaClassificacaoWrap.hidden = false;
  if (els.copaClassificacaoTodosWrap) els.copaClassificacaoTodosWrap.hidden = false;
  ocultarCelebracaoCopa();
  pintarTabelaGrupoCopa();
  pintarResultadosRodadaCopa();
  if (els.copaHubMsg) {
    els.copaHubMsg.hidden = false;
    els.copaHubMsg.textContent =
      "Nenhuma partida da 1.ª rodada foi jogada ainda nos outros grupos. Dispute o seu 1.º jogo; em seguida os demais jogos da rodada serão simulados e listados em “Resultados da rodada”.";
  }
  if (els.btnCopaProximoJogo) {
    els.btnCopaProximoJogo.hidden = false;
    els.btnCopaProximoJogo.textContent = "1.º jogo do grupo";
  }
  if (els.btnCopaVerTabela) els.btnCopaVerTabela.hidden = false;
  mostrarSecaoArtilheirosCopaNoHub();
  if (els.btnCopaVoltarInicioHub) els.btnCopaVoltarInicioHub.hidden = false;
  ocultarChaveamentoCopa();
  pintarListaSavesCopaHub();
}

function entrarNoJogoCopaVersus(cpuId) {
  if (!copaEstado) return;
  try {
    tipoModoJogo = "copa";
    timeJogador = elencoDaSelecao(copaEstado.playerTeamId);
    timeCpu = elencoDaSelecao(cpuId);
    metaSelecaoJogador =
      SELECOES.find((x) => x.id === copaEstado.playerTeamId) ?? null;
    metaSelecaoCpu = SELECOES.find((x) => x.id === cpuId) ?? null;
    copaPartidaKnockout = copaEstado.faseCopa !== "grupos";
    aplicarRestricoesCopaNoElencoHumano();
    snapshotElencoLimpo();
    aplicarCabecalhosPainelSelecoes();
    if (els.telaCopa) {
      els.telaCopa.setAttribute("hidden", "");
      els.telaCopa.style.display = "none";
    }
    if (els.jogoRoot) {
      els.jogoRoot.removeAttribute("hidden");
      els.jogoRoot.style.removeProperty("display");
    }
    golsJogador = 0;
    golsCpu = 0;
    placarPenaltisPosDecisao = null;
    golsPorJogadorNaPartida.clear();
    partidaAtiva = false;
    jogoPausado = false;
    fluxoForaDePartida = "pre_jogo";
    resetFlagsProrrogacaoCopa();
    precisaResolverLesaoHumano = false;
    aguardandoPausaPorExpulsaoHumana = false;
    substituicoesUsadas = 0;
    substituicoesCpuUsadas = 0;
    segundoTempoAutorizado = false;
    aguardandoSegundoTempo = false;
    resolveSegundoTempo = null;
    esconderUiIntervalo();
    renderEscalacoes(null);
    atualizarPlacar();
    atualizarSubsHud();
    if (els.relogio) els.relogio.textContent = "0′";
    if (els.etapaTempo) els.etapaTempo.textContent = "—";
    if (els.log) els.log.innerHTML = "";
    setZonaVisual(null);
    atualizarBtnCentroRodada();
    sincronizarUiPausa();
  } catch (err) {
    console.error(err);
    alert("Erro ao iniciar partida da Copa.");
  }
}

function esconderHudDisputaPenaltis() {
  if (els.copaPenaltisHud) els.copaPenaltisHud.hidden = true;
  if (els.copaPenaltisHudQte) els.copaPenaltisHudQte.hidden = true;
}

/**
 * @returns {Promise<boolean>} true se o jogador humano vence a disputa
 */
function executarDisputaPenaltis() {
  return new Promise((resolve, reject) => {
    if (!els.copaPenaltisOverlay || !copaEstado) {
      placarPenaltisPosDecisao = null;
      esconderHudDisputaPenaltis();
      reject(new Error("UI pênaltis"));
      return;
    }
    const goleiroCpu = sortearGoleiro(timeCpu.titulares);
    const goleiroHum = sortearGoleiro(timeJogador.titulares);
    if (!goleiroCpu || !goleiroHum) {
      placarPenaltisPosDecisao = null;
      esconderHudDisputaPenaltis();
      reject(new Error("Goleiros"));
      return;
    }

    const candidatosHum = timeJogador.titulares.filter(
      (j) => j.posicao !== POSITIONS.GOLEIRO && !j.expulso,
    );
    const candidatosCpu = timeCpu.titulares.filter(
      (j) => j.posicao !== POSITIONS.GOLEIRO && !j.expulso,
    );

    /** @type {string[]} */
    let ordemHum = [];
    const ordemCpuArr = embaralhar([...candidatosCpu], copaEstado.rng).slice(
      0,
      Math.min(5, candidatosCpu.length),
    );
    if (ordemCpuArr.length < 5 || candidatosHum.length < 5) {
      placarPenaltisPosDecisao = null;
      esconderHudDisputaPenaltis();
      reject(new Error("Elenco insuficiente para pênaltis"));
      return;
    }

    placarPenaltisPosDecisao = null;
    els.copaPenaltisOverlay.hidden = false;
    els.copaPenaltisTitulo.textContent = "Disputa de pênaltis";
    els.copaPenaltisTexto.textContent =
      "Escolha os 5 cobradores na ordem (só jogadores em campo). Na cobrança: uma letra para marcar. Na defesa: três letras seguidas para defender.";
    els.copaPenaltisEscolha.hidden = false;
    els.copaPenaltisPlacar.hidden = true;
    els.copaPenaltisLista.replaceChildren();
    els.copaPenaltisOrdem.textContent = "";
    els.copaPenaltisConfirmar.disabled = true;

    for (const j of candidatosHum) {
      const li = document.createElement("li");
      const bt = document.createElement("button");
      bt.type = "button";
      bt.textContent = `${j.nome} (${sigla(j.posicao)})`;
      bt.addEventListener("click", () => {
        if (ordemHum.length >= 5) return;
        if (ordemHum.includes(j.id)) return;
        ordemHum.push(j.id);
        bt.disabled = true;
        bt.classList.add("ja-escolhido");
        els.copaPenaltisOrdem.textContent = `Ordem: ${ordemHum.length}/5`;
        if (ordemHum.length === 5) {
          els.copaPenaltisConfirmar.disabled = false;
          els.copaPenaltisConfirmar.removeAttribute("disabled");
        }
      });
      li.appendChild(bt);
      els.copaPenaltisLista.appendChild(li);
    }

    const jogadorPorId = (id) =>
      [...timeJogador.titulares, ...timeJogador.reservas].find((x) => x.id === id);

    function escolherUmJogador(restantes) {
      return new Promise((resSel) => {
        esconderHudDisputaPenaltis();
        if (els.copaPenaltisOverlay) els.copaPenaltisOverlay.hidden = false;
        els.copaPenaltisLista.replaceChildren();
        if (!restantes.length) {
          if (els.copaPenaltisOverlay) els.copaPenaltisOverlay.hidden = true;
          resSel(null);
          return;
        }
        for (const j of restantes) {
          const li = document.createElement("li");
          const bt = document.createElement("button");
          bt.type = "button";
          bt.textContent = `${j.nome} (${sigla(j.posicao)})`;
          bt.addEventListener("click", () => {
            els.copaPenaltisEscolha.hidden = true;
            if (els.copaPenaltisOverlay) els.copaPenaltisOverlay.hidden = true;
            resSel(j);
          });
          li.appendChild(bt);
          els.copaPenaltisLista.appendChild(li);
        }
      });
    }

    els.copaPenaltisConfirmar.onclick = async () => {
      els.copaPenaltisConfirmar.onclick = null;
      els.copaPenaltisEscolha.hidden = true;
      if (els.copaPenaltisOverlay) els.copaPenaltisOverlay.hidden = true;
      let h = 0;
      let c = 0;
      let rondaMorteSubita = 0;
      const usadosHum = new Set(ordemHum);
      const usadosCpu = new Set(ordemCpuArr.map((x) => x.id));

      const nomePenHum = () =>
        (metaSelecaoJogador && String(metaSelecaoJogador.nome || "").trim()) ||
        "Sua seleção";
      const nomePenCpu = () =>
        (metaSelecaoCpu && String(metaSelecaoCpu.nome || "").trim()) || "Adversário";

      const textoPlacarParcialPen = () =>
        `Pênaltis parciais: ${nomePenHum()} ${h} × ${c} ${nomePenCpu()}`;
      const textoPlacarModalPen = () =>
        `Pênaltis: ${nomePenHum()} ${h} × ${c} ${nomePenCpu()}`;

      const hudPenaltisModoQte = (emQte) => {
        if (els.copaPenaltisHud) els.copaPenaltisHud.hidden = emQte;
        if (els.copaPenaltisHudQte) els.copaPenaltisHudQte.hidden = !emQte;
      };

      const pintarHudPlacarPen = () => {
        const t = textoPlacarParcialPen();
        if (els.copaPenaltisHudPlacar) els.copaPenaltisHudPlacar.textContent = t;
        if (els.copaPenaltisHudQtePlacar) els.copaPenaltisHudQtePlacar.textContent = t;
        if (els.copaPenaltisHud) els.copaPenaltisHud.hidden = false;
      };

      const pintarHudAcaoPen = (txt) => {
        if (els.copaPenaltisHudAcao) els.copaPenaltisHudAcao.textContent = txt;
        if (els.copaPenaltisHudQteAcao) els.copaPenaltisHudQteAcao.textContent = txt;
      };

      const qteChuteHumano = (atacante, textoAcao) =>
        new Promise((res) => {
          pintarHudPlacarPen();
          pintarHudAcaoPen(textoAcao);
          const { ratio } = metricasDuelo(atacante, goleiroCpu, true);
          const p = parametrosLetra(ratio);
          els.dueloOverlay.hidden = false;
          mostrarFaseModal("qte");
          hudPenaltisModoQte(true);
          iniciarQteLetra(p, (o) => {
            els.dueloOverlay.hidden = true;
            mostrarFaseModal("reset");
            hudPenaltisModoQte(false);
            res(o.acertou);
          });
        });

      const qteDefesaHumano = (atacanteCpu, textoAcao) =>
        new Promise((res) => {
          pintarHudPlacarPen();
          pintarHudAcaoPen(textoAcao);
          const { ratio } = metricasDuelo(goleiroHum, atacanteCpu, false);
          const seq = Array.from({ length: 3 }, () => parametrosLetra(ratio));
          els.dueloOverlay.hidden = false;
          mostrarFaseModal("qte");
          hudPenaltisModoQte(true);
          iniciarQteLetraSequencia(seq, (o) => {
            els.dueloOverlay.hidden = true;
            mostrarFaseModal("reset");
            hudPenaltisModoQte(false);
            res(o.acertou);
          });
        });

      const atualizarPlacarPen = () => {
        els.copaPenaltisPlacar.hidden = false;
        els.copaPenaltisPlacar.textContent = textoPlacarModalPen();
        pintarHudPlacarPen();
      };

      const subLinhaPlacarPen = () =>
        `Parcial: ${nomePenHum()} ${h} × ${c} ${nomePenCpu()}.`;

      const popupResultadoPenalti = (titulo, sub, tom) =>
        new Promise((resolve) => {
          if (!els.penaltisResultadoOverlay || !els.btnPenaltisResultadoOk) {
            resolve();
            return;
          }
          if (els.penaltisResultadoTitulo) els.penaltisResultadoTitulo.textContent = titulo;
          if (els.penaltisResultadoSub) els.penaltisResultadoSub.textContent = sub;
          const cartaoEl = els.penaltisResultadoCartao;
          if (cartaoEl) {
            cartaoEl.classList.remove("penaltis-res-tom-gol", "penaltis-res-tom-nao");
            cartaoEl.classList.add(tom === "gol" ? "penaltis-res-tom-gol" : "penaltis-res-tom-nao");
          }
          els.penaltisResultadoOverlay.hidden = false;
          sincronizarUiPausa();
          const fechar = () => {
            els.btnPenaltisResultadoOk.removeEventListener("click", fechar);
            els.penaltisResultadoOverlay.hidden = true;
            sincronizarUiPausa();
            resolve();
          };
          els.btnPenaltisResultadoOk.addEventListener("click", fechar);
        });

      const registrarFimDisputaPenaltis = () => {
        esconderHudDisputaPenaltis();
        placarPenaltisPosDecisao = { jogador: h, cpu: c };
        resolve(h > c);
      };

      try {
        pintarHudPlacarPen();
        pintarHudAcaoPen(
          "Cada rodada: você cobra o pênalti (1 letra) e em seguida defende a cobrança do adversário (3 letras). O placar parcial atualiza após cada lance (no topo entre os lances; durante o lance, logo acima da letra).",
        );

        for (let i = 0; i < 5; i++) {
          const atHum = jogadorPorId(ordemHum[i]);
          const atCpu = ordemCpuArr[i];
          const r = `Rodada ${i + 1} de 5`;
          const nomeH = atHum?.nome ?? "—";
          const nomeC = atCpu?.nome ?? "—";
          const converteuHum = await qteChuteHumano(
            atHum,
            `${r} — sua cobrança. ${nomeH} bate o pênalti: acerte 1 letra (A–Z) para converter.`,
          );
          if (converteuHum) h++;
          atualizarPlacarPen();
          await popupResultadoPenalti(
            converteuHum ? "Gol!" : "Não foi gol",
            converteuHum
              ? `${nomeH} converteu. ${subLinhaPlacarPen()}`
              : `${nomeH} errou a cobrança. ${subLinhaPlacarPen()}`,
            converteuHum ? "gol" : "nao",
          );
          const defendeu = await qteDefesaHumano(
            atCpu,
            `${r} — sua defesa. O adversário cobra (${nomeC}): acerte 3 letras seguidas para evitar o gol.`,
          );
          if (!defendeu) c++;
          atualizarPlacarPen();
          await popupResultadoPenalti(
            defendeu ? "Defendeu!" : "Gol do adversário",
            defendeu
              ? `Você impediu o gol de ${nomeC}. ${subLinhaPlacarPen()}`
              : `${nomeC} converteu. ${subLinhaPlacarPen()}`,
            defendeu ? "gol" : "nao",
          );
          const faltaHum = 5 - 1 - i;
          const faltaCpu = 5 - 1 - i;
          if (h > c + faltaCpu || c > h + faltaHum) {
            registrarFimDisputaPenaltis();
            return;
          }
        }

        if (h !== c) {
          registrarFimDisputaPenaltis();
          return;
        }

        while (true) {
          rondaMorteSubita++;
          els.copaPenaltisTexto.textContent =
            "Empate nas 5 cobranças. Escolha o próximo cobrador; o adversário também cobra uma.";
          els.copaPenaltisEscolha.hidden = false;
          const restH = candidatosHum.filter((j) => !usadosHum.has(j.id));
          const esc = await escolherUmJogador(restH);
          if (!esc) {
            registrarFimDisputaPenaltis();
            return;
          }
          usadosHum.add(esc.id);
          const cpuExtra = candidatosCpu.find((x) => !usadosCpu.has(x.id));
          if (!cpuExtra) {
            registrarFimDisputaPenaltis();
            return;
          }
          usadosCpu.add(cpuExtra.id);
          const rm = `Morte súbita — ${rondaMorteSubita}.ª rodada`;
          const ne = esc.nome ?? "—";
          const nce = cpuExtra.nome ?? "—";
          const convHumMs = await qteChuteHumano(
            esc,
            `${rm} — sua cobrança. ${ne} bate o pênalti: 1 letra para converter.`,
          );
          if (convHumMs) h++;
          atualizarPlacarPen();
          await popupResultadoPenalti(
            convHumMs ? "Gol!" : "Não foi gol",
            convHumMs
              ? `${ne} converteu. ${subLinhaPlacarPen()}`
              : `${ne} errou a cobrança. ${subLinhaPlacarPen()}`,
            convHumMs ? "gol" : "nao",
          );
          const defMs = await qteDefesaHumano(
            cpuExtra,
            `${rm} — sua defesa. O adversário cobra (${nce}): 3 letras seguidas para defender.`,
          );
          if (!defMs) c++;
          atualizarPlacarPen();
          await popupResultadoPenalti(
            defMs ? "Defendeu!" : "Gol do adversário",
            defMs
              ? `Você impediu o gol de ${nce}. ${subLinhaPlacarPen()}`
              : `${nce} converteu. ${subLinhaPlacarPen()}`,
            defMs ? "gol" : "nao",
          );
          if (h !== c) {
            registrarFimDisputaPenaltis();
            return;
          }
        }
      } catch (e) {
        esconderHudDisputaPenaltis();
        if (els.penaltisResultadoOverlay) els.penaltisResultadoOverlay.hidden = true;
        sincronizarUiPausa();
        placarPenaltisPosDecisao = null;
        reject(e);
      }
    };
  });
}

function entrarNoJogoComSelecoes() {
  if (!idSelecaoJogadorEscolhida || !idSelecaoCpuEscolhida) return;
  if (idSelecaoJogadorEscolhida === idSelecaoCpuEscolhida) return;
  try {
    tipoModoJogo = "amistoso";
    timeJogador = elencoDaSelecao(idSelecaoJogadorEscolhida);
    timeCpu = elencoDaSelecao(idSelecaoCpuEscolhida);
    snapshotElencoLimpo();
    metaSelecaoJogador = SELECOES.find((x) => x.id === idSelecaoJogadorEscolhida) ?? null;
    metaSelecaoCpu = SELECOES.find((x) => x.id === idSelecaoCpuEscolhida) ?? null;
    aplicarCabecalhosPainelSelecoes();
    if (els.telaAmistoso) {
      els.telaAmistoso.setAttribute("hidden", "");
      els.telaAmistoso.style.display = "none";
    }
    if (els.jogoRoot) {
      els.jogoRoot.removeAttribute("hidden");
      els.jogoRoot.style.removeProperty("display");
    }
    golsJogador = 0;
    golsCpu = 0;
    placarPenaltisPosDecisao = null;
    golsPorJogadorNaPartida.clear();
    partidaAtiva = false;
    jogoPausado = false;
    fluxoForaDePartida = "pre_jogo";
    precisaResolverLesaoHumano = false;
    aguardandoPausaPorExpulsaoHumana = false;
    substituicoesUsadas = 0;
    substituicoesCpuUsadas = 0;
    segundoTempoAutorizado = false;
    aguardandoSegundoTempo = false;
    resolveSegundoTempo = null;
    esconderUiIntervalo();
    renderEscalacoes(null);
    atualizarPlacar();
    atualizarSubsHud();
    if (els.relogio) els.relogio.textContent = "0′";
    if (els.etapaTempo) els.etapaTempo.textContent = "—";
    if (els.log) els.log.innerHTML = "";
    setZonaVisual(null);
    atualizarBtnCentroRodada();
    sincronizarUiPausa();
  } catch (err) {
    console.error(err);
    alert("Não foi possível iniciar o jogo. Veja o console (F12) para detalhes.");
  }
}

window.__rpgsoccerEntrarJogo = entrarNoJogoComSelecoes;

/** Chamado pelo script inline em index.html ao abrir a tela Amistoso (monta cartões e limpa escolha). */
window.__rpgsoccerAoAbrirAmistoso = function rpgsoccerAoAbrirAmistoso() {
  if (!els.amistosoCardsJogador || !els.amistosoCardsCpu) return;
  if (!amistosoCardsMontados) {
    montarCardsAmistoso();
    amistosoCardsMontados = true;
  }
  resetAmistosoUi();
  window.scrollTo(0, 0);
};

window.__rpgsoccerAoAbrirCopa = function rpgsoccerAoAbrirCopa() {
  tipoModoJogo = "amistoso";
  copaEstado = null;
  copaPartidaKnockout = false;
  resetFlagsProrrogacaoCopa();
  if (!els.copaCardsJogador) return;
  if (!copaCardsMontados) {
    montarCardsCopaSelecao();
    copaCardsMontados = true;
  }
  resetCopaUi();
  window.scrollTo(0, 0);
};

window.__rpgsoccerAbrirTelaCarregarCopa = abrirTelaCarregarCopa;

(function sincronizarAmistosoSeJaVisivel() {
  const ami = document.getElementById("tela-amistoso");
  if (ami && !ami.hasAttribute("hidden") && !amistosoCardsMontados) {
    window.__rpgsoccerAoAbrirAmistoso();
  }
})();

(function sincronizarCopaSeJaVisivel() {
  const copa = document.getElementById("tela-copa");
  if (copa && !copa.hasAttribute("hidden") && !copaCardsMontados) {
    window.__rpgsoccerAoAbrirCopa();
  }
})();

els.btnCopaSortearGrupos?.addEventListener("click", () => {
  iniciarCopaComSorteio();
});

els.btnCopaProximoJogo?.addEventListener("click", () => {
  handleCopaProximoJogo();
});

els.btnCopaVerTabela?.addEventListener("click", () => {
  if (els.copaClassificacaoWrap) els.copaClassificacaoWrap.hidden = false;
  if (els.copaClassificacaoTodosWrap) els.copaClassificacaoTodosWrap.hidden = false;
  document.getElementById("copa-ancora-classificacao")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

els.btnCopaVerArtilheiros?.addEventListener("click", () => {
  if (els.copaArtilheirosWrap) els.copaArtilheirosWrap.hidden = false;
  pintarArtilheirosCopa();
  document.getElementById("copa-ancora-artilheiros")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

els.btnCopaVoltarInicioHub?.addEventListener("click", () => {
  voltarMenuPrincipalDaCopa();
});

els.btnCarregarCopaVoltar?.addEventListener("click", () => {
  fecharTelaCarregarCopa();
});

els.btnCopaSalvar?.addEventListener("click", () => {
  salvarProgressoCopaDaUi();
});

els.btnCentroRodada?.addEventListener("click", () => {
  if (resolveInicioProrrogacao) {
    const r = resolveInicioProrrogacao;
    resolveInicioProrrogacao = null;
    aguardandoInicioProrrogacao = false;
    esconderUiIntervalo();
    r();
    return;
  }
  if (resolveInicioEt2) {
    acrescimosET2 = sortearAcrescimosProrrogacao();
    const r = resolveInicioEt2;
    resolveInicioEt2 = null;
    aguardandoInicioEt2 = false;
    esconderUiIntervalo();
    r();
    return;
  }
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
    if (tipoModoJogo === "copa" && copaTransicaoHubPendente) {
      executarTransicaoCopaAposContinuar();
      return;
    }
    if (fluxoForaDePartida === "pos_fim") {
      fluxoForaDePartida = "nova_prep";
      atualizarBtnCentroRodada();
      atualizarSubsHud();
      appendLog(
        "Ajuste a escalação se quiser e use <strong>Iniciar partida</strong> quando estiver pronto.",
      );
      return;
    }
    void iniciarPartida();
  }
});

function voltarAoMenuPrincipalDoJogo() {
  if (partidaAtiva) return;
  limparSelecaoSub();
  esconderPopupFimDeJogo();
  copaTransicaoHubPendente = null;
  if (tipoModoJogo === "copa") {
    copaEstado = null;
    tipoModoJogo = "amistoso";
    copaPartidaKnockout = false;
    resetFlagsProrrogacaoCopa();
    if (els.copaPenaltisOverlay) els.copaPenaltisOverlay.hidden = true;
    esconderHudDisputaPenaltis();
  }
  if (els.telaAmistoso) {
    els.telaAmistoso.setAttribute("hidden", "");
    els.telaAmistoso.style.display = "none";
  }
  if (els.jogoRoot) {
    els.jogoRoot.setAttribute("hidden", "");
    els.jogoRoot.style.display = "none";
  }
  if (els.telaInicio) {
    els.telaInicio.removeAttribute("hidden");
    els.telaInicio.style.removeProperty("display");
  }
  jogoPausado = false;
  precisaResolverLesaoHumano = false;
  aguardandoPausaPorExpulsaoHumana = false;
  fluxoForaDePartida = "pre_jogo";
  if (els.pausePanel) els.pausePanel.hidden = true;
  sincronizarUiPausa();
}

els.btnVoltarMenuJogo?.addEventListener("click", () => {
  voltarAoMenuPrincipalDoJogo();
});

function alternarPausaPorTecla() {
  if (jogoPausado) {
    if (partidaAtiva && precisaResolverLesaoHumano && temTitularLesionadoHumano()) {
      alert("Substitua o titular lesionado antes de sair da pausa.");
      return;
    }
    jogoPausado = false;
    sincronizarUiPausa();
    return;
  }
  const penaltisResAberto = els.penaltisResultadoOverlay && !els.penaltisResultadoOverlay.hidden;
  if (
    !partidaAtiva ||
    !els.dueloOverlay.hidden ||
    aguardandoSegundoTempo ||
    !els.golOverlay.hidden ||
    penaltisResAberto ||
    (els.fimJogoOverlay && !els.fimJogoOverlay.hidden)
  ) {
    return;
  }
  jogoPausado = true;
  pintarEstatisticasPausa();
  sincronizarUiPausa();
}

els.btnPausa?.addEventListener("click", () => {
  jogoPausado = true;
  pintarEstatisticasPausa();
  sincronizarUiPausa();
});

els.btnContinuarPausa?.addEventListener("click", () => {
  if (partidaAtiva && precisaResolverLesaoHumano && temTitularLesionadoHumano()) {
    alert("Substitua o titular lesionado antes de continuar.");
    return;
  }
  jogoPausado = false;
  sincronizarUiPausa();
});

window.addEventListener("keydown", (e) => {
  if (e.code !== "Escape") return;
  if (!partidaAtiva) return;
  const dueloAberto = els.dueloOverlay && !els.dueloOverlay.hidden;
  const golAberto = els.golOverlay && !els.golOverlay.hidden;
  const penaltisResAberto = els.penaltisResultadoOverlay && !els.penaltisResultadoOverlay.hidden;
  const fimJogoAberto = els.fimJogoOverlay && !els.fimJogoOverlay.hidden;
  if (
    !jogoPausado &&
    (dueloAberto || aguardandoSegundoTempo || golAberto || penaltisResAberto || fimJogoAberto)
  ) {
    return;
  }
  e.preventDefault();
  alternarPausaPorTecla();
}, true);

function abrirModalLance(lance) {
  limparTransicaoResumoCampo();
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
    penaltiPorFaltaCpu: false,
    finalizacaoEhPenalti: false,
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
  els.qteDica.textContent = `Você tem ${fmtSegundosExatos(letraParamsCampo.tempoLimiteMs)} s para pressionar a tecla certa.`;

  ctx.iniciarQteCampo = () => {
    mostrarFaseModal("qte_campo");
    iniciarQteLetra(letraParamsCampo, (outcome) => {
      const acertou = outcome.acertou;
      const teclaErrada = outcome.falhaPorTeclaErrada === true;
      aplicarCansacoDueloCampo(ctx.jogador, ctx.adversario, ctx.jogadorComBola);
      registrarResultadoDuelo(ctx.jogador, ctx.adversario, acertou, ctx.jogadorComBola);
      ctx.venceuPrim = acertou;
      ctx.penaltiPorFaltaCpu = false;
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

      let tipo = tipoFinalizacaoGoleiro(ctx.zona, acertou);

      if (!acertou && teclaErrada) {
        ctx.linhasResultado.push(...aplicarFaltaNoJogador(ctx.jogador));
        ctx.linhasResultado.push(...tentarLesaoJogadorFaltado(ctx.adversario));
        const penaltiZagEmAtacante =
          ctx.jogador.posicao === POSITIONS.ZAGUEIRO &&
          ctx.adversario.posicao === POSITIONS.ATACANTE &&
          ctx.zona === ZONES.DEFESA_JOGADOR &&
          !ctx.jogadorComBola;
        if (penaltiZagEmAtacante) {
          ctx.linhasResultado.push(textoPenaltiMarcadoPorFalta(ctx.jogador, spanNomeJogador));
        } else if (tipo === "cpu_chuta") {
          tipo = null;
        }
      } else if (acertou && Math.random() < CPU_PROB_FALTA) {
        ctx.linhasResultado.push(...aplicarFaltaNoJogador(ctx.adversario));
        ctx.linhasResultado.push(...tentarLesaoJogadorFaltado(ctx.jogador));
        const penaltiZagCpuNoSeuAta =
          ctx.adversario.posicao === POSITIONS.ZAGUEIRO &&
          ctx.jogador.posicao === POSITIONS.ATACANTE &&
          ctx.zona === ZONES.ATAQUE_JOGADOR &&
          ctx.jogadorComBola;
        if (penaltiZagCpuNoSeuAta) {
          ctx.penaltiPorFaltaCpu = true;
          ctx.linhasResultado.push(textoPenaltiMarcadoPorFalta(ctx.adversario, spanNomeJogador));
          if (!tipo) tipo = "jogador_chuta";
        }
      }

      ctx.finalizacaoEhPenalti = tipo === "cpu_chuta" || ctx.penaltiPorFaltaCpu;

      if (tipo) {
        ctx.tipoGol = tipo;
        const chuteJogador = tipo === "jogador_chuta";
        if (chuteJogador) {
          ctx.forwardChute = ctx.penaltiPorFaltaCpu
            ? sortearAtacanteTitular(timeJogador.titulares) ?? ctx.jogador
            : ctx.jogador;
          ctx.goleiroDefesa = sortearGoleiro(timeCpu.titulares);
        } else {
          ctx.forwardChute = ctx.adversario;
          ctx.goleiroDefesa = sortearGoleiro(timeJogador.titulares);
        }
        if (!ctx.goleiroDefesa) {
          encerrarComErro("Sem goleiro titular para o duelo na área.");
          return;
        }

        const penalti = ctx.finalizacaoEhPenalti;
        if (penalti) {
          limparTransicaoResumoCampo();
        } else {
          pintarTransicaoResumoCampo([...ctx.linhasResultado]);
        }
        ctx.linhasResultado.push(textoTransicaoGoleiro(chuteJogador, { penalti }));
        els.dueloTitulo.textContent = penalti ? "Pênalti" : "Finalização";
        if (els.modalDuelo) {
          els.modalDuelo.classList.toggle("modal-duelo--penalti-compacto", Boolean(penalti));
        }
        if (penalti) {
          els.transicaoTexto.hidden = true;
          els.transicaoTexto.textContent = "";
        } else {
          els.transicaoTexto.hidden = false;
          els.transicaoTexto.textContent = textoTransicaoGoleiro(chuteJogador, { penalti });
        }
        els.transicaoPar.innerHTML = chuteJogador
          ? `${spanNomeJogador(ctx.forwardChute)} × ${spanNomeJogador(ctx.goleiroDefesa)}`
          : `${spanNomeJogador(ctx.goleiroDefesa)} × ${spanNomeJogador(ctx.forwardChute)}`;
        els.btnEncararGoleiro.textContent = chuteJogador ? "Encarar o goleiro" : "Defender";

        renderEscalacoes({
          jogador: chuteJogador ? ctx.forwardChute.id : ctx.goleiroDefesa.id,
          adversario: chuteJogador ? ctx.goleiroDefesa.id : ctx.forwardChute.id,
        });
        pintarDueloRpgGoleiro(ctx.forwardChute, ctx.goleiroDefesa, chuteJogador, penalti);
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
  limparTransicaoResumoCampo();
  if (els.modalDuelo) els.modalDuelo.classList.remove("modal-duelo--penalti-compacto");
  if (els.transicaoTexto) els.transicaoTexto.hidden = false;
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
  const penalti = ctx.finalizacaoEhPenalti === true;
  pintarDueloRpgGoleiro(ctx.forwardChute, ctx.goleiroDefesa, chuteJogador, penalti);
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

  /** @param {QteLetraOutcome} outcome */
  function aoFimGoleiro(outcome) {
    const acertou = outcome.acertou;
    if (!penalti) {
      aplicarCansacoDueloGoleiro(ctx.forwardChute, ctx.goleiroDefesa);
    }
    registrarResultadoDuelo(eu, ele, acertou, comBola);
    const fmt = spanNomeJogador;
    const pBase = {
      chuteJogador,
      penalti,
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
        registrarGolMarcadoNaPartida(ctx.forwardChute);
        teveGol = true;
        ctx.golParaJogador = true;
        estadoGlobal.posseJogador = false;
        if (tipoModoJogo === "copa" && copaEstado && metaSelecaoJogador) {
          registrarGolArtilheiroCopa(metaSelecaoJogador.id, ctx.forwardChute.nome);
        }
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
        registrarGolMarcadoNaPartida(ctx.forwardChute);
        teveGol = true;
        ctx.golParaJogador = false;
        estadoGlobal.posseJogador = true;
        if (tipoModoJogo === "copa" && copaEstado && metaSelecaoCpu) {
          registrarGolArtilheiroCopa(metaSelecaoCpu.id, ctx.forwardChute.nome);
        }
      }
    }

    estadoGlobal.proximaZona = ZONES.MEIO_CAMPO;
    mostrarResultadoFinal(teveGol, ctx.golParaJogador);
  }

  const nLetras = penalti
    ? chuteJogador
      ? 1
      : 3
    : chuteJogador
      ? 3
      : 2;
  const seq = Array.from({ length: nLetras }, () => parametrosLetra(met.ratio));
  const msPorLetra = seq.reduce((a, pr) => a + pr.tempoLimiteMs, 0) / nLetras;
  /** @type {Record<number, string>} */
  const porExtenso = { 1: "uma", 2: "duas", 3: "três", 4: "quatro" };
  const alvo = porExtenso[nLetras];
  const prefix = penalti ? "Pênalti — " : "";
  const tempoHint = fmtSegundosExatos(msPorLetra);
  els.qteDica.textContent =
    nLetras === 1
      ? `${prefix}Acerte ${alvo} letra (${tempoHint} s).`
      : `${prefix}Acerte ${alvo} letras seguidas (${tempoHint} s por letra).`;
  iniciarQteLetraSequencia(seq, aoFimGoleiro);
}

/**
 * @param {boolean} teveGol
 * @param {boolean} golParaJogador
 */
function mostrarResultadoFinal(teveGol, golParaJogador) {
  if (!ctx) return;
  ctx._teveGol = teveGol;
  ctx.golParaJogador = golParaJogador;
  atualizarPlacar();
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

els.btnIniciarDueloCampo?.addEventListener("click", () => {
  const fn = ctx?.iniciarQteCampo;
  if (!fn) return;
  ctx.iniciarQteCampo = null;
  fn();
});

els.btnEncararGoleiro?.addEventListener("click", () => {
  iniciarQteGoleiro();
});

els.btnFecharLance?.addEventListener("click", async () => {
  const golParaJogador = ctx?.golParaJogador === true;
  const teveGol = ctx?._teveGol === true;
  const minutoLance = ctx?.minuto ?? estadoGlobal.minuto;
  const blocos = ctx?.linhasResultado ?? [];
  const resumo = blocos.map(htmlParaTextoLog).filter(Boolean).join(" ");

  appendLog(`<strong>${formatMinuto(minutoLance)}</strong> — ${resumo || "Lance concluído."}`);

  fecharModalLance();
  renderEscalacoes(null);
  substituirLesionadosTitularCpu();

  if (tentarEncerrarPartidaPorMinimoJogadoresEmCampo()) return;

  if (teveGol) {
    mostrarPopupGol(golParaJogador);
    return;
  }

  if (temTitularLesionadoHumano()) {
    bloquearPorLesaoHumanoAposLance();
    return;
  }

  await continuarRodadaAposLance();
});

function textoPlacarFinalPartida() {
  const j = metaSelecaoJogador?.sigla ?? "";
  const c = metaSelecaoCpu?.sigla ?? "";
  let t = j && c ? `${j} ${golsJogador} × ${golsCpu} ${c}` : `${golsJogador} × ${golsCpu}`;
  if (placarPenaltisPosDecisao) {
    const { jogador: ph, cpu: pc } = placarPenaltisPosDecisao;
    t += ` (${ph} × ${pc})`;
  }
  return t;
}

function mostrarPopupFimDeJogo() {
  if (!els.fimJogoOverlay) return;
  if (els.fimJogoTitulo) els.fimJogoTitulo.textContent = "Fim de jogo!";
  if (els.fimJogoPlacar) els.fimJogoPlacar.textContent = textoPlacarFinalPartida();
  els.fimJogoOverlay.hidden = false;
  sincronizarUiPausa();
}

function esconderPopupFimDeJogo() {
  if (els.fimJogoOverlay) els.fimJogoOverlay.hidden = true;
  sincronizarUiPausa();
}

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

els.btnFimJogoOk?.addEventListener("click", () => {
  esconderPopupFimDeJogo();
});

els.btnGolOk?.addEventListener("click", async () => {
  els.golOverlay.hidden = true;
  sincronizarUiPausa();
  substituirLesionadosTitularCpu();
  if (tentarEncerrarPartidaPorMinimoJogadoresEmCampo()) return;
  if (temTitularLesionadoHumano()) {
    bloquearPorLesaoHumanoAposLance();
    return;
  }
  await continuarRodadaAposLance();
});

function aplicarPausaPorExpulsaoHumanaSeMarcada() {
  if (!aguardandoPausaPorExpulsaoHumana) return;
  aguardandoPausaPorExpulsaoHumana = false;
  jogoPausado = true;
  pintarEstatisticasPausa();
  sincronizarUiPausa();
  appendLog(
    "<strong>Expulsão.</strong> O jogo pausou — ajuste a escalação se quiser e use <strong>Continuar</strong> na pausa quando estiver pronto.",
  );
}

async function continuarRodadaAposLance() {
  aplicarPausaPorExpulsaoHumanaSeMarcada();
  tentarSubstituicaoCpu();
  const de = estadoGlobal.minuto;
  const salto = proximoIntervaloMinutos();
  const prox = de + salto;
  const fim = minutoFimJogo();
  if (prox > fim) {
    /* Salto sorteado (até +10 min) pode estourar o último minuto (ex.: acréscimos).
     * Animar até o fim evita “pulo” direto do relógio para o apito após o lance. */
    if (de < fim) {
      await animarTempoJogo(de, fim);
    }
    estadoGlobal.minuto = fim;
    els.relogio.textContent = formatMinuto(fim);
    els.etapaTempo.textContent = "Fim";
    const fimReg = minutoFimSegundoTempoRegulamentar();
    const empate = golsJogador === golsCpu;
    if (
      tipoModoJogo === "copa" &&
      copaPartidaKnockout &&
      !copaProrrogaAtiva &&
      fim === fimReg &&
      empate
    ) {
      tempoAnimando = false;
      await aguardarInicioProrrogacao();
      iniciarProrrogacaoAposClique();
      appendLog("1.º tempo da prorrogação (15 min).");
      const saltoP = proximoIntervaloMinutos();
      const teto = minutoFimJogo();
      await animarTempoJogo(fim, Math.min(fim + saltoP, teto));
      estadoGlobal.minuto = Math.min(fim + saltoP, teto);
      dispararLance();
      return;
    }
    if (
      tipoModoJogo === "copa" &&
      copaPartidaKnockout &&
      copaProrrogaAtiva &&
      copaEtExtra === 1 &&
      fim === minutoFimPrimeiroTempoProrrogacao() &&
      empate
    ) {
      tempoAnimando = false;
      await aguardarInicioEt2();
      copaEtExtra = 2;
      copaEt2Liberado = true;
      aguardandoInicioEt2 = false;
      esconderUiIntervalo();
      els.relogio.textContent = formatMinuto(fim);
      els.etapaTempo.textContent = labelEtapa(fim);
      appendLog("2.º tempo da prorrogação (15 min).");
      const saltoEt2 = proximoIntervaloMinutos();
      const tetoEt2 = minutoFimJogo();
      await animarTempoJogo(fim, Math.min(fim + saltoEt2, tetoEt2));
      estadoGlobal.minuto = Math.min(fim + saltoEt2, tetoEt2);
      dispararLance();
      return;
    }
    if (
      tipoModoJogo === "copa" &&
      copaPartidaKnockout &&
      copaProrrogaAtiva &&
      copaEtExtra === 2 &&
      empate
    ) {
      tempoAnimando = false;
      try {
        const humGanhou = await executarDisputaPenaltis();
        await tratarFimPartidaCopaKnockout(humGanhou);
      } catch (e) {
        console.error(e);
        encerrarPartida();
      }
      return;
    }
    encerrarPartida();
    return;
  }
  await animarTempoJogo(de, prox);
  estadoGlobal.minuto = prox;
  dispararLance();
}

function dispararLance() {
  if (partidaAtiva && temTitularLesionadoHumano()) {
    jogoPausado = true;
    precisaResolverLesaoHumano = true;
    pintarEstatisticasPausa();
    sincronizarUiPausa();
    appendLog("Jogo parado: há titular lesionado na escalação — faça a substituição.");
    return;
  }
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

function resetFlagsProrrogacaoCopa() {
  copaProrrogaAtiva = false;
  copaEtExtra = 0;
  copaEt2Liberado = false;
  acrescimosET1 = 0;
  acrescimosET2 = 0;
  aguardandoInicioProrrogacao = false;
  aguardandoInicioEt2 = false;
  resolveInicioProrrogacao = null;
  resolveInicioEt2 = null;
}

function forcaSelecaoId(id) {
  const s = SELECOES.find((x) => x.id === id);
  return s ? forcaMediaSelecao(s) : 50;
}

function processarFimDeJogoCopa() {
  if (!copaEstado) return;
  const gh = golsJogador;
  const gc = golsCpu;
  resetFlagsProrrogacaoCopa();
  copaPartidaKnockout = false;
  const j = metaSelecaoJogador?.sigla ?? "";
  const c = metaSelecaoCpu?.sigla ?? "";
  appendLog(`<strong>Fim de jogo.</strong> ${j} ${gh} × ${gc} ${c}`);

  aplicarEfeitosPosJogoCopaLesaoDisciplina();

  if (copaEstado.faseCopa === "grupos") {
    const adv = copaEstado.adversariosGrupo[copaEstado.idxAdversarioGrupo];
    registrarResultadoGrupoCopa(copaEstado, copaEstado.playerTeamId, adv, gh, gc);
    copaEstado.idxAdversarioGrupo++;
    const nr = copaEstado.idxAdversarioGrupo;
    const partidasSim =
      nr >= 1 && nr <= 3 ? simularRodadaGruposCopa(/** @type {1 | 2 | 3} */ (nr)) : [];
    const listaG = copaEstado.partidasPorGrupo[copaEstado.grupoPlayer];
    const pj = listaG.find(
      (x) =>
        (x.home === copaEstado.playerTeamId && x.away === adv) ||
        (x.home === adv && x.away === copaEstado.playerTeamId),
    );
    const jogoHumano =
      pj && pj.gh >= 0
        ? {
            L: copaEstado.grupoPlayer,
            homeId: pj.home,
            awayId: pj.away,
            gh: pj.gh,
            ga: pj.ga,
          }
        : null;
    const todas = jogoHumano ? [jogoHumano, ...partidasSim] : [...partidasSim];
    copaEstado.ultimaRodadaResultados =
      nr >= 1 && nr <= 3 ? { numero: nr, partidas: todas } : undefined;
    agendarTransicaoCopaAposContinuar(() => mostrarTelaCopaHubAposJogoGrupo());
    return;
  }

  const jogo = copaEstado.jogosEliminatorios[copaEstado.idxJogoEliminatorio];
  if (!jogo) return;
  aplicarPlacarJogoEliminatorioAtualKnockout(null);
  const humanVence = gh > gc;
  const faseAntesEliminacao = copaEstado.faseCopa;
  if (!humanVence) {
    jogo.winnerId =
      jogo.homeId === copaEstado.playerTeamId ? jogo.awayId : jogo.homeId;
    copaEstado.faseCopa = "eliminado";
    completarEliminatoriaAposEliminacaoHumana(
      /** @type {"oitavas"|"quartas"|"semi"|"final"} */ (faseAntesEliminacao),
    );
    agendarTransicaoCopaAposContinuar(() => mostrarTelaCopaEliminado());
    return;
  }
  jogo.winnerId = copaEstado.playerTeamId;
  avancarEliminatoriaCopa(true);
}

function registrarResultadoGrupoCopa(est, humanId, advId, gHuman, gAdv) {
  const lista = est.partidasPorGrupo[est.grupoPlayer];
  const p = lista.find(
    (x) =>
      (x.home === humanId && x.away === advId) ||
      (x.home === advId && x.away === humanId),
  );
  if (!p) return;
  if (p.home === humanId) {
    aplicarResultadoNaLista(lista, humanId, advId, gHuman, gAdv);
  } else {
    aplicarResultadoNaLista(lista, advId, humanId, gAdv, gHuman);
  }
}

/**
 * Grava placar do jogo eliminatório que acabou de ser disputado pelo humano (gols e, se houver, pênaltis).
 * @param {null | { jogador: number, cpu: number }} placarPenaltis
 */
function aplicarPlacarJogoEliminatorioAtualKnockout(placarPenaltis) {
  if (!copaEstado) return;
  const f = copaEstado.faseCopa;
  if (f !== "oitavas" && f !== "quartas" && f !== "semi" && f !== "final") return;
  const jogo = copaEstado.jogosEliminatorios[copaEstado.idxJogoEliminatorio];
  if (!jogo) return;
  const pid = copaEstado.playerTeamId;
  const emCasa = jogo.homeId === pid;
  jogo.gh = emCasa ? golsJogador : golsCpu;
  jogo.ga = emCasa ? golsCpu : golsJogador;
  if (placarPenaltis) {
    jogo.penGh = emCasa ? placarPenaltis.jogador : placarPenaltis.cpu;
    jogo.penGa = emCasa ? placarPenaltis.cpu : placarPenaltis.jogador;
  } else {
    delete jogo.penGh;
    delete jogo.penGa;
  }
}

/**
 * Simula todas as fases restantes da Copa (CPU×CPU) após o jogador ser eliminado e define `campeaoId`.
 * @param {"oitavas"|"quartas"|"semi"|"final"} faseInicial
 */
function completarEliminatoriaAposEliminacaoHumana(faseInicial) {
  if (!copaEstado?.eliminatoria) return;
  let fase = faseInicial;
  for (let passo = 0; passo < 24; passo++) {
    simularJogosCpuSemHumanoNaRodada();
    const lista = copaEstado.jogosEliminatorios;
    if (!lista?.length) break;
    if (lista.some((j) => !j.winnerId)) break;

    if (fase === "final") {
      copaEstado.campeaoId = lista[0].winnerId;
      return;
    }

    const v = lista.map((x) => x.winnerId).filter(Boolean);
    if (fase === "oitavas" && v.length === 8) {
      const qua = montarQuartasFifa(/** @type {string[]} */ (v));
      copaEstado.eliminatoria.quartas = qua;
      copaEstado.jogosEliminatorios = qua;
      fase = "quartas";
      continue;
    }
    if (fase === "quartas" && v.length === 4) {
      const semi = montarSemiFifa(/** @type {string[]} */ (v));
      copaEstado.eliminatoria.semi = semi;
      copaEstado.jogosEliminatorios = semi;
      fase = "semi";
      continue;
    }
    if (fase === "semi" && v.length === 2) {
      const fin = montarFinal(/** @type {string} */ (v[0]), /** @type {string} */ (v[1]));
      copaEstado.eliminatoria.final = fin;
      copaEstado.jogosEliminatorios = fin;
      fase = "final";
      continue;
    }
    break;
  }
}

function simularJogoCpuVsCpu(
  /** @type {{ homeId: string, awayId: string, winnerId?: string | null, gh?: number, ga?: number, penGh?: number, penGa?: number }} */ jogo,
) {
  if (!copaEstado) return jogo.homeId;
  const { homeId, awayId } = jogo;
  const { gh, ga } = simularPlacar(forcaSelecaoId(homeId), forcaSelecaoId(awayId), copaEstado.rng);
  const g = gh === ga ? (copaEstado.rng() < 0.5 ? { gh: gh + 1, ga } : { gh, ga: ga + 1 }) : { gh, ga };
  jogo.gh = g.gh;
  jogo.ga = g.ga;
  delete jogo.penGh;
  delete jogo.penGa;
  registrarGolsPartidaSimuladaCopa(homeId, awayId, g.gh, g.ga, copaEstado.rng);
  return g.gh > g.ga ? homeId : awayId;
}

/**
 * @param {boolean} [adiarIrParaHub] se true (fim de jogo em campo), só mostra o hub após "Continuar"
 */
function avancarEliminatoriaCopa(adiarIrParaHub = false) {
  if (!copaEstado) return;
  const ir = (/** @type {() => void} */ fn) => {
    if (adiarIrParaHub) agendarTransicaoCopaAposContinuar(fn);
    else fn();
  };
  const fase = copaEstado.faseCopa;
  const lista = copaEstado.jogosEliminatorios;

  if (fase === "oitavas") {
    const v = lista.map((x) => x.winnerId).filter(Boolean);
    if (v.length !== 8) return;
    const qua = montarQuartasFifa(v);
    if (copaEstado.eliminatoria) copaEstado.eliminatoria.quartas = qua;
    copaEstado.jogosEliminatorios = qua;
    copaEstado.faseCopa = "quartas";
    simularJogosCpuSemHumanoNaRodada();
    copaEstado.idxJogoEliminatorio = copaEstado.jogosEliminatorios.findIndex(
      (j) => j.homeId === copaEstado.playerTeamId || j.awayId === copaEstado.playerTeamId,
    );
    ir(() => mostrarTelaCopaHubMataMata());
    return;
  }

  if (fase === "quartas") {
    const v = lista.map((x) => x.winnerId).filter(Boolean);
    if (v.length !== 4) return;
    const semi = montarSemiFifa(v);
    if (copaEstado.eliminatoria) copaEstado.eliminatoria.semi = semi;
    copaEstado.jogosEliminatorios = semi;
    copaEstado.faseCopa = "semi";
    simularJogosCpuSemHumanoNaRodada();
    copaEstado.idxJogoEliminatorio = copaEstado.jogosEliminatorios.findIndex(
      (j) => j.homeId === copaEstado.playerTeamId || j.awayId === copaEstado.playerTeamId,
    );
    ir(() => mostrarTelaCopaHubMataMata());
    return;
  }

  if (fase === "semi") {
    const v = lista.map((x) => x.winnerId).filter(Boolean);
    if (v.length !== 2) return;
    const fin = montarFinal(v[0], v[1]);
    if (copaEstado.eliminatoria) copaEstado.eliminatoria.final = fin;
    copaEstado.jogosEliminatorios = fin;
    copaEstado.faseCopa = "final";
    copaEstado.idxJogoEliminatorio = 0;
    ir(() => mostrarTelaCopaHubMataMata());
    return;
  }

  if (fase === "final") {
    copaEstado.campeaoId = copaEstado.playerTeamId;
    copaEstado.faseCopa = "campeao";
    ir(() => mostrarTelaCopaCampeao());
  }
}

function simularJogosCpuSemHumanoNaRodada() {
  if (!copaEstado) return;
  const pid = copaEstado.playerTeamId;
  for (const j of copaEstado.jogosEliminatorios) {
    if (j.winnerId) continue;
    if (j.homeId === pid || j.awayId === pid) continue;
    j.winnerId = simularJogoCpuVsCpu(j);
  }
}

async function tratarFimPartidaCopaKnockout(humGanhouPenaltis) {
  if (!copaEstado) return;
  const jogo = copaEstado.jogosEliminatorios[copaEstado.idxJogoEliminatorio];
  partidaAtiva = false;
  jogoPausado = false;
  precisaResolverLesaoHumano = false;
  aguardandoPausaPorExpulsaoHumana = false;
  fluxoForaDePartida = "pos_fim";
  els.pausePanel.hidden = true;
  aguardandoSegundoTempo = false;
  resolveSegundoTempo = null;
  esconderUiIntervalo();
  const fim = minutoFimJogo();
  estadoGlobal.minuto = Math.min(estadoGlobal.minuto, fim);
  els.relogio.textContent = formatMinuto(estadoGlobal.minuto);
  els.etapaTempo.textContent = "Fim";
  resetFlagsProrrogacaoCopa();
  copaPartidaKnockout = false;
  appendLog(
    humGanhouPenaltis
      ? "<strong>Pênaltis:</strong> você vence a disputa."
      : "<strong>Pênaltis:</strong> o adversário converteu melhor.",
  );
  aplicarEfeitosPosJogoCopaLesaoDisciplina();
  const penSnap = placarPenaltisPosDecisao
    ? { jogador: placarPenaltisPosDecisao.jogador, cpu: placarPenaltisPosDecisao.cpu }
    : null;
  aplicarPlacarJogoEliminatorioAtualKnockout(penSnap);
  jogo.winnerId = humGanhouPenaltis
    ? copaEstado.playerTeamId
    : jogo.homeId === copaEstado.playerTeamId
      ? jogo.awayId
      : jogo.homeId;
  if (els.copaPenaltisOverlay) els.copaPenaltisOverlay.hidden = true;
  esconderHudDisputaPenaltis();
  const faseAntesEliminacao = copaEstado.faseCopa;
  if (humGanhouPenaltis) {
    avancarEliminatoriaCopa(true);
  } else {
    copaEstado.faseCopa = "eliminado";
    completarEliminatoriaAposEliminacaoHumana(
      /** @type {"oitavas"|"quartas"|"semi"|"final"} */ (faseAntesEliminacao),
    );
    agendarTransicaoCopaAposContinuar(() => mostrarTelaCopaEliminado());
  }
  sincronizarUiPausa();
  atualizarBtnCentroRodada();
  mostrarPopupFimDeJogo();
}

function encerrarPartida() {
  placarPenaltisPosDecisao = null;
  partidaAtiva = false;
  jogoPausado = false;
  precisaResolverLesaoHumano = false;
  aguardandoPausaPorExpulsaoHumana = false;
  fluxoForaDePartida = "pos_fim";
  els.pausePanel.hidden = true;
  aguardandoSegundoTempo = false;
  resolveSegundoTempo = null;
  esconderUiIntervalo();
  const fim = minutoFimJogo();
  estadoGlobal.minuto = Math.min(estadoGlobal.minuto, fim);
  els.relogio.textContent = formatMinuto(estadoGlobal.minuto);
  els.etapaTempo.textContent = "Fim";
  sincronizarUiPausa();
  if (tipoModoJogo === "copa" && copaEstado) {
    processarFimDeJogoCopa();
    atualizarBtnCentroRodada();
    mostrarPopupFimDeJogo();
    return;
  }
  atualizarBtnCentroRodada();
  appendLog(`<strong>Fim de jogo.</strong> ${textoPlacarFinalPartida()}`);
  mostrarPopupFimDeJogo();
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
  placarPenaltisPosDecisao = null;
  golsPorJogadorNaPartida.clear();
  esconderPopupFimDeJogo();
  jogoPausado = false;
  precisaResolverLesaoHumano = false;
  aguardandoPausaPorExpulsaoHumana = false;
  els.pausePanel.hidden = true;
  substituicoesUsadas = 0;
  substituicoesCpuUsadas = 0;
  jogadoresSubstituidosForaIds.clear();
  copaTransicaoHubPendente = null;
  segundoTempoAutorizado = false;
  aguardandoSegundoTempo = false;
  resolveSegundoTempo = null;
  esconderUiIntervalo();
  acrescimosPrimeiroTempo = sortearAcrescimosTempo();
  acrescimosSegundoTempo = Math.max(1, sortearAcrescimosTempo());
  resetFlagsProrrogacaoCopa();
  restaurarElencoParaNovaPartida();
  if (tipoModoJogo === "copa" && copaEstado) {
    const lh = copaEstado.lesoesHumano ?? {};
    copaEstado._snapCopaInicioPartida = {
      jogosSuspensao: { ...(copaEstado.jogosSuspensao ?? {}) },
      lesoesHumano: Object.fromEntries(
        Object.keys(lh).map((k) => [k, { partidasFora: lh[k].partidasFora }]),
      ),
    };
  }
  snapshotStatsInicioPartida();
  atualizarPlacar();
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

function montarCardsAmistoso() {
  const montarColuna = (/** @type {"jogador" | "cpu"} */ lado) => {
    const wrap = lado === "jogador" ? els.amistosoCardsJogador : els.amistosoCardsCpu;
    if (!wrap) return;
    wrap.replaceChildren();
    for (const s of SELECOES) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card-selecao";
      btn.dataset.selecaoId = s.id;
      const img = document.createElement("img");
      img.src = urlBandeira(s.iso, 160);
      img.alt = `Bandeira de ${s.nome}`;
      img.width = 88;
      img.height = 66;
      img.loading = "lazy";
      const span = document.createElement("span");
      span.className = "card-selecao-nome";
      span.textContent = s.nome;
      btn.append(img, span);
      btn.addEventListener("click", () => {
        if (lado === "jogador") idSelecaoJogadorEscolhida = s.id;
        else idSelecaoCpuEscolhida = s.id;
        const escolha = lado === "jogador" ? idSelecaoJogadorEscolhida : idSelecaoCpuEscolhida;
        wrap.querySelectorAll(".card-selecao").forEach((b) => {
          b.classList.toggle("card-selecao--ativa", b.dataset.selecaoId === escolha);
        });
        sincronizarEscolhaAmistoso();
      });
      wrap.appendChild(btn);
    }
  };
  montarColuna("jogador");
  montarColuna("cpu");
}

function sincronizarEscolhaAmistoso() {
  const btn = els.btnConfirmarAmistoso;
  if (!btn) return;
  const mesmo =
    Boolean(idSelecaoJogadorEscolhida) &&
    Boolean(idSelecaoCpuEscolhida) &&
    idSelecaoJogadorEscolhida === idSelecaoCpuEscolhida;
  const ambos = Boolean(idSelecaoJogadorEscolhida) && Boolean(idSelecaoCpuEscolhida);
  const podeIr = ambos && !mesmo;
  btn.disabled = !podeIr;
  if (podeIr) btn.removeAttribute("disabled");
  else btn.setAttribute("disabled", "");
  const errEl = els.amistosoErro;
  if (errEl) {
    if (mesmo) {
      errEl.hidden = false;
      errEl.textContent = "Escolha dois times diferentes.";
    } else {
      errEl.hidden = true;
    }
  }
}

function resetAmistosoUi() {
  idSelecaoJogadorEscolhida = null;
  idSelecaoCpuEscolhida = null;
  els.amistosoCardsJogador?.querySelectorAll(".card-selecao").forEach((b) => {
    b.classList.remove("card-selecao--ativa");
  });
  els.amistosoCardsCpu?.querySelectorAll(".card-selecao").forEach((b) => {
    b.classList.remove("card-selecao--ativa");
  });
  if (els.btnConfirmarAmistoso) {
    els.btnConfirmarAmistoso.disabled = true;
    els.btnConfirmarAmistoso.setAttribute("disabled", "");
  }
  if (els.amistosoErro) els.amistosoErro.hidden = true;
}

els.relogio.textContent = "0′";
els.etapaTempo.textContent = "—";
atualizarPlacar();
atualizarSubsHud();
sincronizarUiPausa();
atualizarBtnCentroRodada();
