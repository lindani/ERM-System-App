import Risk from '../models/Risk.js';

export const createRisk = async (req, res) => {
  try {
    const risk = new Risk({
      ...req.body,
      owner: req.user._id
    });

    await risk.save();

    res.status(201).json({
      success: true,
      data: risk
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

export const getRisks = async (req, res) => {
  try {
    const risks = await Risk.find().populate('owner', 'email role');

    res.json({
      success: true,
      count: risks.length,
      data: risks
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};