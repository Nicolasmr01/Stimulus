import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import verificarToken from '../../middlewares/verificarToken';
import Groq from "groq-sdk";

const router = express.Router();
const prisma = new PrismaClient();

// XP fixo por treino
const XP_POR_TREINO = 20;

function validarCampo0a10(nome: string, valor: any) {
  if (valor === undefined || valor === null) return; // campo opcional
  if (typeof valor !== "number" || valor < 0 || valor > 10) {
    throw new Error(`${nome} deve ser um número entre 0 e 10.`);
  }
}

router.get('/treinos', verificarToken, async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

  try {
    const treinos = await prisma.treino.findMany({
      where: { userId },
      include: {
        notes: true,
        TreinoExercicio: {
          include: {
            Exercise: true,
            Serie: true,
          },
        },
      },
      orderBy: { data: 'desc' },
    });

    const treinosFormatados = treinos.map(t => ({
      id: t.id,
      titulo: t.titulo,
      data: t.data,

      // 🔥 AGORA SIM TÁ RETORNANDO AS ANOTAÇÕES
      descanso: t.descanso,
      alimentacao: t.alimentacao,
      humor: t.humor,
      esforco: t.esforco,
      observacoes: t.observacoes,

      notes: t.notes,

      exercicios: t.TreinoExercicio.map(te => ({
        id: te.id,
        carga: te.carga,
        exercise: te.Exercise,
        seriesDetalhes: te.Serie,
      })),
    }));

    res.json(treinosFormatados);
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
  // Validar notas (0–10)
  validarCampo0a10("descanso", descanso);
  validarCampo0a10("alimentacao", alimentacao);
  validarCampo0a10("humor", humor);
  validarCampo0a10("esforco", esforco);
} catch (err: any) {
  return res.status(400).json({ error: err.message });
}

  try {
    // Cria o treino
    const treino = await prisma.treino.create({
      data: {
        userId,
        titulo,
        data: new Date(data),
        descanso: descanso ?? null,
        alimentacao: alimentacao ?? null,
        humor: humor ?? null,
        esforco: esforco ?? null,
        observacoes: observacoes ?? null,
        TreinoExercicio: {
          create: exercicios.map((ex: any) => ({
            exerciseId: ex.exerciseId,
            carga: ex.carga,
            Serie: {
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
        TreinoExercicio: { include: { Exercise: true, Serie: true } },
        notes: true,
      },
    });

    // Atualiza XP e medalhas diretamente
    try {
      let gamificacao = await prisma.gamificacao.findFirst({ where: { userId } });
      if (!gamificacao) {
        gamificacao = await prisma.gamificacao.create({
          data: { userId, xpGanho: 0, nivel: 1, pontos: 0 },
        });
      }

      // Atualiza XP
      const XP_POR_TREINO = 20;
      let novosPontos = gamificacao.pontos + XP_POR_TREINO;
      let novoNivel = gamificacao.nivel;
      const XP_PARA_UPAR = 100;

      if (novosPontos >= XP_PARA_UPAR) {
        novosPontos -= XP_PARA_UPAR;
        novoNivel++;
      }

      const updated = await prisma.gamificacao.update({
        where: { id: gamificacao.id },
        data: { pontos: novosPontos, nivel: novoNivel },
      });

      // Checa milestones de medalha
      const totalTreinos = await prisma.treino.count({ where: { userId } });
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
          await prisma.medalha.create({
            data: { nome: m.nome, descricao: m.descricao, userId, gamificacaoId: updated.id },
          });
        }
      }
    } catch (xpError) {
      console.error('Erro ao atualizar XP/medalhas:', xpError);
    }

    // Retorna o treino criado
    const treinoFormatado = {
      id: treino.id,
      titulo: treino.titulo,
      data: treino.data,
      notes: treino.notes,
      exercicios: treino.TreinoExercicio.map(te => ({
        id: te.id,
        carga: te.carga,
        exercise: te.Exercise,
        seriesDetalhes: te.Serie,
      })),
    };

    res.status(201).json(treinoFormatado);
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    res.status(500).json({ error: 'Erro interno ao criar treino' });
  }
});

// Atualizar treino
router.put('/treinos/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const {
    titulo,
    data,
    descanso,
    alimentacao,
    humor,
    esforco,
    observacoes
  } = req.body;

  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

  try {
    // Verifica se o treino existe e pertence ao usuário
    const treinoExistente = await prisma.treino.findFirst({
      where: { id: Number(id), userId },
    });
    if (!treinoExistente) return res.status(404).json({ error: 'Treino não encontrado' });

    // Atualiza os campos fornecidos
    const treinoAtualizado = await prisma.treino.update({
      where: { id: Number(id) },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(data !== undefined && { data: new Date(data) }),
        ...(descanso !== undefined && { descanso }),
        ...(alimentacao !== undefined && { alimentacao }),
        ...(humor !== undefined && { humor }),
        ...(esforco !== undefined && { esforco }),
        ...(observacoes !== undefined && { observacoes }),
      },
      include: {
        notes: true,
        TreinoExercicio: { include: { Exercise: true, Serie: true } },
      },
    });

    res.json({
      id: treinoAtualizado.id,
      titulo: treinoAtualizado.titulo,
      data: treinoAtualizado.data,
      descanso: treinoAtualizado.descanso,
      alimentacao: treinoAtualizado.alimentacao,
      humor: treinoAtualizado.humor,
      esforco: treinoAtualizado.esforco,
      observacoes: treinoAtualizado.observacoes,
      notes: treinoAtualizado.notes,
      exercicios: treinoAtualizado.TreinoExercicio.map(te => ({
        id: te.id,
        carga: te.carga,
        exercise: te.Exercise,
        seriesDetalhes: te.Serie,
      })),
    });
  } catch (error) {
    console.error('Erro ao atualizar treino:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar treino' });
  }
});


