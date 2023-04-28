import fs from "fs";
import path from "path";

const allModules = JSON.parse(fs.readFileSync(path.resolve("../src/modules-v3.json"), { encoding: "utf-8" }));

export const mergeModules = (moduleOverrides) => {
  if (!moduleOverrides || !moduleOverrides.length)
    return allModules;

  const result = [...allModules];

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