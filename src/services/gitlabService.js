const axios = require("axios");

const gitlabApi = axios.create({
  baseURL: "https://gitlab.in/api/v4",
  headers: {
    "PRIVATE-TOKEN": process.env.GITLAB_TOKEN,
  },
});

exports.fetchMRChanges = async (projectId, mrIid) => {
  try {
    console.log("Fetching gitlab diff");
    const response = await gitlabApi.get(
      `/projects/${projectId}/merge_requests/${mrIid}/changes`
    );
    console.log("Fetched gitlab diff");
    return response.data.changes;
  } catch (err) {
    console.error("❌ GitLab API error:", err.response?.data || err);
    return [];
  }
};

