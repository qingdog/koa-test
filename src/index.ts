import express from "express";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, streamToResponse } from "ai";
const app = express();
const router = express.Router();
export const runtime = "edge";
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
app.use(express.static("public"));
app.use(express.json());

app.all("*", (_, res, next) => {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "authorization, Content-Type");
  // res.header("Access-Control-Allow-Methods", "*");
  next();
});
const openai = new OpenAIApi(config);
router.post("/chat-process", [], async (req, res) => {
  res.setHeader("Content-type", "application/octet-stream");

  const aiResponse = await openai.createChatCompletion({
    // model: "gpt-3.5-turbo-16k-0613",
    model: "gpt-4-0613",
    stream: true,
    messages: [{ role: "user", content: "What is love?" }],
  });

  // Transform the response into a readable stream
  const stream = OpenAIStream(aiResponse);

  // Pipe the stream to the response
  streamToResponse(stream, res);
});
// const server = createServer(async (req, res) => {
//   const aiResponse = await openai.createChatCompletion({
//     model: 'gpt-3.5-turbo-16k-0613',
//     stream: true,
//     messages: [{ role: 'user', content: 'What is love?' }]
//   })
//
//   // Transform the response into a readable stream
//   const stream = OpenAIStream(aiResponse)
//
//   // Pipe the stream to the response
//   streamToResponse(stream, res)
// })
//
// server.listen(3000)
app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
