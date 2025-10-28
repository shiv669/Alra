/**
 * Post-build script to create chunk file copies
 * 
 * Webpack dynamically assigns chunk IDs (e.g., 217, 866) but our webpack config
 * uses named chunks (summarizer, tab-predictor). This script ensures both
 * versions of the files exist so webpack can load them.
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');

// Mapping of webpack chunk IDs to named chunks
const chunkMappings = [
  { source: 'summarizer.js', target: '776.js' },
  { source: 'tab-predictor.js', target: '819.js' },
];

console.log('📦 Post-build: Creating chunk file copies...');

chunkMappings.forEach(({ source, target }) => {
  const sourcePath = path.join(distPath, source);
  const targetPath = path.join(distPath, target);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied ${source} → ${target}`);
  } else {
    console.warn(`⚠️  Source file not found: ${source}`);
  }
});

console.log('✅ Post-build complete!');
