const { spawn } = require('child_process');

// Spawn the actual server process
const child = spawn('node', ['server.js'], { 
    stdio: ['inherit', 'inherit', 'pipe'] // Pipe stderr so we can filter it
});

// Filter stderr to remove annoying C++ ONNX warnings
child.stderr.on('data', (data) => {
    const output = data.toString();
    // Only print if it's NOT an onnxruntime warning
    if (!output.includes('[W:onnxruntime:')) {
        process.stderr.write(data);
    }
});

// Handle exit
child.on('exit', (code) => {
    process.exit(code);
});
