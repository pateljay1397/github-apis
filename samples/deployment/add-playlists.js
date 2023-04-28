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

const samplePlaylists = JSON.parse(fs.readFileSync(path.resolve("../src/sample-playlist.json"), { encoding: "utf-8" }));
const token = await authorize(authority, secret);

if (!token)
    exit(1);

axios.defaults.baseURL = serviceBaseUrl;
axios.defaults.headers.common["Authorization"] = token;
axios.defaults.timeout = 10000;
axios.defaults.httpAgent = new http.Agent({ keepAlive: true });
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });

const success = true;
for (const playlist of samplePlaylists) {

    const codeshares = [];
    for (const sandboxPath of playlist.members) {
        const sandbox = JSON.parse(fs.readFileSync(path.resolve(`../src/${sandboxPath}/config.json`), { encoding: "utf-8" }));
        codeshares.push({ userId: userId, codeshareId: sandbox.id });
    }

    console.log(`${new Date().toISOString()} Adding playlist ${playlist.id} ${playlist.name}`);
    try {
        const playlistResponse = await axios({
            method: "put",
            url: `/api/user/${userId}/playlist`,
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                id: playlist.id,
                name: playlist.name,
                description: playlist.description,
                attributes: playlist.attributes,
                codeshares: codeshares
            }
        });
        console.log(`Playlist added, response status: ${playlistResponse.status}`);
    } catch (error) {
        console.error("Failed to add playlist");
        if (error.response) {
            console.error(error.response.data);
            console.error(error.response.status);
            console.error(error.response.headers);
        } else {
            console.error(error.message);
        }
        success = false;
    }

    //Add sleep
    await new Promise(resolve => setTimeout(resolve, 25));
}

if (!success)
    exit(1);
