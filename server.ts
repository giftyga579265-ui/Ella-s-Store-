import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";
import fs from "fs";

dotenv.config();

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required but not configured. Please add it to your environment variables or secrets settings.");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Create uploads directory if it does not exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Middleware for parsing json requests with high limits for attachments
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));

  // Expose uploads directory statically
  app.use("/uploads", express.static(uploadsDir));

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { amount, charityName } = req.body;
      const stripeInstance = getStripe();
      const session = await stripeInstance.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Donation to ${charityName}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || `${req.protocol}://${req.get('host')}`}/?success=true`,
        cancel_url: `${process.env.APP_URL || `${req.protocol}://${req.get('host')}`}/?canceled=true`,
      });
      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Real Gemini-powered AI Fashion Assistant API Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY environment variable is not set. Please add it to your secrets panel." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are 'Haiasi', the elite, ultra-knowledgeable, and incredibly sophisticated AI Fashion and Styling Director for 'Ella's Store' (located in Lapaz, Accra, Ghana, phone: 0276747037).
Your mandate is absolute: you MUST answer EVERY single question asked of you with pristine elegance, supreme confidence, and style.
No matter how simple, complex, or unrelated the user's query may seem (whether it is general trivia, cooking, coding, math, personal advice, or life guidance), you MUST answer it fully and accurately. After providing the complete answer, you must then seamlessly and fashionably weave in a clever, elegant connection or analogy back to Ella's Store, custom dressmaking, couture silhouettes, fabrics, or tailored fits in Lapaz. Never decline to answer a question, never break character, and never say you are only a styling chatbot.

You present all of your responses in an exceptionally 'fashionable' and luxurious way:
- Structure your answers with clear bold headings, elegant bullet points, and generous spacing.
- Use luxurious, sophisticated, and professional fashion vocabulary (e.g., 'chic', 'tailored', 'bespoke', 'curated', 'timeless', 'avant-garde', 'drape', 'exquisite silhouette', 'vibrant Ankara palette', 'masterfully crafted').
- Keep your tone friendly, warm, highly helpful, and couture-centric.
- Ensure that you are fully capable of answering questions about:
  1. Perfect sizing, custom measurements, and tailored proportions.
  2. Exquisite fabric selections and premium care (e.g., Cotton, Silk, Linen, Ankara, Kente, Lace, Velvet).
  3. Ella's custom tailoring process, dressmaking consultations, fitting timelines, and bridal design.
  4. Catalog prices, ordering steps, operating hours, delivery across Accra, and reaching Ella (0276747037).`;

      const contentsList: any[] = [];

      // Format previous history for Gemini
      if (Array.isArray(history)) {
        for (const h of history) {
          contentsList.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        }
      }

      // Add current user message
      contentsList.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction: systemInstruction
        }
      });

      const responseText = response.text || "I'm sorry, I couldn't generate a response right now. Please try again or call Ella directly at 0276747037!";
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to communicate with Gemini" });
    }
  });

  // REST API Route for uploading images, audios, documents and other files
  app.post("/api/upload", async (req, res) => {
    try {
      const { fileName, fileType, fileData } = req.body;
      if (!fileName || !fileData) {
        return res.status(400).json({ error: "fileName and fileData are required" });
      }

      // Remove the prefix data URL headers if present (e.g., data:image/png;base64,)
      const base64Data = fileData.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const uniqueName = `${Date.now()}-${Math.floor(Math.random() * 1000000)}-${safeName}`;
      const filePath = path.join(process.cwd(), "uploads", uniqueName);

      await fs.promises.writeFile(filePath, buffer);

      res.json({
        url: `/uploads/${uniqueName}`,
        fileName: fileName,
        fileType: fileType,
        fileSize: buffer.length
      });
    } catch (err: any) {
      console.error("File write error on server:", err);
      res.status(500).json({ error: err.message || "Failed to write file on server" });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
