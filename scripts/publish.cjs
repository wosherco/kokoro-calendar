const fs = require('fs');
const { spawn } = require('child_process');

const packages = require('./packages.json');

async function publishPackages() {
    // Read main README content
    const mainReadme = fs.readFileSync(__dirname + '/../README.md', 'utf-8');

    for (let name of packages) {
        const dir = __dirname + '/../packages/' + name;

        // Copy main README to package
        fs.writeFileSync(dir + '/README.md', mainReadme);

        if (name === 'core') {
            const file = dir + '/src/Calendar.svelte';
            const buf = fs.readFileSync(file);
            const tmp = buf.toString().replace(/\.\/styles\/index\.scss/g, '../index.css');

            fs.writeFileSync(file, tmp);
            await publish(dir);
            fs.writeFileSync(file, buf);
        } else {
            await publish(dir);
        }
    }
}

function publish(dir) {
    return new Promise((resolve, reject) => {
        console.log(`Publishing package in ${dir}...`);

        const publish = spawn('pnpm', ['publish', '--access', 'public', '--no-git-checks'], {
            cwd: dir,
            stdio: 'inherit', // This will pipe stdin/stdout/stderr to the parent process
            shell: true
        });

        publish.on('close', (code) => {
            if (code === 0) {
                console.log(`Successfully published package in ${dir}`);
                resolve();
            } else {
                console.error(`Failed to publish package in ${dir}`);
                reject(new Error(`Process exited with code ${code}`));
            }
        });

        publish.on('error', (err) => {
            console.error(`Error publishing package in ${dir}:`, err);
            reject(err);
        });
    });
}

publishPackages().catch(err => {
    console.error('Publishing failed:', err);
    process.exit(1);
});
