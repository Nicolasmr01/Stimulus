import cors from 'cors';
import dotenv from "dotenv";
import express from 'express';
import gamificacaoRoutes from './src/routes/gamificacao';
import notesRoutes from './src/routes/notes';
import treinoRoutes from './src/routes/treino';
import userRoutes from './src/routes/user';
dotenv.config();


const app = express();
app.use(express.json());

const allowedOrigins = [
  // URL PÚBLICA do seu frontend no Vercel
  'https://stimulus-delta.vercel.app', 
  // URLs de desenvolvimento local
  'http://localhost:3333',
  'http://localhost',
  'http://192.168.15.8:3333'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permite requisições sem origem (como apps mobile e Postman) e origens permitidas
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, 
};

app.use(cors(corsOptions));

// Rotas da API
app.use('/api', gamificacaoRoutes);
app.use('/api', userRoutes);
app.use('/api', treinoRoutes);
app.use('/api', notesRoutes);

const PORT = process.env.PORT || 3333;
// Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
