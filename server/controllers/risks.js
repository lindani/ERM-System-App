import Risk from '../models/Risk.js';
import { checkDuplicateRisk, getEmbedding } from '../utils/riskDuplicateChecker.js';

export const createRisk = async (req, res) => {
  const { description } = req.body;

  try {
    const fetchedExistingRisks = await Risk.find({}, 'description embedding').lean();
    const preparedExistingRisks = fetchedExistingRisks
      .filter(risk => risk && typeof risk.description === 'string' && risk.description.trim().length > 0)
      .map(risk => ({
        id: risk._id.toString(), // Convert MongoDB's ObjectId to a string
        description: risk.description,
        embedding: risk.embedding || null // Make sure to pass the embedding if it exists!
      }));

    console.log(`Fetched and prepared ${preparedExistingRisks.length} risks.`);

    const { isDuplicate, reason, matchedRisk } = await checkDuplicateRisk(description, preparedExistingRisks);

    if (isDuplicate) {
      console.log('Duplicate risk detected:', reason);
      return res.status(409).json({
        message: 'This risk appears to be similar to an existing one. Please review.',
        details: reason,
        matchedRisk: matchedRisk
      });
    }
    const newRiskEmbedding = await getEmbedding(description);

    if (!newRiskEmbedding) {
      console.warn("Failed to generate embedding for new risk. Saving without embedding. Future duplicate checks for this risk might be less effective.");
    }

    const newRisk = new Risk({ ...req.body, owner: req.user._id, embedding: newRiskEmbedding });
    await newRisk.save();

    res.status(201).json({ success: true, data: newRisk });

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