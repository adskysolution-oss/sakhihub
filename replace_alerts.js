const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function replaceAlerts(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('alert(')) return;

  let originalContent = content;
  
  let newContent = content.replace(/alert\((.*?)\)/g, (match, p1) => {
    let lower = p1.toLowerCase();
    if (lower.includes('success') || lower.includes('welcome') || lower.includes('accepted')) {
      return `toast.success(${p1})`;
    } else {
      return `toast.error(${p1})`;
    }
  });

  if (newContent !== originalContent) {
    if (!newContent.includes("import { toast }") && !newContent.includes("import {toast}")) {
      let importMatch = [...newContent.matchAll(/^import .*;$/gm)];
      if (importMatch.length > 0) {
        let lastImport = importMatch[importMatch.length - 1];
        let insertPos = lastImport.index + lastImport[0].length;
        newContent = newContent.slice(0, insertPos) + "\nimport { toast } from 'sonner';" + newContent.slice(insertPos);
      } else {
        newContent = "import { toast } from 'sonner';\n" + newContent;
      }
    }
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

walkDir('./src', replaceAlerts);
