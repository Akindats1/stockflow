---
description: Deploy updates to production on Vercel
---

# Deploy to Production

This workflow helps you deploy updates to your StockFlow inventory system.

## Steps

### 1. Test locally first
```bash
npm run build
```
Make sure the build completes successfully with no errors.

// turbo
### 2. Check current git status
```bash
git status
```

### 3. Stage all changes
```bash
git add .
```

### 4. Commit changes
```bash
git commit -m "feat: [describe your changes]"
```

### 5. Push to GitHub (auto-deploys to Vercel)
```bash
git push origin main
```

### 6. Check deployment status
Visit https://vercel.com/dashboard to:
- View deployment progress
- Check build logs
- Get your production URL
- Monitor for any errors

### 7. Test production deployment
Once deployed:
- [ ] Open production URL
- [ ] Test new features
- [ ] Check mobile responsiveness
- [ ] Verify QR code features
- [ ] Test complete user workflow

## Rollback if Needed

If something goes wrong:
```bash
vercel rollback
```

Or use Vercel Dashboard:
Deployments → Previous Version → Promote to Production

## Tips

- Always test locally before deploying
- Write clear commit messages
- Monitor Vercel Analytics after deployment
- Keep deployment logs for debugging
- Test on multiple devices after deployment
