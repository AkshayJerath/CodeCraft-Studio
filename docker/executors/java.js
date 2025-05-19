const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class JavaExecutor {
  constructor() {
    this.version = 'OpenJDK 11';
  }

  async execute(code, input, tempDir) {
    // Extract class name from code (simple regex)
    const classNameMatch = code.match(/public\s+class\s+(\w+)/);
    const className = classNameMatch ? classNameMatch[1] : 'Main';
    
    const sourceFile = `${className}.java`;
    const sourcePath = path.join(tempDir, sourceFile);

    // Write code to temporary file
    await fs.writeFile(sourcePath, code);

    // Compile the Java code
    const compileResult = await this.compile(sourcePath, tempDir);
    if (compileResult.exitCode !== 0) {
      return {
        output: '',
        stderr: `Compilation failed:\n${compileResult.stderr}`,
        exitCode: compileResult.exitCode,
        runtime: this.version
      };
    }

    // Execute the compiled program
    return this.run(className, input, tempDir);
  }

  async compile(sourcePath, tempDir) {
    return new Promise((resolve) => {
      const child = spawn('javac', [sourcePath], {
        cwd: tempDir
      });

      let stderr = '';

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          exitCode: code,
          stderr: stderr
        });
      });
    });
  }

  async run(className, input, tempDir) {
    return new Promise((resolve, reject) => {
      const child = spawn('java', [className], {
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
          runtime: this.version
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

module.exports = new JavaExecutor();