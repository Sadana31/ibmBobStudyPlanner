import { groqChat } from "@/lib/groq";

export async function POST(req) {
  try {
    const { subject, topic } = await req.json();

    const systemPrompt = `You are a technical educator. Provide clear, comprehensive technical explanations using proper terminology and concepts. Focus ONLY on technical aspects - no analogies or interest-based examples.`;

    const userMessage = `Provide a comprehensive technical explanation of "${topic}" in ${subject}.

Include:
1. Formal definitions and terminology
2. Key formulas, equations, or syntax (if applicable)
3. Technical principles and mechanisms
4. Important facts and properties
5. Common applications in the field

Use proper technical language. Be thorough but clear. Format with clear sections.

Do NOT include:
- Analogies or comparisons to other fields
- Interest-based examples
- Simplified explanations

Provide pure technical content that a student would find in a textbook.`;

    const response = await groqChat(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    return Response.json({
      content: response,
      success: true,
    });
  } catch (error) {
    console.error("Error generating technical content:", error);

    return Response.json({
      content: `Technical Overview of ${topic}

This topic covers fundamental concepts in ${subject}. Key aspects include:

1. Core Principles: Understanding the foundational mechanisms and rules
2. Mathematical/Logical Framework: The formal structure and relationships
3. Practical Applications: How these concepts are applied in real scenarios
4. Important Properties: Key characteristics and behaviors

For a complete understanding, review your course materials and textbooks for detailed technical specifications.`,
      success: false,
      error: error.message,
    });
  }
}

// Made with Bob
