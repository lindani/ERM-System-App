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

export const updateRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Explicit role validation
    if (req.user.role === 'viewer') {
      return res.status(403).json({
        success: false,
        error: 'Viewers cannot update risks'
      });
    }

    const filter = { _id: id };

    if (req.user.role === 'risk_manager') {
      filter.owner = req.user._id;
    }

    const risk = await Risk.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'email role');

    if (!risk) {
      return res.status(404).json({
        success: false,
        error: req.user.role === 'admin'
          ? 'Risk not found'
          : 'Risk not found or not owned by you'
      });
    }

    res.json({
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

export const deleteRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = { _id: id };
    if (req.user.role === 'risk_manager') {
      filter.owner = req.user._id;
    }

    const risk = await Risk.findOneAndDelete(filter);

    if (!risk) {
      return res.status(404).json({
        success: false,
        error: req.user.role === 'admin'
          ? 'Risk not found'
          : 'Risk not found or not owned by you'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};