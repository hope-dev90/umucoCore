import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, Award, Frown, Sparkles, Trophy } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function StoryQuiz({ quizData, onComplete }) {
  const { t } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);

  const questions = Array.isArray(quizData) ? quizData : [];
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const score = useMemo(() => answers.filter(Boolean).length, [answers]);
  const progress = questions.length ? Math.round(((currentQuestion + 1) / questions.length) * 100) : 0;

  useEffect(() => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setAnswers([]);
  }, [quizData]);

  if (!question) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 py-10 px-6 text-center">
        <Award className="w-8 h-8 text-[#8D493A]" />
        <h3 className="text-xl font-bold text-[#2C1A14]">Knowledge Check</h3>
        <p className="text-sm text-[#6F5B55]">This story has no quiz yet, but the reading quest is complete.</p>
        <button
          type="button"
          onClick={() => onComplete(0)}
          className="bg-[#8D493A] text-white hover:bg-[#3E2723] px-6 py-3 rounded-xl font-bold text-sm"
        >
          Claim reading reward
        </button>
      </div>
    );
  }

  const handleOptionSelect = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    setAnswers(prev => {
      const next = [...prev];
      next[currentQuestion] = index === question.correctIndex;
      return next;
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalScore = answers.filter(Boolean).length;
      const bonusXP = finalScore * 20;
      onComplete(bonusXP);
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const isCorrect = selectedOption === question.correctIndex;

  return (
    <div className="w-full flex flex-col pt-6 pb-2 px-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-[#8D493A]" />
        <h3 className="text-xl font-bold text-[#2C1A14]">Knowledge Check</h3>
        <span className="ml-auto text-xs font-semibold text-[#6F5B55]">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#EADBC8] overflow-hidden mb-5" aria-hidden="true">
        <motion.div
          className="h-full bg-[#3F7A4A]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4 relative"
        >
          {/* Fun Cartoon Animation Overlay when answered */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="absolute -top-12 -right-4 z-10 pointer-events-none"
              >
                {isCorrect ? (
                  <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="bg-[#FEF3C7] p-3 rounded-full shadow-lg border-2 border-[#F59E0B]"
                  >
                    <Sparkles className="w-8 h-8 text-[#F59E0B]" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ x: [-5, 5, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                    className="bg-neutral-100 p-3 rounded-full shadow-lg border-2 border-neutral-300"
                  >
                    <Frown className="w-8 h-8 text-neutral-500" />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[#3B2A24] font-medium text-lg leading-snug mb-2">
            {question.question}
          </p>

          <div className="flex flex-col gap-3">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isOptionCorrect = index === question.correctIndex;
              let btnStyle = "border-[#EADBC8] bg-white text-[#3B2A24] hover:bg-[#FCDFD3]/20 hover:border-[#8D493A]/50";
              
              if (isAnswered) {
                if (isOptionCorrect) {
                  btnStyle = "border-[#3F7A4A] bg-[#3F7A4A]/10 text-[#3F7A4A] ring-1 ring-[#3F7A4A]";
                } else if (isSelected && !isOptionCorrect) {
                  btnStyle = "border-red-400 bg-red-50 text-red-700";
                } else {
                  btnStyle = "border-[#EADBC8]/50 bg-neutral-50 text-neutral-400 opacity-50";
                }
              }

              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={isAnswered}
                  className={`relative flex items-center w-full px-5 py-4 rounded-xl border text-left transition-all duration-200 ${btnStyle}`}
                >
                  <span className="flex-1 font-medium">{option}</span>
                  {isAnswered && isOptionCorrect && <CheckCircle className="w-5 h-5 text-[#3F7A4A] ml-3 flex-shrink-0" />}
                  {isAnswered && isSelected && !isOptionCorrect && <XCircle className="w-5 h-5 text-red-500 ml-3 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-[#FCDFD3]/30 border border-[#8D493A]/20"
            >
              <p className="text-sm text-[#2C1A14] leading-relaxed">
                <span className="font-bold mr-2 text-[#8D493A]">
                  {isCorrect ? 'Awesome!' : 'Not quite.'}
                </span>
                {question.explanation}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#3F7A4A]">
                <Trophy className="w-4 h-4" />
                Score: {score}/{questions.length} correct
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          disabled={!isAnswered}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${
            isAnswered
              ? 'bg-[#8D493A] text-white hover:bg-[#3E2723] shadow-md hover:shadow-lg'
              : 'bg-[#EADBC8]/40 text-[#6F5B55] cursor-not-allowed'
          }`}
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
