import { ZONE_LABEL, ZONES } from "./constants.js";

/** @typedef {(j: { nome: string }) => string} FmtNome */

/**
 * Contexto do lance: sempre alinha “quem tem a bola” com a ação descrita.
 * `jogador` / `adversario` vêm de escolherDuelistas (seu zag/meia/ata × rival).
 * @param {object} p
 * @param {string} p.zona
 * @param {object} p.jogador
 * @param {object} p.adversario
 * @param {boolean} p.jogadorComBola
 * @param {FmtNome} [fmtNome]
 */
export function textoContextoPrimario(p, fmtNome = (j) => j.nome) {
  const setor = ZONE_LABEL[p.zona] || p.zona;
  const eu = fmtNome(p.jogador);
  const ele = fmtNome(p.adversario);

  if (p.zona === ZONES.DEFESA_JOGADOR) {
    if (p.jogadorComBola) {
      return `${setor}. ${eu} tem a bola na saída da defesa; ${ele} avança da linha de ataque para pressionar e tentar roubar.`;
    }
    return `${setor}. ${ele} desce com a bola buscando infiltrar na última linha; ${eu} recua para fechar espaço e cortar a jogada.`;
  }

  if (p.zona === ZONES.MEIO_CAMPO) {
    if (p.jogadorComBola) {
      return `${setor}. ${eu} comanda o meio com a posse; ${ele} gruda na marcação e disputa cada toque.`;
    }
    return `${setor}. ${ele} organiza o jogo com a bola no miolo; ${eu} pressiona, fecha linhas de passe e força o duelo.`;
  }

  if (p.zona === ZONES.ATAQUE_JOGADOR) {
    if (p.jogadorComBola) {
      return `${setor}. ${eu} encara ${ele} na referência da área rival, com opção de arrastar ou tocar na profundidade.`;
    }
    return `${setor}. ${ele} tenta progressão com a bola na zona alta; ${eu} volta na marcação para travar a subida.`;
  }

  return `${setor}. ${eu} e ${ele} se encontram no lance decisivo.`;
}

/**
 * Resultado do duelo coerente com posse: vitória do humano = sucesso na ação que o QTE representa (ataque ou defesa).
 * @param {object} p
 * @param {boolean} p.venceu
 * @param {boolean} p.jogadorComBola
 * @param {FmtNome} [fmtNome]
 */
export function textoResultadoPrimario(p, fmtNome = (j) => j.nome) {
  const j = fmtNome(p.jogador);
  const a = fmtNome(p.adversario);
  const com = p.jogadorComBola;

  if (p.zona === ZONES.DEFESA_JOGADOR) {
    if (com) {
      if (p.venceu) {
        return `${j} se livra da pressão de ${a}, protege a bola e acha a saída — a defesa respira.`;
      }
      return `${a} acerta o bote, desarma ${j} e recupera a posse na entrada da área.`;
    }
    if (p.venceu) {
      return `${j} antecipa o lance, fecha o corredor e corta a infiltração de ${a}.`;
    }
    return `${a} protege a bola na disputa, ganha o corpo e mantém o ataque vivo em campo.`;
  }

  if (p.zona === ZONES.MEIO_CAMPO) {
    if (com) {
      if (p.venceu) {
        return `${j} vence o mano a mano com a posse e impõe o ritmo no meio.`;
      }
      return `${a} desarma ${j}, rouba no miolo e vira o campo de ataque.`;
    }
    if (p.venceu) {
      return `${j} recupera no combate, tira a bola de ${a} e devolve o controle ao time.`;
    }
    return `${a} segura a marcação de ${j}, conduz de lado e mantém o comando no meio.`;
  }

  if (p.zona === ZONES.ATAQUE_JOGADOR) {
    if (com) {
      if (p.venceu) {
        return `${j} ganha o corpo, abre ângulo e deixa ${a} para trás — a defesa rival pede cobertura.`;
      }
      return `${a} fecha bem a porta, desarma ${j} e afasta o perigo da área.`;
    }
    if (p.venceu) {
      return `${j} pressiona com critério, força o erro de ${a} e mata o avanço na lateral do ataque.`;
    }
    return `${a} sustenta a posse na subida, segura o duelo e segue na progressão.`;
  }

  if (p.venceu) {
    return `${j} leva a melhor no lance e redefine o duelo.`;
  }
  return `${a} prevalece no mano a mano e muda o rumo da jogada.`;
}

