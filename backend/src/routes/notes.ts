import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// --- Rota para pegar todas as notas ---
router.get('/notes', async (_req, res) => {
  try {
    const notes = await prisma.note.findMany();
    res.json(notes);
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar notas' });
  }
});

// --- Rota para criar nova nota ---
router.post('/notes', async (req, res) => {
  const { content, treinoId } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Conteúdo da nota é obrigatório' });
  }
  try {
    const note = await prisma.note.create({
      data: {
        content,
        treinoId: treinoId || undefined,
      },
    });
    res.status(201).json(note);
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    res.status(500).json({ error: 'Erro interno ao criar nota' });
  }
});
  

export default router;
