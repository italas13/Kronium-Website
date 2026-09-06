// Central source data — both Sources.jsx and SourceDetail.jsx import from here.
// When you create your GitHub repo, replace the downloadUrl placeholders with real links.

export const SOURCES = [
  // ── CS2 ───────────────────────────────────────────────────────────────────
  {
    id: 'velocitycs2',
    category: 'cs2',
    categoryLabel: 'Counter-Strike 2',
    name: 'Velocity.cat Source Leak',
    type: 'Internal | HvH',
    description:
      'Famous HvH Cheat Source.',
    tags: ['Broken For Visual Studio 2026', 'Hash Based', 'C++'],
    isUpdated: false,
    virusChecked: true,
    virusTotalUrl: 'https://www.virustotal.com/gui/file/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    downloadUrl: 'https://github.com/wubly/velocity/archive/refs/heads/main.zip',
    // Screenshots — add image URLs or local paths here.
    // Local files: drop images into public/sources/velocitycs2/ and use '/sources/velocitycs2/menu.png'
    // External URLs also work: 'https://i.imgur.com/example.png'
    screenshots: [
      '/velocitycs2/menu.png', '/velocitycs2/visuals.png',
    ],
  },
]

// Group sources by category key
export function getCategories() {
  const map = {}
  for (const s of SOURCES) {
    if (!map[s.category]) {
      map[s.category] = { key: s.category, label: s.categoryLabel, sources: [] }
    }
    map[s.category].sources.push(s)
  }
  return Object.values(map)
}

export function getSourceById(id) {
  return SOURCES.find(s => s.id === id) || null
}