router.delete('/treinos/:id', verificarToken, async (req, res) => {
  const userId = req.userId;
  const treinoId = Number(req.params.id);

  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

  try {
    // Primeiro tenta deletar as séries
    await prisma.serie.deleteMany({
      where: { TreinoExercicio: { treinoId } }
    });

    // Agora deleta os exercícios do treino
    await prisma.treinoExercicio.deleteMany({
      where: { treinoId }
    });

    // Agora deleta o treino
    await prisma.treino.delete({
      where: { id: treinoId }
    });

    res.json({ message: 'Treino deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar treino' });
  }
});

// Buscar todos os exercícios
router.get('/exercicios', async (req, res) => {
  const { musculo } = req.query;

  try {
    const exercicios = await prisma.exercise.findMany({
      where: musculo
        ? { musculo: { contains: String(musculo), mode: 'insensitive' } }
        : {},
    });

    res.json(exercicios);
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error);
    res.status(500).json({ error: 'Erro ao buscar exercícios' });
  }
});

// CRIAR EXERCICIOS //
router.post('/exercicios', async (req, res) => {
  const { name, musculo, photoUrl } = req.body;

  // 🔎 Validação
  if (!name) {
    return res.status(400).json({ error: "O campo 'name' é obrigatório." });
  }

  try {
    // 🟢 Criar exercício
    const exercicio = await prisma.exercise.create({
      data: {
        name,
        musculo: musculo ?? null,
        photoUrl: photoUrl ?? null,
      },
    });

    // 📦 Formatar retorno
    const exercicioFormatado = {
      id: exercicio.id,
      name: exercicio.name,
      musculo: exercicio.musculo,
      photoUrl: exercicio.photoUrl,
    };

    return res.status(201).json(exercicioFormatado);

  } catch (error) {
    console.error("Erro ao criar exercício:", error);

    // ⚠️ Tratamento do erro UNIQUE (P2002)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({
          error: "Já existe um exercício com esse nome.",
        });
      }
    }

    return res.status(500).json({ error: "Erro interno ao criar exercício" });
  }
});

// ATUALIZAR EXERCICIO //
router.put('/exercicios/:id', async (req, res) => {
  const { id } = req.params;
  const { name, musculo, photoUrl } = req.body;

  // Verifica se o ID é válido
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    // Primeiro, checa se realmente existe
    const exercicioExistente = await prisma.exercise.findUnique({
      where: { id: Number(id) },
    });

    if (!exercicioExistente) {
      return res.status(404).json({ error: "Exercício não encontrado." });
    }

    // Atualizar somente os campos enviados
    const exercicioAtualizado = await prisma.exercise.update({
      where: { id: Number(id) },
      data: {
        name: name ?? exercicioExistente.name,
        musculo: musculo ?? exercicioExistente.musculo,
        photoUrl: photoUrl ?? exercicioExistente.photoUrl,
      },
    });

    const exercicioFormatado = {
      id: exercicioAtualizado.id,
      name: exercicioAtualizado.name,
      musculo: exercicioAtualizado.musculo,
      photoUrl: exercicioAtualizado.photoUrl,
    };

    return res.status(200).json(exercicioFormatado);

  } catch (error) {
    console.error("Erro ao atualizar exercício:", error);

    // Erro de UNIQUE no Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({
          error: "Esse nome de exercício já está cadastrado.",
        });
      }
    }

    return res.status(500).json({ error: "Erro interno ao atualizar exercício" });
  }
});



