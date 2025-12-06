const gitlabService = require("../services/gitlabService");
const axios = require("axios");
const logger = require("../utils/logger");

const AI_ANALYZER_URL = process.env.AI_ANALYZER_URL;

exports.handleWebhook = async (req, res) => {
  try {
    const eventType = req.headers["x-gitlab-event"];

    if (eventType !== "Merge Request Hook") {
      return res.status(200).send("Ignored: Not MR event");
    }

    const payload = req.body;
    const mr = payload.object_attributes;

    if (!mr || !mr.iid) {
      return res.status(400).send("Invalid MR payload");
    }

    // Process only merged OR updated MRs
    if (!["merge", "update"].includes(mr.action)) {
      return res.status(200).send(`Ignored MR action: ${mr.action}`);
    }

    const project = payload.project;
    const projectId = project.id;
    const projectWebUrl = project.web_url;

    logger.info(`Processing MR !${mr.iid} for project ${project.path_with_namespace}`);

    // 1️⃣ Fetch MR changes
    const mrChanges = await gitlabService.fetchMRChanges(
      projectWebUrl,
      projectId,
      mr.iid
    );

    // 2️⃣ Build payload for AI Analyzer
    const analyzerPayload = {
      mr_id: mr.id,
      mr_iid: mr.iid,
      title: mr.title,
      description: mr.description,
      state: mr.state,
      action: mr.action,
      source_branch: mr.source_branch,
      target_branch: mr.target_branch,
      last_commit_sha: mr.last_commit?.id,
      project: {
        id: projectId,
        name: project.name,
        path: project.path_with_namespace,
        web_url: projectWebUrl,
      },
      author: {
        name: mr.last_commit?.author?.name || payload.user?.name,
        email: mr.last_commit?.author?.email,
      },
      changes: mrChanges.changes || [],
      web_url: mr.url,
    };

    console.log("📦 Payload to AI Analyzer:", JSON.stringify(message, null, 2));

    // 3️⃣ Fire-and-forget call to AI Analyzer
    axios.post(`${AI_ANALYZER_URL}/analyze/mr`, analyzerPayload, {
      timeout: 10000,
    }).catch(err => {
      logger.error(`AI Analyzer call failed: ${err.message}`);
    });

    return res.status(200).send("MR event accepted");
  } catch (err) {
    logger.error(`Webhook processing failed: ${err.message}`);
    return res.status(500).send("Internal error");
  }
};

