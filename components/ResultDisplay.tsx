
import React, { useEffect, useState } from 'react';
import { TranslationResponse } from '../types';
import { SkullIcon, AlertTriangleIcon } from './ui/Icons';

interface ResultDisplayProps {
  result: TranslationResponse;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [displayedToxicity, setDisplayedToxicity] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Animation logic
  useEffect(() => {
    setDisplayedText('');
    setDisplayedToxicity(0);
    setIsTyping(true);

    const fullText = result.true_meaning;
    const targetToxicity = result.toxicity_level;

    // Toxicity Counter Animation
    // Count up logic
    let currentToxicity = 0;
    const toxicityInterval = setInterval(() => {
      if (currentToxicity >= targetToxicity) {
        setDisplayedToxicity(targetToxicity);
        clearInterval(toxicityInterval);
      } else {
        currentToxicity += 2; // Speed of counting
        if (currentToxicity > targetToxicity) currentToxicity = targetToxicity;
        setDisplayedToxicity(currentToxicity);
      }
    }, 20);

    // Typewriter Text Animation
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex >= fullText.length) {
        setDisplayedText(fullText);
        setIsTyping(false);
        clearInterval(typeInterval);
      } else {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        charIndex++;
      }
    }, 40); // 40ms per character for a snappy but readable speed

    return () => {
      clearInterval(toxicityInterval);
      clearInterval(typeInterval);
    };
  }, [result]);

  // Determine color based on FINAL toxicity (stable theme during animation)
  let toxicityColor = "text-green-500";
  let toxicityLabel = "還算有點良心";
  
  if (result.toxicity_level > 40) {
    toxicityColor = "text-yellow-500";
    toxicityLabel = "微渣";
  }
  if (result.toxicity_level > 70) {
    toxicityColor = "text-orange-500";
    toxicityLabel = "劇毒警告";
  }
  if (result.toxicity_level > 90) {
    toxicityColor = "text-red-600";
    toxicityLabel = "世紀大渣男/女";
  }

  return (
    <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl animate-fade-in relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none">
        <SkullIcon className="w-48 h-48 text-white" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        
        {/* Toxicity Meter */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-950/50 px-4 py-1.5 rounded-full border border-gray-800">
            <AlertTriangleIcon className={`w-4 h-4 ${toxicityColor}`} />
            <span className={`text-sm font-bold font-mono tracking-wider ${toxicityColor}`}>
              毒性指數: {displayedToxicity}%
            </span>
          </div>
        </div>

        {/* The Translation (Main Event) */}
        <div className="w-full space-y-4">
          <div className="relative min-h-[80px] flex items-center justify-center">
            {/* Quote marks */}
            <span className="absolute -top-6 -left-2 text-6xl text-gray-800 font-serif opacity-50">“</span>
            
            <p className="text-xl md:text-2xl font-medium text-white leading-relaxed tracking-wide px-4">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-0.5 h-6 ml-1 bg-rose-500 animate-pulse align-middle" />
              )}
            </p>
            
            <span className="absolute -bottom-10 -right-2 text-6xl text-gray-800 font-serif opacity-50">”</span>
          </div>
        </div>

        <div className={`w-full pt-4 border-t border-gray-800/50 transition-opacity duration-500 ${isTyping ? 'opacity-0' : 'opacity-100'}`}>
          <button
            onClick={onReset}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-lg transition-all"
          >
            翻譯下一句
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
