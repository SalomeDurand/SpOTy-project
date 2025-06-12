import i18n from 'i18next';

/* Returns a punctuation mark with a non-breaking space in French. */
export function getPunctuation(mark: string): string {
  const needsSpace = i18n.language.startsWith('fr') && [":", ";", "!", "?"].includes(mark);
  return needsSpace ? "\u00A0" + mark : mark;
}