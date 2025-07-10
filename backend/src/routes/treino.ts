import express from 'express';
import { PrismaClient } from '@prisma/client';
import verificarToken from '../../middlewares/verificarToken';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/treinos', verificarToken, async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  try {
    const treinos = await prisma.treino.findMany({
      where: { userId },
      include: {
        exercicios: {
          include: {
            exercise: true,
            series: true,
          },
        },
        notes: true,
      },
      orderBy: {
        data: 'desc',
      },
    });

    res.json(treinos);
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar treinos' });
  }
});


router.post('/treinos', verificarToken, async (req, res) => {
  const userId = req.userId;
  const { titulo, data, exercicios, descanso, alimentacao, humor, esforco, observacoes } = req.body;

  if (!userId || !titulo || !data || !Array.isArray(exercicios)) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  try {
    const treino = await prisma.treino.create({
      data: {
        userId,
        titulo,
        data: new Date(data),
        descanso: descanso ? Number(descanso) : null,
        alimentacao: alimentacao ? Number(alimentacao) : null,
        humor: humor ? Number(humor) : null,
        esforco: esforco ? Number(esforco) : null,
        observacoes: observacoes || null,
        exercicios: {
          create: exercicios.map((ex: any) => ({
            exerciseId: ex.exerciseId,
            carga: ex.carga, // obrigatório no modelo
            series: {
              create: ex.seriesDetalhes.map((serie: any) => ({
                tipoSerie: serie.tipoSerie,
                carga: serie.carga,
                reps: serie.reps,
              })),
            },
          })),
        },
      },
      include: {
        exercicios: {
          include: {
            exercise: true,
            series: true,
          },
        },
        notes: true,
      },
    });

    res.status(201).json(treino);
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    res.status(500).json({ error: 'Erro interno ao criar treino' });
  }
});


// Buscar todos os exercícios cadastrados
router.get('/exercicios', async (_req, res) => {
  try {
    const exercicios = await prisma.exercise.findMany();
    res.json(exercicios);
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error);
    res.status(500).json({ error: 'Erro interno ao buscar exercícios' });
  }
});

router.put('/exercicios/:id', async (req, res) => {
  const { id } = req.params;
  const { name, photoUrl } = req.body;

  try {
    // Verifica se o exercício existe
    const exercicioExistente = await prisma.exercise.findUnique({
      where: { id: Number(id) }
    });

    if (!exercicioExistente) {
      return res.status(404).json({ error: 'Exercício não encontrado' });
    }

    // Atualiza os campos enviados (name e photoUrl, se quiser)
    const exercicioAtualizado = await prisma.exercise.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(photoUrl !== undefined && { photoUrl }),
      },
    });

    res.json(exercicioAtualizado);

  } catch (error) {
    console.error('Erro ao atualizar exercício:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar exercício' });
  }
});

router.get('/exercicios', async (req, res) => {
  const { musculo } = req.query;

  try {
    const exercicios = await prisma.exercise.findMany({
      where: musculo ? { musculo: { contains: String(musculo), mode: 'insensitive' } } : {},
    });
    res.json(exercicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar exercícios' });
  }
});




export default router;
