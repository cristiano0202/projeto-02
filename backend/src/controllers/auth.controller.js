const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');

const VALID_USER_TYPES = ['residencial', 'comercial', 'pequeno_empreendedor'];

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    userType: user.user_type,
    createdAt: user.created_at
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: 'Nome, e-mail, senha e tipo de usuário são obrigatórios' });
    }

    if (!VALID_USER_TYPES.includes(userType)) {
      return res.status(400).json({ message: 'Tipo de usuário inválido' });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: 'A senha deve ter no mínimo 8 caracteres' });
    }

    const emailNormalized = String(email).trim().toLowerCase();
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [emailNormalized]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [insertResult] = await db.query(
      `INSERT INTO users (name, email, password_hash, user_type)
       VALUES (?, ?, ?, ?)`,
      [String(name).trim(), emailNormalized, passwordHash, userType]
    );

    const [users] = await db.query(
      'SELECT id, name, email, user_type, created_at FROM users WHERE id = ?',
      [insertResult.insertId]
    );

    const user = users[0];
    const token = createToken(user);

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
    }

    const emailNormalized = String(email).trim().toLowerCase();

    const [users] = await db.query(
      'SELECT id, name, email, password_hash, user_type, created_at FROM users WHERE email = ?',
      [emailNormalized]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }

    const token = createToken(user);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

module.exports = { register, login, me };
