"use client";

import React, { useState } from "react";
import { Button, Card, DemoFrame, Info } from "./ui-kit";
import { EMOJIS } from "./site-data";

function randomId() { return `sid_${Math.random().toString(36).slice(2, 10)}`; }
function randomIp() { return `${Math.floor(Math.random()*223)+1}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.xxx`; }

function bytesToBase64URL(bytes) {
  const binary = Array.from(new Uint8Array(bytes), (b) => String.fromCharCode(b)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomBytes(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function DesktopDemo() {
  const [sessionId, setSessionId] = useState("sid_demo_9f7a2c");
  const [ip, setIp] = useState("223.104.68.xxx");
  const [ua, setUa] = useState("Chrome on Windows 11");
  const [nonce, setNonce] = useState("9f7a2c1b");
  const qrPayload = `https://auth.example.com/scan?sid=${sessionId}&nonce=${nonce}`;

  const refresh = () => {
    setSessionId(randomId());
    setIp(randomIp());
    setUa(`${navigator.userAgent.slice(0, 36)}...`);
    setNonce(Math.random().toString(36).slice(2, 16));
  };

  return (
    <DemoFrame title="电脑扫码登录" subtitle="信息动态生成，超长字段自动换行。">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 space-y-3">
          <Info icon="🧩" label="会话" value={sessionId} />
          <Info icon="🌐" label="IP" value={ip} />
          <Info icon="💻" label="浏览器" value={ua} />
          <Info icon="🔗" label="二维码载荷" value={qrPayload} />
          <Button variant="outline" onClick={refresh}>重新生成</Button>
        </Card>
        <Card className="p-5">
          <div className="rounded-2xl bg-slate-950 p-4 text-xs text-slate-100 break-all whitespace-pre-wrap">{qrPayload}</div>
        </Card>
      </div>
    </DemoFrame>
  );
}

export function PasskeyDemo() {
  const [status, setStatus] = useState("等待注册");
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);

  async function run() {
    try {
      const rpId = window.location.hostname;
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: randomBytes(32),
          rp: { name: "QAuth 演示", id: rpId },
          user: { id: randomBytes(16), name: "QAuth@display.auth", displayName: "QAuth@display.auth" },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: { residentKey: "required", userVerification: "required" },
          timeout: 60000,
        },
      });
      setDone(true);
      setStatus("注册成功");
      setOutput(JSON.stringify({ id: credential.id, rawId: bytesToBase64URL(credential.rawId), type: credential.type }, null, 2));
    } catch (e) {
      setStatus("注册失败或取消");
      setOutput(JSON.stringify({ name: e.name, message: e.message }, null, 2));
    }
  }

  return (
    <DemoFrame title="Passkey 注册" subtitle="创建成功后按钮置灰。">
      <Card className="p-5 space-y-3">
        <div className="rounded-xl bg-slate-50 p-3 text-sm">{status}</div>
        <Button disabled={done} onClick={run}>{done ? "✅ 凭据已创建" : "创建通行密钥"}</Button>
        <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100 whitespace-pre-wrap break-all">{output || "// 返回数据显示在这里"}</pre>
      </Card>
    </DemoFrame>
  );
}

export function MobileCheckDemo() {
  const [picked, setPicked] = useState(["", "", "", ""]);
  const matched = picked.join("") === EMOJIS.join("");
  return (
    <DemoFrame title="手机确认" subtitle="核对符号后确认登录。">
      <Card className="p-5">
        <div className="grid grid-cols-4 gap-2">
          {picked.map((v, i) => <button key={i} onClick={() => setPicked((p) => p.map((x, idx) => idx === i ? EMOJIS[i] : x))} className="h-12 rounded-xl bg-slate-100">{v || "?"}</button>)}
        </div>
        <Button className="mt-3" disabled={!matched}>{matched ? "已匹配" : "等待匹配"}</Button>
      </Card>
    </DemoFrame>
  );
}
