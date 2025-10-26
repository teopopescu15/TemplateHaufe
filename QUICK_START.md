# Quick Start Guide - UI/UX Designer Skill (MCP-Powered)

**🚀 NEW**: Now uses shadcn MCP server for instant component generation!

## 🚀 Installation (2 minutes)

### Step 1: Install the Skill

```bash
# Navigate to your home directory
cd ~

# Create skills directory if it doesn't exist
mkdir -p .claude/skills

# Extract the skill (from Desktop/TemplateHaufe directory)
unzip /mnt/c/Users/Teo/Desktop/TemplateHaufe/ui-ux-designer.zip -d ~/.claude/skills/
```

### Step 2: Verify Installation

```bash
# Check the skill is installed
ls ~/.claude/skills/ui-ux-designer/

# You should see:
# - SKILL.md
# - references/color_palettes.md
# - references/responsive_design.md
# - references/shadcn_components.md
```

## ✅ Done!

The skill is now available in **all** your Claude Code sessions.

## 🎯 How to Use

Just start a conversation with Claude Code and mention UI/UX keywords:

### Example 1: Redesign a Page
```
"Redesign my dashboard page with modern UI and responsive design"
```

### Example 2: Add Components
```
"Add shadcn components to my contact form with icons"
```

### Example 3: Choose Colors
```
"Help me choose a color palette for my healthcare app"
```

### Example 4: Make Responsive
```
"Make my landing page responsive for mobile, tablet, and desktop"
```

## 📋 What You Get

When you ask for UI/UX help, Claude will:

1. ✅ Analyze your project structure
2. ✅ Present 3-4 color palette options
3. ✅ **Generate shadcn/ui components via MCP** (instant, no npm!)
4. ✅ Implement responsive design (mobile → desktop)
5. ✅ Add icons from Lucide React
6. ✅ Create animations and transitions
7. ✅ Generate UI guidelines document
8. ✅ Test across all breakpoints

## 🎯 MCP-Powered Features

**shadcn MCP Server Integration**:
- ✅ **Instant generation** - No `npm install` required
- ✅ **50+ components** - Button, Input, Card, Dialog, Table, and more
- ✅ **Always current** - Latest component versions
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Accessible** - ARIA built-in

**Example**:
```
You: "Generate a Button component"
MCP: Returns complete TypeScript code
Claude: Customizes with gradients and saves
Result: Production-ready button in seconds!
```

## 🎨 Included Color Palettes

1. **Sunset Gradient** (Purple/Pink) - Like your current AI Zen Garden
2. **Ocean Breeze** (Blue/Cyan) - Professional
3. **Forest Zen** (Green/Emerald) - Natural
4. **Midnight Professional** (Slate/Blue) - Enterprise
5. **Vibrant Coral** (Orange/Red) - Energetic
6. **Royal Indigo** (Indigo/Purple) - Premium

## 📱 Responsive Breakpoints

Your designs will work on:
- 📱 Mobile: 375px+ (iPhone SE)
- 📱 Tablet: 768px+ (iPad)
- 💻 Half-screen: 960px (Split screen)
- 💻 Laptop: 1280px+ (MacBook)
- 🖥️ Desktop: 1920px+

## 🛠️ Technical Stack

The skill works with:
- ⚛️ React
- 🎨 Tailwind CSS
- 🧩 shadcn/ui components
- 🎯 Lucide React icons
- 📦 Vite / Next.js / Create React App

## 📚 Documentation

Full documentation in:
- `UI_UX_DESIGNER_SKILL_README.md` - Complete guide
- `ui-ux-designer/SKILL.md` - Main skill file
- `ui-ux-designer/references/` - 3 reference documents (18,000+ words)

## 🎓 Learn by Example

Your current project already uses this skill:
- `frontend/src/pages/Login.tsx` - Modern login page
- `frontend/src/pages/Register.tsx` - Registration with validation
- `frontend/UI_GUIDELINES.md` - Design system documentation

## 💡 Pro Tips

1. **Be specific**: "Make my login page responsive" works better than "improve UI"
2. **Mention devices**: "Design for mobile and tablet" gets targeted results
3. **Ask for colors**: "Show me color palette options" to see choices
4. **Request documentation**: "Create UI guidelines" for team standards

## 🆘 Troubleshooting

### Skill not activating?
- Make sure you installed to `~/.claude/skills/ui-ux-designer/`
- Mention trigger words: "design", "UI", "shadcn", "responsive", "colors"

### shadcn components not found?
```bash
cd your-project/frontend
npx shadcn@latest init
npx shadcn@latest add button input label card alert
```

### Tailwind classes not working?
- Restart your dev server: `npm run dev`
- Check `tailwind.config.js` includes all file paths

## 🔄 Update the Skill

To update the skill with your own patterns:

1. Edit `~/.claude/skills/ui-ux-designer/references/color_palettes.md`
2. Add your brand colors
3. Add your custom components
4. Save and restart Claude Code

## 🎉 You're Ready!

Start designing beautiful, responsive UIs with Claude Code!

**Next**: Open your project and say:
```
"Help me redesign my homepage with modern UI/UX"
```

---

Need help? Check `UI_UX_DESIGNER_SKILL_README.md` for detailed documentation.
