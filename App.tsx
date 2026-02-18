
import React, { useEffect, useRef, useState } from 'react';
import { CardDealer } from './CardDealer';
import { Card } from './types';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dealerRef = useRef<CardDealer | null>(null);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [status, setStatus] = useState<'idle' | 'dealing' | 'paused' | 'complete'>('idle');
  const [history, setHistory] = useState<Card[]>([]);
  const [intervalMs, setIntervalMs] = useState(1500);
  const [deckCount, setDeckCount] = useState(1);
  const [cardsRemaining, setCardsRemaining] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    let dealer: CardDealer | null = null;

    const initDealer = async () => {
      setIsInitializing(true);
      const initialWidth = containerRef.current?.clientWidth || 800;
      const initialHeight = containerRef.current?.clientHeight || 600;

      dealer = new CardDealer({
        width: initialWidth,
        height: initialHeight,
        assetRoot: 'https://raw.githubusercontent.com/example/assets/main/',
        autoShuffle: true,
        repeat: false,
        deckCount: 1
      });

      await dealer.init();
      
      if (!containerRef.current) return;
      
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
      setIsInitializing(false);
    };

    initDealer();

    const handleResize = () => {
      if (containerRef.current && dealerRef.current) {
        dealerRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      dealer?.destroy();
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
            <span className="text-2xl">🂠</span> <span className="hidden sm:inline">POKER DEALER</span>
          </h1>
          <div className="bg-neutral-900 px-2 py-0.5 rounded text-[10px] md:text-xs border border-neutral-700 text-neutral-400">
            {cardsRemaining} LEFT
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-[10px] md:text-sm font-mono bg-neutral-900 px-2 py-0.5 md:px-3 md:py-1 rounded border border-neutral-700">
            <span className="hidden xs:inline">STATUS: </span><span className="uppercase text-yellow-400">{status}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Canvas Area */}
        <div className="flex-[2] bg-neutral-950 relative overflow-hidden flex items-center justify-center min-h-[50vh] md:min-h-0">
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />
          
          {isInitializing && (
             <div className="absolute inset-0 flex items-center justify-center bg-neutral-950 z-20">
                <div className="flex flex-col items-center gap-4">
                   <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                   <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Initializing PixiJS Engine...</p>
                </div>
             </div>
          )}

          {!currentCard && !isInitializing && status === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-neutral-600 animate-pulse px-6 text-center">
              <div className="text-8xl mb-6">🂠</div>
              <p className="text-lg font-medium">Ready to deal. Shuffle to begin session.</p>
              <p className="text-sm mt-2 opacity-60">High-performance PixiJS Engine v8.x</p>
            </div>
          )}
        </div>

        {/* Sidebar Controls and History */}
        <div className="flex-1 w-full md:w-80 lg:w-96 flex flex-col border-t md:border-t-0 md:border-l border-neutral-700 bg-neutral-800 shadow-xl z-10 overflow-y-auto">
          
          <section className="p-4 md:p-5 space-y-4 shrink-0 border-b border-neutral-700">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">Dealer Console</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] uppercase text-neutral-500 font-bold block mb-1.5">Number of Decks</label>
                <select 
                  value={deckCount} 
                  onChange={handleDeckCountChange}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="1">1 Deck (52 cards)</option>
                  <option value="2">2 Decks (104 cards)</option>
                  <option value="3">3 Decks (156 cards)</option>
                  <option value="4">4 Decks (208 cards)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] uppercase text-neutral-500 font-bold block">Deal Interval</label>
                  <span className="text-[10px] font-mono text-emerald-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-700">{intervalMs}ms</span>
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

            <div className="flex flex-col gap-3">
              {(status === 'idle' || status === 'complete') ? (
                <button 
                  onClick={handleStart}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm uppercase tracking-widest"
                >
                  START DEALING
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {status === 'dealing' ? (
                    <button onClick={handlePause} className="bg-amber-600 hover:bg-amber-500 py-3.5 rounded-xl font-bold transition-all shadow-lg text-sm uppercase">PAUSE</button>
                  ) : (
                    <button onClick={handleResume} className="bg-emerald-600 hover:bg-emerald-500 py-3.5 rounded-xl font-bold transition-all shadow-lg text-sm uppercase">RESUME</button>
                  )}
                  <button onClick={handleShuffle} className="bg-neutral-600 hover:bg-neutral-500 py-3.5 rounded-xl font-bold transition-all text-xs uppercase text-neutral-300">SHUFFLE</button>
                </div>
              )}
              
              <button 
                onClick={handleRewind}
                disabled={history.length === 0}
                className="w-full bg-indigo-700/50 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed py-2.5 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest text-indigo-200 border border-indigo-500/30"
              >
                REWIND 1 STEP
              </button>
            </div>
          </section>

          <section className="flex-1 flex flex-col overflow-hidden min-h-[300px]">
            <div className="p-4 md:p-5 flex justify-between items-center border-b border-neutral-700/50">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Hand History</h2>
              <span className="text-[10px] text-neutral-500 font-mono">{history.length} DEALT</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {history.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 opacity-30">
                   <div className="text-4xl mb-2">🂠</div>
                   <p className="text-xs italic">Deck history empty</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                {history.map((card, idx) => (
                  <div key={`${card.uniqueId}-${idx}`} className="flex items-center gap-3 bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-700/50 animate-slide-in hover:bg-neutral-900 transition-colors">
                    <span className={`text-2xl w-10 text-center ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-neutral-200'}`}>
                      {{spades:'♠', hearts:'♥', diamonds:'♦', clubs:'♣'}[card.suit]}
                    </span>
                    <div className="flex-1 text-xs font-semibold tracking-wide">
                      {card.rank} <span className="text-neutral-500 font-normal">of</span> {card.suit.charAt(0).toUpperCase() + card.suit.slice(1)}
                    </div>
                    <div className="text-[9px] text-neutral-700 font-mono tabular-nums">#{history.length - idx}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="p-2 md:p-3 bg-neutral-950 text-center text-[9px] md:text-[10px] text-neutral-600 border-t border-neutral-800 shrink-0">
        Professional Poker Engine • Multi-Deck Logic • Responsive Layout • PixiJS v8
      </footer>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
