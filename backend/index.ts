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

app.use(cors());

// Rotas da API
app.use('/api', gamificacaoRoutes);
app.use('/api', userRoutes);
app.use('/api', treinoRoutes);
app.use('/api', notesRoutes);


// Servidor
app.listen(3333, () => {
  console.log('Servidor rodando na porta 3333');
});
