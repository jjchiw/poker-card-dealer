
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
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [deckCount, setDeckCount] = useState(1);
  const [cardsRemaining, setCardsRemaining] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const dealer = new CardDealer({
      width: containerRef.current.clientWidth || 800,
      height: 600,
      assetRoot: 'https://raw.githubusercontent.com/example/assets/main/',
      autoShuffle: true,
      repeat: false,
      language: 'en',
      deckCount: 1
    });

    dealer.mount(containerRef.current);
    dealer.setInterval(intervalMs);
    dealerRef.current = dealer;

    dealer.on('deal', ({ card, index, total }) => {
      setCurrentCard(card);
      setCardsRemaining(total - index);
      setHistory((prev) => [card, ...prev].slice(0, 20));
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

    return () => {
      dealer.destroy();
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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as 'en' | 'es';
    setLanguage(lang);
    dealerRef.current?.setLanguage(lang);
  };

  const handleDeckCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setDeckCount(count);
    dealerRef.current?.setDeckCount(count);
    setCardsRemaining(count * 52);
    setStatus('idle');
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-900 font-sans text-white">
      <header className="p-4 bg-neutral-800 border-b border-neutral-700 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-emerald-500 flex items-center gap-2">
            <span>🂠</span> POKER DEALER AI
          </h1>
          <div className="bg-neutral-900 px-3 py-1 rounded text-xs border border-neutral-700 text-neutral-400">
            {cardsRemaining} CARDS LEFT
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-neutral-400 font-mono flex flex-col items-end">
             <span className="text-emerald-400">Offline Caching Mode</span>
             <span className="text-[10px] opacity-50 italic"> Dealing continues if API quota is reached</span>
          </div>
          <div className="text-sm font-mono bg-neutral-900 px-3 py-1 rounded border border-neutral-700">
            Status: <span className="uppercase text-yellow-400">{status}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
        <div className="flex-1 bg-neutral-950 rounded-xl border border-neutral-700 shadow-2xl relative overflow-hidden flex items-center justify-center">
          <div ref={containerRef} className="w-full h-full" />
          {!currentCard && status === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-neutral-500">
              <div className="text-6xl mb-4">🂠</div>
              <p className="text-center px-10">Shuffle to start. Dealing logic is resilient to API quota limits.</p>
            </div>
          )}
        </div>

        <div className="w-full md:w-80 flex flex-col gap-6">
          <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 shadow-md">
            <h2 className="text-lg font-semibold mb-4 border-b border-neutral-700 pb-2">Dealer Console</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Language</label>
                  <select 
                    value={language} 
                    onChange={handleLanguageChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-neutral-400 font-bold block mb-1">Decks</label>
                  <select 
                    value={deckCount} 
                    onChange={handleDeckCountChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1">1 Deck</option>
                    <option value="2">2 Decks</option>
                    <option value="3">3 Decks</option>
                    <option value="4">4 Decks</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {status === 'idle' || status === 'complete' ? (
                  <button 
                    onClick={handleStart}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition shadow-lg active:scale-95"
                  >
                    START DEALING
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {status === 'dealing' ? (
                      <button onClick={handlePause} className="bg-amber-600 hover:bg-amber-500 py-3 rounded font-bold transition">PAUSE</button>
                    ) : (
                      <button onClick={handleResume} className="bg-emerald-600 hover:bg-emerald-500 py-3 rounded font-bold transition">RESUME</button>
                    )}
                    <button onClick={handleShuffle} className="bg-neutral-600 hover:bg-neutral-500 py-3 rounded font-bold transition text-sm">SHUFFLE</button>
                  </div>
                )}
                
                <button 
                  onClick={handleRewind}
                  disabled={history.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded transition text-sm font-semibold"
                >
                  REWIND 1 STEP
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase text-neutral-400 font-bold block">Interval</label>
                  <span className="text-[10px] font-mono text-emerald-400">{intervalMs}ms</span>
                </div>
                <input 
                  type="range" 
                  min="300" 
                  max="3000" 
                  step="100" 
                  value={intervalMs} 
                  onChange={handleIntervalChange}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 shadow-md flex-1 flex flex-col overflow-hidden">
            <h2 className="text-lg font-semibold mb-4 border-b border-neutral-700 pb-2">Hand History</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {history.length === 0 && <p className="text-neutral-500 text-sm italic text-center py-4">Wait for shuffle...</p>}
              {history.map((card, idx) => (
                <div key={`${card.uniqueId}-${idx}`} className="flex items-center gap-3 bg-neutral-900 p-2 rounded border border-neutral-700 animate-slide-in">
                  <span className={`text-2xl w-8 text-center ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-white'}`}>
                    {{spades:'♠', hearts:'♥', diamonds:'♦', clubs:'♣'}[card.suit]}
                  </span>
                  <div className="flex-1 text-xs font-medium">
                    {card.rank} of {card.suit.charAt(0).toUpperCase() + card.suit.slice(1)}
                  </div>
                  <div className="text-[9px] text-neutral-600 font-mono">#{history.length - idx}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="p-3 bg-neutral-950 text-center text-[10px] text-neutral-600 border-t border-neutral-800">
        Professional Poker Dealer Module • Resilient Multi-Deck Core • Persistent Audio Storage Enabled
      </footer>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #171717;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default App;
