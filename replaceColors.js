const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace Tailwind blue classes with primary
    // Match cases like bg-blue-600, text-blue-500, ring-blue-500/30, shadow-blue-500
    // But be careful not to replace something else.
    let newContent = content.replace(/([a-z0-9A-Z]+)-blue-([0-9]+)/g, '$1-primary-$2');
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
