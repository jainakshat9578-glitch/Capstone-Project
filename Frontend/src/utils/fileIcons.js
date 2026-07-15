import {
  FileText, Folder, FolderOpen,
  FileCode, FileJson, FileImage,
  FileType, Globe, Terminal,
  Settings, Package, Lock,
  GitBranch, Coffee, Database,
  Layers, Zap,
} from 'lucide-react';

const EXT_ICONS = {
  // Web
  js:    { icon: FileCode, color: '#f0db4f' },
  jsx:   { icon: FileCode, color: '#61dafb' },
  ts:    { icon: FileCode, color: '#3178c6' },
  tsx:   { icon: FileCode, color: '#3178c6' },
  html:  { icon: Globe,    color: '#e34c26' },
  css:   { icon: Layers,   color: '#264de4' },
  scss:  { icon: Layers,   color: '#cd6799' },
  sass:  { icon: Layers,   color: '#cd6799' },
  // Data
  json:  { icon: FileJson, color: '#fbbf24' },
  yml:   { icon: Settings, color: '#cb171e' },
  yaml:  { icon: Settings, color: '#cb171e' },
  toml:  { icon: Settings, color: '#9c4221' },
  // Images
  png:   { icon: FileImage, color: '#10b981' },
  jpg:   { icon: FileImage, color: '#10b981' },
  jpeg:  { icon: FileImage, color: '#10b981' },
  gif:   { icon: FileImage, color: '#10b981' },
  svg:   { icon: FileImage, color: '#f97316' },
  webp:  { icon: FileImage, color: '#10b981' },
  // Config
  env:   { icon: Lock,     color: '#ef4444' },
  lock:  { icon: Lock,     color: '#6b7280' },
  // DB
  sql:   { icon: Database, color: '#3b82f6' },
  prisma:{ icon: Database, color: '#2d3748' },
  // Misc
  md:    { icon: FileType, color: '#d1d5db' },
  mdx:   { icon: FileType, color: '#d1d5db' },
  sh:    { icon: Terminal, color: '#4ade80' },
  bash:  { icon: Terminal, color: '#4ade80' },
  py:    { icon: FileCode, color: '#3776ab' },
  rs:    { icon: Zap,      color: '#f04a00' },
  go:    { icon: FileCode, color: '#00acd7' },
  rb:    { icon: Coffee,   color: '#cc342d' },
  java:  { icon: Coffee,   color: '#ea2d2e' },
  php:   { icon: FileCode, color: '#787cb5' },
  pkg:   { icon: Package,  color: '#10b981' },
};

const SPECIAL_NAMES = {
  'package.json':      { icon: Package,   color: '#4ade80' },
  'package-lock.json': { icon: Package,   color: '#6b7280' },
  '.gitignore':        { icon: GitBranch, color: '#f34f29' },
  '.env':              { icon: Lock,      color: '#ef4444' },
  'dockerfile':        { icon: Terminal,  color: '#0db7ed' },
  'docker-compose.yml':{ icon: Terminal,  color: '#0db7ed' },
  'vite.config.js':    { icon: Zap,       color: '#fbbf24' },
  'vite.config.ts':    { icon: Zap,       color: '#fbbf24' },
};

export function getFileIcon(name = '', isDir = false, isOpen = false) {
  if (isDir) return { icon: isOpen ? FolderOpen : Folder, color: '#fbbf24' };

  const lower = name.toLowerCase();
  if (SPECIAL_NAMES[lower]) return SPECIAL_NAMES[lower];

  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return EXT_ICONS[ext] ?? { icon: FileText, color: '#9898b8' };
}
