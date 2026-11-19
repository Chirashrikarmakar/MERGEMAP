
const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    prUrl: {
      type: String,
      required: true,
    },

    owner: {
      type: String,
      required: true,
    },

    repo: {
      type: String,
      required: true,
    },

    prNumber: {
      type: Number,
      required: true,
    },

    title: String,
    description: String,
    author: String,
    state: String,

    baseBranch: String,
    headBranch: String,

    additions: {
      type: Number,
      default: 0,
    },

    deletions: {
      type: Number,
      default: 0,
    },

    changedFiles: {
      type: Number,
      default: 0,
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
    },

    riskFactors: [String],

    checklist: [String],

    filesSummary: [
      {
        filename: String,
        status: String,
        additions: Number,
        deletions: Number,
        changes: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analysis", analysisSchema);
