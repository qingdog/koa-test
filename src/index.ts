import Koa from "koa";
import koaBodyParser from "koa-bodyparser";
import Router from "koa-router";
import KoaStatic from "koa-static";
import path from "path";
import { chatConfig, currentModel } from "./chatgpt";
import { isNotEmptyString } from "./utils/is";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse, streamToResponse } from "ai";

const app = new Koa();
const staticPath = "../static";
// Set the runtime to edge for best performance
export const runtime = "edge";
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);
app.use(KoaStatic(path.join(__dirname, staticPath)));
const router = new Router();
router.get("/", async (ctx) => {
  ctx.body = {
    data: "1234",
  };
});
// SSE 请求，不返回标准 JSON，而是 UTF-8 文本
router.post("/chat-process", async (ctx, next) => {
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    stream: true,
    messages: [{ role: 'user', content: 'What is love?' }],
  })
  const stream = OpenAIStream(response)

  ctx.body = new StreamingTextResponse(stream, {
    headers: { 'X-RATE-LIMIT': 'lol' },
  })
});
// //
router.post("/config", async (ctx) => {
  try {
    const response = await chatConfig();
    // res.send(response)
    ctx.body = response;
  } catch (error) {
    // res.send(error)
    ctx.body = error;
  }
});

router.post("/session", async (ctx) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY);
    // res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
    ctx.body = {
      status: "Success",
      message: "",
      data: { auth: hasAuth, model: currentModel() },
    };
  } catch (error) {
    // res.send({ status: 'Fail', message: error.message, data: null })
    ctx.body = { status: "Fail", message: error.message, data: null };
  }
});

router.post("/verify", async (ctx, next) => {
  try {
    const { token } = ctx.request.body as { token: string };
    if (!token) throw new Error("Secret key is empty");

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error("密钥无效 | Secret key is invalid");

    // res.send({ status: 'Success', message: 'Verify successfully', data: null })
    ctx.body = {
      status: "Success",
      message: "Verify successfully",
      data: null,
    };
  } catch (error) {
    // res.send({ status: 'Fail', message: error.message, data: null })
    ctx.body = { status: "Fail", message: error.message, data: null };
  }
});
const home = new Router();
home.get("/test", async (ctx) => {
  const res = ctx.res;
  ctx.status = 200;
  ctx.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Transfer-Encoding": "chunked",
  });
  res.write(`start<br>`);
  return new Promise<void>((resolve) => {
    let i = 0,
      total = 5;
    while (i <= total) {
      (function (i) {
        setTimeout(() => {
          if (i === total) {
            resolve();
            res.end();
          } else {
            res.write(`${i}<br>`);
          }
        }, i * 1000);
      })(i);
      i++;
    }
  });
});
const rootRouter = new Router();
// // 装载所有子路由
// let router = new Router()
rootRouter.use("/home", home.routes(), home.allowedMethods());
rootRouter.use("/api", router.routes(), router.allowedMethods());
app.use(koaBodyParser());
// router.use('/api', router.routes(), router.allowedMethods())
// 加载路由中间件
app.use(rootRouter.routes()).use(rootRouter.allowedMethods());
app.listen(process.env.PORT || 9020, () => {
  console.log("启动了");
});
