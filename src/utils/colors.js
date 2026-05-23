export const COLOR_SETS = {
  a1: { primary: '#FDB913', secondary: '#FF9F1C', accent: '#FEF9E7', text: '#92400E', border: '#FDE68A' },
  a2: { primary: '#FF9F1C', secondary: '#FF6B35', accent: '#FFF3E0', text: '#9A3412', border: '#FDBA74' },
  b1: { primary: '#E91E8C', secondary: '#D81B60', accent: '#FDF2F8', text: '#9D174D', border: '#F9A8D4' },
  b2: { primary: '#C2185B', secondary: '#A00147', accent: '#FCE4EC', text: '#831843', border: '#F472B6' },
  b3: { primary: '#D8608C', secondary: '#D8608C', accent: '#FDF2F8', text: '#DF8CBA', border: '#DF8CBA' },
  c1: { primary: '#8B0000', secondary: '#DC143C', accent: '#FEE2E2', text: '#7F1D1D', border: '#FCA5A5' },
  c2: { primary: '#663399', secondary: '#5C2E7E', accent: '#F3E8FF', text: '#4C1D95', border: '#C4B5FD' },
  d1: { primary: '#CF1164', secondary: '#FF904D', accent: '#FFDFCB', text: '#D8608C', border: '#D8608C' },
}

export const COLOR_ORDER = ['a1', 'a2', 'b1', 'b2', 'b3','c1', 'c2', 'd1']

export function getCardColorSet(index) {
  return COLOR_SETS[COLOR_ORDER[index % COLOR_ORDER.length]]
}

export const PAGE_COLORS = {
  dashboard:  COLOR_SETS.d1,
  flashcards: COLOR_SETS.a1,
  roadmap:    COLOR_SETS.b2,
  diario:     COLOR_SETS.a2,
  erros:      COLOR_SETS.c1,
  glossario:  COLOR_SETS.c2,
  vip:        COLOR_SETS.b3,
  frase:      COLOR_SETS.a1,
  metas:      COLOR_SETS.a2,
}
