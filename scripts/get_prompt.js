const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain';

function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const idx = content.indexOf('GLOBAL LAYOUT PATTERN');
    if (idx !== -1) {
      console.log(`Found in: ${filePath}`);
      // Find one that does NOT have the word "truncated" immediately after
      const snippet = content.substring(idx, idx + 2000);
      if (!snippet.includes('truncated')) {
        console.log("--- FULL CONTENT ---");
        console.log(content.substring(idx, idx + 10000));
        console.log("-------------------");
      } else {
        console.log("(This one is truncated)");
      }
    }
  } catch (err) {}
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else {
      if (file.endsWith('.txt') || file.endsWith('.json') || file.endsWith('.md')) {
        searchInFile(fullPath);
      }
    }
  }
}

if (fs.existsSync(brainDir)) {
  walk(brainDir);
} else {
  console.log("Brain dir not found");
}
