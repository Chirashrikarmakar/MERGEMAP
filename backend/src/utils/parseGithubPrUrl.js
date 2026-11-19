
const parseGithubPrUrl = (input) => {
  let url;

  try {
    url = new URL(input);
  } catch {
    throw new Error("Invalid URL.");
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    url.username ||
    url.password
  ) {
    throw new Error("Please provide a valid public GitHub PR URL.");
  }

  const parts = url.pathname.split("/").filter(Boolean);

  if (
    parts.length !== 4 ||
    parts[2] !== "pull" ||
    !/^\d+$/.test(parts[3])
  ) {
    throw new Error("URL must follow: https://github.com/owner/repo/pull/123");
  }

  return {
    owner: parts[0],
    repo: parts[1],
    prNumber: Number(parts[3]),
  };
};

module.exports = parseGithubPrUrl;
