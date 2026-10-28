import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleCicloLeveChat } from './src/server/chatHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API route for CicloLeve Gemini chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    const result = await handleCicloLeveChat(message, history || [], context);
    res.json(result);
  } catch (error: any) {
    console.error('API Error in server.ts:', error);
    res.status(500).json({ error: error?.message || 'Erro interno no servidor' });
  }
});

// Serve frontend dist if available
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CicloLeve server running on port ${PORT}`);
});
