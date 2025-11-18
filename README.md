# NRIDL Website

## The National Research Institute for Democratized Learning

A modern, sophisticated website showcasing NRIDL's mission to democratize access to knowledge and empower communities through education and technology.

---

## 📁 Project Structure

```
NRIDL/
├── index.html                          # Home page
├── literacy.html                       # Literacy programs page
├── digital-futures.html                # Digital futures & technology page
├── heritage.html                       # Cultural heritage page
├── sustainability.html                 # Sustainability initiatives page
├── privacy-policy.html                 # Privacy policy
├── cookie-policy.html                  # Cookie policy
├── terms-of-use.html                   # Terms of use
├── ip-policy.html                      # Intellectual property policy
├── responsible-ai-policy.html          # Responsible AI policy
├── css/
│   ├── main.css                        # Global styles and utilities
│   ├── navigation.css                  # Navigation bar styles
│   ├── footer.css                      # Footer styles
│   ├── home.css                        # Home page specific styles
│   ├── policy.css                      # Policy pages styles
│   └── sustainability.css              # Sustainability page styles
└── js/
    ├── navigation.js                   # Navigation component & logic
    ├── footer.js                       # Footer component
    └── common.js                       # Common utilities & animations
```

---

## 🎨 Design Features

### Typography
- **Headings**: Playfair Display (elegant serif)
- **Body Text**: Inter (clean sans-serif)
- **Accents**: Montserrat (modern sans-serif)

### Color Palette
- **Primary**: Deep navy (#1a1a2e)
- **Secondary**: Dark blue (#16213e)
- **Accent**: Ocean blue (#0f4c75, #3282b8)
- **Sustainability**: Teal (#16a085)

### Key Features
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Smooth scroll animations
- ✅ Modern card-based layouts
- ✅ Consistent navigation and footer across all pages
- ✅ Accessible and semantic HTML
- ✅ Professional typography with proper hierarchy
- ✅ Interactive hover effects
- ✅ Scroll reveal animations

---

## 🎥 Adding Your Hero Video

To add your hero video to the home page:

1. Create a `videos` folder in the NRIDL directory
2. Place your video file in the folder (e.g., `hero-video.mp4`)
3. Open `index.html`
4. Find the `<video>` tag in the hero section (around line 30)
5. Uncomment the `<source>` line and update the path:

```html
<video class="hero-video" autoplay muted loop playsinline poster="videos/poster-image.jpg">
    <source src="videos/hero-video.mp4" type="video/mp4">
</video>
```

**Recommended video specs:**
- Format: MP4 (H.264 codec)
- Resolution: 1920x1080 or higher
- Duration: 10-30 seconds (looping)
- File size: Under 10MB for optimal loading

---

## 🚀 Getting Started

### Local Development

1. **Open the website locally:**
   - Simply open `index.html` in your web browser
   - Or use a local server (recommended):

```powershell
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)
npx http-server
```

2. **Navigate to:** `http://localhost:8000`

### Editing Content

- **Home page content**: Edit `index.html`
- **Policy pages**: Edit respective HTML files
- **Styling**: Modify CSS files in the `css/` folder
- **Colors/fonts**: Update CSS variables in `css/main.css` (lines 4-40)

---

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px

---

## 🎯 Key Pages

### Home Page (index.html)
- Hero section with video background
- 3 problem areas with solutions
- Mission & vision
- 5-year strategic plan (2025-2030)

### Literacy (literacy.html)
- Overview of literacy programs
- StoryBee library
- Digital and financial literacy initiatives

### Digital Futures (digital-futures.html)
- AI and emerging technology education
- Digital transformation support
- Responsible AI practices

### Heritage (heritage.html)
- Cultural preservation initiatives
- Indigenous knowledge protection
- Community partnerships

### Sustainability (sustainability.html)
- Environmental literacy programs
- AI-enabled sustainable solutions
- Community impact stories
- Shared values

### Policy Pages
- Privacy Policy
- Cookie Policy
- Terms of Use
- IP Policy
- Responsible AI Policy

---

## 🛠️ Customization

### Changing Colors

Edit `css/main.css` (starting at line 4):

```css
:root {
    --primary-color: #1a1a2e;      /* Main dark color */
    --accent-color: #0f4c75;       /* Links and highlights */
    --accent-light: #3282b8;       /* Lighter accent */
    /* ... */
}
```

### Changing Fonts

1. Update Google Fonts link in HTML `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap" rel="stylesheet">
```

2. Update CSS variables in `css/main.css`:
```css
--font-primary: 'YourFont', sans-serif;
```

### Adding New Pages

1. Create new HTML file (e.g., `new-page.html`)
2. Copy structure from existing page
3. Add link to navigation in `js/navigation.js`
4. Add link to footer in `js/footer.js` (if needed)

---

## ✨ Features Included

### Navigation
- Fixed header with scroll effect
- Mobile-responsive hamburger menu
- Active page highlighting
- Smooth transitions

### Footer
- Comprehensive link organization
- Policy links (capitalized as requested)
- Copyright notice
- Responsive layout

### Animations
- Scroll reveal effects (fade-in on scroll)
- Smooth page transitions
- Hover effects on cards and buttons
- Parallax effects (where applicable)

### Accessibility
- Semantic HTML5 elements
- ARIA labels where needed
- Keyboard navigation support
- Proper heading hierarchy

---

## 📧 Contact & Support

For questions about this website:
- **Email**: support@nridl.org
- **Organization**: The National Research Institute for Democratized Learning

---

## 📄 License

ALL RIGHTS RESERVED © 2022-2025 THE NATIONAL RESEARCH INSTITUTE FOR DEMOCRATIZED LEARNING

---

## 🔄 Future Enhancements

Consider adding:
- [ ] Blog section
- [ ] Resource library
- [ ] Partner showcase
- [ ] Event calendar
- [ ] Newsletter signup
- [ ] Search functionality
- [ ] Multi-language support

---

## 🎨 Design Inspiration

The website draws inspiration from:
- LVMH Inside (https://www.insidelvmh.com/) - Sophisticated layout
- Modern nonprofit websites - Clean, mission-focused design
- Educational platforms - Accessible and engaging UX

---

**Built with care for NRIDL's mission to democratize learning worldwide.**
