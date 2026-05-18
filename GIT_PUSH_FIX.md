# Git Push Error Fix Guide

## Error: "push declined due to repository rule violations"

### Possible Causes & Solutions:

#### 1. **Authentication Issue**
```bash
# Check if you're authenticated
git config --global user.name
git config --global user.email

# If not set, configure:
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### 2. **Use SSH instead of HTTPS**
```bash
# Check current remote
git remote -v

# If using HTTPS, switch to SSH:
git remote set-url origin git@github.com:Hariom-BM/college.git

# Or update URL:
git remote set-url origin https://github.com/Hariom-BM/college.git
```

#### 3. **Check for Large Files**
Repository might have file size limits:
```bash
# Check for large files
find . -type f -size +50M

# If found, add to .gitignore or use Git LFS
```

#### 4. **Check Protected Files**
Some files might be protected:
- `.env` files
- API keys
- Large binary files
- `node_modules/`

**Solution:** Add to `.gitignore`:
```
node_modules/
.env
*.log
.DS_Store
```

#### 5. **Branch Naming Convention**
Repository might require specific branch names:
```bash
# Try different naming:
git checkout -b feat/task-manager
# or
git checkout -b update/task-manager
# or
git checkout -b task-manager
```

#### 6. **Commit Message Requirements**
Some repos require specific commit message format:
```bash
# Use conventional commits:
git commit -m "feat: add A/B test generator"
# or
git commit -m "fix: update CSS generation"
```

#### 7. **Check Repository Settings**
On GitHub:
1. Go to repository Settings
2. Check "Rules" → "Rulesets"
3. See what rules are blocking
4. Adjust branch protection rules if you're admin

#### 8. **Try Different Approach**
```bash
# 1. Check what's being pushed
git log origin/main..HEAD

# 2. Create minimal commit
git add task_manager/
git commit -m "feat: add A/B test generator app"

# 3. Try pushing with verbose output
git push -v origin feature/task-manager-updates
```

#### 9. **Use Personal Access Token**
If using HTTPS, you might need a Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` permissions
3. Use token as password when pushing

#### 10. **Check .gitignore**
Make sure sensitive files are ignored:
```bash
# Check .gitignore
cat .gitignore

# Add if missing:
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo "*.log" >> .gitignore
```

### Quick Diagnostic Commands:
```bash
# Check repository status
git status

# Check remote configuration
git remote -v

# Check branch
git branch -a

# Check last commit
git log -1

# Check file sizes
du -sh *
```

### Alternative: Use GitHub Desktop or VS Code Git
If command line isn't working, try:
- GitHub Desktop app
- VS Code Source Control panel
- GitHub web interface (upload files directly)
