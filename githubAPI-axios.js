import axios  from 'axios';
import {readFileSync}  from 'fs';
import jwt from 'jsonwebtoken';

const APP_ID = '334769';
const PRIVATE_KEY = readFileSync("./private-key.pem", "utf-8");
const installationId = '37587394';
const owner = 'pateljay1397';
const repo = 'github-apis';

async function fetchContent(path, token) {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const files = [];
    const promises  = response.data.map( async (file) => {
      if (file.type === 'file') {
        const isImage = /\.(jpg|jpeg|png)$/i.test(file.name);
        const contentResponse = await axios.get(file.download_url);
        const content = isImage ? Buffer.from(contentResponse.data, 'base64') : contentResponse.data;
        files.push({ path: file.path, content });
      } else if (file.type === 'dir') {
          await fetchContent(`${path}/${file.name}`, token).then((subFiles)=>{
            files.push(...subFiles);
          });
      }
    })
    await Promise.all(promises);
    return files;
  } catch (error) {
    console.log(error);
  }
}

async function retrieveToken() {
  try {
    const response = await axios.post(`https://api.github.com/app/installations/${installationId}/access_tokens`, null, {
      headers: {
        'Authorization': `Bearer ${generateAppToken()}`,
        'Accept': 'application/vnd.github.machine-man-preview+json',
      },
    });

    return response.data.token;
  } catch (error) {
    console.log(error);
  }
}

function generateAppToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + 60,
    iss: APP_ID,
  };
  return jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });
}

async function main() {
  console.log("Auth is done, Now calling a fetchContent");
  const token = await retrieveToken();
  let samplesPaths
  if(token){
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/samplesPaths.json`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if(response.status === 200 ){
      const content = Buffer.from(response.data.content, "base64").toString("utf-8");
      samplesPaths = JSON.parse(content);
    }
  for (const samplePath of samplesPaths.paths){
    const startTime = performance.now();
    await fetchContent(`samples/src/sandboxes/${samplePath}`, token).then((files)=>{
      const endTime = performance.now();
      console.log(` ${samplePath},${Math.round(endTime - startTime)}`,files);
    });
  }
}
}

main();
