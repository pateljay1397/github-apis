import fs from "fs";
import path from "path";
import axios from "axios";
import http from "http";
import https from "https";
import authorize from "./authorize.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
if (args.length !== 3) {
  console.error("Backend service url, authority and client_credential secret must be provided as arguments");
  exit(1);
}

const serviceBaseUrl = args[0];
const authority = args[1];
const secret = args[2];

const token = await authorize(authority, secret);
if (!token)
  exit(1);

axios.defaults.baseURL = serviceBaseUrl;
axios.defaults.headers.common["Authorization"] = token;
axios.defaults.timeout = 10000;
axios.defaults.httpAgent = new http.Agent({ keepAlive: true });
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });

const optionalFiles = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/common-files-config.json"), { encoding: "utf-8" }));

for (const fileSet of optionalFiles) {
  const files = {};
  for (let filePath of fileSet.files) {
    const contentsPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    files[filePath] = { content: fs.readFileSync(path.resolve(__dirname, "../src", contentsPath), { encoding: "utf-8" }) };
  }

  fileSet.files = files;
}

try {
  console.log(`Adding optional files...`);
  const uploadResponse = await axios({
    method: "put",
    url: `/api/optionalFiles`,
    headers: {
      "Content-Type": "application/json",
    },
    data: optionalFiles
  });

  console.log(`Optional files added, response status: ${uploadResponse.status}`);
} catch (error) {
  console.error("Add optional files failed. " + error.message);
  if (error.response) {
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  }
}