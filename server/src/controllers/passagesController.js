const { listPassages, findPassageById } = require('../data/passagesData');

exports.getPassages = async (req, res) => {
  const { data, source } = await listPassages();
  return res.json({ success: true, data, source });
};

exports.getPassageById = async (req, res) => {
  const found = await findPassageById(req.params.id);
  if (!found) {
    return res.status(404).json({ success: false, error: 'Reading passage not found' });
  }
  return res.json({ success: true, data: found.data, source: found.source });
};
