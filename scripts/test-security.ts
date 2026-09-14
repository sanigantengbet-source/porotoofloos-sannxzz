import { sanitizeUrl, sanitizeText, validatePayloadSize } from "../src/lib/security";

console.log("--- TEST SANITIZE URL ---");
const urls = [
  'javascript:alert("xss")',
  'JAVASCRIPT:/*foo*/alert(1)',
  'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
  'vbscript:msgbox(1)',
  'https://github.com/sannnproject',
  'http://localhost:8080',
  'example.com/project',
];

let allPassed = true;

for (const u of urls) {
  const sanitized = sanitizeUrl(u);
  console.log(u, "->", sanitized);
  if (u.toLowerCase().includes("javascript:") || u.toLowerCase().includes("data:") || u.toLowerCase().includes("vbscript:")) {
    if (sanitized !== "#blocked-insecure-url") {
      console.error("FAIL: dangerous URL not blocked:", u);
      allPassed = false;
    }
  }
}

console.log("--- TEST SANITIZE TEXT ---");
const dirtyText = 'Hello <script>alert("hack")</script> world <img src=x onerror=alert(1)>';
const cleaned = sanitizeText(dirtyText);
console.log("Dirty:", dirtyText);
console.log("Cleaned:", cleaned);
if (cleaned.includes("<script>") || cleaned.includes("onerror=")) {
  console.error("FAIL: malicious script tag or onerror not removed");
  allPassed = false;
}

console.log("--- TEST PAYLOAD SIZE ---");
const normal = validatePayloadSize({ test: "ok" });
const huge = validatePayloadSize({ big: "x".repeat(3 * 1024 * 1024) });
console.log("Normal payload:", normal);
console.log("3MB payload (exceeds 2MB limit):", huge);

if (!normal.valid || huge.valid) {
  console.error("FAIL: payload size validation logic error");
  allPassed = false;
}

if (allPassed) {
  console.log("=== ALL SECURITY TESTS PASSED SUCCESSFULLY! ===");
} else {
  process.exit(1);
}
