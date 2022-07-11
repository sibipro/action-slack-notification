const https = require("https");

function getRunUrl({ repository, runId }) {
  return `https://github.com/${repository}/actions/runs/${runId}`;
}

function getColor(type) {
  if (type === "failure") {
    return "#FF0000";
  }
  return "#1a7f37";
}

function main({
  message,
  token,
  channel,
  actor,
  repository,
  runId,
  runAttempt,
  type,
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
              text: `${message}\n<${runUrl}|Run #${runId}-${runAttempt}->`,
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
  repository: process.env.GITHUB_REPOSITORY,
  runId: process.env.GITHUB_RUN_ID,
  runAttempt: process.env.GITHUB_RUN_ATTEMPT,
});
