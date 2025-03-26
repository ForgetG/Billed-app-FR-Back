const { User } = require('../models');
const { compare } = require('../services/password');
const jwt = require('../services/jwt');

const login = async (req, res) => {
  const { password, email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).send({ message: 'Cannot authenticate user' });
    if (await compare(password, user.password)) {
      await User.update({ status: 'connected' }, { where: { id: user.id } });
      return res.status(201).send({
        jwt: jwt.encrypt({
          userId: user.key,
          email: user.email,
        }),
      });
    }
    return res.status(400).send({ message: 'Cannot authenticate user' });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, type } = req.body;
    const hashedPassword = await hash(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      type,
      status: 'disconnected',
    });
    return res.status(201).json({
      name: user.name,
      email: user.email,
      type: user.type,
      status: user.status,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const loggout = async (req, res) => {
  const { user } = req;
  try {
    await User.update({ status: 'disconnected' }, { where: { id: user.id } });
    return res.status(200).send({ message: 'user disconnected' });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

module.exports = {
  login,
  register,
  loggout,
};
