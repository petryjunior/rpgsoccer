/** @typedef {'goleiro' | 'zagueiro' | 'meia' | 'atacante'} Position */

export const POSITIONS = {
  GOLEIRO: "goleiro",
  ZAGUEIRO: "zagueiro",
  MEIA: "meia",
  ATACANTE: "atacante",
};

export const POSITION_LABEL = {
  goleiro: "GOL",
  zagueiro: "ZAG",
  meia: "MEI",
  atacante: "ATA",
};

/** Ordem de exibição nas escalações */
export const POSITION_SORT_ORDER = ["goleiro", "zagueiro", "meia", "atacante"];

/** Três faixas do campo (perspectiva do time do jogador). */
export const ZONES = {
  DEFESA_JOGADOR: "defesa_jogador",
  MEIO_CAMPO: "meio_campo",
  ATAQUE_JOGADOR: "ataque_jogador",
};

export const ZONE_LABEL = {
  defesa_jogador: "Defesa (você)",
  meio_campo: "Meio-campo",
  ataque_jogador: "Ataque (você)",
};
