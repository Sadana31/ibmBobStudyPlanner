"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { subjects } from "@/lib/data";

export default function QuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const subject = params.subject;
  const difficulty = searchParams.get("difficulty");
  const interest = searchParams.get("interest");
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          difficulty,
          interest,
          questionCount: 5
        })
      });

      const data = await response.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
    }
    setLoading(false);
  };

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnsweredQuestions([...answeredQuestions, {
      question: questions[currentQuestion].question,
      userAnswer: answerIndex,
      correctAnswer: questions[currentQuestion].correctAnswer,
      isCorrect
    }]);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-0">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Generating your quiz...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const needsRetry = percentage < 60;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-6 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
        >
          <h1 className="text-4xl font-black text-white mb-6 text-center">
            Quiz Complete! 🎉
          </h1>
          
          <div className="text-center mb-8">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-2xl text-white/80">
              {percentage}% Correct
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {answeredQuestions.map((q, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 ${
                  q.isCorrect
                    ? "bg-green-500/20 border-green-500"
                    : "bg-red-500/20 border-red-500"
                }`}
              >
                <p className="text-white font-semibold mb-2">
                  Question {idx + 1}: {q.isCorrect ? "✓" : "✗"}
                </p>
                <p className="text-white/70 text-sm">{q.question}</p>
              </div>
            ))}
          </div>

          {needsRetry && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
              <p className="text-yellow-300 font-semibold mb-2">💡 Suggestion</p>
              <p className="text-white/80">
                You're doing great! Would you like to try the quiz again to improve your score? Practice makes perfect!
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
            >
              Back to Home
            </button>
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setSelectedAnswer(null);
                setScore(0);
                setShowResult(false);
                setAnsweredQuestions([]);
                generateQuiz();
              }}
              className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg text-white rounded-xl font-bold transition-all"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-6 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-white/60 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div className="text-white/60">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <span className="text-4xl">{subjects[subject]?.emoji || "📚"}</span>
              <div className="flex-1">
                <div className="text-cyan-400 text-sm font-semibold mb-2">
                  {difficulty?.toUpperCase()} • {subjects[subject]?.label}
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {question?.question}
                </h2>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {question?.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                const showCorrect = selectedAnswer !== null && isCorrect;
                const showWrong = selectedAnswer !== null && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                    whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`
                      w-full p-4 rounded-xl text-left font-semibold transition-all border-2
                      ${showCorrect
                        ? "bg-green-500/30 border-green-500 text-white"
                        : showWrong
                        ? "bg-red-500/30 border-red-500 text-white"
                        : isSelected
                        ? "bg-white/20 border-white/40 text-white"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                      }
                      ${selectedAnswer !== null ? "cursor-default" : "cursor-pointer"}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showCorrect && <span className="text-2xl">✓</span>}
                      {showWrong && <span className="text-2xl">✗</span>}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation (shown after answering) */}
            {selectedAnswer !== null && question.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
              >
                <p className="text-cyan-300 font-semibold mb-2">Explanation:</p>
                <p className="text-white/80">{question.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        {selectedAnswer !== null && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg text-white rounded-xl font-bold text-lg transition-all"
          >
            {currentQuestion < questions.length - 1 ? "Next Question →" : "See Results →"}
          </motion.button>
        )}
      </div>
    </div>
  );
}

// Made with Bob
