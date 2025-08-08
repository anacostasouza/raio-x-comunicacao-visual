/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { VercelRequest, VercelResponse } from "@vercel/node";

const app = express();

// 🌍 Origens permitidas
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://raio-x-desenhar.web.app"
];

// ✅ Configuração global do CORS no Express
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Garantir que o Express entenda JSON
app.use(express.json());

// ✅ Responder manualmente a qualquer preflight (OPTIONS)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  return res.status(200).end();
});

const API_BASE = "https://backend.botconversa.com.br/api/v1/webhook";
const API_KEY = process.env.BOTCONVERSA_KEY;

// 📌 Criar contato
app.post("/proxy/contatos", async (req, res) => {
  try {
    const nome = (req.body.nome || "").trim();
    const telefone = (req.body.telefone || "").trim();

    if (!telefone || !nome) {
      return res.status(400).json({ error: "Nome e telefone são obrigatórios" });
    }

    const nomes = nome.split(" ");
    const firstName = nomes[0];
    const lastName = nomes.slice(1).join(" ") || "";

    const response = await fetch(`${API_BASE}/subscriber/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": API_KEY!,
      },
      body: JSON.stringify({
        phone: telefone,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    const data = await response.json();
    return res.json(data);

  } catch (err) {
    console.error("Erro ao criar contato:", err);
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// 📌 Enviar mensagem
app.post("/proxy/mensagens", async (req, res) => {
  try {
    const telefone = req.body.telefone;
    const mensagem = req.body.mensagem;

    const resGet = await fetch(`${API_BASE}/subscriber/get_by_phone/${telefone}/`, {
      headers: { "accept": "application/json", "Api-Key": API_KEY! },
    });

    const subscriber = await resGet.json();
    const subscriberId = subscriber.id;

    if (!subscriberId) {
      return res.status(404).json({ error: "Subscriber não encontrado" });
    }

    const resSend = await fetch(`${API_BASE}/subscriber/${subscriberId}/send_message/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Api-Key": API_KEY! },
      body: JSON.stringify({ type: "text", value: mensagem }),
    });

    const dataSend = await resSend.json();
    return res.json(dataSend);
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    return res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// Enviar Fluxo BotConversa

app.post("/proxy/fluxo", async (req, res) => {
  try {
    const telefone = req.body.telefone;
    const fluxoId = 7522480;
    if (!telefone || !fluxoId) {
      return res.status(400).json({ error: "Telefone e fluxoId são obrigatórios" });
    }
    const resGet = await fetch(`${API_BASE}/subscriber/get_by_phone/${telefone}/`, {
      headers: { "accept": "application/json", "Api-Key": API_KEY! },
    });
    const subscriber = await resGet.json();
    const subscriberId = subscriber.id;
    if (!subscriberId) {
      return res.status(404).json({ error: "Subscriber não encontrado" });
    }
    const resFluxo = await fetch(`${API_BASE}/subscriber/${subscriberId}/send_flow/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Api-Key": API_KEY! },
      body: JSON.stringify({ flow_id: fluxoId }),
    });
    const dataFluxo = await resFluxo.json();
    return res.json(dataFluxo);
  } catch (err) {
    console.error("Erro ao iniciar fluxo:", err);
    return res.status(500).json({ error: "Erro ao iniciar fluxo" });
  }
});

// 🔥 Export para Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return app(req as any, res as any);
}
