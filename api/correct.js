export default async function handler(req, res) {
  try {
    // ✅ Only allow POST
    if (req.method !== "POST") {
      return res.status(405).json({
        corrected: "Method not allowed"
      });
    }

    // ✅ SAFE BODY PARSE
    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const message = body?.message?.trim();

    if (!message) {
      return res.status(400).json({
        corrected: "⚠️ No message received"
      });
    }

    // ✅ CALL OPENAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // ✅ cheap & fast model
        messages: [
          {
            role: "system",
            content:
              "Correct the sentence grammatically and return only the corrected sentence. Keep it simple."
          },
          {
            role: "user",
            content: message
          }
        ],
      }),
    });

    // ✅ HANDLE HTTP ERROR FROM OPENAI
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OPENAI ERROR:", errorText);

      return res.status(200).json({
        corrected: "⚠️ API limit or key issue. Please try again later."
      });
    }

    const data = await response.json();

    console.log("API DATA:", data);

    const corrected =
      data?.choices?.[0]?.message?.content?.trim();

    return res.status(200).json({
      corrected: corrected || "⚠️ No correction found"
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(200).json({
      corrected: "⚠️ Server error. Please try again."
    });
  }
}
