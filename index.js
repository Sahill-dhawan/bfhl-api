import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();

app.use(express.json());

// ---------- HELPERS ----------
const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

// ---------- GET /health ----------
app.get("/health", (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: process.env.OFFICIAL_EMAIL
  });
});

// ---------- POST /bfhl ----------
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Exactly one key is required"
      });
    }

    const key = keys[0];
    const value = body[key];

    let data;

    // ---- Fibonacci ----
    if (key === "fibonacci") {
      if (!Number.isInteger(value) || value < 0) {
        throw new Error("Invalid fibonacci input");
      }
      const fib = [0, 1];
      for (let i = 2; i < value; i++) {
        fib.push(fib[i - 1] + fib[i - 2]);
      }
      data = fib.slice(0, value);
    }

    // ---- Prime ----
    else if (key === "prime") {
      if (!Array.isArray(value)) throw new Error("Invalid prime input");
      data = value.filter((n) => Number.isInteger(n) && isPrime(n));
    }

    // ---- LCM ----
    else if (key === "lcm") {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error("Invalid lcm input");
      }
      data = value.reduce((acc, cur) => lcm(acc, cur));
    }

    // ---- HCF ----
    else if (key === "hcf") {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error("Invalid hcf input");
      }
      data = value.reduce((acc, cur) => gcd(acc, cur));
    }

    // ---- AI ----
    else if (key === "AI") {
      if (typeof value !== "string") {
        throw new Error("Invalid AI input");
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: value }] }]
        }
      );

      data =
        response.data.candidates[0].content.parts[0].text.split(" ")[0];
    }

    else {
      return res.status(400).json({
        is_success: false,
        error: "Invalid key"
      });
    }

    return res.status(200).json({
      is_success: true,
      official_email: process.env.OFFICIAL_EMAIL,
      data
    });

  } catch (err) {
    return res.status(500).json({
      is_success: false,
      error: err.message
    });
  }
});

// ---------- START ----------
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
