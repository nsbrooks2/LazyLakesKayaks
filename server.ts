import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const db = new Database("lazy-lake.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    kayaks INTEGER NOT NULL,
    paddle_boards INTEGER DEFAULT 0,
    duration TEXT NOT NULL,
    location TEXT NOT NULL,
    add_ons TEXT,
    life_jacket TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    guided_tour_hours INTEGER DEFAULT 0,
    notes TEXT,
    waiver_signed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS waivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER,
    name TEXT NOT NULL,
    signature TEXT NOT NULL,
    virtual_signature TEXT,
    signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(booking_id) REFERENCES bookings(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    approved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS api_usage (
    date TEXT PRIMARY KEY,
    request_count INTEGER DEFAULT 0
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Email Transporter
  const transporter = (process.env.SMTP_HOST && !process.env.SMTP_HOST.includes('@')) 
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null;

  // Rate Limiting for AI API
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Security Middleware for AI API
  const validateOrigin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const allowedOrigins = [
      "https://lazylakekayaks.com",
      "https://www.lazylakekayaks.com",
      process.env.APP_URL, // Allow current environment
      process.env.SHARED_APP_URL // Allow shared environment
    ].filter(Boolean);

    const origin = req.get("origin") || req.get("referer");
    
    // In development/preview, we might not have a strict origin match if accessed via proxy
    // but we should at least check if it's one of ours if it exists
    if (origin) {
      const isAllowed = allowedOrigins.some(ao => origin.startsWith(ao!));
      if (!isAllowed && process.env.NODE_ENV === "production") {
        console.warn(`Unauthorized origin attempt: ${origin}`);
        return res.status(403).json({ error: "Unauthorized origin" });
      }
    }
    next();
  };

  // Daily Usage Check
  const checkDailyLimit = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const today = new Date().toISOString().split("T")[0];
    const limit = 100; // Max 100 images per day for the whole site

    const usage = db.prepare("SELECT request_count FROM api_usage WHERE date = ?").get(today) as { request_count: number } | undefined;
    
    if (usage && usage.request_count >= limit) {
      return res.status(429).json({ error: "Daily AI usage limit reached. Please try again tomorrow." });
    }
    next();
  };

  // API Routes
  app.post("/api/generate-image", aiLimiter, validateOrigin, checkDailyLimit, async (req, res) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.length > 500) {
      return res.status(400).json({ error: "Invalid prompt" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      return res.status(500).json({ error: "AI service is currently unavailable" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts: [{ text: prompt }] },
      });

      let imageData = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          break;
        }
      }

      if (!imageData) {
        return res.status(500).json({ error: "Failed to generate image" });
      }

      // Update usage
      const today = new Date().toISOString().split("T")[0];
      db.prepare("INSERT INTO api_usage (date, request_count) VALUES (?, 1) ON CONFLICT(date) DO UPDATE SET request_count = request_count + 1").run(today);

      res.json({ image: `data:image/png;base64,${imageData}` });
    } catch (error: any) {
      console.error("Gemini API Error:", error.message);
      // Do not expose raw error to user
      res.status(500).json({ error: "An error occurred while generating the image" });
    }
  });

  app.get("/api/reviews", (req, res) => {
    const reviews = db.prepare("SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC").all();
    res.json(reviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { name, rating, comment } = req.body;
    try {
      db.prepare("INSERT INTO reviews (name, rating, comment) VALUES (?, ?, ?)").run(name, rating, comment);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit review" });
    }
  });

  // Simple Admin Routes (In a real app, these would be protected by Auth)
  app.get("/api/admin/reviews", (req, res) => {
    const reviews = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
    res.json(reviews);
  });

  app.post("/api/admin/reviews/approve", (req, res) => {
    const { id, approved } = req.body;
    try {
      db.prepare("UPDATE reviews SET approved = ? WHERE id = ?").run(approved ? 1 : 0, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update review status" });
    }
  });

  app.delete("/api/admin/reviews/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  app.get("/api/availability", (req, res) => {
    const { date } = req.query;
    const bookings = db.prepare("SELECT time, kayaks FROM bookings WHERE date = ?").all(date);
    res.json(bookings);
  });

  app.post("/api/bookings", async (req, res) => {
    const { name, email, phone, date, time, kayaks, paddleBoards, duration, location, addOns, lifeJacket, paymentMethod, guidedTourHours, notes } = req.body;
    
    try {
      const info = db.prepare(`
        INSERT INTO bookings (name, email, phone, date, time, kayaks, paddle_boards, duration, location, add_ons, life_jacket, payment_method, guided_tour_hours, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, email, phone, date, time, kayaks || 0, paddleBoards || 0, duration, location, JSON.stringify(addOns), lifeJacket, paymentMethod, guidedTourHours || 0, notes || '');

      const bookingId = info.lastInsertRowid;

      // Calculate Total Price (Align with frontend/types.ts)
      const kayakPricing: any = {
        '2-Hour': 30,
        'Half-Day (5h)': 50,
        'Full-Day (8h)': 70,
      };
      
      const pbPricing: any = {
        '1-Hour': 20,
        '2-Hour': 30,
        '3-Hour': 45,
      };
      
      let totalAmount = 0;
      if (kayaks > 0) {
        totalAmount += (kayakPricing[duration as string] || 0) * kayaks;
      }
      if (paddleBoards > 0) {
        totalAmount += (pbPricing[duration as string] || 0) * paddleBoards;
      }
      
      // Add-ons
      if (Array.isArray(addOns)) {
        addOns.forEach((addon: string) => {
          if (addon.includes('+$5')) totalAmount += 5;
          if (addon.includes('+$10')) totalAmount += 10;
        });
      }

      // Guided Tour
      if (guidedTourHours) {
        totalAmount += guidedTourHours * 15;
      }

      // Send Emails (Owner)
      const ownerMailOptions = {
        from: `"Lazy Lakes Kayaks" <${process.env.SMTP_USER || "noreply@lazylakekayaks.com"}>`,
        to: process.env.BUSINESS_EMAIL,
        subject: `🚨 NEW BOOKING: ${name} - ${date} @ ${time}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #0c4a6e; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">New Booking Received!</h1>
            </div>
            <div style="padding: 24px; color: #334155;">
              <h2 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #0c4a6e;">Customer Details</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              
              <h2 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #0c4a6e; margin-top: 24px;">Rental Details</h2>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
              <p><strong>Kayaks:</strong> ${kayaks || 0}</p>
              <p><strong>Paddle Boards:</strong> ${paddleBoards || 0}</p>
              <p><strong>Duration:</strong> ${duration}</p>
              <p><strong>Location:</strong> ${location}</p>
              <p><strong>Add-ons:</strong> ${addOns.length > 0 ? addOns.join(", ") : "None"}</p>
              <p><strong>Life Jacket:</strong> ${lifeJacket === 'provided' ? 'Provided by us' : 'Bringing own'}</p>
              
              <h2 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #0c4a6e; margin-top: 24px;">Guided Tour</h2>
              <p><strong>Hours:</strong> ${guidedTourHours || 0} hours</p>
              <p><strong>Additional Cost:</strong> $${(guidedTourHours || 0) * 15}</p>

              <h2 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #0c4a6e; margin-top: 24px;">Customer Notes</h2>
              <p>${notes || "No notes provided."}</p>
              
              <h2 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #0c4a6e; margin-top: 24px;">Payment Info</h2>
              <p><strong>Method:</strong> ${paymentMethod}</p>
              <p style="font-size: 18px; font-weight: bold; color: #ea580c;">Estimated Total: $${totalAmount}</p>
              
              <div style="margin-top: 32px; padding: 16px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">A confirmation email has also been sent to the customer.</p>
              </div>
            </div>
          </div>
        `,
      };

      // Send Emails (Customer)
      const customerMailOptions = {
        from: `"Lazy Lakes Kayaks" <${process.env.SMTP_USER || "noreply@lazylakekayaks.com"}>`,
        to: email,
        subject: `Booking Confirmation - Lazy Lakes Kayaks`,
        html: `
          <h1>Thanks for booking with Lazy Lakes Kayaks!</h1>
          <p>Hi ${name}, your booking is received but <strong>not yet confirmed</strong>.</p>
          <p><strong>Booking Details:</strong></p>
          <ul>
            <li>Date: ${date}</li>
            <li>Time: ${time}</li>
            <li>Kayaks: ${kayaks || 0}</li>
            <li>Paddle Boards: ${paddleBoards || 0}</li>
            <li>Location: ${location}</li>
            ${guidedTourHours ? `<li><strong>Guided Tour:</strong> ${guidedTourHours} hours with Nick (+$${guidedTourHours * 15})</li>` : ''}
          </ul>
          
          ${guidedTourHours ? `<p style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bae6fd;"><strong>Note:</strong> Since you booked a guided tour, please remember to meet Nicholas Brooks at the pickup location!</p>` : ''}

          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Complete the waiver if you haven't already.</li>
            <li>Prepare your $100 deposit or driver's license hold.</li>
            <li>Payment via ${paymentMethod} will be handled at the time of rental.</li>
          </ol>
          <p><strong>Estimated Total: $${totalAmount}</strong></p>
          <p>See you on the water!</p>
        `,
      };

      if (transporter) {
        try {
          await transporter.sendMail(ownerMailOptions);
          await transporter.sendMail(customerMailOptions);
        } catch (mailError) {
          console.error("Email sending failed:", mailError);
        }
      } else {
        console.log("SMTP not configured or invalid. Skipping emails.");
        if (process.env.SMTP_HOST?.includes('@')) {
          console.warn("Warning: SMTP_HOST seems to be an email address, not a hostname.");
        }
        console.log("Owner Email Content:", ownerMailOptions.html);
      }

      res.json({ success: true, bookingId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.post("/api/waiver", (req, res) => {
    const { bookingId, name, signature, virtualSignature } = req.body;
    try {
      db.prepare("INSERT INTO waivers (booking_id, name, signature, virtual_signature) VALUES (?, ?, ?, ?)").run(bookingId, name, signature, virtualSignature);
      db.prepare("UPDATE bookings SET waiver_signed = 1 WHERE id = ?").run(bookingId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit waiver" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
