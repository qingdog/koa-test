// src/index.ts
import { createServer } from "http";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, streamToResponse } from "ai";
const runtime = "edge";
const config = {
  supportsResponseStreaming: true
};
const OpenAIConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(OpenAIConfig);
const server = createServer(async (req, res) => {
  const aiResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k-0613",
    stream: true,
    messages: [{ role: "user", content: "What is love?" }]
  });
  const stream = OpenAIStream(aiResponse);
  streamToResponse(stream, res);
});
server.listen(3e3);
export {
  config,
  runtime
};
//# sourceMappingURL=index.mjs.map
