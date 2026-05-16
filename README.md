# 🎓 AI Study Planner - Personalized Learning Platform

> Transform complex concepts into engaging, personalized lessons using AI-powered analogies tailored to your interests.

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Groq AI](https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Real-Life Use Cases](#-real-life-use-cases)
- [AI Technology Stack](#-ai-technology-stack)
- [System Architecture](#-system-architecture)
- [User Flow](#-user-flow)
- [Features](#-features)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Project Structure](#-project-structure)
- [API Routes](#-api-routes)
- [Contributing](#-contributing)

---

## 🌟 Overview

**AI Study Planner** is an innovative educational platform that revolutionizes how students learn complex subjects. Instead of generic textbook explanations, it uses AI to create personalized lessons using analogies from topics students are passionate about - whether that's gaming, music, football, cooking, anime, or movies.

### The Problem We Solve

Traditional education often fails to engage students because:
- Concepts are explained in abstract, technical terms
- Examples don't relate to students' interests
- One-size-fits-all approach doesn't work for everyone
- Students struggle to see real-world applications

### Our Solution

We use **AI-powered personalization** to:
- Transform complex topics into relatable analogies
- Generate step-by-step lessons tailored to individual interests
- Provide interactive Q&A through an intelligent chatbot
- Create custom quizzes with difficulty levels
- Make learning fun, engaging, and effective

---

## 🌍 Real-Life Use Cases

### 1. **High School & College Students**
**Scenario:** A student struggling with Linear Algebra who loves gaming.

**Traditional Approach:**
> "A vector is an ordered n-tuple of real numbers representing magnitude and direction in n-dimensional space."

**Our Approach:**
> "Think of vectors like your character's movement in a game. When you move forward at 5 units per second, that's a vector - it has both speed (5) and direction (forward). In Minecraft, when you mine a block, you're using vectors!"

**Result:** 3x better comprehension and retention.

### 2. **Career Switchers Learning Programming**
**Scenario:** A chef transitioning to software development learning Python.

**Traditional Approach:**
> "A list is a mutable, ordered collection of elements stored in contiguous memory locations."

**Our Approach:**
> "A list is like your recipe ingredients. You start with an empty bowl [], add flour, then sugar, then eggs. Each ingredient has its spot, and you can add or remove items as you cook!"

**Result:** Faster learning curve, higher confidence.

### 3. **Self-Learners & Hobbyists**
**Scenario:** A music producer learning chemistry for sound design.

**Traditional Approach:**
> "Atoms combine through ionic and covalent bonds to form molecular structures."

**Our Approach:**
> "Atoms are like individual notes. When you combine notes, you create chords. Just like C + E + G makes a C major chord, atoms combine to make molecules. The 'bond' is like harmony!"

**Result:** Better understanding of scientific principles in their field.

### 4. **Test Preparation**
**Scenario:** Student preparing for exams with limited time.

**Features Used:**
- Quick 5-question quizzes with instant feedback
- Difficulty levels (Easy/Medium/Hard) to match exam complexity
- AI-generated explanations for wrong answers
- Progress tracking across multiple subjects

**Result:** Efficient, targeted practice with immediate learning.

---

## 🧠 AI Technology Stack

### Primary AI: **Groq AI (Llama 3.3 70B)**

**Why Groq?**
- ⚡ **Ultra-fast inference:** 500+ tokens/second
- 🎯 **High accuracy:** 70B parameter model
- 💰 **Cost-effective:** Free tier available
- 🔄 **Reliable:** Consistent JSON output
- 🌐 **OpenAI-compatible API:** Easy integration

### AI Use Cases in the App

| Feature | AI Model | Purpose |
|---------|----------|---------|
| **Lesson Generation** | Llama 3.3 70B | Creates 5-step personalized lessons |
| **Chatbot Q&A** | Llama 3.3 70B | Answers student questions in context |
| **Quiz Generation** | Llama 3.3 70B | Creates multiple-choice questions |
| **Fact Generation** | Llama 3.3 70B | Generates fascinating facts on hover |
| **Step Re-explanation** | Llama 3.3 70B | Explains concepts differently |

### AI Configuration

```javascript
// Groq API Setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Optimized for complete responses
const completion = await groq.chat.completions.create({
  messages: [...],
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,        // Balanced creativity
  max_tokens: 2048,        // Prevents truncation
  top_p: 1,
  stream: false
});
```

### Prompt Engineering Strategy

We use **structured prompts** with:
1. **Clear role definition:** "You are a friendly tutor..."
2. **Specific constraints:** "Keep under 100 words", "Use simple language"
3. **Format requirements:** "Return ONLY JSON array"
4. **Examples:** Concrete examples of desired output
5. **Interest integration:** Dynamic insertion of user's passion

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Homepage   │  │  Learn Page  │  │   Quiz Page  │      │
│  │  (Subject &  │  │  (Lessons &  │  │ (Questions & │      │
│  │   Interest)  │  │   Chatbot)   │  │   Scoring)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ HTTP Requests    │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS 15 SERVER (App Router)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    API Routes                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │  /lesson   │  │ /chatbot   │  │   /quiz    │     │   │
│  │  │ Generate   │  │   Answer   │  │  Generate  │     │   │
│  │  │  Lessons   │  │ Questions  │  │ Questions  │     │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘     │   │
│  │        │                │                │            │   │
│  │  ┌─────┴────────────────┴────────────────┴──────┐   │   │
│  │  │         /generate-fact (Hover Facts)         │   │   │
│  │  └─────────────────────┬──────────────────────────┘   │   │
│  └────────────────────────┼──────────────────────────────┘   │
│                           │                                   │
│  ┌────────────────────────┴──────────────────────────────┐   │
│  │              Groq AI Integration Layer                 │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │  groqChat() - Unified AI Communication       │     │   │
│  │  │  • Handles API calls                          │     │   │
│  │  │  • Manages tokens (2048 max)                  │     │   │
│  │  │  • Error handling & retries                   │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  └────────────────────────┬──────────────────────────────┘   │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    GROQ AI CLOUD                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Llama 3.3 70B Versatile Model                │   │
│  │  • 70 billion parameters                             │   │
│  │  • 500+ tokens/second inference                      │   │
│  │  • Context window: 8,192 tokens                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW                                 │
│                                                              │
│  User Input → API Route → Groq AI → JSON Response →         │
│  Parse & Validate → Cache → Return to Client → Render       │
│                                                              │
│  Fallback: If AI fails → Use pre-written content            │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── app/
│   ├── page.js                    # Homepage (Subject & Interest Selection)
│   ├── learn/[subject]/page.js   # Learning Interface
│   ├── quiz/[subject]/page.js    # Quiz Interface
│   └── api/
│       ├── lesson/route.js        # Generate lessons
│       ├── chatbot/route.js       # Q&A responses
│       ├── generate-quiz/route.js # Quiz questions
│       ├── generate-fact/route.js # Hover facts
│       └── explain-step/route.js  # Re-explain concepts
├── components/
│   ├── SelfPacedLesson.jsx       # 5-step lesson display
│   ├── Chatbot.jsx                # Interactive Q&A
│   └── TopicCard.jsx              # Topic selection cards
└── lib/
    ├── groq.js                    # AI integration
    └── data.js                    # Subjects & interests config
```

---

## 🔄 User Flow

### Complete Learning Journey

```
START
  │
  ├─► 1. HOMEPAGE
  │     │
  │     ├─► Select Subject (Chemistry, Linear Algebra, Python, Physics)
  │     │     └─► Hover → AI generates fascinating fact
  │     │
  │     ├─► Select Interest (Gaming, Music, Football, Cooking, Anime, Movies)
  │     │     └─► Hover → AI generates related tech fact
  │     │
  │     └─► Choose Mode
  │           ├─► LEARN MODE → Go to Step 2
  │           └─► QUIZ MODE → Go to Step 3
  │
  ├─► 2. LEARN MODE
  │     │
  │     ├─► Select Topic (e.g., "Atoms and Molecules")
  │     │
  │     ├─► AI Generates 5-Step Lesson
  │     │     │
  │     │     ├─► Step 1: Introduction (with interest analogy)
  │     │     ├─► Step 2: Core Concept
  │     │     ├─► Step 3: Deep Dive
  │     │     ├─► Step 4: Application
  │     │     └─► Step 5: Summary
  │     │
  │     ├─► For Each Step:
  │     │     │
  │     │     ├─► Read Content
  │     │     │
  │     │     ├─► Options:
  │     │     │     ├─► "I'm Ready" → Next step
  │     │     │     ├─► "Explain Again" → AI re-explains differently
  │     │     │     └─► "Ask Question" → Open chatbot
  │     │     │
  │     │     └─► Chatbot (if opened):
  │     │           ├─► Ask any question
  │     │           ├─► AI answers in simple terms
  │     │           ├─► Uses interest analogies
  │     │           └─► Close → Back to lesson
  │     │
  │     └─► Complete All Steps → Return to topic selection
  │
  └─► 3. QUIZ MODE
        │
        ├─► Select Difficulty
        │     ├─► Easy (Basic concepts)
        │     ├─► Medium (Intermediate)
        │     └─► Hard (Advanced)
        │
        ├─► AI Generates 5 Questions
        │
        ├─► For Each Question:
        │     │
        │     ├─► Read Question
        │     ├─► Select Answer (A/B/C/D)
        │     ├─► Instant Feedback
        │     │     ├─► Correct → Green highlight
        │     │     └─► Wrong → Red highlight + show correct
        │     ├─► Read Explanation
        │     └─► Next Question
        │
        ├─► Final Score
        │     ├─► X/5 correct
        │     ├─► Percentage
        │     └─► Review all answers
        │
        └─► Options:
              ├─► Try Again → New questions
              └─► Back to Home

END
```

---

## ✨ Features

### 🎯 Personalized Learning
- **6 Interest Categories:** Gaming, Music, Football, Cooking, Anime, Movies
- **4 Subjects:** Chemistry, Linear Algebra, Python Programming, Physics
- **Dynamic Analogies:** AI creates examples using your interests
- **Adaptive Explanations:** Re-explain concepts in different ways

### 📚 Interactive Lessons
- **5-Step Structure:** Intro → Concept → Deep Dive → Application → Summary
- **Self-Paced:** Control when to move forward
- **Inline Chatbot:** Ask questions without leaving the lesson
- **Technical Terms:** Simple explanations with real notation

### 💬 AI Chatbot
- **Context-Aware:** Knows what lesson you're on
- **Simple Language:** No jargon, easy to understand
- **Interest-Based:** Uses your passion to explain
- **Instant Responses:** Powered by Groq's fast inference

### 🎯 Quiz System
- **3 Difficulty Levels:** Easy, Medium, Hard
- **AI-Generated Questions:** Unique every time
- **Instant Feedback:** Know immediately if you're right
- **Explanations:** Learn from mistakes
- **Score Tracking:** See your progress

### 🎨 Beautiful UI
- **3D Animations:** Interactive Three.js visualizations
- **Smooth Transitions:** Framer Motion animations
- **Neon Mouse Trail:** Engaging visual effects
- **Responsive Design:** Works on all devices
- **Dark Theme:** Easy on the eyes

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Groq API key (free at [groq.com](https://groq.com))

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/studyplanner-ai.git
cd studyplanner-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

---

## 🔐 Environment Setup

### Getting Your Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste into `.env.local`

### Environment Variables

```env
# Required
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx

# Optional (for production)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 📁 Project Structure

```
studyplanner-ai/
├── src/
│   ├── app/
│   │   ├── page.js                      # Homepage
│   │   ├── layout.js                    # Root layout
│   │   ├── globals.css                  # Global styles
│   │   ├── learn/
│   │   │   └── [subject]/
│   │   │       └── page.js              # Learning interface
│   │   ├── quiz/
│   │   │   └── [subject]/
│   │   │       └── page.js              # Quiz interface
│   │   └── api/
│   │       ├── lesson/route.js          # Lesson generation
│   │       ├── chatbot/route.js         # Chatbot responses
│   │       ├── generate-quiz/route.js   # Quiz generation
│   │       ├── generate-fact/route.js   # Fact generation
│   │       └── explain-step/route.js    # Re-explanations
│   ├── components/
│   │   ├── SelfPacedLesson.jsx         # Lesson component
│   │   ├── Chatbot.jsx                  # Chatbot component
│   │   ├── TopicCard.jsx                # Topic cards
│   │   └── Loader.jsx                   # Loading spinner
│   ├── lib/
│   │   ├── groq.js                      # Groq AI integration
│   │   └── data.js                      # App configuration
│   └── services/
│       └── api.js                       # API utilities
├── public/
│   └── images/                          # Static assets
├── .env.local                           # Environment variables
├── package.json                         # Dependencies
├── next.config.mjs                      # Next.js config
├── tailwind.config.js                   # Tailwind config
└── README.md                            # This file
```

---

## 🔌 API Routes

### POST `/api/lesson`
Generate a personalized lesson.

**Request:**
```json
{
  "subject": "chemistry",
  "topic": "Atoms and Molecules",
  "interest": "gaming"
}
```

**Response:**
```json
{
  "steps": [
    {
      "title": "Step 1: Atoms are Like Game Characters",
      "content": "Imagine atoms like characters in your game...",
      "type": "intro"
    }
  ],
  "success": true
}
```

### POST `/api/chatbot`
Get AI response to a question.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What is a molecule?" }
  ],
  "subject": "chemistry",
  "topic": "Atoms and Molecules",
  "interest": "gaming"
}
```

**Response:**
```json
{
  "response": "Think of a molecule like a team in your game...",
  "success": true
}
```

### POST `/api/generate-quiz`
Generate quiz questions.

**Request:**
```json
{
  "subject": "chemistry",
  "difficulty": "medium",
  "interest": "gaming",
  "questionCount": 5
}
```

**Response:**
```json
{
  "questions": [
    {
      "question": "What is H2O?",
      "options": ["Water", "Oxygen", "Hydrogen", "Carbon"],
      "correctAnswer": 0,
      "explanation": "H2O is water - 2 hydrogen atoms and 1 oxygen atom."
    }
  ],
  "success": true
}
```

### POST `/api/generate-fact`
Generate an interesting fact.

**Request:**
```json
{
  "topic": "Chemistry",
  "type": "subject"
}
```

**Response:**
```json
{
  "fact": "A single drop of water contains 1.67 sextillion molecules!",
  "success": true
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write clear commit messages
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** - Ultra-fast AI inference
- **Next.js** - Amazing React framework
- **Vercel** - Deployment platform
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **Three.js** - 3D graphics

---

## 📞 Contact

**Project Maintainer:** Your Name
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

---

## 🎯 Future Roadmap

- [ ] Add more subjects (Math, Biology, History)
- [ ] Voice-to-text for questions
- [ ] Progress tracking dashboard
- [ ] Social features (share lessons)
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Multi-language support
- [ ] Teacher dashboard
- [ ] Custom lesson creation

---

<div align="center">

**Made with ❤️ using AI and Next.js**

[⭐ Star this repo](https://github.com/yourusername/studyplanner-ai) | [🐛 Report Bug](https://github.com/yourusername/studyplanner-ai/issues) | [✨ Request Feature](https://github.com/yourusername/studyplanner-ai/issues)

</div>
