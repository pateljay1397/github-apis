const lnk = require("lnk");
const glob = require("glob");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const symlinkType = args[0] || "symbolic";

const commonFilesDefinitions = require("../src/common-files-config.json");

const updateGitIgnore = (paths) => {
    const gitIgnorePath = path.resolve(__dirname, "../.gitignore");
    let data = fs.readFileSync(gitIgnorePath, { encoding: "utf-8" });
    const rootPath = path.resolve(__dirname, "..");
    for (const p of paths) {
        let normalizedPath = path.normalize(p).replace(rootPath, "").replace(/\\/g, '/');
        if (normalizedPath.startsWith("/"))
            normalizedPath = normalizedPath.slice(1);

        if (data.includes(normalizedPath)) {
            console.log("skipping " + normalizedPath)
            continue;
        }

        data += "\r\n" + normalizedPath;
    }
    fs.writeFileSync(gitIgnorePath, data);
}

glob(__dirname + "/../src/+(sandboxes|templates)/**/*/", null, (error, folders) => {
    console.log("Removing symlinks...");
    for (folder of folders) {
        if (fs.existsSync(folder)) {
            const d = fs.readdirSync(folder, { encoding: "utf8", withFileTypes: true });
            d.forEach(entry => {
                if (entry.isSymbolicLink()) {
                    const p = path.join(folder, entry.name);
                    console.log(`   ${p}`);
                    if (fs.lstatSync(p).isDirectory() && fs.existsSync(p)) {
                        fs.rmdirSync(p, { recursive: true });
                    } else {
                        if (fs.existsSync(p))
                            fs.unlinkSync(p);
                    }
                }
            });
        }
    }
    console.log("done.");

    glob(__dirname + "/../src/sandboxes/**/config.json", null, (error, configs) => {
        console.log("Creating shared file symlinks...")
        for (const configPath of configs) {
            const parsedConfigPath = path.parse(configPath);
            const config = require(configPath);
            const links = [];
            if (config.symlinks) {
                for (const sourceFile of config.symlinks) {
                    const targetFolder = path.parse(path.join(parsedConfigPath.dir, "sources", sourceFile)).dir;
                    const promise = lnk([path.join(__dirname, "../src/shared", sourceFile)], targetFolder, { type: symlinkType, parent: false, force: true }) // Requires Developer Mode enabled in windows 10
                        .then(() => {
                            console.log(`   Symlink created: ${sourceFile} --> ${targetFolder}`);
                            return path.join(targetFolder, `${path.parse(sourceFile).name}${path.parse(sourceFile).ext}`);
                        })
                        .catch(error => console.error(error));
                    links.push(promise)
                }
            }
            Promise.all(links).then((paths) => {
                updateGitIgnore(paths);
            })
        }
    });

    glob(__dirname + "/../src/+(sandboxes|templates)/**/config.json", null, (error, configs) => {
        console.log("Creating common file symlinks...")
        const links = [];

        for (const configPath of configs) {
            const parsedConfigPath = path.parse(configPath);
            const config = require(configPath);
            if (config.commonFiles) {
                for (const fileSetName of config.commonFiles) {
                    const definition = commonFilesDefinitions.find((f) => f.name === fileSetName);
                    if (!definition)
                        throw Error(`Common files set was not found: ${fileSetName}`);

                    for (const filePath of definition.files) {
                        const targetPath = path.join(__dirname, "../src", filePath);
                        const destinationFolder = path.parse(path.join(parsedConfigPath.dir, "sources", filePath)).dir;

                        const promise = lnk([targetPath], destinationFolder, { type: symlinkType, parent: false, force: true }) // Requires Developer Mode enabled in windows 10
                            .then(() => {
                                console.log(`   Symlink created: ${targetPath} --> ${destinationFolder}`);
                            })
                            .catch(error => console.error(error));
                        links.push(promise)
                    }
                }
            }
        }

        Promise.all(links).then(() => {
            console.log("Symlinks successfully created")
        })
    });
})
