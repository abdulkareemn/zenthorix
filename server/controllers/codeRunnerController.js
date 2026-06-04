const { spawn } = require('child_process');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const ts = require('typescript');

const TIMEOUT_MS = 4000;
const MAX_CODE_SIZE = 80000;
const MAX_TESTS = 20;
const runnerTempRoot = process.env.CODE_RUNNER_TMP || (process.platform === 'win32' ? 'C:\\tmp' : os.tmpdir());
const bundledPython = path.join(os.homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', 'python.exe');

function normalizeLanguage(language) {
  return String(language || '').trim().toLowerCase();
}

function normalizeOutput(value) {
  return String(value || '').replace(/\r\n/g, '\n').trim();
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: false,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, options.timeout || TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: error.message, timedOut: false });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });

    if (options.input) child.stdin.write(options.input);
    child.stdin.end();
  });
}

function buildJavaScriptSource(code) {
  return [
    "const fs = require('fs');",
    "const input = fs.readFileSync(0, 'utf8');",
    "const lines = input.split(/\\r?\\n/);",
    code
  ].join('\n');
}

function transpileTypeScript(code, isReact) {
  const result = ts.transpileModule(code, {
    compilerOptions: {
      jsx: isReact ? ts.JsxEmit.React : ts.JsxEmit.None,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    }
  });

  return result.outputText;
}

async function prepareRunner(language, code, workspace) {
  const normalized = normalizeLanguage(language);

  if (normalized === 'javascript' || normalized === 'node.js' || normalized === 'node') {
    const file = path.join(workspace, 'main.js');
    await fs.writeFile(file, buildJavaScriptSource(code));
    return { command: 'node', args: [file] };
  }

  if (normalized === 'typescript') {
    const file = path.join(workspace, 'main.js');
    await fs.writeFile(file, buildJavaScriptSource(transpileTypeScript(code, false)));
    return { command: 'node', args: [file] };
  }

  if (normalized === 'react') {
    const file = path.join(workspace, 'main.js');
    await fs.writeFile(file, buildJavaScriptSource(transpileTypeScript(code, true)));
    return { command: 'node', args: [file] };
  }

  if (normalized === 'python') {
    const file = path.join(workspace, 'main.py');
    await fs.writeFile(file, code);
    return { command: process.env.PYTHON_BIN || bundledPython, args: [file], fallbackCommand: 'python' };
  }

  if (normalized === 'c++' || normalized === 'cpp') {
    const source = path.join(workspace, 'main.cpp');
    const exe = path.join(workspace, process.platform === 'win32' ? 'main.exe' : 'main');
    await fs.writeFile(source, code);
    const compile = await runProcess('g++', [source, '-std=c++17', '-O2', '-o', exe], { cwd: workspace, timeout: TIMEOUT_MS });
    if (compile.code !== 0) {
      return { compileError: compile.stderr || compile.stdout || 'C++ compilation failed.' };
    }
    return { command: exe, args: [] };
  }

  if (normalized === 'java') {
    const source = path.join(workspace, 'Main.java');
    await fs.writeFile(source, code);
    const compile = await runProcess('javac', [source], { cwd: workspace, timeout: TIMEOUT_MS });
    if (compile.code !== 0) {
      return { compileError: compile.stderr || compile.stdout || 'Java compilation failed.' };
    }
    return { command: 'java', args: ['-cp', workspace, 'Main'] };
  }

  return { compileError: `Unsupported language: ${language}` };
}

async function executeWithFallback(runner, input, workspace) {
  const result = await runProcess(runner.command, runner.args, { cwd: workspace, input, timeout: TIMEOUT_MS });

  if (result.code === -1 && runner.fallbackCommand) {
    return runProcess(runner.fallbackCommand, runner.args, { cwd: workspace, input, timeout: TIMEOUT_MS });
  }

  return result;
}

async function runCode(req, res) {
  let workspace = '';

  try {
    const language = req.body.language;
    const code = typeof req.body.code === 'string' ? req.body.code : '';
    const testCases = Array.isArray(req.body.testCases) ? req.body.testCases.slice(0, MAX_TESTS) : [];

    if (!code.trim()) {
      return res.status(400).json({ message: 'Code is required' });
    }

    if (code.length > MAX_CODE_SIZE) {
      return res.status(400).json({ message: 'Code is too large' });
    }

    if (testCases.length === 0) {
      return res.status(400).json({ message: 'At least one test case is required' });
    }

    await fs.mkdir(runnerTempRoot, { recursive: true });
    workspace = await fs.mkdtemp(path.join(runnerTempRoot, 'proctor-run-'));
    const runner = await prepareRunner(language, code, workspace);

    if (runner.compileError) {
      return res.status(200).json({
        passed: false,
        summary: runner.compileError,
        results: testCases.map((testCase, index) => ({
          index,
          input: testCase.input || '',
          expected: testCase.expected || '',
          actual: '',
          passed: false,
          error: runner.compileError
        }))
      });
    }

    const startedAt = Date.now();
    const results = [];

    for (let index = 0; index < testCases.length; index += 1) {
      const testCase = testCases[index];
      const input = typeof testCase.input === 'string' ? testCase.input : '';
      const expected = typeof testCase.expected === 'string' ? testCase.expected : '';
      const run = await executeWithFallback(runner, input, workspace);
      const actual = normalizeOutput(run.stdout);
      const normalizedExpected = normalizeOutput(expected);

      results.push({
        index,
        input,
        expected,
        actual,
        passed: !run.timedOut && run.code === 0 && actual === normalizedExpected,
        error: run.timedOut ? 'Execution timed out' : normalizeOutput(run.stderr)
      });
    }

    const passedCount = results.filter((result) => result.passed).length;
    const runtimeMs = Date.now() - startedAt;

    return res.status(200).json({
      passed: passedCount === results.length,
      passedCount,
      totalCount: results.length,
      runtimeMs,
      summary: `${passedCount} / ${results.length} test cases passed`,
      results
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to run code' });
  } finally {
    if (workspace) {
      await fs.rm(workspace, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}

module.exports = { runCode };
