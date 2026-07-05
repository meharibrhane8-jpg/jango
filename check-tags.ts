import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// A simple regex to find JSX tags: <tag ...> or </tag>
const tagRegex = /<\/?[a-zA-Z0-9\._:-]+(?:\s+[a-zA-Z0-9\._:-]+(?:=(?:"[^"]*"|'[^']*'|{[^}]*}|[^\s>]+))?)*\s*\/?>/g;

let match;
let stack: { tag: string; line: number }[] = [];
let lines = content.split('\n');

// Skip tracking self-closing tags, script/style, and braces
const ignoreTags = new Set(['input', 'img', 'br', 'hr', 'meta', 'link']);

for (let i = 0; i < lines.length; i++) {
  const lineNum = i + 1;
  const lineText = lines[i];
  
  // Simple regex to match tags on this line
  const matches = lineText.matchAll(/(<\/?[a-zA-Z0-9\._:-]+)/g);
  for (const m of matches) {
    const rawTag = m[1];
    
    // Check if it's a close tag
    if (rawTag.startsWith('</')) {
      const tag = rawTag.substring(2);
      if (stack.length === 0) {
        console.log(`[Line ${lineNum}] Unexpected closing tag: </${tag}>`);
      } else {
        const last = stack.pop();
        if (last && last.tag !== tag) {
          console.log(`[Line ${lineNum}] Mismatched closing tag: expected </${last.tag}> (opened line ${last.line}), got </${tag}>`);
        }
      }
    } else {
      const tag = rawTag.substring(1);
      // Check if self-closing (ends with /> in the actual line, simplified check)
      const afterTagIndex = lineText.indexOf(m[0]);
      const rest = lineText.substring(afterTagIndex);
      const isSelfClosing = rest.match(/^[^\/>]*\/>/) || ignoreTags.has(tag.toLowerCase());
      
      if (!isSelfClosing) {
        stack.push({ tag, line: lineNum });
      }
    }
  }
}

console.log("\nRemaining open tags on stack:", stack);
