const { spawn } = require('child_process');

const args = ['vercel', 'env', 'add', 'TEST_VAR2', 'production'];
const cp = spawn('npx.cmd', args);

let done = false;
cp.stdout.on('data', (data) => {
  console.log('out: ' + data.toString());
  if (data.toString().toLowerCase().includes('value') && !done) {
    done = true;
    cp.stdin.write('test_value_123\n');
    cp.stdin.end();
  }
});

cp.stderr.on('data', (data) => {
  console.log('err: ' + data.toString());
  if (data.toString().toLowerCase().includes('value') && !done) {
    done = true;
    cp.stdin.write('test_value_123\n');
    cp.stdin.end();
  }
});

cp.on('close', (code) => {
  console.log('exit: ' + code);
});
