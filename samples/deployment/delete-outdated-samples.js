import fs from "fs";
import path from "path";
import axios from "axios";
import http from "http";
import https from "https";
import { exit } from "process";
import authorize from "./authorize.js";

const userId = 'b44ec7df-cd25-4a10-ba11-bafe02e91c35'; // iTwinPlatform userId

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
axios.defaults.timeout = 10000;
axios.defaults.httpAgent = new http.Agent({ keepAlive: true });
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });

// Get all samples added to the playlists
const samplePlaylists = JSON.parse(fs.readFileSync(path.resolve("../src/sample-playlist.json"), { encoding: "utf-8" }));
const templatePlaylists = JSON.parse(fs.readFileSync(path.resolve("../src/template-playlist.json"), { encoding: "utf-8" }));
const sandboxes = [];

for (const playlist of [...samplePlaylists, ...templatePlaylists]) {
  for (const sandboxPath of playlist.members) {
    const sandboxConfig = JSON.parse(fs.readFileSync(path.resolve(`../src/${sandboxPath}/config.json`), { encoding: "utf-8" }));
    sandboxes.push(sandboxConfig);
  }
}

// Get samples deployed as iTwinPlatform userId
const codeshares = await axios({
  method: "get",
  url: `/api/user/${userId}/codeshares`,
  headers: {
    "Content-Type": "application/json",
  }
});


// Delete deployed (and stale) samples that are not in the current playlists
for (const codeshare of codeshares.data) {
  if (!sandboxes.find(item => item.id === codeshare.id)) {
    try {
      console.log(`Deleting codeshare id=${codeshare.id} "${codeshare.name}"`);
      await axios({
        method: "delete",
        url: `/api/sample/${codeshare.id}`,
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        }
      });
    } catch (error) {
      console.error("Deleted codeshare failed. " + error.message);
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      }
    }
  }
}

