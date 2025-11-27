import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

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
        treinoId: treinoId ? Number(treinoId) : undefined, // converte para número se existir
      },
    });

    // Retorna no mesmo formato do GET
    res.status(201).json({
      id: note.id,
      content: note.content,
      treinoId: note.treinoId,
    });
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    res.status(500).json({ error: 'Erro interno ao criar nota' });
  }
});

// --- Rota para pegar todas as notas ---
router.get('/notes', async (req, res) => {
  const { treinoId } = req.query;

  try {
    const notes = await prisma.note.findMany({
      where: treinoId ? { treinoId: Number(treinoId) } : {},
      orderBy: { id: 'asc' }, // ordena para ficar previsível
    });

    // Mapeia para frontend
    const notesFormatadas = notes.map(n => ({
      id: n.id,
      content: n.content,
      treinoId: n.treinoId,
    }));

    res.json(notesFormatadas);
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar notas' });
  }
});

router.put('/notes/:id', async (req, res) => {
  const noteId = Number(req.params.id);
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Conteúdo é obrigatório' });
  }

  try {
    const updated = await prisma.note.update({
      where: { id: noteId },
      data: { content }
    });

    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    res.status(500).json({ error: 'Erro ao atualizar nota' });
  }
});

router.delete('/notes/:id', async (req, res) => {
  const noteId = Number(req.params.id);

  try {
    await prisma.note.delete({
      where: { id: noteId }
    });

    res.json({ message: 'Nota deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir nota:', error);
    res.status(500).json({ error: 'Erro ao excluir nota' });
  }
});



  

export default router;
