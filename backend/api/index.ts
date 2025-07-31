 
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',                 
  'https://raio-x-desenhar.web.app',      
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.options('*', cors());

app.use(express.json());



const API_BASE = 'https://backend.botconversa.com.br/api/v1/webhook';
const API_KEY = process.env.BOTCONVERSA_KEY;

app.get('/test', (req, res) => {
  res.send('API está funcionando');
});


app.post('/proxy/contatos', async (req, res) => {
  try {
    const nome = (req.body.nome || '').trim();
    const telefone = (req.body.telefone || '').trim();

    if (!telefone || !nome) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    const nomes = nome.split(' ');
    const firstName = nomes[0];
    const lastName = nomes.slice(1).join(' ') || '';

    const response = await fetch(`${API_BASE}/subscriber/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY!,
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
    console.error('Erro ao criar contato:', err);
    return res.status(500).json({ error: 'Erro ao criar contato' });
  }
});

app.post('/proxy/mensagens', async (req, res) => {
  try {
    const telefone = req.body.telefone;
    const mensagem = req.body.mensagem;

    const resGet = await fetch(`${API_BASE}/subscriber/get_by_phone/${telefone}/`, {
      headers: { 'accept': 'application/json', 'Api-Key': API_KEY! },
    });

    const subscriber = await resGet.json();
    const subscriberId = subscriber.id;

    if (!subscriberId) {
      return res.status(404).json({ error: 'Subscriber não encontrado' });
    }

    const resSend = await fetch(`${API_BASE}/subscriber/${subscriberId}/send_message/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Key': API_KEY! },
      body: JSON.stringify({ type: 'text', value: mensagem }),
    });

    const dataSend = await resSend.json();
    return res.json(dataSend);
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    return res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app(req as any, res as any);
}
