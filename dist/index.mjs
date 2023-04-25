// node_modules/.pnpm/registry.npmmirror.com+tsup@6.7.0_6qtx7vkbdhwvdm4crzlegk4mvi/node_modules/tsup/assets/esm_shims.js
import { fileURLToPath } from "url";
import path from "path";
var getFilename = () => fileURLToPath(import.meta.url);
var getDirname = () => path.dirname(getFilename());
var __dirname = /* @__PURE__ */ getDirname();

// src/index.ts
import Koa from "koa";
import koaBodyParser from "koa-bodyparser";
import Router from "koa-router";
import KoaStatic from "koa-static";
import path2 from "path";
import { PassThrough } from "stream";

// src/chatgpt/index.ts
import * as dotenv from "dotenv";
import "isomorphic-fetch";
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from "chatgpt";
import { SocksProxyAgent } from "socks-proxy-agent";
import httpsProxyAgent from "https-proxy-agent";
import fetch from "node-fetch";

// src/utils/index.ts
function sendResponse(options) {
  if (options.type === "Success") {
    return Promise.resolve({
      message: options.message ?? null,
      data: options.data ?? null,
      status: options.type
    });
  }
  return Promise.reject({
    message: options.message ?? "Failed",
    data: options.data ?? null,
    status: options.type
  });
}

// src/utils/is.ts
function isNotEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

// src/chatgpt/index.ts
var { HttpsProxyAgent } = httpsProxyAgent;
dotenv.config();
var ErrorCodeMessage = {
  401: "[OpenAI] \u63D0\u4F9B\u9519\u8BEF\u7684API\u5BC6\u94A5 | Incorrect API key provided",
  403: "[OpenAI] \u670D\u52A1\u5668\u62D2\u7EDD\u8BBF\u95EE\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5 | Server refused to access, please try again later",
  502: "[OpenAI] \u9519\u8BEF\u7684\u7F51\u5173 |  Bad Gateway",
  503: "[OpenAI] \u670D\u52A1\u5668\u7E41\u5FD9\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5 | Server is busy, please try again later",
  504: "[OpenAI] \u7F51\u5173\u8D85\u65F6 | Gateway Time-out",
  500: "[OpenAI] \u670D\u52A1\u5668\u7E41\u5FD9\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5 | Internal Server Error"
};
var timeoutMs = !isNaN(+process.env.TIMEOUT_MS) ? +process.env.TIMEOUT_MS : 100 * 1e3;
var disableDebug = process.env.OPENAI_API_DISABLE_DEBUG === "true";
var apiModel;
var model = isNotEmptyString(process.env.OPENAI_API_MODEL) ? process.env.OPENAI_API_MODEL : "gpt-3.5-turbo";
if (!isNotEmptyString(process.env.OPENAI_API_KEY) && !isNotEmptyString(process.env.OPENAI_ACCESS_TOKEN))
  throw new Error("Missing OPENAI_API_KEY or OPENAI_ACCESS_TOKEN environment variable");
