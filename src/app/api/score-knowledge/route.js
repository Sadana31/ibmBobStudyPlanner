import { groqChat } from "@/lib/groq";

export async function POST(req) {
  try {
    const { subject, topic, userInput, technicalContent } = await req.json();

    const systemPrompt = `You are an educational evaluator. Score student understanding based on their written explanation. Be fair but thorough.`;

    const userMessage = `Evaluate this student's understanding of "${topic}" in ${subject}.

Technical Reference:
${technicalContent}

Student's Explanation:
${userInput}

Provide a score from 0-100 based on:
1. Accuracy of concepts (40%)
2. Completeness of explanation (30%)
3. Use of proper terminology (20%)
4. Clarity and organization (10%)

Return ONLY a JSON object with this format:
{
  "score": 75,
  "feedback": "Brief constructive feedback in 2-3 sentences"
}`;

    const response = await groqChat(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    // Parse the response
    let result;
    try {
      const cleanResponse = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      // Fallback scoring based on length and keywords
      const wordCount = userInput.trim().split(/\s+/).length;
      const hasKeyTerms = technicalContent.toLowerCase().split(/\s+/).slice(0, 10).some(term => 
        userInput.toLowerCase().includes(term)
      );
      
      let score = 50; // Base score
      if (wordCount > 50) score += 10;
      if (wordCount > 100) score += 10;
      if (hasKeyTerms) score += 20;
      
      result = {
        score: Math.min(score, 85),
        feedback: "Good effort! Your explanation shows understanding. Consider adding more technical details and specific terminology."
      };
    }

    return Response.json({
      score: result.score || 50,
      feedback: result.feedback || "Keep practicing!",
      success: true,
    });
  } catch (error) {
    console.error("Error scoring knowledge:", error);

    return Response.json({
      score: 50,
      feedback: "Unable to evaluate at this time. Please try again.",
      success: false,
      error: error.message,
    });
  }
}

// Made with Bob
