"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { subjects } from "@/lib/data";
import EnhancedLesson from "@/components/EnhancedLesson";
import Chatbot from "@/components/Chatbot";

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const [interest, setInterest] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [currentStep, setCurrentStep] = useState("topics"); // topics, lesson

  const subject = subjects[params.subject];

  useEffect(() => {
    const storedInterest = localStorage.getItem("interest");
    if (!storedInterest) {
      router.push("/");
      return;
    }
    setInterest(storedInterest);
  }, [router]);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setCurrentStep("lesson");
  };

  const handleMarkComplete = () => {
    if (selectedTopic && !completedTopics.includes(selectedTopic)) {
      setCompletedTopics([...completedTopics, selectedTopic]);
    }
  };

  const handleLessonComplete = () => {
    if (selectedTopic && !completedTopics.includes(selectedTopic)) {
      setCompletedTopics([...completedTopics, selectedTopic]);
    }
    setSelectedTopic(null);
    setCurrentStep("topics");
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setCurrentStep("topics");
  };

  if (!subject) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <p className="text-white">Subject not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-hidden px-0">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-500/10 to-cyan-500/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-full mx-auto px-6 py-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <span className="text-2xl">←</span>
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-4xl">{subject.emoji}</span>
            <div>
              <h1 className="text-2xl font-black">{subject.label}</h1>
              <p className="text-sm text-white/50">
                {completedTopics.length} / {subject.topics.length} topics completed
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowChat(!showChat)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-cyan-500 font-bold hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all"
          >
            {showChat ? "Close Chat" : "Ask AI 💬"}
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-full mx-auto px-0 py-12">
        <AnimatePresence mode="wait">
          {currentStep === "topics" && (
            <motion.div
              key="topics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl font-black mb-3">Choose a Topic</h2>
                <p className="text-white/60 text-lg">
                  Select a topic to learn with personalized explanations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subject.topics.map((topic, index) => {
                  const isCompleted = completedTopics.includes(topic);
                  return (
                    <motion.button
                      key={topic}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTopicSelect(topic)}
                      className={`
                        relative p-8 rounded-3xl border text-left transition-all duration-300
                        ${isCompleted
                          ? "border-green-500/40 bg-green-500/10"
                          : "border-white/10 bg-black/40 hover:bg-white/5"
                        }
                      `}
                    >
                      {isCompleted && (
                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-lg">✓</span>
                        </div>
                      )}
                      <h3 className="text-2xl font-black mb-2">{topic}</h3>
                      <p className="text-white/50">
                        {isCompleted ? "Review this topic" : "Click to learn"}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {currentStep === "lesson" && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EnhancedLesson
                topic={selectedTopic}
                subject={subject}
                interest={interest}
                onComplete={handleLessonComplete}
                onBack={handleBackToTopics}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chatbot Overlay */}
      <AnimatePresence>
        {showChat && (
          <Chatbot
            subject={subject.label}
            topic={selectedTopic}
            interest={interest}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
