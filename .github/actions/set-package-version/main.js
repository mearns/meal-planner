const core = require("@actions/core");
const fs = require("fs").promises;

async function enter() {
    const packageData = JSON.parse(await fs.readFile("package.json", "utf-8"));
    const baseVersion = packageData.version;

    core.info(`Found base version ${baseVersion}`);

    const match = /([0-9]+)\.([0-9]+)\.([0-9]+)(-[^+]+)?(\+.*)?$/.exec(
        baseVersion
    );
    const [, major, minor, patch, preRelease, meta] = match;
    core.info(
        `Found these: ${JSON.stringify({
            major,
            minor,
            patch,
            preRelease,
            meta
        })}`
    );
}

async function main() {
    try {
        await enter();
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
