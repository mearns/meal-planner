const YAML = require("js-yaml");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

async function main() {
    const [, , srcPath, destPath] = process.argv;
    await generateDir(srcPath, destPath);
}

async function generateDir(srcPath, destPath) {
    await mkdirp(destPath);
    const children = await fs.promises.readdir(srcPath, {
        encoding: "utf-8",
        withFileTypes: true
    });
    await Promise.all(
        children.map(async child => {
            const fullPath = path.join(srcPath, child.name);
            const fullDestPath = path.join(
                destPath,
                child.name.replace(/\.[^.]*$/, ".yaml")
            );
            if (child.isDirectory()) {
                return generateDir(fullPath, fullDestPath);
            } else if (child.isFile()) {
                if (path.extname(child.name) === ".js") {
                    try {
                        const childExport = await import(`../${fullPath}`);
                        await fs.promises.writeFile(
                            fullDestPath,
                            YAML.dump(childExport.default),
                            "utf8"
                        );
                        console.log(
                            `Generated from JavaScript: ${fullDestPath}`
                        );
                    } catch (error) {
                        throw Object.assign(
                            new Error(
                                `Error generating contents from ${fullPath}: ${error.message}`
                            ),
                            {
                                name: error.name,
                                stack: error.stack
                            }
                        );
                    }
                } else {
                    await fs.promises.copyFile(fullPath, fullDestPath);
                    console.log(`Copied file to ${fullDestPath}`);
                }
                await fs.promises.chmod(fullDestPath, 0o444);
            } else {
                throw new Error(
                    "Don't know how to handle a directory entry that is neither a directory nor a file: " +
                        fullPath
                );
            }
        })
    );
}

async function enter() {
    try {
        await main();
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
}

enter();
