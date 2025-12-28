# Setting Up GitHub Repository

## Quick Setup

### 1. Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `SaddleUp` (or your preferred name)
3. Description: "AI-powered horse training app for beginner horse owners"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2. Connect Local Repository

After creating the repository on GitHub, run these commands:

```bash
cd /Users/staciehuffhines/SaddleUp

# Add all files (except those in .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: SaddleUp AI-powered horse training app"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/SaddleUp.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. If Repository Already Exists on GitHub

If you already created the repository with a README:

```bash
# Pull first
git pull origin main --allow-unrelated-histories

# Resolve any conflicts, then:
git push -u origin main
```

## Important Notes

### Before Pushing

**Make sure `.env` files are NOT committed:**
- ✅ `.gitignore` includes `.env` files
- ✅ Check: `git status` should NOT show `.env` files
- ✅ If `.env` shows up, it was committed before .gitignore was added
  - Remove it: `git rm --cached backend/.env frontend/.env`
  - Commit: `git commit -m "Remove .env files from git"`

### Environment Variables

Create `.env.example` files for reference:

**backend/.env.example** - Already exists ✅
**frontend/.env.example** - Can be created if needed

Never commit actual `.env` files with real credentials!

## Repository Structure

Your repository includes:
- Backend (Express.js + TypeScript)
- Frontend (React Native + Expo)
- Database schema (Prisma)
- Documentation
- CI/CD workflow (GitHub Actions)

## Next Steps After Push

1. **Add repository description** on GitHub
2. **Add topics/tags**: `react-native`, `expo`, `typescript`, `postgresql`, `ai`, `horse-training`
3. **Set up branch protection** (optional, for main branch)
4. **Configure GitHub Pages** (if hosting docs)
5. **Set up secrets** for CI/CD (if deploying automatically)

## Useful Git Commands

```bash
# Check status
git status

# See what would be committed
git status --short

# Check if .env files are ignored
git check-ignore -v backend/.env

# Add all changes
git add .

# Commit
git commit -m "Your commit message"

# Push
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature/your-feature-name

# Switch branches
git checkout main
```

## Troubleshooting

**"Repository not found" error:**
- Check repository name and username
- Verify you have push access
- Try SSH instead: `git remote set-url origin git@github.com:USERNAME/SaddleUp.git`

**Large files warning:**
- node_modules is already in .gitignore ✅
- If you see warnings, check what files are large
- Consider .gitattributes for line ending handling (optional)

**Authentication issues:**
- Use GitHub Personal Access Token or SSH keys
- See: https://docs.github.com/en/authentication

