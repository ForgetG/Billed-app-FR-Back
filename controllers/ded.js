const { Ded } = require('../models');

const getFileURL = (filePath) => `http://localhost:5678/${filePath}`;

const isPicture = (mimeType) => ['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType);

const create = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const {
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      amount,
    } = req.body;
    const { file } = req;
    const ded = await Ded.create({
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      fileName: isPicture(file.mimetype) ? file.originalname : 'null',
      filePath: isPicture(file.mimetype) ? file.path : 'null',
      amount,
    });
    return res.status(201).json(ded);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const get = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const ded = user.type === 'Admin'
      ? await Ded.findOne({ where: { key: req.params.id } })
      : await Ded.findOne({
        where: { key: req.params.id, email: user.email },
      });
    if (!ded) return res.status(401).send({ message: 'unauthorized action' });
    const {
      key: id,
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      fileName,
      amount,
      filePath,
    } = ded;
    return res.json({
      id,
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      fileName,
      fileUrl: getFileURL(filePath),
      amount,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const list = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });

  try {
    console.log('User Type:', user.type); // Debugging
    const deds = user.type === 'Admin'
      ? await Ded.findAll() // Admin sees all records
      : await Ded.findAll({ where: { email: user.email } }); // User sees only their records

    return res.json(
      deds.map(
        ({
          key: id,
          name,
          type,
          email,
          date,
          vat,
          pct,
          commentary,
          status,
          commentAdmin,
          fileName,
          amount,
          filePath,
        }) => ({
          id,
          name,
          type,
          email,
          date,
          vat,
          pct,
          commentary,
          status,
          commentAdmin,
          fileName,
          amount,
          fileUrl: getFileURL(filePath),
        }),
      ),
    );
  } catch (err) {
    console.error('Error fetching Deds:', err); // Debugging
    return res.status(500).send({ message: err.message });
  }
};

const update = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const {
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      amount,
    } = req.body;
    const toUpdate = {
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      amount,
    };
    const ded = user.type === 'Admin'
      ? await Ded.findOne({ where: { key: req.params.id } })
      : await Ded.findOne({
        where: { key: req.params.id, email: user.email },
      });
    if (!ded) return res.status(401).send({ message: 'unauthorized action' });
    const updated = await ded.update(toUpdate);
    return res.json(updated);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
const remove = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const ded = user.type === 'Admin'
      ? await Ded.findOne({ where: { key: req.params.id } })
      : await Ded.findOne({
        where: { key: req.params.id, email: user.email },
      });
    if (!ded) return res.status(401).send({ message: 'unauthorized action' });
    await Ded.destroy({ where: { id: ded.id } });
    return res.send('Ded removed');
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

module.exports = {
  list,
  get,
  create,
  update,
  remove,
};
