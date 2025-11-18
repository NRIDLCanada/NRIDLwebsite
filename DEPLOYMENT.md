# NRIDL Website - Deployment Guide

## 📤 How to Upload Your Website

### Option 1: Using FTP/SFTP (Most Common)

#### Required Information from Your Hosting Provider:
- FTP/SFTP Server Address (e.g., ftp.yourdomain.com)
- Username
- Password
- Port (usually 21 for FTP, 22 for SFTP)

#### Recommended FTP Clients:
- **FileZilla** (Free, Windows/Mac/Linux) - https://filezilla-project.org/
- **WinSCP** (Free, Windows) - https://winscp.net/
- **Cyberduck** (Free, Windows/Mac) - https://cyberduck.io/

#### Steps:

1. **Download and Install an FTP Client** (e.g., FileZilla)

2. **Connect to Your Server:**
   - Open FileZilla
   - Go to File → Site Manager
   - Click "New Site"
   - Enter your FTP details:
     - Host: your-server-address
     - Port: 21 (or as provided)
     - Protocol: FTP or SFTP
     - Encryption: Use explicit FTP over TLS if available
     - Logon Type: Normal
     - User: your-username
     - Password: your-password
   - Click "Connect"

3. **Upload Files:**
   - In FileZilla, you'll see two panels:
     - Left side: Your computer (local)
     - Right side: Your web server (remote)
   - Navigate to your NRIDL folder on the left
   - Navigate to your website's root directory on the right (usually `public_html`, `www`, or `htdocs`)
   - Select ALL files and folders from NRIDL
   - Right-click → Upload
   - Wait for upload to complete

4. **Verify:**
   - Open your website: http://www.nridl.org
   - Check that all pages load correctly
   - Test navigation and links

---

### Option 2: Using cPanel File Manager (If Your Host Provides cPanel)

1. **Log into cPanel:**
   - Go to your hosting control panel
   - Find and click "File Manager"

2. **Navigate to Website Root:**
   - Go to `public_html` or `www` folder

3. **Upload Files:**
   - Click "Upload" button
   - Select all files from your NRIDL folder
   - OR zip the NRIDL folder first, upload the zip, then extract it in cPanel

4. **Set Permissions (if needed):**
   - Folders: 755
   - Files: 644

---

### Option 3: Using Git/GitHub (Advanced)

If your hosting supports Git deployment:

```bash
# Initialize git repository
cd NRIDL
git init
git add .
git commit -m "Initial NRIDL website"

# Add remote and push
git remote add origin your-git-url
git push -u origin main
```

Then set up automatic deployment through your hosting provider's Git integration.

---

## 📁 What to Upload

Upload **ALL** of these files and folders:

```
✅ index.html
✅ literacy.html
✅ digital-futures.html
✅ heritage.html
✅ sustainability.html
✅ privacy-policy.html
✅ cookie-policy.html
✅ terms-of-use.html
✅ ip-policy.html
✅ responsible-ai-policy.html
✅ README.md
✅ css/ (entire folder)
✅ js/ (entire folder)
✅ videos/ (when you create it - for your hero video)
```

---

## ✅ Post-Upload Checklist

After uploading, verify:

- [ ] Home page loads correctly at www.nridl.org
- [ ] All navigation links work
- [ ] All policy pages are accessible
- [ ] CSS styles are loading properly
- [ ] JavaScript is working (test mobile menu)
- [ ] All images/videos display correctly
- [ ] Footer appears on all pages
- [ ] Forms (if any) are working
- [ ] Website is responsive on mobile devices
- [ ] HTTPS is working (SSL certificate)

---

## 🔒 Security Best Practices

1. **Enable HTTPS:**
   - Most hosts offer free SSL certificates (Let's Encrypt)
   - In cPanel: look for "SSL/TLS" or "Let's Encrypt"

2. **File Permissions:**
   ```
   Folders: 755
   HTML/CSS/JS files: 644
   ```

3. **Backup Regularly:**
   - Keep local copies
   - Use your host's backup service
   - Consider automated backups

4. **Keep Files Updated:**
   - Update content regularly
   - Keep backups before making changes

---

## 🎥 Adding Your Hero Video After Upload

1. **Create videos folder on server:**
   - In FileZilla/cPanel, create a `videos` folder in the root directory

2. **Upload your video:**
   - Recommended: Compress video to reduce file size
   - Upload via FTP (may take time depending on file size)

3. **Update index.html:**
   - Edit line ~32 to uncomment the video source
   - Save and re-upload index.html

4. **Test:**
   - Clear browser cache
   - Visit homepage
   - Verify video plays

---

## 🐛 Troubleshooting Common Issues

### Problem: Pages show "404 Not Found"
**Solution:** 
- Check file names are exact (case-sensitive on Linux servers)
- Ensure files are in correct directory (usually `public_html`)

### Problem: CSS/JavaScript not loading
**Solution:**
- Verify folder structure is correct
- Check file paths in HTML
- Clear browser cache (Ctrl+F5)

### Problem: Website shows folder listing instead of home page
**Solution:**
- Rename homepage to `index.html` (not Index.html)
- Check server's default document settings

### Problem: Video not playing
**Solution:**
- Check video format (MP4 recommended)
- Verify video path is correct
- Test video file locally first
- Consider video size (<10MB recommended)

---

## 📞 Getting Help

### From Your Hosting Provider:
- Contact their support for FTP details
- Ask about SSL certificate setup
- Request help with file permissions

### Testing Tools:
- **Google Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html

---

## 🌐 Domain Setup

If you're setting up a new domain:

1. **Point domain to hosting:**
   - Update nameservers (from domain registrar)
   - Or update A record to point to hosting IP

2. **Wait for propagation:**
   - Can take 4-48 hours
   - Check status: https://www.whatsmydns.net/

3. **Set up www redirect:**
   - In cPanel: Redirects → Add `www` to non-www or vice versa

---

## 📊 Analytics Setup (Optional)

To track website visitors:

1. **Google Analytics:**
   - Create account at https://analytics.google.com
   - Get tracking code
   - Add to all pages before `</head>` tag

2. **Other Options:**
   - Microsoft Clarity (free, privacy-friendly)
   - Matomo (self-hosted)

---

## 🎉 You're Done!

Your NRIDL website should now be live and accessible to the world!

**Final Steps:**
1. Share the link: www.nridl.org
2. Test on multiple devices
3. Gather feedback
4. Make improvements over time

---

**Questions?** Contact your web hosting support or email support@nridl.org

**Good luck with your launch! 🚀**
