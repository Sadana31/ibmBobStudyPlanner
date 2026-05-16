"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnhancedLesson({
  topic,
  subject,
  interest,
  onComplete,
  onBack,
}) {
  const [phase, setPhase] = useState("lesson"); // lesson, quiz, technical, knowledge-test, results
  const [currentStep, setCurrentStep] = useState(0);
  const [lessonContent, setLessonContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readCount, setReadCount] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [technicalContent, setTechnicalContent] = useState("");
  const [userKnowledge, setUserKnowledge] = useState("");
  const [knowledgeScore, setKnowledgeScore] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [topic, subject, interest]);

  const loadLesson = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.label,
          topic,
          interest,
        }),
      });

      const data = await res.json();
      setLessonContent(data.steps || []);
    } catch (error) {
      console.error("Error loading lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < lessonContent.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Lesson complete, move to quiz
      setPhase("quiz");
      generateQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.label,
          difficulty: "mixed", // Will generate easy, medium, hard
          interest,
          questionCount: 3,
          topic
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Ensure we have easy, medium, hard
        const questions = data.questions.slice(0, 3);
        setQuizQuestions(questions);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === quizQuestions[currentQuizQuestion].correctAnswer;
    
    if (isCorrect) {
      setQuizScore(quizScore + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizQuestion < quizQuestions.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz complete, show technical concepts
      setPhase("technical");
      loadTechnicalContent();
    }
  };

  const loadTechnicalContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/technical-concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.label,
          topic,
        }),
      });

      const data = await res.json();
      setTechnicalContent(data.content || "");
    } catch (error) {
      console.error("Error loading technical content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitKnowledge = async () => {
    if (!userKnowledge.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/score-knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.label,
          topic,
          userInput: userKnowledge,
          technicalContent
        }),
      });

      const data = await res.json();
      setKnowledgeScore(data.score);
      setPhase("results");
    } catch (error) {
      console.error("Error scoring knowledge:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setReadCount(readCount + 1);
    setCurrentStep(0);
    setPhase("lesson");
    setQuizScore(0);
    setCurrentQuizQuestion(0);
    setSelectedAnswer(null);
    setUserKnowledge("");
    setKnowledgeScore(null);
  };

  const handleAskQuestion = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          subject: subject.label,
          topic,
          interest,
          context: lessonContent[currentStep],
        }),
      });

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading && lessonContent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
        <p className="mt-6 text-white/60 text-lg">
          Preparing your personalized lesson...
        </p>
      </div>
    );
  }

  // LESSON PHASE
  if (phase === "lesson") {
    const currentContent = lessonContent[currentStep];
    const progress = ((currentStep + 1) / lessonContent.length) * 100;

    return (
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">
              Step {currentStep + 1} of {lessonContent.length} • Read {readCount + 1}
            </span>
            <span className="text-sm text-white/60">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-orange-500 to-cyan-500"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">{subject.emoji}</span>
              <div>
                <h2 className="text-3xl font-black text-white">
                  {currentContent?.title}
                </h2>
                <p className="text-white/50">{topic}</p>
              </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none mb-8">
              <p className="text-white/90 leading-relaxed text-lg whitespace-pre-wrap">
                {currentContent?.content}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleNext}
                className="flex-1 min-w-[200px] px-8 py-4 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all"
              >
                {currentStep < lessonContent.length - 1
                  ? "I'm Ready, Next →"
                  : "Take Quiz →"}
              </button>

              <button
                onClick={() => setShowChatbot(!showChatbot)}
                className="px-8 py-4 bg-purple-500/20 border border-purple-500/40 rounded-2xl font-bold hover:bg-purple-500/30 transition-all"
              >
                {showChatbot ? "Hide Chat" : "Ask Question 💬"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Inline Chatbot */}
        <AnimatePresence>
          {showChatbot && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-purple-500/20 rounded-3xl p-6 mb-6 overflow-hidden"
            >
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <span>💬</span>
                Ask Me Anything
              </h3>

              <div className="max-h-[300px] overflow-y-auto mb-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <p className="text-white/50 text-center py-4">
                    Ask me anything about this step!
                  </p>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-orange-500 to-cyan-500 text-white"
                            : "bg-white/10 text-white/90 border border-white/10"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="w-2 h-2 bg-cyan-500 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
                  placeholder="Type your question..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all"
                >
                  Send
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all"
            >
              ← Previous Step
            </button>
          )}
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all ml-auto"
          >
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  // QUIZ PHASE
  if (phase === "quiz" && quizQuestions.length > 0) {
    const question = quizQuestions[currentQuizQuestion];
    const difficulties = ["Easy", "Medium", "Hard"];

    return (
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-2">Quick Quiz</h2>
          <p className="text-white/60">
            Question {currentQuizQuestion + 1} of {quizQuestions.length} • {difficulties[currentQuizQuestion]}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuizQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              {question?.question}
            </h3>

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
                    onClick={() => handleQuizAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`
                      w-full p-4 rounded-xl text-left font-semibold transition-all border-2
                      ${showCorrect
                        ? "bg-green-500/30 border-green-500 text-white"
                        : showWrong
                        ? "bg-red-500/30 border-red-500 text-white"
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

        {selectedAnswer !== null && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNextQuizQuestion}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:shadow-lg text-white rounded-xl font-bold text-lg transition-all"
          >
            {currentQuizQuestion < quizQuestions.length - 1 ? "Next Question →" : "See Technical Concepts →"}
          </motion.button>
        )}
      </div>
    );
  }

  // TECHNICAL CONCEPTS PHASE
  if (phase === "technical") {
    return (
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-6"
        >
          <h2 className="text-3xl font-black mb-6 text-white">
            Technical Concepts: {topic}
          </h2>
          
          <div className="prose prose-invert prose-lg max-w-none mb-8">
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
              {technicalContent || "Loading technical concepts..."}
            </p>
          </div>

          <button
            onClick={() => setPhase("knowledge-test")}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all"
          >
            Test Your Knowledge →
          </button>
        </motion.div>
      </div>
    );
  }

  // KNOWLEDGE TEST PHASE
  if (phase === "knowledge-test") {
    return (
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-6"
        >
          <h2 className="text-3xl font-black mb-6 text-white">
            Share Your Understanding
          </h2>
          
          <p className="text-white/70 mb-6">
            Write everything you know about {topic}. Don't worry about being perfect - just share your understanding!
          </p>

          <textarea
            value={userKnowledge}
            onChange={(e) => setUserKnowledge(e.target.value)}
            placeholder="Type your understanding here..."
            className="w-full h-64 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none mb-6"
          />

          <button
            onClick={handleSubmitKnowledge}
            disabled={!userKnowledge.trim() || loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Evaluating..." : "Submit for Evaluation →"}
          </button>
        </motion.div>
      </div>
    );
  }

  // RESULTS PHASE
  if (phase === "results") {
    const quizPercentage = Math.round((quizScore / quizQuestions.length) * 100);
    const needsRetry = quizPercentage < 60 || knowledgeScore < 60;
    const canProceed = readCount >= 1 && quizPercentage >= 60;

    return (
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-6"
        >
          <h2 className="text-4xl font-black mb-8 text-center text-white">
            Your Results
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <p className="text-white/60 mb-2">Quiz Score</p>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                {quizScore}/{quizQuestions.length}
              </p>
              <p className="text-white/60 mt-2">{quizPercentage}%</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <p className="text-white/60 mb-2">Knowledge Score</p>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
                {knowledgeScore}%
              </p>
              <p className="text-white/60 mt-2">Understanding</p>
            </div>
          </div>

          {needsRetry && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
              <p className="text-yellow-300 font-semibold mb-2">💡 Suggestion</p>
              <p className="text-white/80">
                You're doing great! Would you like to review the material once more to strengthen your understanding? 
                {readCount < 1 && " We recommend reading through at least twice before the final assessment."}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            {needsRetry && (
              <button
                onClick={handleRetry}
                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all"
              >
                Review Material Again
              </button>
            )}
            
            {canProceed && (
              <button
                onClick={onComplete}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all"
              >
                Complete Lesson ✓
              </button>
            )}

            <button
              onClick={onBack}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all"
            >
              Back to Topics
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}

// Made with Bob
