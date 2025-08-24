# 🚀 GitHub Setup & Deployment Guide

This guide will walk you through setting up your Personal AI Assistant project on GitHub and deploying it to GitHub Pages.

## 📋 **Prerequisites**

- GitHub account
- Git installed on your local machine
- Node.js 18+ and npm
- Your project ready with environment variables

## 🔧 **Step 1: Create GitHub Repository**

1. **Go to GitHub.com** and sign in
2. **Click "New repository"** (green button)
3. **Repository name**: `my_personal_assistant`
4. **Description**: `AI-powered personal productivity assistant with React, TypeScript, and Supabase`
5. **Visibility**: Choose Public or Private
6. **Initialize with**: 
   - ✅ Add a README file
   - ✅ Add .gitignore (choose Node)
   - ✅ Choose a license (MIT recommended)
7. **Click "Create repository"**

## 🔗 **Step 2: Connect Local Repository to GitHub**

After creating the repository, GitHub will show you commands. Run these in your project directory:

```bash
# Add the remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/my_personal_assistant.git

# Verify the remote was added
git remote -v
```

## 📝 **Step 3: Prepare Your First Commit**

```bash
# Add all files to git
git add .

# Make your first commit
git commit -m "Initial commit: Personal AI Assistant with React, TypeScript, and Supabase"

# Push to GitHub (this will trigger the first deployment)
git push -u origin main
```

## ⚙️ **Step 4: Configure GitHub Pages**

1. **Go to your repository** on GitHub
2. **Click "Settings"** tab
3. **Scroll down to "Pages"** in the left sidebar
4. **Source**: Select "GitHub Actions"
5. **Save the settings**

## 🔑 **Step 5: Set Up Environment Variables (Optional)**

If you want to use GitHub Actions for building with environment variables:

1. **Go to repository Settings**
2. **Click "Secrets and variables" → "Actions"**
3. **Add repository secrets**:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_OPENAI_API_KEY`: Your OpenAI API key

## 🚀 **Step 6: Verify Deployment**

1. **Check Actions tab** to see deployment progress
2. **Wait for deployment** to complete (green checkmark)
3. **Visit your live site**: `https://YOUR_USERNAME.github.io/my_personal_assistant`

## 🔄 **Step 7: Update README with Your Links**

Replace these placeholders in your README.md:

```markdown
# Replace YOUR_USERNAME with your actual GitHub username
git clone https://github.com/YOUR_USERNAME/my_personal_assistant.git

# Update the live demo link
Visit the live application: https://YOUR_USERNAME.github.io/my_personal_assistant
```

## 📱 **Step 8: Test Your Live Application**

1. **Open the live URL** in your browser
2. **Test all features**:
   - Adding items
   - AI planning (if OpenAI key is set)
   - Voice input
   - Data persistence
3. **Check mobile responsiveness**

## 🛠️ **Troubleshooting**

### **Build Failures**
- Check GitHub Actions logs for errors
- Verify all dependencies are in `package.json`
- Ensure Node.js version compatibility

### **Environment Variables Not Working**
- Remember: GitHub Pages is client-side only
- Environment variables must be set at build time
- Consider using GitHub Actions secrets

### **404 Errors on Refresh**
- This is normal for SPA routing
- Consider adding a custom 404 page
- Or use HashRouter instead of BrowserRouter

### **Deployment Not Triggering**
- Check branch name (should be `main` or `master`)
- Verify GitHub Actions workflow file exists
- Check repository permissions

## 🔒 **Security Considerations**

- **Never commit `.env` files**
- **Use GitHub Secrets** for sensitive data
- **Review Actions permissions** regularly
- **Consider private repository** for sensitive projects

## 📈 **Next Steps**

After successful deployment:

1. **Share your live application** with others
2. **Set up custom domain** (optional)
3. **Configure branch protection** rules
4. **Set up automated testing** (optional)
5. **Monitor deployment health**

## 🎉 **Congratulations!**

Your Personal AI Assistant is now live on GitHub Pages! 

- **Repository**: `https://github.com/YOUR_USERNAME/my_personal_assistant`
- **Live Site**: `https://YOUR_USERNAME.github.io/my_personal_assistant`
- **Actions**: `https://github.com/YOUR_USERNAME/my_personal_assistant/actions`

## 📚 **Additional Resources**

- [GitHub Pages Documentation](https://pages.github.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router & GitHub Pages](https://create-react-app.dev/docs/deployment/#github-pages)

---

**Need help?** Check the GitHub Actions logs or create an issue in your repository!
