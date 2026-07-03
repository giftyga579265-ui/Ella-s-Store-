import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";

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

  // Middleware for parsing json requests
  app.use(express.json());

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

      const systemInstruction = `You are 'Haiasi', an intelligent fashion and styling assistant for 'Ella's Store' (located in Lapaz, Accra, Ghana, phone: 0276747037).
Your tone is friendly, warm, highly professional, helpful, and deeply knowledgeable about Ella's Store.
You are fully capable of answering ALL questions from customers. This includes answering questions about:
1. Sizing and how to measure oneself for a perfect fit.
2. Fabric suggestions and care (e.g. Cotton, Silk, Linen, Ankara, Kente, Lace).
3. The custom tailoring and dressmaking process, styling consultations, custom fitting times, etc.
4. Product prices, catalog items, ordering process, operating hours, delivery options and tracking across Accra.
5. Store information, directions to the Lapaz boutique, and reaching the owner, Ella (phone: 0276747037), who is always ready to assist.
6. General queries and any other customer questions! Always reply in a friendly, enthusiastic manner and relate it back to Ella's Store where appropriate. Never decline to answer a question or say you are only a styling chatbot.

Feel free to use appropriate bullet points for clarity. Keep responses engaging, informative, and concise.`;

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
        model: "gemini-2.0-flash",
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
