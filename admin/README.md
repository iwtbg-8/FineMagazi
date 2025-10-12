# Admin Directory

This directory contains administrative files, build tools, and configuration files for the FineMagazi website.

## Directory Structure

```
/admin/
├── config/          # Configuration files
│   ├── package.json              # Node.js dependencies and build scripts
│   ├── hreflang-config.js        # International targeting configuration
│   └── HREFLANG_IMPLEMENTATION.md # Technical documentation
├── tools/           # Build and development tools
│   ├── minify_simple.py          # Python minification script
│   ├── prod_minify.js            # Node.js production minifier
│   ├── prod_minify.sh            # Bash build script
│   └── __pycache__/              # Python cache files
├── seo/             # SEO and webmaster files
│   ├── robots.txt                # Search engine directives
│   ├── sitemap.xml               # XML sitemap
│   ├── sitemap-with-hreflang.xml # XML sitemap with hreflang
│   ├── google*.html              # Google Search Console verification
│   └── CNAME                     # Domain configuration
├── testing/         # Testing files
│   └── hreflang-test.html        # Hreflang implementation tests
├── backups/         # Backup management
│   └── [timestamped backup directories]
└── README.md        # This file
```

## Important Notes

1. **Symbolic Links**: Critical files like `robots.txt`, `sitemap.xml`, etc. are symlinked from the root directory to maintain accessibility for search engines and web crawlers.

2. **Build Scripts**: All build scripts have been updated to work from the new admin directory structure. Run builds from `/admin/config/`:
   ```bash
   cd admin/config
   npm install
   npm run minify
   ```

3. **Backup Location**: Backups are now stored in `/admin/backups/` instead of the root `/backups/` directory.

4. **Exclusions**: The `/admin/` directory is excluded from:
   - robots.txt (disallowed for search engines)
   - Build processes (not minified)
   - Version control (consider adding to .gitignore if needed)

## Usage

- For development builds: Use `admin/tools/minify_simple.py`
- For production builds: Use `admin/tools/prod_minify.sh`
- For configuration: Edit files in `admin/config/`
- For SEO management: Edit files in `admin/seo/`