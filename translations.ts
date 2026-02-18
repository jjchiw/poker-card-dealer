export type Language = 'en' | 'es';

export interface Translations {
  app: {
    title: string;
    left: string;
    status: string;
  };
  status: {
    idle: string;
    dealing: string;
    paused: string;
    complete: string;
  };
  welcome: {
    title: string;
    subtitle: string;
  };
  console: {
    title: string;
    numberOfDecks: string;
    mode: string;
    dealInterval: string;
    startDealing: string;
    pause: string;
    resume: string;
    shuffle: string;
    rewind: string;
  };
  modeOptions: {
    automatic: string;
    manual: string;
  };
  deckOptions: {
    deck1: string;
    deck2: string;
    deck3: string;
    deck4: string;
  };
  history: {
    title: string;
    dealt: string;
    empty: string;
    of: string;
  };
  suits: {
    spades: string;
    hearts: string;
    diamonds: string;
    clubs: string;
  };
  footer: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    app: {
      title: 'POKER DEALER',
      left: 'LEFT',
      status: 'STATUS:',
    },
    status: {
      idle: 'idle',
      dealing: 'dealing',
      paused: 'paused',
      complete: 'complete',
    },
    welcome: {
      title: 'Ready to deal. Shuffle to begin session.',
      subtitle: 'High-performance PixiJS Engine v7.4',
    },
    console: {
      title: 'Dealer Console',
      numberOfDecks: 'Number of Decks',
      mode: 'Mode',
      dealInterval: 'Deal Interval',
      startDealing: 'START DEALING',
      pause: 'PAUSE',
      resume: 'RESUME',
      shuffle: 'SHUFFLE',
      rewind: 'REWIND 1 STEP',
    },
    modeOptions: {
      automatic: 'Automatic',
      manual: 'Manual',
    },
    deckOptions: {
      deck1: '1 Deck (52 cards)',
      deck2: '2 Decks (104 cards)',
      deck3: '3 Decks (156 cards)',
      deck4: '4 Decks (208 cards)',
    },
    history: {
      title: 'Hand History',
      dealt: 'DEALT',
      empty: 'Deck history empty',
      of: 'of',
    },
    suits: {
      spades: 'Spades',
      hearts: 'Hearts',
      diamonds: 'Diamonds',
      clubs: 'Clubs',
    },
    footer:
      'Professional Poker Engine • Multi-Deck Logic • Responsive Layout • PixiJS v7 • LaCalabaza',
  },
  es: {
    app: {
      title: 'REPARTIDOR DE PÓKER',
      left: 'RESTANTES',
      status: 'ESTADO:',
    },
    status: {
      idle: 'inactivo',
      dealing: 'repartiendo',
      paused: 'pausado',
      complete: 'completado',
    },
    welcome: {
      title: 'Listo para repartir. Baraja para comenzar la sesión.',
      subtitle: 'Motor PixiJS de alto rendimiento v7.4',
    },
    console: {
      title: 'Consola del Repartidor',
      numberOfDecks: 'Número de Mazos',
      mode: 'Modo',
      dealInterval: 'Intervalo de Reparto',
      startDealing: 'COMENZAR A REPARTIR',
      pause: 'PAUSAR',
      resume: 'REANUDAR',
      shuffle: 'BARAJAR',
      rewind: 'RETROCEDER 1 PASO',
    },
    modeOptions: {
      automatic: 'Automático',
      manual: 'Manual',
    },
    deckOptions: {
      deck1: '1 Mazo (52 cartas)',
      deck2: '2 Mazos (104 cartas)',
      deck3: '3 Mazos (156 cartas)',
      deck4: '4 Mazos (208 cartas)',
    },
    history: {
      title: 'Historial de Manos',
      dealt: 'REPARTIDAS',
      empty: 'Historial del mazo vacío',
      of: 'de',
    },
    suits: {
      spades: 'Picas',
      hearts: 'Corazones',
      diamonds: 'Diamantes',
      clubs: 'Tréboles',
    },
    footer:
      'Motor Profesional de Póker • Lógica Multi-Mazo • Diseño Adaptable • PixiJS v7',
  },
};
