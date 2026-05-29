export enum PhraseType {
  MOTIVATIONAL = "MOTIVATIONAL",
  SARCASTIC = "SARCASTIC",
  WISE = "WISE",
  FUNNY = "FUNNY",
  ROAST = "ROAST",
}

export interface PhraseContext {
  readonly buddyName: string;
  readonly buddyTalent: string;
  readonly buddyDescription: string;
  readonly phraseType: PhraseType;
}

const PHRASE_TYPE_VALUES = Object.values(PhraseType);

export function randomPhraseType(): PhraseType {
  const index = Math.floor(Math.random() * PHRASE_TYPE_VALUES.length);
  return PHRASE_TYPE_VALUES[index] as PhraseType;
}
