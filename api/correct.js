export default async function handler(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

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
            content: "Correct the grammar and return only the corrected sentence."
          },
          {
            role: "user",
            content: message
          }
        ],
      }),
    });

    const data = await response.json();

    console.log("API RESPONSE:", data); // debug

    const corrected = data?.choices?.[0]?.message?.content;

    res.status(200).json({
      corrected: corrected || "No correction found",
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
