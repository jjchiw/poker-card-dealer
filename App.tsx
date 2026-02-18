import React, { useEffect, useRef, useState } from 'react';
import { CardDealer } from './CardDealer';
import { Card } from './types';
import { useTranslation } from './useTranslation';

const App: React.FC = () => {
  const { t, language, toggleLanguage } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const dealerRef = useRef<CardDealer | null>(null);
  const historyScrollRef = useRef<HTMLDivElement>(null);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'dealing' | 'paused' | 'complete'
  >('idle');
  const [history, setHistory] = useState<Card[]>([]);
  const [intervalMs, setIntervalMs] = useState(1500);
  const [deckCount, setDeckCount] = useState(1);
  const [cardsRemaining, setCardsRemaining] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    dealer.setInterval(intervalMs);
    dealerRef.current = dealer;

    dealer.on('deal', ({ card, index, total }) => {
      setCurrentCard(card);
      setCardsRemaining(total - index);
      setHistory((prev) => [card, ...prev].slice(0, 50));
    });

    dealer.on('pause', () => setStatus('paused'));
    dealer.on('resume', () => setStatus('dealing'));
    dealer.on('complete', () => setStatus('complete'));
    dealer.on('shuffle', () => {
      setHistory([]);
      setCurrentCard(null);
      setCardsRemaining(52 * deckCount);
    });

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
    dealerRef.current?.rewind(1);
    setHistory((prev) => prev.slice(1));
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setIntervalMs(val);
    dealerRef.current?.setInterval(val);
  };

  const handleDeckCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setDeckCount(count);
    dealerRef.current?.setDeckCount(count);
    setCardsRemaining(count * 52);
    setStatus('idle');
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-900 font-sans text-white overflow-hidden">
      <header className="p-3 md:p-4 bg-neutral-800 border-b border-neutral-700 flex justify-between items-center shadow-lg z-10 shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <h1 className="text-lg md:text-xl font-bold text-emerald-500 flex items-center gap-2">
            <span className="text-2xl">🂠</span>{' '}
            <span className="hidden sm:inline">{t.app.title}</span>
          </h1>
          <div className="bg-neutral-900 px-2 py-0.5 rounded text-[10px] md:text-xs border border-neutral-700 text-neutral-400">
            {cardsRemaining} {t.app.left}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleLanguage}
            className="bg-neutral-900 hover:bg-neutral-700 px-2 py-1 rounded border border-neutral-700 text-xs font-bold transition-all"
            title="Toggle Language"
          >
            {language === 'en' ? 'EN' : 'ES'}
          </button>
          <div className="text-[10px] md:text-sm font-mono bg-neutral-900 px-2 py-0.5 md:px-3 md:py-1 rounded border border-neutral-700">
            <span className="hidden xs:inline">{t.app.status} </span>
            <span className="uppercase text-yellow-400">
              {t.status[status]}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Main Canvas Area */}
        <div className="flex-[2] bg-neutral-950 relative overflow-hidden flex items-center justify-center flex-1 md:min-h-0 pb-20 md:pb-0">
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />

          {!currentCard && status === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-neutral-600 animate-pulse px-6 text-center">
              <div className="text-8xl mb-6">🂠</div>
              <p className="text-lg font-medium">{t.welcome.title}</p>
              <p className="text-sm mt-2 opacity-60">{t.welcome.subtitle}</p>
            </div>
          )}
        </div>

        {/* Mobile Bottom Action Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-800 border-t border-neutral-700 px-4 py-3 z-20 flex items-center gap-2 shadow-2xl">
          {status === 'idle' || status === 'complete' ? (
            <button
              onClick={handleStart}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase"
            >
              {t.console.startDealing}
            </button>
          ) : (
            <>
              {status === 'dealing' ? (
                <button
                  onClick={handlePause}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase"
                >
                  {t.console.pause}
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase"
                >
                  {t.console.resume}
                </button>
              )}
            </>
          )}
          <button
            onClick={handleShuffle}
            className="flex-1 bg-neutral-600 hover:bg-neutral-500 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase"
          >
            {t.console.shuffle}
          </button>
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 font-bold"
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
          flex-1 w-full md:w-80 lg:w-96 flex flex-col bg-neutral-800 shadow-xl
          md:relative md:border-l md:z-10
          fixed bottom-0 left-0 right-0 z-40
          transition-transform duration-300 ease-out
          ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
          max-h-[85vh] md:max-h-none
          rounded-t-3xl md:rounded-none
          border-t border-neutral-700
        `}
        >
          {/* Mobile Drawer Handle */}
          <div className="md:hidden flex justify-center py-2 shrink-0">
            <div className="w-12 h-1.5 bg-neutral-600 rounded-full" />
          </div>

          <section className="p-4 md:p-5 space-y-4 shrink-0 border-b border-neutral-700">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">
              {t.console.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] uppercase text-neutral-500 font-bold block mb-1.5">
                  {t.console.numberOfDecks}
                </label>
                <select
                  value={deckCount}
                  onChange={handleDeckCountChange}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="1">{t.deckOptions.deck1}</option>
                  <option value="2">{t.deckOptions.deck2}</option>
                  <option value="3">{t.deckOptions.deck3}</option>
                  <option value="4">{t.deckOptions.deck4}</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] uppercase text-neutral-500 font-bold block">
                    {t.console.dealInterval}
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-700">
                    {intervalMs}ms
                  </span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="3000"
                  step="100"
                  value={intervalMs}
                  onChange={handleIntervalChange}
                  className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Desktop-only controls - Mobile has bottom bar */}
            <div className="hidden md:flex flex-col gap-3">
              {status === 'idle' || status === 'complete' ? (
                <button
                  onClick={handleStart}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm uppercase tracking-widest"
                >
                  {t.console.startDealing}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {status === 'dealing' ? (
                    <button
                      onClick={handlePause}
                      className="bg-amber-600 hover:bg-amber-500 py-3.5 rounded-xl font-bold transition-all shadow-lg text-sm uppercase"
                    >
                      {t.console.pause}
                    </button>
                  ) : (
                    <button
                      onClick={handleResume}
                      className="bg-emerald-600 hover:bg-emerald-500 py-3.5 rounded-xl font-bold transition-all shadow-lg text-sm uppercase"
                    >
                      {t.console.resume}
                    </button>
                  )}
                  <button
                    onClick={handleShuffle}
                    className="bg-neutral-600 hover:bg-neutral-500 py-3.5 rounded-xl font-bold transition-all text-xs uppercase text-neutral-300"
                  >
                    {t.console.shuffle}
                  </button>
                </div>
              )}

              <button
                onClick={handleRewind}
                disabled={history.length === 0}
                className="w-full bg-indigo-700/50 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed py-2.5 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest text-indigo-200 border border-indigo-500/30"
              >
                {t.console.rewind}
              </button>
            </div>
          </section>

          <section className="flex-1 flex flex-col overflow-hidden md:min-h-[300px]">
            <div className="p-4 md:p-5 flex justify-between items-center border-b border-neutral-700/50 shrink-0">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                {t.history.title}
              </h2>
              <span className="text-[10px] text-neutral-500 font-mono">
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
                    className="flex items-center gap-3 bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-700/50 animate-slide-in hover:bg-neutral-900 transition-colors"
                  >
                    <span
                      className={`text-2xl w-10 text-center ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-neutral-200'}`}
                    >
                      {
                        { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' }[
                          card.suit
                        ]
                      }
                    </span>
                    <div className="flex-1 text-xs font-semibold tracking-wide">
                      {card.rank}{' '}
                      <span className="text-neutral-500 font-normal">
                        {t.history.of}
                      </span>{' '}
                      {t.suits[card.suit]}
                    </div>
                    <div className="text-[9px] text-neutral-700 font-mono tabular-nums">
                      #{history.length - idx}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="hidden md:block p-2 md:p-3 bg-neutral-950 text-center text-[9px] md:text-[10px] text-neutral-600 border-t border-neutral-800 shrink-0">
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #525252;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div>
  );
};

export default App;