var api;
(async () => {
  if (isNotEmptyString(process.env.OPENAI_API_KEY)) {
    const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL;
    const options = {
      apiKey: process.env.OPENAI_API_KEY,
      completionParams: { model },
      debug: !disableDebug
    };
    if (model.toLowerCase().includes("gpt-4")) {
      if (model.toLowerCase().includes("32k")) {
        options.maxModelTokens = 32768;
        options.maxResponseTokens = 8192;
      } else {
        options.maxModelTokens = 8192;
        options.maxResponseTokens = 2048;
      }
    }
    if (isNotEmptyString(OPENAI_API_BASE_URL))
      options.apiBaseUrl = `${OPENAI_API_BASE_URL}/v1`;
    setupProxy(options);
    api = new ChatGPTAPI({ ...options });
    apiModel = "ChatGPTAPI";
  } else {
    const options = {
      accessToken: process.env.OPENAI_ACCESS_TOKEN,
      apiReverseProxyUrl: isNotEmptyString(process.env.API_REVERSE_PROXY) ? process.env.API_REVERSE_PROXY : "https://bypass.churchless.tech/api/conversation",
      model,
      debug: !disableDebug
    };
    setupProxy(options);
    api = new ChatGPTUnofficialProxyAPI({ ...options });
    apiModel = "ChatGPTUnofficialProxyAPI";
  }
})();
async function chatReplyProcess(options) {
  const { message, lastContext, process: process2, systemMessage, temperature, top_p } = options;
  try {
    let options2 = { timeoutMs };
    if (apiModel === "ChatGPTAPI") {
      if (isNotEmptyString(systemMessage))
        options2.systemMessage = systemMessage;
      options2.completionParams = { model, temperature, top_p };
    }
    if (lastContext != null) {
      if (apiModel === "ChatGPTAPI")
        options2.parentMessageId = lastContext.parentMessageId;
      else
        options2 = { ...lastContext };
    }
    const response = await api.sendMessage(message, {
      ...options2,
      onProgress: (partialResponse) => {
        process2?.(partialResponse);
      }
    });
    return sendResponse({ type: "Success", data: response });
  } catch (error) {
    const code = error.statusCode;
    global.console.log(error);
    if (Reflect.has(ErrorCodeMessage, code))
      return sendResponse({ type: "Fail", message: ErrorCodeMessage[code] });
    return sendResponse({ type: "Fail", message: error.message ?? "Please check the back-end console" });
  }
}
async function fetchUsage() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL;
  if (!isNotEmptyString(OPENAI_API_KEY))
    return Promise.resolve("-");
  const API_BASE_URL = isNotEmptyString(OPENAI_API_BASE_URL) ? OPENAI_API_BASE_URL : "https://api.openai.com";
  const [startDate, endDate] = formatDate();
  const urlUsage = `${API_BASE_URL}/v1/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`;
  const headers = {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  };
  const options = {};
  setupProxy(options);
  try {
    const useResponse = await options.fetch(urlUsage, { headers });
    if (!useResponse.ok)
      throw new Error("\u83B7\u53D6\u4F7F\u7528\u91CF\u5931\u8D25");
    const usageData = await useResponse.json();
    const usage = Math.round(usageData.total_usage) / 100;
    return Promise.resolve(usage ? `$${usage}` : "-");
  } catch (error) {
    global.console.log(error);
    return Promise.resolve("-");
  }
}
function formatDate() {
  const today = /* @__PURE__ */ new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const lastDay = new Date(year, month, 0);
  const formattedFirstDay = `${year}-${month.toString().padStart(2, "0")}-01`;
  const formattedLastDay = `${year}-${month.toString().padStart(2, "0")}-${lastDay.getDate().toString().padStart(2, "0")}`;
  return [formattedFirstDay, formattedLastDay];
}
async function chatConfig() {
  const usage = await fetchUsage();
  const reverseProxy = process.env.API_REVERSE_PROXY ?? "-";
  const httpsProxy = (process.env.HTTPS_PROXY || process.env.ALL_PROXY) ?? "-";
  const socksProxy = process.env.SOCKS_PROXY_HOST && process.env.SOCKS_PROXY_PORT ? `${process.env.SOCKS_PROXY_HOST}:${process.env.SOCKS_PROXY_PORT}` : "-";
  return sendResponse({
    type: "Success",
    data: { apiModel, reverseProxy, timeoutMs, socksProxy, httpsProxy, usage }
  });
}
function setupProxy(options) {
  if (isNotEmptyString(process.env.SOCKS_PROXY_HOST) && isNotEmptyString(process.env.SOCKS_PROXY_PORT)) {
    const agent = new SocksProxyAgent({
      hostname: process.env.SOCKS_PROXY_HOST,
      port: process.env.SOCKS_PROXY_PORT,
      userId: isNotEmptyString(process.env.SOCKS_PROXY_USERNAME) ? process.env.SOCKS_PROXY_USERNAME : void 0,
      password: isNotEmptyString(process.env.SOCKS_PROXY_PASSWORD) ? process.env.SOCKS_PROXY_PASSWORD : void 0
    });
    options.fetch = (url, options2) => {
      return fetch(url, { agent, ...options2 });
    };
  } else if (isNotEmptyString(process.env.HTTPS_PROXY) || isNotEmptyString(process.env.ALL_PROXY)) {
    const httpsProxy = process.env.HTTPS_PROXY || process.env.ALL_PROXY;
    if (httpsProxy) {
      const agent = new HttpsProxyAgent(httpsProxy);
      options.fetch = (url, options2) => {
        return fetch(url, { agent, ...options2 });
      };
    }
  } else {
    options.fetch = (url, options2) => {
      return fetch(url, { ...options2 });
    };
  }
}
function currentModel() {
  return apiModel;
}

