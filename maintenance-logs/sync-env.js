const fs = require('fs');
const cp = require('child_process');

const content = fs.readFileSync('.env.new', 'utf-8');
const lines = content.split('\n');
const envMap = {};

for (const line of lines) {
  const match = line.match(/^STORAGE_B_([^=]+)=(.*)$/);
  if (match) {
    const key = match[1];
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    envMap[key] = val;
  }
}

for (const key of Object.keys(envMap)) {
  if (key === 'NEON_PROJECT_ID') continue;
  const val = envMap[key];
  console.log(`Processing ${key}...`);
  try {
    cp.execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore', shell: true });
  } catch(e) {}
  try {
    cp.execSync(`npx vercel env rm ${key} preview -y`, { stdio: 'ignore', shell: true });
  } catch(e) {}
  try {
    cp.execSync(`npx vercel env rm ${key} development -y`, { stdio: 'ignore', shell: true });
  } catch(e) {}

  try {
    cp.execSync(`npx vercel env add ${key} production`, { input: val, stdio: 'pipe', shell: true });
  } catch(e) { console.error(`Error adding ${key} prod`); }
  try {
    cp.execSync(`npx vercel env add ${key} preview`, { input: val, stdio: 'pipe', shell: true });
  } catch(e) { console.error(`Error adding ${key} prev`); }
  try {
    cp.execSync(`npx vercel env add ${key} development`, { input: val, stdio: 'pipe', shell: true });
  } catch(e) { console.error(`Error adding ${key} dev`); }
}

console.log("Done syncing environment variables!");
