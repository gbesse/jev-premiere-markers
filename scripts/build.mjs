import { build } from 'esbuild';
await build({ entryPoints: ['src/panel.js'], outfile: 'dist/main.js', bundle: true, format: 'cjs', platform: 'browser', target: 'es2022', external: ['premierepro', 'uxp'], loader: { '.json': 'json' }, legalComments: 'none' });

