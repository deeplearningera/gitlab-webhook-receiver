const axios = require("axios");

function getGitLabApiClient(projectWebUrl) {
  const origin = new URL(projectWebUrl).origin; // https://gitlab.com
  return axios.create({
    baseURL: `${origin}/api/v4`,
    headers: {
      "PRIVATE-TOKEN": process.env.GITLAB_TOKEN,
    },
    timeout: 15000,
  });
}

exports.fetchMRChanges = async (projectWebUrl, projectId, mrIid) => {
  try {
    const client = getGitLabApiClient(projectWebUrl);
    const res = await client.get(
      `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/changes`
    );
    return res.data;
  } catch (err) {
    console.error(
      "❌ GitLab API error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

