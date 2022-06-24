const https = require("https");
const fs = require("fs");

function getRunUrl({ repository, runId }) {
  return `https://github.com/${repository}/actions/runs/${runId}`;
}

function getColor(type) {
  if (type === "failure") {
    return "#FF0000";
  }
  return "#1a7f37";
}

function getEvent(path) {
  console.log({ path });
  const content = fs.readFileSync(path, "utf8");
  console.log({ content });
  return JSON.parse(content);
}

function main({
  message,
  token,
  channel,
  actor,
  repository,
  runId,
  type,
  eventPath,
}) {
  const options = {
    hostname: "slack.com",
    path: `/api/chat.postMessage`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const runUrl = getRunUrl({
    repository,
    runId,
  });

  const event = getEvent(eventPath);

  const data = JSON.stringify({
    channel,
    attachments: [
      {
        fallback: message,
        color: getColor(type),
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `{message}\n<${runUrl}|${event.head_commit.message}>`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Triggered by *${actor}*`,
              },
            ],
          },
        ],
      },
    ],
  });

  const req = https.request(options, (res) => {
    res.on("data", (d) => {
      process.stdout.write(d);
    });
    res.on("end", () => {
      process.exit(0);
    });
  });

  req.on("error", (e) => {
    console.error(e);
    process.exit(1);
  });

  req.write(data);

  req.end();
}

main({
  token: process.env.INPUT_TOKEN,
  channel: process.env.INPUT_CHANNEL,
  type: process.env.INPUT_TYPE,
  message: process.env.INPUT_MESSAGE,
  actor: process.env.GITHUB_ACTOR,
  repository: process.env.GITHUB_ACTION_REPOSITORY,
  runId: process.env.GITHUB_RUN_ID,
  eventPath: process.env.GITHUB_EVENT_PATH,
});