/**
 * @param {boolean} chuteJogador
 * @param {{ penalti?: boolean }} [opts]
 */
export function textoTransicaoGoleiro(chuteJogador, opts) {
  const penalti = opts?.penalti === true;
  if (penalti) {
    if (chuteJogador) {
      return "Pênalti a seu favor. A bola vai para a marca da cal; quem bate encara o goleiro de frente.";
    }
    return "Pênalti para o adversário. O atacante posiciona a bola; você entra no duelo como goleiro.";
  }
  if (chuteJogador) {
    return "A zaga não conteve — sobra finalização cara a cara com o goleiro.";
  }
  return "A defesa cedeu espaço: o atacante entra na grande área para bater no gol.";
}

/** @param {FmtNome} [fmtNome] */
export function textoFaltaMarcada(j, fmtNome = (x) => x.nome) {
  return `${fmtNome(j)} comete uma falta.`;
}

/** @param {FmtNome} [fmtNome] */
export function textoCartaoAmarelo(j, fmtNome = (x) => x.nome) {
  return `Segunda falta no jogo — ${fmtNome(j)} recebe cartão amarelo.`;
}

/** @param {FmtNome} [fmtNome] */
export function textoExpulsao(j, fmtNome = (x) => x.nome) {
  return `Terceira falta — ${fmtNome(j)} é expulso. O time fica um jogador a menos e o elenco perde 7% em ataque e defesa pelo restante da partida.`;
}

/**
 * Após falta do zagueiro na área (tecla errada ou infração equivalente).
 * @param {FmtNome} [fmtNome]
 */
export function textoPenaltiMarcadoPorFalta(j, fmtNome = (x) => x.nome) {
  return `Dentro da área, a infração de ${fmtNome(j)} é punida com pênalti.`;
}

/** Quem sofreu a falta fica lesionado e precisa sair de campo. @param {FmtNome} [fmtNome] */
export function textoLesaoPorFalta(j, fmtNome = (x) => x.nome) {
  return `${fmtNome(j)} sente o choque da entrada e não pode continuar — lesão; precisa ser substituído.`;
}

/**
 * @param {object} p
 * @param {boolean} p.venceu
 * @param {boolean} p.chuteJogador você no ataque (chute) ou no gol (defesa)
 * @param {boolean} [p.penalti]
 * @param {FmtNome} [fmtNome]
 */
export function textoDueloGoleiro(p, fmtNome = (j) => j.nome) {
  const at = fmtNome(p.atacante);
  const gl = fmtNome(p.goleiro);
  const pen = p.penalti === true;

  if (p.chuteJogador) {
    if (p.venceu) {
      if (pen) {
        return `${at} cobra com calma da marca da cal; ${gl} parte para um canto, mas a bola vai no outro — gol.`;
      }
      return `${at} enche o pé; o goleiro ${gl} ainda reage, mas não alcança — bola no fundo das redes.`;
    }
    if (pen) {
      return `${gl} lê a batida e encaixa a defesa na hora — pênalti defendido.`;
    }
    return `${gl} fecha o ângulo, estica o braço e encaixa a defesa. O estádio segura o grito.`;
  }

  if (p.venceu) {
    if (pen) {
      return `No pênalti, ${gl} vai firme ao canto e empurra a finalização de ${at} — defesa.`;
    }
    return `${gl} sai no contrapé, fecha o arco e nega o gol a ${at}.`;
  }
  if (pen) {
    return `${at}, da marca dos onze metros, bate seco; ${gl} ainda desvia, mas a bola entra — gol.`;
  }
  return `${at} converte: a bola passa raspando as luvas de ${gl} e entra.`;
}

/**
 * Após vencer o QTE contra o goleiro, o chute ainda pode sair ruim.
 * @param {{ nome: string }} atacante
 * @param {FmtNome} [fmtNome]
 */
export function textoChuteParaForaAposDuelo(atacante, fmtNome = (j) => j.nome) {
  const at = fmtNome(atacante);
  return `${at} tinha o goleiro batido, mas a finalização sobe demais — bola na arquibancada.`;
}
