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

// src/chatgpt/index.ts
import * as dotenv from "dotenv";
import "isomorphic-fetch";
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from "chatgpt";
import { SocksProxyAgent } from "socks-proxy-agent";
import httpsProxyAgent from "https-proxy-agent";
import fetch2 from "node-fetch";

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
      return fetch2(url, { agent, ...options2 });
    };
  } else if (isNotEmptyString(process.env.HTTPS_PROXY) || isNotEmptyString(process.env.ALL_PROXY)) {
    const httpsProxy = process.env.HTTPS_PROXY || process.env.ALL_PROXY;
    if (httpsProxy) {
      const agent = new HttpsProxyAgent(httpsProxy);
      options.fetch = (url, options2) => {
        return fetch2(url, { agent, ...options2 });
      };
    }
  } else {
    options.fetch = (url, options2) => {
      return fetch2(url, { ...options2 });
    };
  }
}
function currentModel() {
  return apiModel;
}

// node_modules/.pnpm/eventsource-parser@1.0.0/node_modules/eventsource-parser/dist/index.js
function createParser(onParse) {
  let isFirstChunk;
  let buffer;
  let startingPosition;
  let startingFieldLength;
  let eventId;
  let eventName;
  let data;
  reset();
  return {
    feed,
    reset
  };
  function reset() {
    isFirstChunk = true;
    buffer = "";
    startingPosition = 0;
    startingFieldLength = -1;
    eventId = void 0;
    eventName = void 0;
    data = "";
  }
  function feed(chunk) {
    buffer = buffer ? buffer + chunk : chunk;
    if (isFirstChunk && hasBom(buffer)) {
      buffer = buffer.slice(BOM.length);
    }
    isFirstChunk = false;
    const length = buffer.length;
    let position = 0;
    let discardTrailingNewline = false;
    while (position < length) {
      if (discardTrailingNewline) {
        if (buffer[position] === "\n") {
          ++position;
        }
        discardTrailingNewline = false;
      }
      let lineLength = -1;
      let fieldLength = startingFieldLength;
      let character;
      for (let index = startingPosition; lineLength < 0 && index < length; ++index) {
        character = buffer[index];
        if (character === ":" && fieldLength < 0) {
          fieldLength = index - position;
        } else if (character === "\r") {
          discardTrailingNewline = true;
          lineLength = index - position;
        } else if (character === "\n") {
          lineLength = index - position;
        }
      }
      if (lineLength < 0) {
        startingPosition = length - position;
        startingFieldLength = fieldLength;
        break;
      } else {
        startingPosition = 0;
        startingFieldLength = -1;
      }
      parseEventStreamLine(buffer, position, fieldLength, lineLength);
      position += lineLength + 1;
    }
    if (position === length) {
      buffer = "";
    } else if (position > 0) {
      buffer = buffer.slice(position);
    }
  }
  function parseEventStreamLine(lineBuffer, index, fieldLength, lineLength) {
    if (lineLength === 0) {
      if (data.length > 0) {
        onParse({
          type: "event",
          id: eventId,
          event: eventName || void 0,
          data: data.slice(0, -1)
          // remove trailing newline
        });
        data = "";
        eventId = void 0;
      }
      eventName = void 0;
      return;
    }
    const noValue = fieldLength < 0;
    const field = lineBuffer.slice(index, index + (noValue ? lineLength : fieldLength));
    let step = 0;
    if (noValue) {
      step = lineLength;
    } else if (lineBuffer[index + fieldLength + 1] === " ") {
      step = fieldLength + 2;
    } else {
      step = fieldLength + 1;
    }
    const position = index + step;
    const valueLength = lineLength - step;
    const value = lineBuffer.slice(position, position + valueLength).toString();
    if (field === "data") {
      data += value ? "".concat(value, "\n") : "\n";
    } else if (field === "event") {
      eventName = value;
    } else if (field === "id" && !value.includes("\0")) {
      eventId = value;
    } else if (field === "retry") {
      const retry = parseInt(value, 10);
      if (!Number.isNaN(retry)) {
        onParse({
          type: "reconnect-interval",
          value: retry
        });
      }
    }
  }
}
var BOM = [239, 187, 191];
function hasBom(buffer) {
  return BOM.every((charCode, index) => buffer.charCodeAt(index) === charCode);
}

// src/chatgpt/OpenAIStream.ts
async function OpenAIStream(payload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let counter = 0;
  const res = await fetch("https://api.openai.com/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`
    },
    method: "POST",
    body: JSON.stringify(payload)
  });
  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event) {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].text;
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            controller.error(e);
          }
        }
      }
      const parser = createParser(onParse);
      for await (const chunk of res.body) {
        parser.feed(decoder.decode(chunk));
      }
    }
  });
  return stream;
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
router.post("/chat-process", async (ctx, next) => {
  ctx.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
    // "Transfer-Encoding": "chunked",
  });
  const res = await OpenAIStream(ctx.request.body);
  console.log(res);
  ctx.body = res;
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