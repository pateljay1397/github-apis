import glob from "glob";
import path from "path";
import { exit } from "process";
import fs from "fs";
import util from "util";
import axios from "axios";
import http from "http";
import https from "https";
import authorize from "./authorize.js";
import { getMediaType } from "./media-types.js";
import { mergeModules } from "./modules.js";

const args = process.argv.slice(2);
if (args.length !== 3) {
    console.error("Backend service url, authority and client_credential secret must be provided as arguments");
    exit(1);
}

const serviceBaseUrl = args[0];
const authority = args[1];
const secret = args[2];
const globAsync = util.promisify(glob);

const requiredAttributes = ["itwin-version:", "api-path:", "api-group-id:"]

const optionalFiles = JSON.parse(fs.readFileSync("../src/common-files-config.json", { encoding: "utf-8" }));

const token = await authorize(authority, secret);

if (!token)
    exit(1);

axios.defaults.baseURL = serviceBaseUrl;
axios.defaults.headers.common["Authorization"] = token;
axios.defaults.timeout = 10000;
axios.defaults.httpAgent = new http.Agent({ keepAlive: true });
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });

const payload = {};
const matches = await globAsync("../src/sandboxes/**/config.json");

for (const match of matches) {
    const parsedPath = path.parse(match);
    const config = JSON.parse(fs.readFileSync(match, { encoding: "utf-8" }));
    const uploadPath = path.join(parsedPath.dir, "sources/**/*.*");

    if (!config.attributes)
        throw new Error(`Required attributes for sandbox '${config.name}' are not defined`);

    for (const attr of requiredAttributes) {
        if (!config.attributes.find(a => a.startsWith(attr)))
            throw new Error(`Required attribute '${attr}' for sandbox '${config.name}' is not defined`);
    }

    payload[config.id] = {
        id: config.id,
        name: config.name,
        description: config.description,
        modules: mergeModules(config.modules),
        thumbnailPath: path.join(parsedPath.dir, config.thumbnail),
        attributes: config.attributes,
        iModels: config.iModels,
        optionalFiles: config.commonFiles && config.commonFiles.map((name) => {
            const file = optionalFiles.find((item) => item.name === name);
            return {
                name: file.name,
                version: file.version,
            }
        }),
    };

    const files = await globAsync(uploadPath);
    const filesPayload = {};
    for (const file of files) {
        if (file.includes("/common/"))
            continue;

        const parsedFilePath = path.parse(file);
        const fileName = file.slice(path.join(parsedPath.dir, "sources/").length);

        const content = /.*(.jpg|.jpeg|.png|.gif|.bmp|.webp)$/gi.test(file)
            ? `data:${getMediaType(path.parse(fileName).ext)};base64,${fs.readFileSync(file, "base64")}`
            : fs.readFileSync(file, { encoding: "utf-8" });

        filesPayload[fileName] = {
            content: content,
            entry: parsedFilePath.base.toLowerCase() === config.entryFile.toLowerCase(),
        };
    }
    payload[config.id].files = filesPayload;
}

let success = true;
for (let sample of Object.values(payload)) {
    console.log(`${new Date().toISOString()} Uploading sample id=${sample.id} name='${sample.name}'...`);
    try {
        const uploadMetadataResponse = await axios({
            method: "put",
            url: `/api/sample?updateIndex=true`,
            headers: {
                "Content-Type": "application/json",
            },
            data: sample
        });
        console.log(`Sample added, response status: ${uploadMetadataResponse.status}`);

        const imagePath = path.resolve(sample.thumbnailPath);
        if (!fs.existsSync(imagePath)) {
            console.log("Thumbnail not found: " + imagePath);
            continue;
        }

        const thumbnailResponse = await axios({
            method: "put",
            url: `/api/codeshare/${sample.id}/thumbnail`,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `form-data; name="file"; filename="${path.parse(imagePath).name}${path.parse(imagePath).ext}"`
            },
            data: fs.createReadStream(imagePath)
        });
        console.log(`Thumbnail uploaded, response status: ${thumbnailResponse.status}`);

        //Add sleep
        await new Promise(resolve => setTimeout(resolve, 25));
    } catch (error) {
        console.error("Failed to upload thumbnail");
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else {
            console.log(error.message);
        }
        success = false;
    }
}

if (!success)
    exit(1);
