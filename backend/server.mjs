import http from "node:http";
import { analyzePayload } from "./analyze.mjs";

const PORT = Number(process.env.PORT ?? 5050);

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  });
  res.end(JSON.stringify(body));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "POST" || req.url !== "/analyze") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  try {
    const rawBody = await readRequestBody(req);
    const payload = rawBody ? JSON.parse(rawBody) : {};
    const result = analyzePayload(payload);
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : "Unable to analyze image.",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Cocoa backend listening on http://localhost:${PORT}`);
});
