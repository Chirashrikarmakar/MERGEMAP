
const calculateRisk = (pr, files) => {
  let score = 0;
  const factors = [];
  const checklist = [];

  const addRisk = (points, factor) => {
    score += points;
    factors.push(factor);
  };

  const sensitivePattern =
    /(^|\/)(auth|authentication|authorization|security|permissions?|middleware|config|secrets?)(\/|\.|$)/i;

  const databasePattern =
    /(migration|schema|database|models?\/|\.sql$)/i;

  const infrastructurePattern =
    /(^|\/)(\.github\/workflows|dockerfile|docker-compose|terraform|k8s|kubernetes)/i;

  const dependencyPattern =
    /(^|\/)(package(-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|requirements\.txt|pom\.xml|build\.gradle)$/i;

  const deletedFiles = files.filter(
    (file) => file.status === "removed"
  );

  const sensitiveFiles = files.filter(
    (file) => sensitivePattern.test(file.filename)
  );

  const databaseFiles = files.filter(
    (file) => databasePattern.test(file.filename)
  );

  const infrastructureFiles = files.filter(
    (file) => infrastructurePattern.test(file.filename)
  );

  const dependencyFiles = files.filter(
    (file) => dependencyPattern.test(file.filename)
  );

  const totalChanges = pr.additions + pr.deletions;

  if (sensitiveFiles.length > 0) {
    addRisk(30, "Sensitive authentication, security or configuration files modified.");
    checklist.push("Review authentication, authorization and security changes.");
  }

  if (databaseFiles.length > 0) {
    addRisk(25, "Database schema or migration files modified.");
    checklist.push("Verify database migrations and backward compatibility.");
  }

  if (infrastructureFiles.length > 0) {
    addRisk(20, "Infrastructure or deployment configuration modified.");
    checklist.push("Check deployment configuration and environment settings.");
  }

  if (dependencyFiles.length > 0) {
    addRisk(15, "Project dependencies modified.");
    checklist.push("Review dependency versions and potential vulnerabilities.");
  }

  if (deletedFiles.length > 0) {
    addRisk(15, "One or more files deleted.");
    checklist.push("Check whether deleted files are still required.");
  }

  if (totalChanges >= 500) {
    addRisk(20, "Very large pull request with at least 500 changed lines.");
    checklist.push("Break down and carefully review the large changeset.");
  } else if (totalChanges >= 200) {
    addRisk(10, "Large pull request with at least 200 changed lines.");
    checklist.push("Review the scope of the large changeset.");
  }

  const hasCodeChanges = files.some((file) =>
    /\.(js|jsx|ts|tsx|py|java|cpp|c|go|rs)$/i.test(file.filename)
  );

  const hasTestChanges = files.some((file) =>
    /(test|tests|spec|specs|__tests__)/i.test(file.filename)
  );

  if (hasCodeChanges && !hasTestChanges) {
    addRisk(10, "Code changed without corresponding test-file changes.");
    checklist.push("Check whether appropriate automated tests are needed.");
  }

  if (factors.length === 0) {
    factors.push("No predefined high-risk modification patterns detected.");
  }

  if (checklist.length === 0) {
    checklist.push("Review the overall implementation and run relevant tests.");
    checklist.push("Check for unintended side effects.");
  }

  score = Math.min(score, 100);

  let riskLevel = "LOW";

  if (score >= 75) {
    riskLevel = "CRITICAL";
  } else if (score >= 50) {
    riskLevel = "HIGH";
  } else if (score >= 25) {
    riskLevel = "MEDIUM";
  }

  return {
    riskScore: score,
    riskLevel,
    riskFactors: factors,
    checklist,
  };
};

module.exports = calculateRisk;
