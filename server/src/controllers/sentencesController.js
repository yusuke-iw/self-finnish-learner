const { listSentences } = require('../data/sentencesData');

exports.getSentences = async (req, res) => {
  const { data, source } = await listSentences();
  return res.json({ success: true, data, source });
};
