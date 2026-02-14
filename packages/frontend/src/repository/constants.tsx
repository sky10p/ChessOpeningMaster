const localHosts = new Set(["localhost", "127.0.0.1"]);
const browserHostname = typeof window !== "undefined" ? window.location.hostname : "";
const browserProtocol = typeof window !== "undefined" ? window.location.protocol : "http:";
const backendPort = process.env.BACKEND_PORT || "3001";
const dynamicApiUrl = browserHostname ? `${browserProtocol}//${browserHostname}:${backendPort}` : "";
const envApiUrl = process.env.API_URL || "";
const envUsesLocalhost = envApiUrl.includes("localhost") || envApiUrl.includes("127.0.0.1");
const shouldUseDynamicHost = Boolean(browserHostname) && !localHosts.has(browserHostname) && envUsesLocalhost;

export const API_URL = shouldUseDynamicHost ? dynamicApiUrl : envApiUrl || dynamicApiUrl || "http://localhost:3000";
