import { spawn } from "child_process";
import fs from "fs";

async function main() {
  // 1. Sign in to get session cookie
  const res = await fetch("http://localhost:3323/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "http://localhost:3323",
      "Referer": "http://localhost:3323/login",
    },
    body: JSON.stringify({
      email: "admin@scanflow.io",
      password: "AdminPassword123!",
    }),
  });

  const cookies = res.headers.getSetCookie();
  const sessionCookie = cookies.find((c) => c.includes("better-auth.session_token"));
  if (!sessionCookie) {
    throw new Error("No session cookie received from sign-in");
  }

  const match = sessionCookie.match(/better-auth\.session_token=([^;]+)/);
  if (!match) {
    throw new Error("Could not parse better-auth.session_token");
  }
  const token = decodeURIComponent(match[1]);

  // 2. Launch headless Chrome
  const port = 9223;
  const chrome = spawn("google-chrome", [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${port}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=/tmp/chrome-dashboard-profile",
  ]);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 3. Connect to CDP
  const versionRes = await fetch(`http://localhost:${port}/json/version`);
  const versionData = await versionRes.json();
  const ws = new WebSocket(versionData.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === msgId) {
          ws.removeEventListener("message", handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener("message", handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  await new Promise((resolve) => (ws.onopen = resolve));

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const pageWsUrl = `ws://localhost:${port}/devtools/page/${targetId}`;
  const pageWs = new WebSocket(pageWsUrl);
  await new Promise((resolve) => (pageWs.onopen = resolve));

  const pageSend = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === msgId) {
          pageWs.removeEventListener("message", handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      pageWs.addEventListener("message", handler);
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  await pageSend("Network.enable");
  await pageSend("Page.enable");

  await pageSend("Network.setCookie", {
    name: "better-auth.session_token",
    value: token,
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  });

  const capturePage = async (url, outputPath, width = 1440, height = 1200, waitMs = 4000) => {
    console.log(`Navigating to ${url}...`);
    await pageSend("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await pageSend("Page.navigate", { url });
    await new Promise((resolve) => setTimeout(resolve, waitMs));

    console.log(`Capturing ${outputPath}...`);
    const screenshot = await pageSend("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
    });
    const buffer = Buffer.from(screenshot.data, "base64");
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved ${outputPath} (${buffer.length} bytes)`);
  };

  // Capture Main Dashboard
  await capturePage("http://localhost:3323/dashboard", "/home/amirfaisalz/Documents/amir/QR/public/screenshot-dashboard.png", 1440, 1200);

  // Capture QR Codes Management Page
  await capturePage("http://localhost:3323/dashboard/qr-codes", "/home/amirfaisalz/Documents/amir/QR/public/screenshot-qr-codes.png", 1440, 1050);

  // Capture Analytics Breakdown Page
  await capturePage("http://localhost:3323/dashboard/analytics", "/home/amirfaisalz/Documents/amir/QR/public/screenshot-analytics.png", 1440, 1200);

  // Capture Scan Journeys Explorer
  await capturePage("http://localhost:3323/dashboard/journeys", "/home/amirfaisalz/Documents/amir/QR/public/screenshot-journeys.png", 1440, 1050);

  pageWs.close();
  ws.close();
  chrome.kill();
  console.log("All screenshots captured successfully!");
}

main().catch(console.error);
