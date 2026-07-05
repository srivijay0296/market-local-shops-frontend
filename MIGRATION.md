# Monorepo Migration Guide

This guide explains how to migrate from two separate repositories into a single monorepo structure.

## 📋 Current State

- **Frontend Repo**: `srivijay0296/market-local-shops-frontend`
- **Backend Repo**: `srivijay0296/market_local_shops_143_backend`
- **Target Repo**: `srivijay0296/namma-market` (new)

## 🎯 Target Structure

```
namma-market/
├── frontend/                # React Vite app
├── backend/                 # Spring Boot app
├── docker-compose.yml
├── .gitignore
├── README.md
├── .env.example
└── MIGRATION.md            # This file
```

---

## 📝 Manual Migration Steps

### Step 1: Create New Repository

```bash
# Create a new repository on GitHub named "namma-market"
# Do NOT initialize with README, .gitignore, or LICENSE
```

### Step 2: Clone and Setup Monorepo

```bash
# Create a new directory
mkdir namma-market-monorepo
cd namma-market-monorepo

# Initialize git
git init

# Add both repos as remotes
git remote add frontend https://github.com/srivijay0296/market-local-shops-frontend.git
git remote add backend https://github.com/srivijay0296/market_local_shops_143_backend.git

# Fetch from both
git fetch frontend monorepo-setup
git fetch backend main
```

### Step 3: Merge Frontend into frontend/ Folder

```bash
# Create frontend branch from frontend repo
git checkout -b combine-frontend frontend/monorepo-setup

# Create a temporary directory
mkdir frontend-temp
cd frontend-temp

# Move all frontend files to frontend/ subdirectory
for file in $(git ls-files | grep -v '^\.'); do
  mkdir -p "$(dirname "frontend/$file")"
  mv "$file" "frontend/$file" || true
done

cd ..

# Commit the restructure
git add -A
git commit -m "feat: restructure frontend into frontend/ directory"
```

### Step 4: Merge Backend into backend/ Folder

```bash
# Create a new branch for backend
git checkout --orphan combine-backend backend/main

# Fetch backend files
git pull backend main --allow-unrelated-histories

# Create a temporary directory
mkdir backend-temp
cd backend-temp

# Move all backend files to backend/ subdirectory
for file in $(git ls-files | grep -v '^\.'); do
  mkdir -p "$(dirname "backend/$file")"
  mv "$file" "backend/$file" || true
done

cd ..

# Commit the restructure
git add -A
git commit -m "feat: restructure backend into backend/ directory"
```

### Step 5: Combine Both Branches

```bash
# Create main branch from monorepo-setup
git checkout -b main frontend/monorepo-setup

# Merge backend branch
git merge combine-backend --allow-unrelated-histories -m "merge: combine frontend and backend repositories"

# Resolve any conflicts if needed
git status
```

### Step 6: Add Root Configuration Files

These files should already be in the frontend/monorepo-setup branch:

```bash
# Verify these exist at root:
# - .gitignore
# - README.md
# - docker-compose.yml
# - .env.example
# - MIGRATION.md

git status
```

### Step 7: Update Import Paths

Check for any hardcoded paths that need updating:

```bash
# Frontend: Check for absolute paths
grep -r "../backend" frontend/src/ || echo "No backend references found"

# Backend: Check for frontend references
grep -r "../frontend" backend/src/ || echo "No frontend references found"
```

### Step 8: Push to New Repository

```bash
# Add the new repo as remote
git remote add origin https://github.com/srivijay0296/namma-market.git

# Push the main branch
git branch -M main
git push -u origin main

# Push other important branches
git push -u origin frontend/monorepo-setup
git push -u origin combine-backend
```

---

## 🔧 Automated Migration Script

Alternatively, use this bash script to automate the process:

```bash
#!/bin/bash

# setup-monorepo.sh
# Automated monorepo setup script

set -e  # Exit on error

echo "🚀 Starting Monorepo Setup..."

# Step 1: Create directories
echo "📁 Creating directory structure..."
mkdir -p namma-market-repo
cd namma-market-repo

# Step 2: Initialize git
echo "🔧 Initializing git repository..."
git init

# Step 3: Add remotes
echo "📡 Adding remote repositories..."
git remote add frontend https://github.com/srivijay0296/market-local-shops-frontend.git
git remote add backend https://github.com/srivijay0296/market_local_shops_143_backend.git

# Step 4: Fetch branches
echo "⬇️  Fetching repositories..."
git fetch frontend monorepo-setup
git fetch backend main

# Step 5: Checkout frontend
echo "📦 Setting up frontend..."
git checkout -b main frontend/monorepo-setup

# Step 6: Merge backend
echo "🔀 Merging backend repository..."
git merge -X theirs --allow-unrelated-histories backend/main -m "merge: combine backend repository"

echo "✅ Monorepo setup complete!"
echo "📊 Current branch: $(git branch --show-current)"
echo "🔗 Remotes: $(git remote -v | cut -d' ' -f1 | sort -u | tr '\n' ', ')"
echo ""
echo "Next steps:"
echo "1. Add origin remote: git remote add origin https://github.com/srivijay0296/namma-market.git"
echo "2. Push to GitHub: git push -u origin main"
```

