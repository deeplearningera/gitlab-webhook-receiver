const axios = require("axios");

const gitlabApi = axios.create({
  baseURL: "https://gitlab.payu.in/api/v4",
  headers: {
    "PRIVATE-TOKEN": process.env.GITLAB_TOKEN,
  },
});

exports.fetchMRChanges = async (projectId, mrIid) => {
  try {
    const response = await gitlabApi.get(
      `/projects/${projectId}/merge_requests/${mrIid}/changes`
    );
    return response.data.changes;
  } catch (err) {
    console.error("❌ GitLab API error:", err.response?.data || err);
    return [];
  }
};

