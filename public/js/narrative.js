import { ZONE_LABEL, ZONES } from "./constants.js";

/** @typedef {(j: { nome: string }) => string} FmtNome */

/**
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
  const bola = p.jogadorComBola ? `${eu} conduz a bola` : `${ele} pressiona com a posse`;

  if (p.zona === ZONES.DEFESA_JOGADOR) {
    return `${setor}. ${bola}. ${eu} fecha o espaço na última linha contra ${ele}, que busca infiltrar.`;
  }
  if (p.zona === ZONES.MEIO_CAMPO) {
    return `${setor}. ${bola}. ${eu} e ${ele} disputam o segundo tempo de bola no miolo.`;
  }
  if (p.zona === ZONES.ATAQUE_JOGADOR) {
    return `${setor}. ${bola}. ${eu} encara ${ele} na referência da área rival.`;
  }
  return `${setor}. ${eu} contra ${ele}.`;
}

/**
 * @param {object} p
 * @param {boolean} p.venceu
 * @param {FmtNome} [fmtNome]
 */
export function textoResultadoPrimario(p, fmtNome = (j) => j.nome) {
  const j = fmtNome(p.jogador);
  const a = fmtNome(p.adversario);
  if (p.venceu) {
    if (p.zona === ZONES.ATAQUE_JOGADOR) {
      return `${j} ganha o corpo, abre ângulo e deixa o zagueiro para trás — a defesa rival pede cobertura.`;
    }
    if (p.zona === ZONES.DEFESA_JOGADOR) {
      return `${j} antecipa o passe, corta a jogada e tira pressão do setor defensivo.`;
    }
    return `${j} sai na frente no duelo e impõe o ritmo no lance.`;
  }
  if (p.zona === ZONES.ATAQUE_JOGADOR) {
    return `${a} fecha bem a porta, desarma ${j} e a bola volta para o meio.`;
  }
  if (p.zona === ZONES.DEFESA_JOGADOR) {
    return `${a} protege a bola, gira na marcação e mantém o ataque vivo em campo.`;
  }
  return `${a} leva a melhor no mano a mano e redefine o lance.`;
}

export function textoTransicaoGoleiro(chuteJogador) {
  if (chuteJogador) {
    return "A zaga não conteve — sobra finalização cara a cara com o goleiro.";
  }
  return "A defesa cedeu espaço: o atacante entra na grande área para bater no gol.";
}

/**
 * @param {object} p
 * @param {boolean} p.venceu
 * @param {boolean} p.chuteJogador
 * @param {FmtNome} [fmtNome]
 */
export function textoDueloGoleiro(p, fmtNome = (j) => j.nome) {
  const at = fmtNome(p.atacante);
  const gl = fmtNome(p.goleiro);
  if (p.chuteJogador) {
    if (p.venceu) {
      return `${at} enche o pé; o goleiro ${gl} ainda reage, mas não alcança — bola no fundo das redes.`;
    }
    return `${gl} fecha o ângulo, estica o braço e encaixa a defesa. O estádio segura o grito.`;
  }
  if (p.venceu) {
    return `${gl} sai no contrapé, fecha o arco e nega o gol a ${at}.`;
  }
  return `${at} converte: a bola passa raspando as luvas de ${gl} e entra.`;
}
