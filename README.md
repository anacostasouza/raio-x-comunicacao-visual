Aqui está o **README completo**, já com o backend em Node/Express, Vercel, e o fluxograma:

---

# 🎯 Raio-X da Comunicação Visual — Identidade Visual Empresarial

Este projeto é um **quiz interativo** desenvolvido para avaliar a percepção e consistência da **identidade visual de empresas**.
A aplicação oferece uma análise rápida (**raio-x**) sobre **logotipo, tipografia, paleta de cores, e outros elementos gráficos essenciais da marca**.

---

## 🔧 **Tecnologias Utilizadas**

### 🎨 **Frontend**

* ⚡️ **[Vite](https://vitejs.dev/)** → Bundler ultrarrápido para desenvolvimento e build.
* ⚛️ **[React](https://reactjs.org/)** → Criação de interfaces dinâmicas.
* 🔷 **[TypeScript](https://www.typescriptlang.org/)** → Tipagem estática para maior segurança no código.
* 🎨 **CSS Responsivo** → Interface adaptada para tablets, desktops e smartphones.

### 🛠 **Backend**

* 🌐 **[Node.js](https://nodejs.org/)** + **[Express](https://expressjs.com/)** → API intermediária entre o frontend e o BotConversa.
* ☁️ **[Vercel](https://vercel.com/)** → Hospedagem serverless do backend, com escalabilidade automática.

### 📡 **Integrações**

* 🔥 **BotConversa API** → Envio automático de mensagens de WhatsApp para o cliente com os resultados do quiz.

---

## 📸 **Funcionalidades**

✅ **Sistema de quiz** com perguntas de múltipla escolha.
✅ **Diagnóstico final** com análise de identidade visual.
✅ **Envio de mensagens pelo WhatsApp** via BotConversa.
✅ **Criação de contatos no BotConversa** para relacionamento.
✅ **Área administrativa** para gerenciar perguntas (login protegido).
✅ **Interface responsiva**, adaptada especialmente para tablets como o **Samsung Tab A9**.

---

## 🏗 **Arquitetura do Sistema**

📌 **Frontend (React + Vite)** → Interface que roda no navegador do usuário.
📌 **Backend (Node + Express na Vercel)** → Ponte segura para se comunicar com a BotConversa.
📌 **BotConversa API** → Plataforma que envia as mensagens de WhatsApp.

---

## 🌐 **Backend — Node.js + Express (Hospedado na Vercel)**

O backend serve como **proxy seguro** entre o **React** e a **API BotConversa**.
Isso significa que a chave secreta `BOTCONVERSA_KEY` **nunca é exposta no frontend**.

### 📌 **Principais Rotas**

* **`POST /proxy/contatos`** → Cria um contato no BotConversa.
* **`POST /proxy/mensagens`** → Envia uma mensagem de WhatsApp.

### 🔑 **Variáveis de Ambiente**

```env
BOTCONVERSA_KEY=suachaveaqui
```

### 🔒 **Segurança**

✅ **CORS configurado** → Apenas:

* `http://localhost:3000` (desenvolvimento)
* `https://raio-x-desenhar.web.app` (produção)

✅ Bloqueia qualquer domínio não autorizado.

---

✅ **Fluxograma do Sistema:**
1️⃣ Usuário responde o quiz.
2️⃣ O **frontend React** coleta as respostas.
3️⃣ O frontend chama o **backend Node/Express (Vercel)** para criar um contato.
4️⃣ O backend envia a requisição autenticada para a **API BotConversa**.
5️⃣ O BotConversa cria o contato e retorna a confirmação.
6️⃣ O backend envia a mensagem de WhatsApp com os resultados.
7️⃣ O usuário vê a confirmação do envio na tela.

---

## 🚀 **Deploy**

* **Frontend:** hospedado no **Firebase Hosting**.
* **Backend:** hospedado no **Vercel** como Serverless Functions.

---

## 📲 **Experiência do Usuário**

📱 O sistema foi pensado para rodar em **tablets** (ex.: **Samsung Tab A9**) mas é **100% responsivo** e se adapta a smartphones e desktops.

---
