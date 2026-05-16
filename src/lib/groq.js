const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function groqChat(messages, systemPrompt) {
  try {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not found");
    }

    // Format messages for Groq (OpenAI-compatible)
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Faster with higher rate limits
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2048, // Increased for longer responses
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Groq API error:", error);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error("Invalid response from Groq API");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw error;
  }
}

// Made with Bob
