import { groqChat } from "@/lib/groq";
import { subjects } from "@/lib/data";

export async function POST(req) {
  try {
    const { subject, difficulty, interest, questionCount = 5, topic } = await req.json();

    const difficultyDescriptions = {
      easy: "basic concepts with straightforward questions",
      medium: "intermediate concepts requiring some thinking",
      hard: "advanced concepts with challenging questions",
      mixed: "one easy, one medium, and one hard question"
    };

    let promptDifficulty = difficulty;
    let actualQuestionCount = questionCount;

    // For mixed difficulty, generate 3 questions (easy, medium, hard)
    if (difficulty === "mixed") {
      promptDifficulty = "varied";
      actualQuestionCount = 3;
    }

    const systemPrompt = `You are a quiz generator creating ${promptDifficulty} level questions for ${subjects[subject]?.label || subject}.

IMPORTANT: Keep questions SIMPLE and clear. Use everyday language.

Generate questions that:
1. Test understanding, not memorization
2. Use simple, clear language
3. Have one obviously correct answer
4. Include brief, simple explanations
5. Relate to ${interest} when possible`;

    const userMessage = `Create ${actualQuestionCount} multiple-choice questions about ${topic || subjects[subject]?.label || subject} in ${subjects[subject]?.label || subject}.

${difficulty === "mixed" ?
  `Generate exactly 3 questions:
  1. First question: EASY - basic concept
  2. Second question: MEDIUM - intermediate concept
  3. Third question: HARD - advanced concept`
  :
  `Difficulty: ${difficultyDescriptions[difficulty]}`
}

For someone interested in ${interest}, make questions relatable when possible.

Return ONLY a JSON array with this exact format:
[
  {
    "question": "Clear, simple question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief, simple explanation in 1-2 sentences"
  }
]

Rules:
- Keep questions short and clear
- Use simple language
- Make explanations easy to understand
- correctAnswer is the index (0-3) of the correct option
- Ensure one answer is clearly correct`;

    const response = await groqChat(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    // Parse the response
    let questions;
    try {
      // Clean response
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      // Find JSON array
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
        console.log("Successfully generated quiz questions!");
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError.message);
      // Fallback questions
      questions = getFallbackQuestions(subject, difficulty, questionCount);
    }

    return Response.json({
      questions,
      success: true
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    
    return Response.json({
      questions: getFallbackQuestions(subject, difficulty, questionCount),
      success: false,
      error: error.message
    });
  }
}

function getFallbackQuestions(subject, difficulty, count) {
  const fallbackQuestions = {
    chemistry: [
      {
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "O2", "H2"],
        correctAnswer: 0,
        explanation: "Water is made of 2 hydrogen atoms and 1 oxygen atom, written as H2O."
      },
      {
        question: "What happens when you mix an acid and a base?",
        options: ["They neutralize each other", "They explode", "Nothing happens", "They freeze"],
        correctAnswer: 0,
        explanation: "Acids and bases neutralize each other, creating water and salt."
      },
      {
        question: "What is the smallest unit of matter?",
        options: ["Molecule", "Atom", "Cell", "Particle"],
        correctAnswer: 1,
        explanation: "An atom is the smallest unit of matter that keeps its properties."
      }
    ],
    "linear-algebra": [
      {
        question: "What is a vector?",
        options: ["A number with direction and size", "Just a number", "A shape", "A formula"],
        correctAnswer: 0,
        explanation: "A vector has both size (how much) and direction (which way)."
      },
      {
        question: "How do you add two vectors?",
        options: ["Add each part separately", "Multiply them", "Divide them", "Subtract them"],
        correctAnswer: 0,
        explanation: "To add vectors, you add each matching part together."
      },
      {
        question: "What is a matrix?",
        options: ["A grid of numbers", "A single number", "A line", "A circle"],
        correctAnswer: 0,
        explanation: "A matrix is a rectangular grid filled with numbers."
      }
    ],
    python: [
      {
        question: "What does 'print()' do in Python?",
        options: ["Shows text on screen", "Saves a file", "Deletes code", "Runs a program"],
        correctAnswer: 0,
        explanation: "print() displays text or values on your screen."
      },
      {
        question: "What is a variable?",
        options: ["A container for storing data", "A type of loop", "A function", "An error"],
        correctAnswer: 0,
        explanation: "A variable stores data that you can use later in your code."
      },
      {
        question: "What does 'if' do in Python?",
        options: ["Makes a decision", "Repeats code", "Stops the program", "Prints text"],
        correctAnswer: 0,
        explanation: "'if' checks a condition and runs code only if it's true."
      }
    ],
    physics: [
      {
        question: "What is gravity?",
        options: ["A force that pulls things down", "A type of energy", "A speed", "A temperature"],
        correctAnswer: 0,
        explanation: "Gravity is the force that pulls objects toward each other, like Earth pulling you down."
      },
      {
        question: "What is speed?",
        options: ["How fast something moves", "How heavy something is", "How hot something is", "How big something is"],
        correctAnswer: 0,
        explanation: "Speed measures how fast an object moves from one place to another."
      },
      {
        question: "What is energy?",
        options: ["The ability to do work", "A type of matter", "A force", "A speed"],
        correctAnswer: 0,
        explanation: "Energy is what lets things move, change, or do work."
      }
    ]
  };

  const subjectQuestions = fallbackQuestions[subject] || fallbackQuestions.chemistry;
  return subjectQuestions.slice(0, count);
}

// Made with Bob
