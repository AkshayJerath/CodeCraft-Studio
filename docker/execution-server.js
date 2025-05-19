const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const { spawn, execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;
const EXECUTION_TIMEOUT = parseInt(process.env.EXECUTION_TIMEOUT) || 30000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Verify language installations on startup
function checkLanguageInstallations() {
  console.log('=== Checking Language Installations ===');
  
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    console.log('✅ Node.js:', nodeVersion);
  } catch (e) {
    console.log('❌ Node.js: Not available');
  }
  
  try {
    const pythonVersion = execSync('python3 --version').toString().trim();
    console.log('✅ Python3:', pythonVersion);
  } catch (e) {
    console.log('❌ Python3: Not available');
  }
  
  try {
    const javaVersion = execSync('java -version 2>&1').toString().trim().split('\n')[0];
    console.log('✅ Java:', javaVersion);
  } catch (e) {
    console.log('❌ Java: Not available');
  }
  
  try {
    const javacVersion = execSync('javac -version 2>&1').toString().trim();
    console.log('✅ Javac:', javacVersion);
  } catch (e) {
    console.log('❌ Javac: Not available');
  }
  
  try {
    const tsVersion = execSync('npx tsc --version').toString().trim();
    console.log('✅ TypeScript:', tsVersion);
  } catch (e) {
    console.log('❌ TypeScript: Not available');
  }
  
  console.log('=== Language Check Complete ===');
}

