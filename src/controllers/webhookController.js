const gitlabService = require("../services/gitlabService");
const queueService = require("../services/queueService");

exports.handleWebhook = async (req, res) => {
  try {
    const gitlabToken = req.headers["x-gitlab-token"];
    if (gitlabToken !== process.env.WEBHOOK_SECRET) {
      return res.status(403).json({ error: "Invalid Webhook Token" });
    }

    const event = req.body;

    // We only care about merged merge requests into master
    if (
      event.object_kind === "merge_request" &&
      event.object_attributes.state === "merged" &&
      event.object_attributes.target_branch === "main"
    ) {
      console.log("🔔 MR merged! Fetching diff...");

      const projectId = event.project.id;
      const mrIid = event.object_attributes.iid;

      // Fetch full diff
      const changes = await gitlabService.fetchMRChanges(projectId, mrIid);

      const message = {
        mr_id: mrIid,
        project_id: projectId,
        title: event.object_attributes.title,
        description: event.object_attributes.description,
        merged_by: event.user.name,
        merged_at: event.object_attributes.updated_at,
        diff: changes,
        repo: event.project.path_with_namespace,
      };

      await queueService.sendToQueue(message);
    }

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("❌ Error in webhook:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