Run it:
```bash
chmod +x setup-monorepo.sh
./setup-monorepo.sh
```

---

## ✅ Verification Checklist

After migration, verify:

- [ ] `.gitignore` is at repository root
- [ ] `README.md` is at repository root
- [ ] `docker-compose.yml` is at repository root
- [ ] `.env.example` is at repository root
- [ ] `frontend/` directory contains all frontend code
- [ ] `backend/` directory contains all backend code
- [ ] `frontend/package.json` exists
- [ ] `backend/pom.xml` exists
- [ ] No circular dependencies between frontend and backend
- [ ] All environment variables are configured
- [ ] Docker Compose can build both images

```bash
# Run verification
echo "Checking monorepo structure..."
[ -f ".gitignore" ] && echo "✓ .gitignore exists"
[ -f "README.md" ] && echo "✓ README.md exists"
[ -f "docker-compose.yml" ] && echo "✓ docker-compose.yml exists"
[ -d "frontend" ] && echo "✓ frontend/ directory exists"
[ -d "backend" ] && echo "✓ backend/ directory exists"
[ -f "frontend/package.json" ] && echo "✓ frontend/package.json exists"
[ -f "backend/pom.xml" ] && echo "✓ backend/pom.xml exists"
echo "Done!"
```

---

## 🐳 Testing the Monorepo

### Test Build

```bash
# Build frontend
cd frontend
npm install
npm run build
cd ..

# Build backend
cd backend
./mvnw clean package -DskipTests
cd ..

echo "✅ Both applications built successfully!"
```

### Test Docker Compose

```bash
# Build and start services
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 🔄 Git History Preservation

If you want to preserve full git history from both repos:

```bash
# Use git subtree instead of manual moves
git subtree add --prefix=frontend frontend/monorepo-setup
git subtree add --prefix=backend backend/main
```

This preserves all commit history in subdirectories.

---

## 📊 File Changes Summary

**Frontend files moved to `frontend/`:**
- `src/` → `frontend/src/`
- `public/` → `frontend/public/`
- `package.json` → `frontend/package.json`
- `vite.config.ts` → `frontend/vite.config.ts`
- All configuration files

**Backend files moved to `backend/`:**
- `src/` → `backend/src/`
- `pom.xml` → `backend/pom.xml`
- `mvnw` → `backend/mvnw`
- All Maven configuration

**Root level files (new):**
- `.gitignore` - Combined ignore patterns
- `README.md` - Monorepo documentation
- `docker-compose.yml` - Service orchestration
- `.env.example` - Shared environment template
- `MIGRATION.md` - This file
- `Dockerfile` - Frontend container (new)
- `backend/Dockerfile` - Backend container (new)

---

## 🆘 Troubleshooting

### Merge Conflicts

```bash
# View conflicts
git status

# Edit conflicted files
vim conflicted-file.txt

# Mark as resolved
git add conflicted-file.txt

# Complete merge
git commit -m "resolve: merge conflicts"
```

### Large Files

If you have large files in git history:

```bash
# Use BFG to remove large files
bfg --strip-blobs-bigger-than 100M
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Push Rejection

```bash
# If push is rejected
git push --force-with-lease origin main
```

---

## 📚 Resources

- [Git Subtree Documentation](https://git-scm.com/book/en/v2/Git-Tools-Subtrees)
- [Monorepo Best Practices](https://monorepo.tools/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## ✨ Next Steps After Migration

1. **Update CI/CD**: Modify GitHub Actions workflows for monorepo structure
2. **Update Documentation**: Update contributing guidelines
3. **Set Branch Protection**: Protect main branch in new repository
4. **Archive Old Repos**: Archive the original repositories (optional)
5. **Update Team**: Notify team about new repository URL

---

**Happy migrating! 🎉**
