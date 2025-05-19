const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class JavaScriptExecutor {
  constructor() {
    this.version = process.version;
  }

  async execute(code, input, tempDir) {
    const fileName = 'script.js';
    const filePath = path.join(tempDir, fileName);

    // Write code to temporary file
    await fs.writeFile(filePath, code);

    // Write input to file if provided
    const inputFile = path.join(tempDir, 'input.txt');
    if (input) {
      await fs.writeFile(inputFile, input);
    }

    return new Promise((resolve, reject) => {
      const child = spawn('node', [filePath], {
        cwd: tempDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          output: stdout,
          stderr: stderr,
          exitCode: code,
          runtime: 'Node.js ' + this.version
        });
      });

      child.on('error', (error) => {
        reject(error);
      });

      // Send input if provided
      if (input) {
        child.stdin.write(input);
        child.stdin.end();
      }
    });
  }
}

module.exports = new JavaScriptExecutor();