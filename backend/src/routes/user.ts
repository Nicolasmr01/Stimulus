import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import verificarToken from '../../middlewares/verificarToken';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = 'sua_chave_secreta';

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=?])[A-Za-z0-9!@#$%^&*()_+=?]{6,15}$/;

// Registro
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Preencha todos os campos' });

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        'Senha inválida. A senha deve ter 6–15 caracteres, 1 letra maiúscula, 1 número e 1 caractere especial (!@#$%^&*()_+=?).',
    });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: 'Usuário já existe' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({ message: 'Usuário criado', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login efetuado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Listar usuários
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true},
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Perfil
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

router.put('/user', verificarToken, async (req, res) => {
  const { name, email, password, photoUrl } = req.body; // Agora inclui photoUrl

  try {
    const dataUpdate: any = {};

    if (name) dataUpdate.name = name;
    if (email) dataUpdate.email = email;
    if (password) dataUpdate.password = await bcrypt.hash(password, 10);
    if (photoUrl) dataUpdate.photoUrl = photoUrl; // Atualizando a foto de perfil

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: dataUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        photoUrl: true, // Retorna a foto de perfil
      },
    });

    res.json({ message: 'Atualizado com sucesso', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

export default router;
