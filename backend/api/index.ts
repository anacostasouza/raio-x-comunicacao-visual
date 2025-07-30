import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const API_BASE = 'https://backend.botconversa.com.br/api/v1/webhook';
const API_KEY = process.env.BOTCONVERSA_API_KEY || '';

if (!API_KEY) {
  throw new Error('🚨 API key BotConversa não configurada em BOTCONVERSA_API_KEY');
}

// Cria contato
app.post('/proxy/contatos', async (req, res) => {
  try {
    const nome = (req.body.nome || '').trim();
    const telefone = (req.body.telefone || '').trim();

    if (!nome || !telefone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    const nomes = nome.split(' ');
    const firstName = nomes[0];
    const lastName = nomes.slice(1).join(' ') || '';

    const bodyToSend = {
      phone: telefone,
      first_name: firstName,
      last_name: lastName,
    };

    const response = await fetch(`${API_BASE}/subscriber/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY,
      },
      body: JSON.stringify(bodyToSend),
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: 'Resposta inválida do BotConversa (não é JSON)', raw: text });
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Erro no proxy /contatos:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
  }
});

// Envia mensagem
app.post('/proxy/mensagens', async (req, res) => {
  try {
    const telefone = req.body.telefone;
    const mensagem = req.body.mensagem;

    if (!telefone || !mensagem) {
      return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }

    // Busca subscriber pelo telefone
    const resGet = await fetch(`${API_BASE}/subscriber/get_by_phone/${telefone}/`, {
      headers: {
        'accept': 'application/json',
        'Api-Key': API_KEY,
      },
    });

    if (!resGet.ok) {
      const errorText = await resGet.text();
      return res.status(resGet.status).json({ error: 'Subscriber não encontrado', raw: errorText });
    }

    const subscriber = await resGet.json();
    const subscriberId = subscriber.id;
    if (!subscriberId) {
      return res.status(404).json({ error: 'Subscriber ID não encontrado na resposta' });
    }

    // Envia mensagem para subscriber
    const resSend = await fetch(`${API_BASE}/subscriber/${subscriberId}/send_message/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY,
      },
      body: JSON.stringify({
        type: 'text',
        value: mensagem,
      }),
    });

    const textSend = await resSend.text();
    let dataSend;
    try {
      dataSend = JSON.parse(textSend);
    } catch {
      return res.status(500).json({ error: 'Resposta inválida do BotConversa (não é JSON)', raw: textSend });
    }

    if (!resSend.ok) {
      return res.status(resSend.status).json(dataSend);
    }

    res.json(dataSend);
  } catch (error) {
    console.error('Erro no proxy /mensagens:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
  }
});

export default app;
