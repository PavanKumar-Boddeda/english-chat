import OpenAI from "openai";

export default async function handler(req, res) {

  try {

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "Correct the grammar of the sentence and return only the corrected sentence."
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const corrected = completion.choices[0].message.content.trim();

    res.status(200).json({
      corrected: corrected
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      corrected: null
    });

  }

}