// # CHATBOT #
router.post('/treinos/ai', verificarToken, async (req, res) => {
  const userId = req.userId;
  const { texto } = req.body;

  if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });
  if (!texto) return res.status(400).json({ error: "Envie o campo 'texto' com a descrição do treino." });

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 📌 1) BUSCA TODOS EXERCÍCIOS DO BANCO
    const exerciciosBanco = await prisma.exercise.findMany();
    const nomesValidos = exerciciosBanco.map(e => e.name);

    // 📌 2) MONTA LISTA QUE A IA É **OBRIGADA** A SEGUIR
    const listaFormatada = nomesValidos.map(n => `- ${n}`).join("\n");

    // 📌 3) CHAMADA CORRETA À IA (GROQ)
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
Você interpreta descrições de treinos de musculação e deve retornar SOMENTE JSON PURO.
PROIBIDO:
- Usar bloco de código
- Usar crases
- Usar texto antes ou depois
- Usar markdown
- Usar comentários

Responda EXCLUSIVAMENTE com JSON puro.

REGRAS IMPORTANTES:
- Nunca invente exercícios. Use SOMENTE a lista abaixo.
- Nunca altere nomes.
- Ignore exercícios que não existirem no banco.
- Não invente carga, reps ou séries.
- Só inclua descanso, humor, alimentacao ou esforço se o usuário disser.
- Sem divisões inventadas.
- Se mencionar “upper” → "Treino Upper"
- “lower” → "Treino Lower"
- “push” → "Treino Push"
- “pull” → "Treino Pull"
- Se não mencionar divisão → "Treino"
- Use data atual no formato YYYY-MM-DD.
- Sempre que o usúario digitar A DATA EM YYYY-MM-DD, USE ELA
- Sempre que o usuário mencionar "reps", entenda como "repetições" e use esse valor para preencher o campo "reps" do exercício.

Se o usuário informar descanso, humor, alimentação ou esforço:
- O valor DEVE estar entre 0 e 10.
- Se vier fora desse intervalo, ajuste automaticamente (ex: 12 → 10, -2 → 0).
- Nunca retorne valores fora de 0 a 10.

LISTA PERMITIDA:
${listaFormatada}

FORMATO DE SÉRIES (seriesDetalhes):
Sempre repita a quantidade correta de séries informadas.

FORMATO FINAL:

{
  "titulo": "...",
  "data": "2025-01-01",
  "exercicios": [
    {
      "nome": "Voador",
      "series": 3,
      "carga": 50,
      "reps": 10,
      "seriesDetalhes": [
        { "tipoSerie": "válida", "carga": 50, "reps": 10 },
        { "tipoSerie": "válida", "carga": 50, "reps": 10 },
        { "tipoSerie": "válida", "carga": 50, "reps": 10 }
      ]
    }
  ],
  "descanso": 5,
  "humor": 4,
  "alimentacao": 3,
  "esforco": 7
}

RETORNE SOMENTE O JSON. NUNCA USE \`\`\` OU TEXTO EXTRA.
`
        },
        { role: "user", content: texto }
      ],
      temperature: 0.1
    });


    const raw = completion.choices[0].message.content || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const dataAI = JSON.parse(cleaned);

    console.log("IA interpretou treino:", dataAI);

    // --------------------------------------------------
    // 4) CRIAR TREINO
    // --------------------------------------------------
    const novoTreino = await prisma.treino.create({
      data: {
        userId,
        titulo: dataAI.titulo,
        data: new Date(),
      }
    });

    // --------------------------------------------------
    // 5) CRIAR EXERCÍCIOS DO TREINO
    // --------------------------------------------------
    for (const ex of dataAI.exercicios) {

      // Faz comparação insensitive
      const existente = exerciciosBanco.find(
        e => e.name.toLowerCase() === ex.nome.toLowerCase()
      );

      if (!existente) {
        console.log("❌ Exercício não encontrado no banco:", ex.nome);
        continue;
      }

      const treinoEx = await prisma.treinoExercicio.create({
        data: {
          treinoId: novoTreino.id,
          exerciseId: existente.id,
          carga: ex.carga ?? 0,
        }
      });

      const series = Array.from({ length: ex.series }).map(() => ({
        tipoSerie: "válida",
        carga: ex.carga ?? 0,
        reps: 10
      }));

      await prisma.serie.createMany({
        data: series.map(s => ({
          ...s,
          treinoExercicioId: treinoEx.id
        }))
      });
    }

    // --------------------------------------------------
    // 6) RETORNAR TREINO COMPLETO
    // --------------------------------------------------
    const retorno = await prisma.treino.findUnique({
      where: { id: novoTreino.id },
      include: {
        TreinoExercicio: {
          include: { Exercise: true, Serie: true }
        }
      }
    });

    res.json(retorno);

  } catch (error) {
    console.error("ERRO EM /treinos/ai:", error);
    res.status(500).json({ error: "Erro ao interpretar e registrar treino" });
  }
});


export default router;