// Enhanced language executors
const SUPPORTED_LANGUAGES = {
  javascript: {
    execute: async (code, input, tempDir) => {
      const filePath = path.join(tempDir, 'script.js');
      await fs.writeFile(filePath, code);
      return executeCommand('node', [filePath], input, tempDir);
    },
    version: 'Node.js v18.x',
    description: 'JavaScript execution with Node.js runtime'
  },
  
  python: {
    execute: async (code, input, tempDir) => {
      const filePath = path.join(tempDir, 'script.py');
      await fs.writeFile(filePath, code);
      return executeCommand('python3', [filePath], input, tempDir);
    },
    version: 'Python 3.11',
    description: 'Python 3 execution with full standard library'
  },
  
  java: {
    execute: async (code, input, tempDir) => {
      // Extract class name from code
      const classNameMatch = code.match(/public\s+class\s+(\w+)/);
      const className = classNameMatch ? classNameMatch[1] : 'Main';
      
      const sourceFile = `${className}.java`;
      const sourcePath = path.join(tempDir, sourceFile);
      
      await fs.writeFile(sourcePath, code);
      
      // Compile Java code
      console.log(`Compiling Java: javac ${sourceFile}`);
      const compileResult = await executeCommand('javac', [sourceFile], '', tempDir);
      
      if (compileResult.exitCode !== 0) {
        return {
          output: '',
          stderr: `Java Compilation Error:\n${compileResult.stderr}`,
          exitCode: compileResult.exitCode,
          runtime: 'Java OpenJDK 11 (Compilation Failed)'
        };
      }
      
      // Run Java code
      console.log(`Running Java: java ${className}`);
      return executeCommand('java', ['-cp', tempDir, className], input, tempDir);
    },
    version: 'Java OpenJDK 11',
    description: 'Java compilation and execution with OpenJDK 11'
  },
  
  typescript: {
    execute: async (code, input, tempDir) => {
      const filePath = path.join(tempDir, 'script.ts');
      
      // Create minimal tsconfig.json
      const tsConfig = {
        compilerOptions: {
          target: "es2020",
          module: "commonjs",
          strict: false,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: false,
          moduleResolution: "node",
          allowJs: true,
          outDir: "./dist"
        },
        include: ["*.ts"],
        exclude: ["node_modules"]
      };
      
      const tsConfigPath = path.join(tempDir, 'tsconfig.json');
      await fs.writeFile(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      await fs.writeFile(filePath, code);
      
      // Use tsx for direct TypeScript execution
      return executeCommand('npx', ['tsx', filePath], input, tempDir);
    },
    version: 'TypeScript 5.x with tsx',
    description: 'TypeScript execution with modern tsx runtime'
  }
};

async function executeCommand(command, args, input, tempDir) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command} ${args.join(' ')} in ${tempDir}`);
    
    const child = spawn(command, args, {
      cwd: tempDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        JAVA_HOME: '/usr/lib/jvm/java-11-openjdk',
        PATH: process.env.PATH + ':/usr/lib/jvm/java-11-openjdk/bin'
      }
    });

    let stdout = '', stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      console.log(`Command completed with exit code: ${code}`);
      resolve({
        output: stdout,
        stderr: stderr,
        exitCode: code,
        runtime: `${command} execution`
      });
    });
    
    child.on('error', (error) => {
      console.error(`Command error: ${error.message}`);
      reject(error);
    });
    
    // Handle input - support both single line and multiple lines
    if (input && input.trim()) {
      const processedInput = input.includes('\n') ? input : input.split(' ').join('\n') + '\n';
      child.stdin.write(processedInput);
    }
    child.stdin.end();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    languages: Object.keys(SUPPORTED_LANGUAGES),
    server: 'Multi-Language Code Executor',
    runtime: 'Node.js + Python3 + Java11 + TypeScript'
  });
});

// Detailed languages endpoint
app.get('/languages', (req, res) => {
  res.json({ 
    supported: Object.keys(SUPPORTED_LANGUAGES),
    count: Object.keys(SUPPORTED_LANGUAGES).length,
    executors: Object.keys(SUPPORTED_LANGUAGES).map(lang => ({
      language: lang,
      version: SUPPORTED_LANGUAGES[lang].version,
      description: SUPPORTED_LANGUAGES[lang].description
    }))
  });
});

// Execute code endpoint
app.post('/execute', async (req, res) => {
  const { code, language, input = '', timeout = EXECUTION_TIMEOUT } = req.body;
  
  if (!code || !language) {
    return res.status(400).json({
      success: false,
      error: 'Code and language are required',
      supportedLanguages: Object.keys(SUPPORTED_LANGUAGES)
    });
  }

  if (!SUPPORTED_LANGUAGES[language]) {
    return res.status(400).json({
      success: false,
      error: `Unsupported language: ${language}`,
      supportedLanguages: Object.keys(SUPPORTED_LANGUAGES)
    });
  }

  const executionId = uuidv4();
  const tempDir = path.join('/app/temp', executionId);

  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    console.log(`Starting execution for ${language} (ID: ${executionId})`);
    
    const executor = SUPPORTED_LANGUAGES[language];
    
    const result = await executeWithTimeout(
      () => executor.execute(code, input, tempDir),
      Math.min(timeout, EXECUTION_TIMEOUT)
    );

    console.log(`Execution completed for ${executionId}: exit code ${result.exitCode}`);

    res.json({
      success: true,
      executionId,
      language,
      ...result,
      runtime: SUPPORTED_LANGUAGES[language].version
    });

  } catch (error) {
    console.error(`Execution error for ${executionId}:`, error);
    res.status(500).json({
      success: false,
      executionId,
      language,
      error: error.message,
      output: '',
      stderr: error.stderr || error.message,
      exitCode: error.exitCode || 1
    });
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error(`Cleanup error for ${executionId}:`, cleanupError);
    }
  }
});

async function executeWithTimeout(executeFn, timeout) {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Execution timed out after ${timeout}ms`));
    }, timeout);

    try {
      const result = await executeFn();
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Multi-Language Code Execution Server Started!');
  console.log(`📡 Port: ${PORT}`);
  console.log(`⏱️  Timeout: ${EXECUTION_TIMEOUT}ms`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Check language installations
  checkLanguageInstallations();
  
  console.log('\n✅ Server ready to execute code in:');
  Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
    console.log(`   - ${lang.toUpperCase()}: ${SUPPORTED_LANGUAGES[lang].version}`);
  });
  console.log('\n🎯 All systems operational!\n');
});