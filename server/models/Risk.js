import mongoose from 'mongoose';

const severityLevels = ['low', 'medium', 'high', 'critical'];

const RiskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    required: [true, 'Description is required'],
    minlength: [10, 'Description too short']
  },
  impact: {
    type: Number,
    min: [1, 'Impact must be at least 1'],
    max: [5, 'Impact cannot exceed 5'],
    required: true
  },
  probability: {
    type: Number,
    min: [1, 'Probability must be at least 1'],
    max: [5, 'Probability cannot exceed 5'],
    required: true
  },
  severity: {
    type: String,
    enum: severityLevels,
    default: 'low'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mitigationPlan: {
    type: String,
    trim: true
  },
  targetDate: {
    type: Date,
    required: false,
    validate: {
      validator: function(value) {
        return !value || value > Date.now();
      },
      message: 'Target date must be in the future'
    },
  },
  status: {
    type: String,
    enum: ['open', 'mitigated', 'accepted'],
    default: 'open'
  }
}, { timestamps: true });

// Calculate severity before saving
RiskSchema.pre('save', function(next) {
  const riskScore = this.impact * this.probability;

  if (riskScore <= 4) this.severity = 'low';
  else if (riskScore <= 10) this.severity = 'medium';
  else if (riskScore <= 20) this.severity = 'high';
  else this.severity = 'critical';

  next();
});

export default mongoose.model('Risk', RiskSchema);