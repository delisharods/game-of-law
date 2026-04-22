import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Quiz() {
  // --- Missing State Variables Added Here ---
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestionsAttempted, setTotalQuestionsAttempted] = useState(0);

  const indianLawQuestions = [
    {
      question: "Which article of the Indian Constitution guarantees the Right to Equality?",
      options: ["Article 14", "Article 19", "Article 21", "Article 32"],
      correct: 0
    },
    {
      question: "What is the maximum strength of Lok Sabha as per the Constitution?",
      options: ["545", "550", "552", "560"],
      correct: 1
    },
    {
      question: "Which article deals with the Right to Constitutional Remedies?",
      options: ["Article 30", "Article 31", "Article 32", "Article 33"],
      correct: 2
    },
    {
      question: "The Indian Penal Code was enacted in which year?",
      options: ["1858", "1860", "1862", "1865"],
      correct: 1
    },
    {
      question: "Which amendment is known as the 'Mini Constitution'?",
      options: ["42nd Amendment", "44th Amendment", "52nd Amendment", "73rd Amendment"],
      correct: 0
    }
  ];

  const wheelSegments = [
    { color: "#8B4513", darkColor: "#654321", label: "Legal Questions" },
    { color: "#A0522D", darkColor: "#8B4513", label: "Constitutional Law" },
    { color: "#CD853F", darkColor: "#A0522D", label: "Criminal Law" },
    { color: "#D2B48C", darkColor: "#CD853F", label: "Civil Law" },
    { color: "#F4E4BC", darkColor: "#D2B48C", label: "Corporate Law" },
    { color: "#DEB887", darkColor: "#CD853F", label: "Family Law" },
    { color: "#BC9A6A", darkColor: "#A0522D", label: "Labor Law" },
    { color: "#9A7B4F", darkColor: "#8B4513", label: "Property Law" }
  ];

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResults(false);
    
    // Calculate a random rotation
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const extraDegrees = Math.random() * 360;
    const newRotation = rotation + (spins * 360) + extraDegrees;
    
    setRotation(newRotation);
    
    // Wait for animation to finish (5 seconds matching the CSS transition)
    setTimeout(() => {
      const randomQuestionIndex = Math.floor(Math.random() * indianLawQuestions.length);
      setCurrentQuestion(indianLawQuestions[randomQuestionIndex]);
      setIsSpinning(false);
    }, 5000);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowResults(true);
    setTotalQuestionsAttempted(prev => prev + 1);
    
    if (answerIndex === currentQuestion.correct) {
      setScore(prev => prev + 1);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResults(false);
  };

  const resetAllGame = () => {
    resetGame();
    setScore(0);
    setTotalQuestionsAttempted(0);
    setRotation(0);
  };

  const getAnswerStyle = (index) => {
    if (!showResults) {
      return "bg-white hover:bg-amber-50 border border-amber-200 text-black";
    }
    if (index === currentQuestion.correct) {
      return "bg-green-600 text-white border border-green-700 shadow-lg";
    } else if (index === selectedAnswer && index !== currentQuestion.correct) {
      return "bg-red-600 text-white border border-red-700 shadow-lg";
    } else {
      return "bg-gray-200 text-gray-500 border border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-4 md:p-8">
      <div className="bg-gradient-to-b from-amber-100 to-stone-200 rounded-3xl shadow-2xl max-w-4xl mx-auto border border-amber-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-8 text-white text-center">
            <h1 className="text-3xl font-bold text-black mb-2">Indian Law Knowledge Wheel</h1>
            <div className="flex justify-center gap-4 mt-4">
              <div className="bg-white/50 px-6 py-1 rounded-full border border-amber-300 font-bold">
                Score: {score}
              </div>
              <div className="bg-white/50 px-6 py-1 rounded-full border border-amber-300 font-bold">
                Attempted: {totalQuestionsAttempted}
              </div>
            </div>
        </div>

        <div className="p-8 flex flex-col items-center">
          
          {/* Wheel Section */}
          <div className="relative mb-12">
            {/* Pointer */}
            <div className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 z-30">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-red-600 filter drop-shadow-md"></div>
            </div>

            {/* Wheel Container */}
            <div 
              className="w-64 h-64 md:w-80 md:h-80 rounded-full relative overflow-hidden border-8 border-amber-900 shadow-2xl"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)' : 'none',
              }}
            >
              {wheelSegments.map((segment, index) => {
                const angle = (360 / wheelSegments.length) * index;
                return (
                  <div
                    key={index}
                    className="absolute inset-0 origin-center"
                    style={{
                      background: segment.color,
                      clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 30%)`, // Simplified clip for visual representation
                      transform: `rotate(${angle}deg)`,
                      borderRight: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    <span className="absolute top-10 left-1/2 transform -translate-x-1/2 -rotate-90 text-[10px] font-bold text-white uppercase whitespace-nowrap">
                      {segment.label}
                    </span>
                  </div>
                );
              })}
              {/* Hub */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-amber-900 rounded-full border-4 border-amber-200 z-10 shadow-inner"></div>
            </div>
          </div>

          {/* Controls */}
          {!currentQuestion && (
            <div className="text-center">
              <button
                onClick={spinWheel}
                disabled={isSpinning}
                className={`px-10 py-4 rounded-full font-black text-xl shadow-xl transition-all border-b-4 ${
                  isSpinning 
                  ? 'bg-gray-400 text-gray-200 border-gray-500 cursor-not-allowed' 
                  : 'bg-amber-700 text-white border-amber-900 hover:bg-amber-600 active:translate-y-1 active:border-b-0'
                }`}
              >
                {isSpinning ? 'SPINNING...' : 'SPIN FOR A QUESTION'}
              </button>
            </div>
          )}

          {/* Question Overlay */}
          {currentQuestion && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden"
            >
              <div className="p-6 bg-amber-50 border-b border-amber-100">
                <h3 className="text-xl font-bold text-stone-800 text-center leading-tight">
                  {currentQuestion.question}
                </h3>
              </div>
              
              <div className="p-6 grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResults}
                    className={`p-4 rounded-xl font-bold text-left transition-all ${getAnswerStyle(index)}`}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>

              {showResults && (
                <div className="p-6 bg-stone-50 flex gap-4 justify-center border-t border-stone-200">
                  <button onClick={resetGame} className="bg-amber-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-800">
                    Next Spin
                  </button>
                  <button onClick={resetAllGame} className="bg-stone-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-stone-600">
                    Reset Score
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
