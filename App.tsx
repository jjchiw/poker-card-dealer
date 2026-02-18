import React, { useEffect, useRef, useState } from 'react';
import { CardDealer } from './CardDealer';
import { Card } from './types';
import { useTranslation } from './useTranslation';
import { audioService } from './audioService';
import { useTheme } from './useTheme';
import { themes } from './themes';

const App: React.FC = () => {
  const { t, language, toggleLanguage } = useTranslation();
  const { theme, themeId, changeTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const dealerRef = useRef<CardDealer | null>(null);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const isRewindingRef = useRef(false);
  const languageRef = useRef(language);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'dealing' | 'paused' | 'complete'
  >('idle');
  const [history, setHistory] = useState<Card[]>([]);
  const [intervalSeconds, setIntervalSeconds] = useState(5);
  const [deckCount, setDeckCount] = useState(1);
  const [cardsRemaining, setCardsRemaining] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(() =>
    audioService.isEnabled(),
  );
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-scroll to top only if user is already near the top (within 100px)
  useEffect(() => {
    if (historyScrollRef.current && history.length > 0) {
      const scrollTop = historyScrollRef.current.scrollTop;
      // Only auto-scroll if user is already at or near the top
      if (scrollTop < 100) {
        historyScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [history]);

  // Preload audio when language changes
  useEffect(() => {
    languageRef.current = language;
    audioService.preloadCommonCards(language);
  }, [language]);

  useEffect(() => {
    if (!containerRef.current) return;

    const initialWidth = containerRef.current.clientWidth || 800;
    const initialHeight = containerRef.current.clientHeight || 600;

    const dealer = new CardDealer({
      width: initialWidth,
      height: initialHeight,
      assetRoot: 'https://raw.githubusercontent.com/example/assets/main/',
      autoShuffle: true,
      repeat: false,
      deckCount: 1,
    });

    dealer.mount(containerRef.current);
    dealer.setInterval(intervalSeconds * 1000);
    dealerRef.current = dealer;

    dealer.on('deal', ({ card, index, total }) => {
      setCurrentCard(card);
      setCardsRemaining(total - index);
      // Only add to history if not rewinding
      if (!isRewindingRef.current) {
        setHistory((prev) => [card, ...prev].slice(0, 50));
      }
      isRewindingRef.current = false;
      // Play audio announcement
      audioService.playCard(card.rank, card.suit, languageRef.current);
    });

    dealer.on('pause', () => setStatus('paused'));
    dealer.on('resume', () => setStatus('dealing'));
    dealer.on('complete', () => setStatus('complete'));
    dealer.on('shuffle', () => {
      setHistory([]);
      setCurrentCard(null);
      setCardsRemaining(52 * deckCount);
    });

    // Reset to clean state on mount/refresh
    setStatus('idle');
    setHistory([]);
    setCurrentCard(null);
    setCardsRemaining(52);

    const handleResize = () => {
      if (containerRef.current && dealerRef.current) {
        dealerRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight,
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      dealer.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleStart = () => {
    if (dealerRef.current) {
      dealerRef.current.start();
      setStatus('dealing');
    }
  };

  const handlePause = () => {
    dealerRef.current?.pause();
  };

  const handleResume = () => {
    dealerRef.current?.resume();
  };

  const handleShuffle = () => {
    dealerRef.current?.shuffle();
    setStatus('idle');
  };

  const handleRewind = () => {
    if (history.length === 0) return;
    isRewindingRef.current = true;
    setHistory((prev) => prev.slice(1));
    dealerRef.current?.rewind(1);
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setIntervalSeconds(val);
    dealerRef.current?.setInterval(val * 1000);
  };

  const handleDeckCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setDeckCount(count);
    dealerRef.current?.setDeckCount(count);
    setCardsRemaining(count * 52);
    setStatus('idle');
  };

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    audioService.setEnabled(newState);
  };

  // Close theme selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isThemeSelectorOpen &&
        !(e.target as Element).closest('.theme-selector')
      ) {
        setIsThemeSelectorOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isThemeSelectorOpen]);

  // Progress bar animation for next card
  useEffect(() => {
    if (status !== 'dealing') {
      setProgress(0);
      return;
    }

    // Reset progress when a new card is dealt
    setProgress(0);

    const startTime = Date.now();
    const duration = intervalSeconds * 1000;
    let animationFrame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100 && status === 'dealing') {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [status, intervalSeconds, history.length]);

  return (
    <div
      className="flex flex-col h-screen font-sans text-white overflow-hidden"
      style={{ backgroundColor: theme.colors.bg }}
    >
      <header
        className="p-3 md:p-4 flex justify-between items-center shadow-lg z-50 shrink-0 overflow-visible"
        style={{
          backgroundColor: theme.colors.bgAlt,
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <h1
            className="text-lg md:text-xl font-bold flex items-center gap-2"
            style={{ color: theme.colors.primary }}
          >
            <span className="text-2xl">🂠</span>{' '}
            <span className="hidden sm:inline">{t.app.title}</span>
          </h1>
          <div
            className="px-2 py-0.5 rounded text-[10px] md:text-xs"
            style={{
              backgroundColor: theme.colors.bg,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.textMuted,
            }}
          >
            {cardsRemaining} {t.app.left}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 overflow-visible">
          <div className="relative theme-selector">
            <button
              ref={themeButtonRef}
              onClick={() => setIsThemeSelectorOpen(!isThemeSelectorOpen)}
              className="px-2 py-1 rounded border text-xs font-bold transition-all"
              style={{
                backgroundColor: theme.colors.bg,
                borderColor: theme.colors.border,
              }}
              title="Change Theme"
            >
              <span className="text-base">{theme.icon}</span>
            </button>
            {isThemeSelectorOpen && (
              <div
                className="fixed rounded-lg shadow-2xl overflow-hidden z-[99999] min-w-[180px]"
                style={{
                  backgroundColor: theme.colors.bgAlt,
                  border: `1px solid ${theme.colors.border}`,
                  top: themeButtonRef.current
                    ? `${themeButtonRef.current.getBoundingClientRect().bottom + 8}px`
                    : '60px',
                  right: themeButtonRef.current
                    ? `${window.innerWidth - themeButtonRef.current.getBoundingClientRect().right}px`
                    : '16px',
                }}
              >
                {Object.values(themes).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      changeTheme(t.id);
                      setIsThemeSelectorOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium transition-all flex items-center gap-3"
                    style={{
                      backgroundColor:
                        themeId === t.id
                          ? theme.colors.primary + '30'
                          : 'transparent',
                      borderLeft:
                        themeId === t.id
                          ? `3px solid ${theme.colors.primary}`
                          : '3px solid transparent',
                    }}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={toggleAudio}
            className="px-2 py-1 rounded border text-xs font-bold transition-all"
            style={{
              backgroundColor: audioEnabled
                ? theme.colors.primary
                : theme.colors.bg,
              borderColor: audioEnabled
                ? theme.colors.primary
                : theme.colors.border,
            }}
            title={audioEnabled ? 'Audio: On' : 'Audio: Off'}
          >
            {audioEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded border text-xs font-bold transition-all"
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.border,
            }}
            title="Toggle Language"
          >
            {language === 'en' ? 'EN' : 'ES'}
          </button>
          <div
            className="text-[10px] md:text-sm font-mono px-2 py-0.5 md:px-3 md:py-1 rounded border"
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.border,
            }}
          >
            <span className="hidden xs:inline">{t.app.status} </span>
            <span className="uppercase" style={{ color: theme.colors.warning }}>
              {t.status[status]}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Main Canvas Area */}
        <div
          className="flex-[2] relative overflow-hidden flex items-center justify-center flex-1 md:min-h-0"
          style={{
            background: theme.colors.canvasGradient || theme.colors.canvas,
          }}
        >
          <div
            ref={containerRef}
            className="absolute top-0 left-0 right-0 canvas-height w-full"
          />

          {/* Progress Bar for Next Card */}
          {status === 'dealing' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 md:w-96 z-10">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-full backdrop-blur-md"
                style={{
                  backgroundColor: theme.colors.bgAlt + 'cc',
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <div
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                  <div
                    className="h-full transition-all duration-100 ease-linear rounded-full"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: theme.colors.primary,
                      boxShadow: `0 0 10px ${theme.colors.primaryLight}`,
                    }}
                  />
                </div>
                <span
                  className="text-xs font-mono font-bold tabular-nums min-w-[3ch]"
                  style={{ color: theme.colors.primary }}
                >
                  {Math.ceil(((100 - progress) * intervalSeconds) / 100)}s
                </span>
              </div>
            </div>
          )}

          {!currentCard && status === 'idle' && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-pulse px-6 text-center"
              style={{ color: theme.colors.textDim }}
            >
              <div className="text-8xl mb-6">🂠</div>
              <p className="text-lg font-medium">{t.welcome.title}</p>
              <p className="text-sm mt-2 opacity-60">{t.welcome.subtitle}</p>
            </div>
          )}
        </div>

        {/* Mobile Bottom Action Bar */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 px-4 py-3 z-20 flex items-center gap-2 shadow-2xl"
          style={{
            backgroundColor: theme.colors.bgAlt,
            borderTop: `1px solid ${theme.colors.border}`,
          }}
        >
          {status === 'idle' || status === 'complete' ? (
            <button
              onClick={handleStart}
              className="flex-1 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {t.console.startDealing}
            </button>
          ) : (
            <>
              {status === 'dealing' ? (
                <button
                  onClick={handlePause}
                  className="flex-1 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase"
                  style={{ backgroundColor: theme.colors.warning }}
                >
                  {t.console.pause}
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="flex-1 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {t.console.resume}
                </button>
              )}
            </>
          )}
          <button
            onClick={handleShuffle}
            className="flex-1 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase"
            style={{ backgroundColor: theme.colors.secondary }}
          >
            {t.console.shuffle}
          </button>
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="text-white px-4 py-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 font-bold"
            style={{ backgroundColor: theme.colors.accent }}
          >
            <span>📋</span>
            <span>{history.length}</span>
          </button>
        </div>

        {/* Mobile Drawer Backdrop */}
        {isDrawerOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* Sidebar Controls and History */}
        <div
          className={`
          flex-1 w-full md:w-80 lg:w-96 flex flex-col shadow-xl
          md:relative md:border-l md:z-10
          fixed bottom-0 left-0 right-0 z-40
          transition-transform duration-300 ease-out
          ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
          max-h-[85vh] md:max-h-none
          rounded-t-3xl md:rounded-none
        `}
          style={{
            backgroundColor: theme.colors.bgAlt,
            borderTop: `1px solid ${theme.colors.border}`,
            borderLeft: `1px solid ${theme.colors.border}`,
          }}
        >
          {/* Mobile Drawer Handle */}
          <div className="md:hidden flex justify-center py-2 shrink-0">
            <div
              className="w-12 h-1.5 rounded-full"
              style={{ backgroundColor: theme.colors.border }}
            />
          </div>

          <section
            className="p-4 md:p-5 space-y-4 shrink-0"
            style={{ borderBottom: `1px solid ${theme.colors.border}` }}
          >
            <h2
              className="text-sm font-bold uppercase tracking-wider mb-2"
              style={{ color: theme.colors.textMuted }}
            >
              {t.console.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label
                  className="text-[10px] uppercase font-bold block mb-1.5"
                  style={{ color: theme.colors.textMuted }}
                >
                  {t.console.numberOfDecks}
                </label>
                <select
                  value={deckCount}
                  onChange={handleDeckCountChange}
                  className="w-full rounded-lg p-2.5 text-sm focus:outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundColor: theme.colors.bg,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.text,
                  }}
                >
                  <option value="1">{t.deckOptions.deck1}</option>
                  <option value="2">{t.deckOptions.deck2}</option>
                  <option value="3">{t.deckOptions.deck3}</option>
                  <option value="4">{t.deckOptions.deck4}</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    className="text-[10px] uppercase font-bold block"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {t.console.dealInterval}
                  </label>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                    style={{
                      color: theme.colors.primary,
                      backgroundColor: theme.colors.bg,
                      borderColor: theme.colors.border,
                    }}
                  >
                    {intervalSeconds}s
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={intervalSeconds}
                  onChange={handleIntervalChange}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                  style={{
                    backgroundColor: theme.colors.border,
                    accentColor: theme.colors.primary,
                  }}
                />
              </div>
            </div>

            {/* Desktop-only controls - Mobile has bottom bar */}
            <div className="hidden md:flex flex-col gap-3">
              {status === 'idle' || status === 'complete' ? (
                <button
                  onClick={handleStart}
                  className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm uppercase tracking-widest"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {t.console.startDealing}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {status === 'dealing' ? (
                    <button
                      onClick={handlePause}
                      className="py-3.5 rounded-xl font-bold transition-all shadow-lg text-sm uppercase"
                      style={{ backgroundColor: theme.colors.warning }}
                    >
                      {t.console.pause}
                    </button>
                  ) : (
                    <button
                      onClick={handleResume}
                      className="py-3.5 rounded-xl font-bold transition-all shadow-lg text-sm uppercase"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {t.console.resume}
                    </button>
                  )}
                  <button
                    onClick={handleShuffle}
                    className="py-3.5 rounded-xl font-bold transition-all text-xs uppercase"
                    style={{
                      backgroundColor: theme.colors.secondary,
                      color: theme.colors.text,
                    }}
                  >
                    {t.console.shuffle}
                  </button>
                </div>
              )}

              <button
                onClick={handleRewind}
                disabled={history.length === 0}
                className="w-full disabled:opacity-30 disabled:cursor-not-allowed py-2.5 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest border"
                style={{
                  backgroundColor: theme.colors.accent + '80',
                  color: theme.colors.text,
                  borderColor: theme.colors.accent,
                }}
              >
                {t.console.rewind}
              </button>
            </div>
          </section>

          <section className="flex-1 flex flex-col overflow-hidden md:min-h-[300px]">
            <div
              className="p-4 md:p-5 flex justify-between items-center shrink-0"
              style={{ borderBottom: `1px solid ${theme.colors.border}` }}
            >
              <h2
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: theme.colors.textMuted }}
              >
                {t.history.title}
              </h2>
              <span
                className="text-[10px] font-mono"
                style={{ color: theme.colors.textMuted }}
              >
                {history.length} {t.history.dealt}
              </span>
            </div>
            <div
              ref={historyScrollRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar touch-scroll"
            >
              {history.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 opacity-30">
                  <div className="text-4xl mb-2">🂠</div>
                  <p className="text-xs italic">{t.history.empty}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                {history.map((card, idx) => (
                  <div
                    key={`${card.uniqueId}-${idx}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg border animate-slide-in transition-colors"
                    style={{
                      backgroundColor: theme.colors.bgCard,
                      borderColor: theme.colors.border + '80',
                    }}
                  >
                    <span
                      className={`text-2xl w-10 text-center ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : ''}`}
                      style={{
                        color:
                          card.suit === 'spades' || card.suit === 'clubs'
                            ? theme.colors.text
                            : undefined,
                      }}
                    >
                      {
                        { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' }[
                          card.suit
                        ]
                      }
                    </span>
                    <div className="flex-1 text-xs font-semibold tracking-wide">
                      {card.rank}{' '}
                      <span
                        className="font-normal"
                        style={{ color: theme.colors.textMuted }}
                      >
                        {t.history.of}
                      </span>{' '}
                      {t.suits[card.suit]}
                    </div>
                    <div
                      className="text-[9px] font-mono tabular-nums"
                      style={{ color: theme.colors.textDim }}
                    >
                      #{history.length - idx}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer
        className="hidden md:block p-2 md:p-3 text-center text-[9px] md:text-[10px] shrink-0"
        style={{
          backgroundColor: theme.colors.canvas,
          color: theme.colors.textDim,
          borderTop: `1px solid ${theme.colors.border}`,
        }}
      >
        {t.footer}
      </footer>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .touch-scroll {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        .canvas-height {
          bottom: 80px;
          height: auto;
        }
        @media (min-width: 768px) {
          .canvas-height {
            bottom: 0;
            height: 100%;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-borderLight);
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          box-shadow: 0 0 10px var(--color-primaryLight);
        }
      `}</style>
    </div>
  );
};

export default App;
