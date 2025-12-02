import React, { useState } from 'react';
import { Coin3D } from './components/Coin3D';
import { CoinSide, HistoryItem } from './types';
import { v4 as uuidv4 } from 'uuid'; // Assuming environment has uuid, if not we use simple math random for IDs

const App: React.FC = () => {
    // State
    const [result, setResult] = useState<CoinSide>(CoinSide.HEADS);
    const [isFlipping, setIsFlipping] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Helper to trigger vibration
    const triggerHaptic = () => {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    };

    const handleFlip = async () => {
        if (isFlipping) {
            return;
        }

        setIsFlipping(true);
        triggerHaptic();

        // Determine result immediately (deterministic for logic, visual for user)
        const isHeads = Math.random() > 0.5;
        const newSide = isHeads ? CoinSide.HEADS : CoinSide.TAILS;
        setResult(newSide);

        // Animation Duration matches CSS (3s)
        setTimeout(async () => {
            setIsFlipping(false);
            triggerHaptic(); // Feedback on landing

            // Add to history
            const newItem: HistoryItem = {
                id: Date.now().toString(), // Simple ID
                side: newSide,
                timestamp: Date.now(),
            };

            setHistory(prev => [newItem, ...prev]);

        }, 3000);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col overflow-hidden relative">

            {/* Header */}
            <header className="p-6 flex justify-between items-center z-10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-700">
                        CoinFlip
                    </h1>
                    <p className="text-xs text-slate-400">PWA Edition</p>
                </div>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 rounded-full bg-slate-800/50 backdrop-blur hover:bg-slate-700 transition-colors"
                    aria-label="History"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center relative z-0 pb-20">

                {/* Coin */}
                <div className="mb-10">
                    <Coin3D
                        result={result}
                        isFlipping={isFlipping}
                        onFlipStart={handleFlip}
                    />
                </div>

                {/* Status / Action Text */}
                <div className="text-center h-24 px-6">
                    {isFlipping ? (
                        <p className="text-xl font-light animate-pulse text-gold-300">
                            Flipping...
                        </p>
                    ) : (
                        <div className="animate-bounce-slight">
                            <p className="text-lg text-slate-400 mb-2">
                                Tap coin to flip
                            </p>
                        </div>
                    )}
                </div>

            </main>

            {/* History Overlay (Bottom Sheet Style) */}
            <div
                className={`fixed inset-x-0 bottom-0 bg-slate-800/95 backdrop-blur-xl rounded-t-3xl shadow-2xl transform transition-transform duration-500 z-20 flex flex-col max-h-[60vh] ${showHistory ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="p-4 border-b border-slate-700 flex justify-between items-center" onClick={() => setShowHistory(false)}>
                    <h2 className="font-bold text-lg text-slate-200 pl-2">History</h2>
                    <div className="w-12 h-1 bg-slate-600 rounded-full absolute left-1/2 transform -translate-x-1/2 top-3"></div>
                    <button className="text-slate-400 hover:text-white p-2">Close</button>
                </div>
                <div className="overflow-y-auto p-4 space-y-3 flex-1">
                    {history.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">No flips yet.</p>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className="flex items-start p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs border mr-3 ${item.side === CoinSide.HEADS ? 'bg-gold-900/20 border-gold-700 text-gold-500' : 'bg-slate-700/30 border-slate-500 text-slate-400'}`}>
                                    {item.side === CoinSide.HEADS ? 'H' : 'T'}
                                </div>
                                <div>
                                    <div className="flex items-baseline space-x-2">
                                        <span className={`font-bold ${item.side === CoinSide.HEADS ? 'text-gold-400' : 'text-slate-300'}`}>
                                            {item.side}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Overlay backdrop for history */}
            {showHistory && (
                <div
                    className="fixed inset-0 bg-black/50 z-10 transition-opacity"
                    onClick={() => setShowHistory(false)}
                />
            )}
        </div>
    );
};

export default App;