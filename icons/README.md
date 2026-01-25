# Tool Icons

This folder contains SVG icons for tools in the CAAL registry.

## Icon Hierarchy

The frontend uses this fallback order:
1. **Tool-specific icon** - `google_tasks.svg`, `truenas.svg`
2. **Category icon** - `category-productivity.svg`, `category-homelab.svg`
3. **Generic wrench** - Last resort fallback

## Naming Conventions

**Tool icons:** Match the tool's `name` field
- `google_tasks.svg`
- `espn_nhl.svg`
- `truenas.svg`

**Category icons:** `category-{category}.svg`
- `category-productivity.svg`
- `category-homelab.svg`
- `category-media.svg`
- `category-smart-home.svg`
- `category-sports.svg`
- `category-developer.svg`
- `category-utilities.svg`
- `category-social.svg`
- `category-other.svg`

## Requirements

- **Format:** SVG only
- **Size:** 24x24 viewBox recommended
- **Colors:** Use `currentColor` for theming support, or brand colors
- **Style:** Simple, recognizable silhouettes work best

## Usage in Manifests

Reference icons in `manifest.json`:
```json
{
  "name": "google_tasks",
  "icon": "google_tasks.svg",
  ...
}
```

If `icon` is empty or missing, frontend falls back to category icon.

## Icon URL

Icons are served from:
`https://raw.githubusercontent.com/CoreWorxLab/caal-tools/main/icons/{icon}`
