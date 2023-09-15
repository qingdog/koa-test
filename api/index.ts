import {createServer} from 'http'
import {Configuration, OpenAIApi} from 'openai-edge'
import {OpenAIStream, streamToResponse} from 'ai'
import * as fs from "fs";
import * as path from "path";

const dotenv = require('dotenv');
dotenv.config();
const OpenAIConfig = new Configuration({
    basePath: process.env.OPENAI_BASE_PATH || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(OpenAIConfig)
const runtime = "edge";
export const config = {
    supportsResponseStreaming: true
};

const server = createServer(async (req, res) => {
    if (req.url === '/v1/chat/completions') {
        const aiResponse = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            stream: true,
            messages: [{ role: 'user', content: 'What is love?' }]
        })

        // Transform the response into a readable stream
        const stream = OpenAIStream(aiResponse)

        // Pipe the stream to the response
        streamToResponse(stream, res)
    } else {
        const uri = req.url === '/' ? '/index.html': req.url;
        fs.readFile(path.join(__dirname, '../public' + uri), (err, data) => {
            res.setHeader('Content-Type', 'text/html;charset=utf-8')
            res.end(data?.toString())
        })

    }
})

server.listen(3000)
