
import React, { useState } from 'react';
import { SkullIcon, SendIcon, RefreshCwIcon } from './components/ui/Icons';
import ResultDisplay from './components/ResultDisplay';
import { translateExMessage } from './services/geminiService';
import { RelationshipContext, SenderType, TranslationResponse } from './types';

const App: React.FC = () => {
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState<SenderType>(SenderType.TOXIC_EX);
  const [context, setContext] = useState<RelationshipContext>(RelationshipContext.GHOSTING);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const translation = await translateExMessage(message, context, sender);
      setResult(translation);
    } catch (err) {
      setError("翻譯機過熱，可能是前任的怨念太深導致系統崩潰，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-200 font-sans selection:bg-rose-500 selection:text-white flex flex-col">

      {/* Header */}
      <header className="border-b border-gray-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-600 p-2 rounded-lg">
              <SkullIcon className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">前任誠實翻譯機</h1>
              <p className="text-xs text-rose-400 font-mono">TOXIC EX-TRANSLATOR</p>
            </div>
          </div>
          <div className="hidden sm:block text-xs text-gray-500 font-mono">
            v6.6.6_beta
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">

        {!result ? (
          <div className="w-full max-w-2xl animate-fade-in-up">

            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                不要相信<span className="text-rose-500">鬼話</span>。
              </h2>
              <p className="text-gray-400 text-lg">
                把前任那些模稜兩可、假裝深情的訊息貼上來，<br className="hidden sm:block" />
                讓 AI 告訴你背後有多缺德。
              </p>
            </div>

            <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 shadow-xl backdrop-blur-sm">

              {/* Input Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">對方是誰</label>
                  <select
                    value={sender}
                    onChange={(e) => setSender(e.target.value as SenderType)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                  >
                    {Object.values(SenderType).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">現在什麼狀況</label>
                  <select
                    value={context}
                    onChange={(e) => setContext(e.target.value as RelationshipContext)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                  >
                    {Object.values(RelationshipContext).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Text Area */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase">貼上他的鬼話</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="例如：我們還是當朋友吧、最近好嗎、我不想耽誤你..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 text-white rounded-lg p-4 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none placeholder-gray-600 transition-all text-lg"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-300 rounded text-sm text-center">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleTranslate}
                disabled={loading || !message.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95
                  ${loading || !message.trim()
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 shadow-lg shadow-rose-900/20'
                  }`}
              >
                {loading ? (
                  <>
                    <RefreshCwIcon className="animate-spin w-5 h-5" />
                    正在破解渣男語法...
                  </>
                ) : (
                  <>
                    <SendIcon className="w-5 h-5" />
                    開始翻譯 (Truth Reveal)
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-gray-600">
                *注意：本服務極度毒舌，玻璃心請勿使用。
              </p>
            </div>
          </div>
        ) : (
          <ResultDisplay result={result} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Toxic Translator. Powered by Grok.</p>
      </footer>
    </div>
  );
};

export default App;
