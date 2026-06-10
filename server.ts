import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Sarvam API subscription key
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || "";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json({ limit: "50mb" }));

// 1. Heatlh check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// 2. Speech-to-Text Proxy
app.post("/api/stt", async (req, res) => {
  try {
    const { audioBase64, language_code } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: "Missing audioBase64 field" });
    }

    const langCode = language_code || "hi-IN";

    // Reconstruct audio chunk buffer
    const buffer = Buffer.from(audioBase64, "base64");
    const blob = new Blob([buffer], { type: "audio/wav" });
    const file = new File([blob], "audio.wav", { type: "audio/wav" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "saarika:v2.5");
    formData.append("language_code", langCode);

    console.log(`Sending STT request to Sarvam AI for language: ${langCode}...`);

    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": SARVAM_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Sarvam STT Failed: ${response.status} - ${errorText}`);
      throw new Error(`Sarvam STT failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Sarvam STT success:", data);
    res.json(data);
  } catch (error: any) {
    console.error("STT Proxy error:", error);
    res.status(500).json({ error: error.message || "Speech-to-Text conversion failed" });
  }
});

// 3. Translation Proxy
app.post("/api/translate", async (req, res) => {
  try {
    const { text, source_language_code } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text to translate" });
    }

    // If source language is already English, no need to translate via Sarvam
    if (source_language_code === "en-IN") {
      return res.json({ translated_text: text });
    }

    console.log(`Translating text from ${source_language_code} to en-IN...`);

    const response = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        source_language_code,
        target_language_code: "en-IN",
        speaker_gender: "Male"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Sarvam Translate Failed: ${response.status} - ${errorText}`);
      throw new Error(`Sarvam Translate failed: ${errorText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Translation Proxy error:", error);
    // Return original text if translation fails, as Gemini can handle/translate it
    res.json({ translated_text: req.body.text, error: error.message });
  }
});

// 4. Gemini Resume Generator
app.post("/api/resume-generate", async (req, res) => {
  try {
    const { transcript, originalLanguage } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Missing transcript for resume generation" });
    }

    const prompt = `Use the transcript below, which is a voice-recorded session of a user explaining their background, skills, experience, and details. 
Extract and organize it into a polished, structured professional resume. If some information is not provided (like creative summaries, duration of jobs, email addresses, phone coordinates, or locations), proactively pre-fill realistic placeholder information based on context so the generated resume is fully formed and complete.

Calculate an ATS score (integer from 0 to 100) representing how professional and complete the input voice description was, and provide a 1-sentence constructive enhancement feedback.

Transcript:
"""
${transcript}
"""

Original Language of Speech: ${originalLanguage || "English"}
`;

    console.log("Sending prompt to Gemini for resume generation...");

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert recruitment advisor and ATS professional who excels at formatting unstructured voice inputs into flawless, standard, resume-ready JSON objects.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Candidate's full name. Proactively invent if missing but try to extract first." },
                email: { type: Type.STRING, description: "Candidate's professional email. Prefill professionally if missing." },
                phone: { type: Type.STRING, description: "Candidate's telephone number. Prefill professionally if missing." },
                location: { type: Type.STRING, description: "Candidate's city and state/country. Prefill standard Indian city if missing." },
                summary: { type: Type.STRING, description: "A high-impact 2-3 sentence professional summary focusing on candidate's strengths." }
              },
              required: ["name", "email", "phone", "location", "summary"]
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Extracted skills as individual tags or strings."
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING, description: "E.g., June 2024 - Present, or similar" },
                  description: { type: Type.STRING, description: "2-3 key bullet points joined by newlines or a single well-crafted paragraph detailing their responsibilities." }
                },
                required: ["role", "company", "duration", "description"]
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  school: { type: Type.STRING },
                  year: { type: Type.STRING }
                },
                required: ["degree", "school", "year"]
              }
            },
            languages: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of spoken/written languages"
            },
            atsScore: { type: Type.INTEGER, description: "An integer ATS format matching score out of 100." },
            feedback: { type: Type.STRING, description: "1-sentence actionable feedback to boost their CV score." }
          },
          required: ["personalInfo", "skills", "experience", "education", "languages", "atsScore", "feedback"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Zero-length response returned from Gemini");
    }

    const jsonResult = JSON.parse(resultText.trim());
    res.json(jsonResult);
  } catch (error: any) {
    console.error("Gemini Resume Generation failed:", error);
    res.status(500).json({ error: error.message || "Failed to process resume with AI" });
  }
});

// Configure Vite middleware and static serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running successfully on http://localhost:${PORT}`);
  });
}

bootstrap();
