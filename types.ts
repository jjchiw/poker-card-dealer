
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface Card {
  rank: Rank;
  suit: Suit;
  id: string;
  uniqueId: string; // Needed for multi-deck to identify specific card instances
}

export interface CardDealerOptions {
  width?: number;
  height?: number;
  assetRoot: string;
  autoShuffle?: boolean;
  repeat?: boolean;
  deckCount?: number;
}

export type DealerEvent = 'deal' | 'shuffle' | 'complete' | 'pause' | 'resume' | 'rewind-finished';

export interface DealPayload {
  card: Card;
  index: number;
  total: number;
}
