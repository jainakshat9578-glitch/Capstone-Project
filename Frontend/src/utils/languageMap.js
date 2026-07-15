// Map file extension → Monaco language ID
export const LANGUAGE_MAP = {
  js:    'javascript',
  jsx:   'javascript',
  ts:    'typescript',
  tsx:   'typescript',
  html:  'html',
  htm:   'html',
  css:   'css',
  scss:  'scss',
  sass:  'scss',
  less:  'less',
  json:  'json',
  jsonc: 'json',
  md:    'markdown',
  mdx:   'markdown',
  yml:   'yaml',
  yaml:  'yaml',
  xml:   'xml',
  svg:   'xml',
  sh:    'shell',
  bash:  'shell',
  zsh:   'shell',
  py:    'python',
  rb:    'ruby',
  go:    'go',
  rs:    'rust',
  java:  'java',
  kt:    'kotlin',
  swift: 'swift',
  php:   'php',
  c:     'c',
  cpp:   'cpp',
  cs:    'csharp',
  dockerfile: 'dockerfile',
  toml:  'ini',
  ini:   'ini',
  env:   'ini',
  sql:   'sql',
  prisma:'graphql',
  graphql:'graphql',
  gql:   'graphql',
  vue:   'html',
  svelte:'html',
};

export function getLanguage(filename = '') {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const basename = filename.split('/').pop()?.toLowerCase() ?? '';
  if (basename === 'dockerfile') return 'dockerfile';
  if (basename === '.env' || basename.startsWith('.env.')) return 'ini';
  return LANGUAGE_MAP[ext] ?? 'plaintext';
}
