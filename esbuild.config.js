const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

// Create dist directory if it doesn't exist
const distDir = "dist";
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create js directory if it doesn't exist
const jsDir = path.join(distDir, "js");
if (!fs.existsSync(jsDir)) {
  fs.mkdirSync(jsDir, { recursive: true });
}

// Build JavaScript
esbuild
  .build({
    entryPoints: ["src/tinyselect.js"],
    bundle: false,
    minify: true,
    sourcemap: false,
    outfile: "dist/js/tinyselect.min.js",
  })
  .catch(() => process.exit(1));

// Copy CSS files
const cssDir = "src/css";
const cssDistDir = path.join(distDir, "css");

// Create css directory if it doesn't exist
if (!fs.existsSync(cssDistDir)) {
  fs.mkdirSync(cssDistDir, { recursive: true });
}

const cssFiles = fs.readdirSync(cssDir);

cssFiles.forEach((file) => {
  const sourcePath = path.join(cssDir, file);
  const destPath = path.join(cssDistDir, file);

  if (fs.statSync(sourcePath).isFile()) {
    fs.copyFileSync(sourcePath, destPath);
  }
});

console.log("Build completed successfully!");
