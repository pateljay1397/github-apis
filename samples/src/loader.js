/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import playlists from "./sample-playlist.json";
import modules from "./modules-v3.json";
import optionalFileDefinitions from "./common-files-config.json";

const guidValidationPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const mergeModules = (moduleOverrides) => {
    if (!moduleOverrides || !moduleOverrides.length)
        return modules;

    const result = [...modules];

    for (const override of moduleOverrides) {
        const match = result.find((item) => item.name === override.name);
        if (match) {
            const index = result.indexOf(match);
            result.splice(index, 1);
        }
        result.push(override);
    }

    return result;
}

export const getManifest = async () => {
    const manifest = new Map();
    const sampleIds = new Map();

    for (const playlist of playlists) {
        for (const sandboxPath of playlist.members) {
            try {
                const config = await import(`./${sandboxPath}/config.json`).then((module) => module.default);

                if (config.id.match(guidValidationPattern) === null) {
                    throw new Error(`Sample located at '${sandboxPath}' has invalid GUID Id`);
                }

                if (sampleIds.has(config.id) && sampleIds.get(config.id) !== sandboxPath)
                    throw new Error(`Sample located at '${sandboxPath}' has the same ID value as sample at '${sampleIds.get(config.id)}'`);
                else
                    sampleIds.set(config.id, sandboxPath);

                const optionalFiles = [];
                if (config.commonFiles) {
                    for (const fileSetName of config.commonFiles) {
                        const definition = optionalFileDefinitions.find((f) => f.name === fileSetName)
                        if (!definition)
                            throw Error(`Optional file set is not defined: ${fileSetName}`);

                        const opFile = {
                            name: definition.name,
                            displayName: definition.displayName,
                            version: definition.version,
                            files: [],
                        }

                        for (const file of definition.files) {
                            const path = file.startsWith("/") ? file.slice(1) : file;
                            opFile.files.push({
                                name: path,
                                getContent: async () => (await import(`./${sandboxPath}/sources/${path}?sample`)).default,
                            });
                        }
                        optionalFiles.push(opFile);
                    }
                }

                const sandboxFiles = [...(config.files || []), ...(config.symlinks || [])].reduce((acc, filePath) => {
                    acc.set(`/${filePath}`, async () => {
                        let content = (await import(`./${sandboxPath}/sources/${filePath}?sample`)).default;
                        return content;
                    });
                    return acc;
                }, new Map());

                if (manifest.has(config.id)) {
                    manifest.get(config.id).playlists.push(playlist);
                } else {
                    manifest.set(config.id, {
                        id: config.id,
                        name: config.name,
                        entryFile: `/${config.entryFile}`,
                        files: sandboxFiles,
                        optionalFiles: optionalFiles,
                        modules: mergeModules(config.modules),
                        description: config.description || "",
                        playlists: [playlist],
                        thumbnail: async () => {
                            return (await import(`./${sandboxPath}/${config.thumbnail}?sample`)).default;
                        },
                        attributes: config.attributes || [],
                        iModels: config.iModels || [],
                    });
                }
            } catch (error) {
                console.error(error);
                throw error;
            }
        }
    }

    return manifest;
};
