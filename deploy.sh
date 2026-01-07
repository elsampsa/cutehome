#!/bin/bash
# Deploy script for GitHub Pages
# Copies app/ and lib/ to docs/ folder and creates redirect index.html

set -e  # Exit on error

echo "Starting deployment to docs/ folder..."

# Clean up old docs folder if it exists
if [ -d "docs" ]; then
    echo "Removing old docs/ folder..."
    rm -rf docs
fi

# Create docs folder
echo "Creating docs/ folder..."
mkdir -p docs

# Copy app/ folder
echo "Copying app/ folder..."
cp -r app docs/

# Copy lib/ folder (without .git submodule info)
echo "Copying lib/ folder..."
cp -r lib docs/

# Remove any .git references from the copied lib (since it's a submodule)
if [ -d "docs/lib/.git" ]; then
    echo "Removing .git from docs/lib/..."
    rm -rf docs/lib/.git
fi

# Create .nojekyll file to prevent Jekyll processing
echo "Creating .nojekyll file..."
touch docs/.nojekyll

# Create redirect index.html at docs root
echo "Creating redirect index.html..."
cat > docs/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=./app/landing.html">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #1a1a1a;
            color: #ffffff;
        }
        .message {
            text-align: center;
        }
        a {
            color: #4a9eff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="message">
        <h1>Redirecting...</h1>
        <p>If you are not redirected automatically, <a href="./app/landing.html">click here</a>.</p>
    </div>
</body>
</html>
EOF

echo ""
echo "✓ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Add docs/ folder to git: git add docs/"
echo "2. Commit: git commit -m 'Deploy to GitHub Pages'"
echo "3. Push: git push"
echo "4. Enable GitHub Pages in repository settings:"
echo "   - Go to Settings → Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: master (or main) → /docs folder"
echo ""
echo "Your site will be available at: https://<username>.github.io/<repository>/"
