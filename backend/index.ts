import express from 'express';
import cors from 'cors';
import userRoutes from './src/routes/user';
import treinoRoutes from './src/routes/treino';
import jwt from 'jsonwebtoken';
import verificarToken from './middlewares/verificarToken';

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api', userRoutes);
app.use('/api', verificarToken, treinoRoutes);

app.listen(3333, () => {
  console.log('Servidor rodando na porta 3333');
});
