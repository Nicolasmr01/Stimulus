import express from 'express';
import { PrismaClient } from '@prisma/client';
import verificarToken from '../../middlewares/verificarToken';

const router = express.Router();
const prisma = new PrismaClient();

const XP_POR_TREINO = 20;
const XP_PARA_UPAR = 100;

router.get('/gamificacao', verificarToken, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

  try {
    let gamificacao = await prisma.gamificacao.findFirst({
      where: { userId },
      include: { medalhas: true },
    });

    if (!gamificacao) {
      gamificacao = await prisma.gamificacao.create({
       data: {
      userId,       // ou user: { connect: { id: userId } }
      xpGanho: 0,   // inicial
      nivel: 1,     // inicial
    },
    include: { medalhas: true },
      });
    }

    res.json(gamificacao);
  } catch (error) {
    console.error('Erro ao buscar gamificação:', error);
    res.status(500).json({ error: 'Erro ao buscar gamificação' });
  }
});

router.post('/gamificacao/add-xp', verificarToken, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

  try {
    let gamificacao = await prisma.gamificacao.findFirst({ where: { userId } });
    if (!gamificacao) {
  gamificacao = await prisma.gamificacao.create({
    data: {
      userId,      // conecta o usuário
      xpGanho: 0,  // valor inicial
      nivel: 1,    // valor inicial
      pontos: 0,   // valor inicial
    },
  });
  }

    let novosPontos = gamificacao.pontos + XP_POR_TREINO;
    let novoNivel = gamificacao.nivel;

    if (novosPontos >= XP_PARA_UPAR) {
      novosPontos -= XP_PARA_UPAR;
      novoNivel++;
    }

    const updated = await prisma.gamificacao.update({
      where: { id: gamificacao.id },
      data: { pontos: novosPontos, nivel: novoNivel },
    });

    const totalTreinos = await prisma.treino.count({ where: { userId } });

    const medalhas: any[] = [];
    const milestones = [
      { quantidade: 10, nome: 'Bronze', descricao: '10 treinos completos' },
      { quantidade: 20, nome: 'Prata', descricao: '20 treinos completos' },
      { quantidade: 50, nome: 'Ouro', descricao: '50 treinos completos' },
      { quantidade: 100, nome: 'Diamante', descricao: '100 treinos completos' },
    ];

    for (const m of milestones) {
      const jaTem = await prisma.medalha.findFirst({
        where: { gamificacaoId: updated.id, nome: m.nome },
      });

      if (!jaTem && totalTreinos >= m.quantidade) {
        const nova = await prisma.medalha.create({
          data: { nome: m.nome, descricao: m.descricao, userId, gamificacaoId: updated.id },
        });
        medalhas.push(nova);
      }
    }

    res.json({
      message: 'XP atualizado com sucesso!',
      nivel: updated.nivel,
      pontos: updated.pontos,
      novasMedalhas: medalhas,
    });
  } catch (error) {
    console.error('Erro ao adicionar XP:', error);
    res.status(500).json({ error: 'Erro ao adicionar XP' });
  }
});

export default router;
