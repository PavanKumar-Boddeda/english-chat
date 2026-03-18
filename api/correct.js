export default async function handler(req, res) {
  try {

    // ✅ SAFE BODY PARSE
    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const message = body?.message;

    if (!message) {
      return res.status(400).json({
        corrected: "No message received"
      });
    }

    // ✅ CALL OPENAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Correct the sentence grammatically and return only corrected sentence."
          },
          {
            role: "user",
            content: message
          }
        ],
      }),
    });

    const data = await response.json();

    console.log("API DATA:", data);

    const corrected = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      corrected: corrected || message
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      corrected: "Error correcting sentence"
    });
  }
}
