import {App} from "octokit";
import {readFileSync}  from 'fs';

const PRIVATE_KEY = readFileSync("./private-key.pem", "utf-8");
const app = new App({
  appId: "334769",
  privateKey: PRIVATE_KEY,
});
let octokit;

async function fetchContent(path, level, maxLevel) {
  try {
      const response = await octokit.request(
          "GET /repos/:owner/:repo/git/trees/:tree_sha",
          {
              owner: "pateljay1397",
              repo: "github-apis",
              tree_sha: "HEAD:" + path,
          }
      );
      const files = [];
      const promises = response.data.tree.map(async (file) => {
          if (file.type === "tree") {
              await fetchContent(`${path}/${file.path}`, level + 1, maxLevel).then((subFiles)=>{
                  files.push(...subFiles);
              });
          } else if (file.type === "blob") {
              const isImage = /\.(jpg|jpeg|png)$/i.test(file.path);
              const contentPromise = octokit.request(
                  "GET /repos/:owner/:repo/git/blobs/:file_sha",
                  {
                      owner: "pateljay1397",
                      repo: "github-apis",
                      file_sha: file.sha,
                  }
              ).then(contentResponse => {
                  const content = isImage
                    ? Buffer.from(contentResponse.data.content, "base64")
                    : Buffer.from(contentResponse.data.content, "base64").toString("utf-8");
                  return { path: `${path}/${file.path}`, contentResponse: content };
              });
              files.push(contentPromise);
          }
      });
      await Promise.all(promises);
      return Promise.all(files);
  } catch (error) {
      console.log(error);
  }
}

async function main() {
  octokit = await app.getInstallationOctokit(37587394);
  console.log("Auth is done, Now calling a fetchContent");
  let samplesPaths
  if (octokit) {
    const response = await octokit.request("GET /repos/:owner/:repo/contents/:path", {
                          owner: "pateljay1397",
                          repo: "github-apis",
                          path: "samplesPaths.json"
                        });
    if(response.status === 200 ){
      const content = Buffer.from(response.data.content, "base64").toString("utf-8");
      samplesPaths = JSON.parse(content);
    }
    for(const samplePath of samplesPaths.paths) {
      const startTime = performance.now();
      await fetchContent(`samples/src/sandboxes/${samplePath}`, 0, 1).then((files)=>{
        const endTime = performance.now();
        console.log(`${samplePath},${Math.round(endTime - startTime)}`, files);
      }) 
  }
};
}

main();