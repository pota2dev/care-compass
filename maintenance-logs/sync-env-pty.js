const { spawn } = require('child_process');

function addEnv(key, value, env) {
  return new Promise((resolve) => {
    const cp = spawn('npx.cmd', ['vercel', 'env', 'add', key, env], { shell: true });
    
    let resolved = false;
    
    cp.stdout.on('data', (d) => {
      const out = d.toString();
      console.log(`[${key} ${env} OUT] ` + out);
      if (out.toLowerCase().includes('value') && !resolved) {
        resolved = true;
        cp.stdin.write(value + '\n');
        cp.stdin.end();
      }
    });

    cp.stderr.on('data', (d) => {
      const err = d.toString();
      console.log(`[${key} ${env} ERR] ` + err);
      // vercel puts the prompt in stderr sometimes
      if (err.toLowerCase().includes('value') && !resolved) {
        resolved = true;
        cp.stdin.write(value + '\n');
        cp.stdin.end();
      }
    });

    cp.on('close', (code) => {
      console.log(`[${key} ${env} EXIT] ` + code);
      if (!resolved) {
        // Just in case it never prompted
        cp.stdin.end();
      }
      resolve();
    });
  });
}

async function main() {
  const envs = {
    "DATABASE_URL": "postgresql://neondb_owner:npg_QhRu7FUrMcf3@ep-crimson-frost-an0vhcfj-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
    "DATABASE_URL_UNPOOLED": "postgresql://neondb_owner:npg_QhRu7FUrMcf3@ep-crimson-frost-an0vhcfj.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require",
    "DIRECT_URL": "postgresql://neondb_owner:npg_QhRu7FUrMcf3@ep-crimson-frost-an0vhcfj.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require",
    "PGDATABASE": "neondb",
    "PGHOST": "ep-crimson-frost-an0vhcfj-pooler.c-6.us-east-1.aws.neon.tech",
    "PGHOST_UNPOOLED": "ep-crimson-frost-an0vhcfj.c-6.us-east-1.aws.neon.tech",
    "PGPASSWORD": "npg_QhRu7FUrMcf3",
    "PGUSER": "neondb_owner",
    "POSTGRES_DATABASE": "neondb",
    "POSTGRES_HOST": "ep-crimson-frost-an0vhcfj-pooler.c-6.us-east-1.aws.neon.tech",
    "POSTGRES_PASSWORD": "npg_QhRu7FUrMcf3",
    "POSTGRES_PRISMA_URL": "postgresql://neondb_owner:npg_QhRu7FUrMcf3@ep-crimson-frost-an0vhcfj-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require",
    "POSTGRES_URL": "postgresql://neondb_owner:npg_QhRu7FUrMcf3@ep-crimson-frost-an0vhcfj-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
    "POSTGRES_URL_NON_POOLING": "postgresql://neondb_owner:npg_QhRu7FUrMcf3@ep-crimson-frost-an0vhcfj.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require",
    "POSTGRES_URL_NO_SSL": "postgresql://neondb_owner:npg_QhRu7FUrMcf3@ep-crimson-frost-an0vhcfj-pooler.c-6.us-east-1.aws.neon.tech/neondb",
    "POSTGRES_USER": "neondb_owner"
  };

  const keys = Object.keys(envs);
  for (const key of keys) {
    const value = envs[key];
    console.log(`\nremoving ${key}`);
    const cpRm = spawn('npx.cmd', ['vercel', 'env', 'rm', key, 'production', '-y'], { shell: true });
    await new Promise(r => cpRm.on('close', r));
    const cpRm2 = spawn('npx.cmd', ['vercel', 'env', 'rm', key, 'preview', '-y'], { shell: true });
    await new Promise(r => cpRm2.on('close', r));
    const cpRm3 = spawn('npx.cmd', ['vercel', 'env', 'rm', key, 'development', '-y'], { shell: true });
    await new Promise(r => cpRm3.on('close', r));
    
    console.log(`pushing ${key}`);
    await addEnv(key, value, 'production');
    await addEnv(key, value, 'preview');
    await addEnv(key, value, 'development');
  }
}

main().then(() => console.log("FINISHED"));
