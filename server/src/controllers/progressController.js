const progressData = require('../data/progressData');

const USER_ID_REGEX = /^[A-Za-z0-9_-]{1,40}$/;
const isValidUserId = (userId) => typeof userId === 'string' && USER_ID_REGEX.test(userId);

exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.query.userId === undefined ? 'default_user' : req.query.userId;

    if (!isValidUserId(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId'
      });
    }

    const { data, source } = await progressData.getProgress(userId);
    res.json({ success: true, data, source });
  } catch (err) {
    next(err);
  }
};

exports.saveProgress = async (req, res, next) => {
  try {
    const {
      userId = 'default_user',
      learningPath,
      passagesProgress,
      passageAnswers,
      mistakes,
      sentenceMistakes,
      wordBook,
      reviewSchedule,
      studyStats,
      settings
    } = req.body;

    if (!isValidUserId(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId'
      });
    }

    const update = {
      userId,
      ...(learningPath !== undefined && { learningPath }),
      ...(passagesProgress !== undefined && { passagesProgress }),
      ...(passageAnswers !== undefined && { passageAnswers }),
      ...(mistakes !== undefined && { mistakes }),
      ...(sentenceMistakes !== undefined && { sentenceMistakes }),
      ...(wordBook !== undefined && { wordBook }),
      ...(reviewSchedule !== undefined && { reviewSchedule }),
      ...(studyStats !== undefined && { studyStats }),
      ...(settings !== undefined && { settings }),
      updatedAt: new Date()
    };

    const { data, source } = await progressData.saveProgress(userId, update);
    res.json({ success: true, data, source });
  } catch (err) {
    next(err);
  }
};
