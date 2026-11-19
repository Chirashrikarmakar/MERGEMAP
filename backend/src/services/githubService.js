
const axios = require("axios");

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  timeout: 15000,
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

if (process.env.GITHUB_TOKEN) {
  githubApi.defaults.headers.common.Authorization =
    `Bearer ${process.env.GITHUB_TOKEN}`;
}

const fetchPullRequest = async (owner, repo, prNumber) => {
  const response = await githubApi.get(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${prNumber}`
  );

  return response.data;
};

const fetchPullRequestFiles = async (owner, repo, prNumber) => {
  const files = [];

  for (let page = 1; page <= 5; page++) {
    const response = await githubApi.get(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${prNumber}/files`,
      {
        params: {
          per_page: 100,
          page,
        },
      }
    );

    files.push(...response.data);

    if (response.data.length < 100) {
      break;
    }
  }

  return files;
};

module.exports = {
  fetchPullRequest,
  fetchPullRequestFiles,
};
