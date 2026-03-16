import OpenAI from "openai";

export default async function handler(req, res) {

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { text } = req.body;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `Correct the following sentence into perfect English. Return only the corrected sentence: ${text}`
  });

  const corrected = response.output[0].content[0].text;

  res.status(200).json({ corrected });

}
