// src/index.ts
import express from "express";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, streamToResponse } from "ai";
var app = express();
var router = express.Router();
var runtime = "edge";
var config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
app.use(express.static("public"));
app.use(express.json());
app.all("*", (_, res, next) => {
  next();
});
var openai = new OpenAIApi(config);
router.post("/chat-process", [], async (req, res) => {
  res.setHeader("Content-type", "application/octet-stream");
  const aiResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k-0613",
    stream: true,
    messages: [{ role: "user", content: "What is love?" }]
  });
  const stream = OpenAIStream(aiResponse);
  streamToResponse(stream, res);
});
export {
  runtime
};
//# sourceMappingURL=index.mjs.map