// src/index.ts
var app = new Koa();
var staticPath = "../static";
app.use(KoaStatic(path2.join(__dirname, staticPath)));
var router = new Router();
router.get("/", async (ctx) => {
  ctx.body = {
    data: "1234"
  };
});
var CLOSE_MARK_MSG = "--dev-zuo[DONE]dev-zuo--";
router.post("/chat-process", async (ctx, next) => {
  ctx.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Transfer-Encoding": "chunked"
  });
  const steamData = new PassThrough();
  ctx.body = steamData;
  try {
    const {
      prompt,
      options = {},
      systemMessage,
      temperature,
      top_p
    } = ctx.request.body;
    let firstChunk = true;
    const res = await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat) => {
        console.log(chat);
        steamData.write(firstChunk ? JSON.stringify(chat) : `
${JSON.stringify(chat)}`);
        if (chat.detail.choices[0].finish_reason === "stop") {
          console.log("\u54CD\u5E94\u5DF2\u7ED3\u675F", chat.text);
          steamData.write(`data:${CLOSE_MARK_MSG}

`);
          steamData.end();
        }
        firstChunk = false;
      },
      systemMessage,
      temperature,
      top_p
    });
  } catch (error) {
    ctx.body = error;
  } finally {
    next();
  }
});
router.post("/config", async (ctx) => {
  try {
    const response = await chatConfig();
    ctx.body = response;
  } catch (error) {
    ctx.body = error;
  }
});
router.post("/session", async (ctx) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY);
    ctx.body = {
      status: "Success",
      message: "",
      data: { auth: hasAuth, model: currentModel() }
    };
  } catch (error) {
    ctx.body = { status: "Fail", message: error.message, data: null };
  }
});
router.post("/verify", async (ctx, next) => {
  try {
    const { token } = ctx.request.body;
    if (!token)
      throw new Error("Secret key is empty");
    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error("\u5BC6\u94A5\u65E0\u6548 | Secret key is invalid");
    ctx.body = {
      status: "Success",
      message: "Verify successfully",
      data: null
    };
  } catch (error) {
    ctx.body = { status: "Fail", message: error.message, data: null };
  }
});
var home = new Router();
home.get("/test", async (ctx) => {
  const res = ctx.res;
  ctx.status = 200;
  ctx.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Transfer-Encoding": "chunked"
  });
  res.write(`start<br>`);
  return new Promise((resolve) => {
    let i = 0, total = 5;
    while (i <= total) {
      (function(i2) {
        setTimeout(() => {
          if (i2 === total) {
            resolve();
            res.end();
          } else {
            res.write(`${i2}<br>`);
          }
        }, i2 * 1e3);
      })(i);
      i++;
    }
  });
});
var rootRouter = new Router();
rootRouter.use("/home", home.routes(), home.allowedMethods());
rootRouter.use("/api", router.routes(), router.allowedMethods());
app.use(koaBodyParser());
app.use(rootRouter.routes()).use(rootRouter.allowedMethods());
app.listen(process.env.PORT || 9020, () => {
  console.log("\u542F\u52A8\u4E86");
});
//# sourceMappingURL=index.mjs.map