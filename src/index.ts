import Koa from "koa";
import koaBodyParser from "koa-bodyparser";
import Router from "koa-router";
import KoaStatic from "koa-static";
import path from "path";
import { fileURLToPath } from "url";
import type { RequestProps } from "./types";
import type { ChatMessage } from "chatgpt";
import {  PassThrough } from "stream";
import { chatConfig, chatReplyProcess, currentModel } from "./chatgpt";
import { isNotEmptyString } from "./utils/is";

const app = new Koa();
const staticPath = "../static";
// console.log(__dirname)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
app.use(KoaStatic(path.join(__dirname, staticPath)));
const router = new Router();
router.get("/", async (ctx) => {
  ctx.body = {
    data: "1234",
  };
});
router.post("/chat-process", async (ctx, next) => {
  ctx.set('Content-type', 'application/octet-stream')
  const passThrough = new PassThrough();
  try {
    const {
      prompt,
      options = {},
      systemMessage,
      temperature,
      top_p,
    } = ctx.request.body as RequestProps;
    let firstChunk = true;
    const res = ctx.res
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        // res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        // ctx.body = passThrough;
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        // stream.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        // ctx.body = firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`
        // passThrough.write(
        //   firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`
        // );
        firstChunk = false;
      },
      systemMessage,
      temperature,
      top_p,
    });
  } catch (error) {
    // res.write(JSON.stringify(error))
    ctx.body = error;
  } finally {
    // ctx.end()
    next();
  }
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
  res.setHeader("Content-Type", "text/html");
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('X-Accel-Buffering', 'no')
  res.write(`start<br>`);
  return new Promise<void>(resolve => {
    let i = 0,
      total = 5;
    while (i <= total) {
      (function(i) {
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
