
const Analysis = require("../models/Analysis");

const parseGithubPrUrl = require("../utils/parseGithubPrUrl");

const {
  fetchPullRequest,
  fetchPullRequestFiles,
} = require("../services/githubService");

const calculateRisk = require("../services/riskEngine");

const createAnalysis = async (req, res, next) => {
  try {
    const { prUrl } = req.body;

    if (!prUrl || typeof prUrl !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide a GitHub PR URL.",
      });
    }

    const { owner, repo, prNumber } = parseGithubPrUrl(prUrl);

    const pr = await fetchPullRequest(owner, repo, prNumber);

    const files = await fetchPullRequestFiles(
      owner,
      repo,
      prNumber
    );

    const risk = calculateRisk(pr, files);

    const analysis = await Analysis.create({
      prUrl,
      owner,
      repo,
      prNumber,

      title: pr.title,
      description: pr.body,
      author: pr.user.login,
      state: pr.state,

      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,

      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,

      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      riskFactors: risk.riskFactors,
      checklist: risk.checklist,

      filesSummary: files.map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
      })),
    });

    return res.status(201).json({
      success: true,
      message: "Pull request analyzed successfully.",
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

const getAnalyses = async (req, res, next) => {
  try {
    const analyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      count: analyses.length,
      data: analyses,
    });
  } catch (error) {
    next(error);
  }
};

const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
};
