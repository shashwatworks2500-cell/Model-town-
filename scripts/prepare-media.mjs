/**
 * Model Town — media pipeline.
 *
 * Turns the supplied source film and reference photography into the exact assets
 * the site consumes:
 *
 *   • A frame sequence for the scroll-scrubbed hero. The source film has a single
 *     keyframe, which makes `video.currentTime` seeking unusably slow, so the hero
 *     draws decoded stills to a canvas instead. Frame-accurate, no seek latency.
 *   • Two art-directed cuts — landscape for wide viewports, a centre portrait crop
 *     for phones. The film is symmetrical about its vertical axis, so the centre
 *     crop keeps the avenue and the flanking villas intact.
 *   • A faststart MP4 for the reduced-motion and no-JavaScript paths.
 *   • Reference photography regraded toward the film's warm palette so the two
 *     sources read as one world.
 *
 * Run: npm run media
 */
import { execFile } from 'node:child_process';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const run = promisify(execFile);

const SOURCE_DIR = process.env.MEDIA_SOURCE_DIR ?? path.resolve('media-source');
const OUT = path.resolve('public/media');

const FILM = path.join(SOURCE_DIR, 'model-town-film.mp4');

/** Source film: 1280x720, 10.042s, 241 frames at 24fps. */
const FILM_DURATION = 10.042;
const LAST_FRAME_T = 9.98;

/**
 * Delivered frame counts. Desktop takes every 2nd source frame, phones every 3rd —
 * enough temporal resolution that scrubbing reads as continuous motion while
 * keeping the payload inside a sane budget for a hero.
 */
const CUTS = {
  lg: { step: 2, filter: 'scale=1280:720', width: 1280, height: 720, quality: 70 },
  sm: { step: 3, filter: 'crop=480:720:400:0', width: 480, height: 720, quality: 68 },
};

/** Reference photography. Order matches the supplied asset order. */
const PHOTOS = [
  {
    id: 'welcome',
    file: '01-lifestyle-welcome.jpeg',
    // NOTE: supplied as a watermarked stock comp. Used at restrained scale and
    // regraded, but it should be swapped for a licensed or project photograph.
    note: 'watermarked stock comp — replace before launch',
  },
  { id: 'community', file: '02-community-gardens.jpeg' },
  { id: 'leisure', file: '03-pool-lifestyle.jpeg' },
  { id: 'interior', file: '04-interior-living.jpeg' },
];

/**
 * Warm grade. The reference photography runs cool and neutral; the film runs warm
 * and hazy. This pulls the stills a few degrees toward the film so images do not
 * read as pasted in from a different project.
 */
const WARM_MATRIX = [
  [1.055, 0.025, -0.02],
  [0.012, 1.0, -0.012],
  [-0.025, 0.015, 0.94],
];

const graded = (pipeline) =>
  pipeline.recomb(WARM_MATRIX).modulate({ saturation: 0.9, brightness: 1.015 }).gamma(1.02);

async function ffmpeg(args) {
  await run(ffmpegPath, ['-v', 'error', '-y', ...args], { maxBuffer: 64 * 1024 * 1024 });
}

async function blurPlaceholder(input) {
  const buf = await graded(sharp(input).resize(16, 16, { fit: 'inside' })).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

async function buildCut(name) {
  const cut = CUTS[name];
  const dir = path.join(OUT, 'film', name);
  const staging = path.join(OUT, '.staging', name);

  await rm(dir, { recursive: true, force: true });
  await rm(staging, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await mkdir(staging, { recursive: true });

  await ffmpeg([
    '-i', FILM,
    '-vf', `select='not(mod(n\\,${cut.step}))',${cut.filter}`,
    '-vsync', '0',
    '-c:v', 'libwebp',
    '-quality', String(cut.quality),
    '-compression_level', '6',
    '-preset', 'photo',
    path.join(staging, '%04d.webp'),
  ]);

  // ffmpeg numbers from 1; the client indexes from 0.
  const files = (await readdir(staging)).filter((f) => f.endsWith('.webp')).sort();
  await Promise.all(
    files.map((file, i) =>
      sharp(path.join(staging, file)).toFile(path.join(dir, `${String(i).padStart(4, '0')}.webp`)),
    ),
  );
  await rm(staging, { recursive: true, force: true });

  console.log(`  ${name}: ${files.length} frames @ ${cut.width}x${cut.height}`);
  return { count: files.length, width: cut.width, height: cut.height };
}

async function buildStills() {
  const dir = path.join(OUT, 'film');
  await mkdir(dir, { recursive: true });
  const tmp = path.join(OUT, '.staging');
  await mkdir(tmp, { recursive: true });

  /** Key moments pulled as full-quality stills for use outside the hero. */
  const stills = [
    { id: 'arrival', t: LAST_FRAME_T, filter: 'scale=1280:720' },
    { id: 'arrival-sm', t: LAST_FRAME_T, filter: 'crop=480:720:400:0' },
    { id: 'land', t: 0.04, filter: 'scale=1280:720' },
    { id: 'plan', t: 2.1, filter: 'scale=1280:720' },
    { id: 'structure', t: 6.0, filter: 'scale=1280:720' },
  ];

  const blur = {};
  const size = {};
  for (const still of stills) {
    const raw = path.join(tmp, `${still.id}.png`);
    await ffmpeg(['-ss', String(still.t), '-i', FILM, '-frames:v', '1', '-vf', still.filter, raw]);
    const out = await sharp(raw).webp({ quality: 86 }).toFile(path.join(dir, `${still.id}.webp`));
    size[still.id] = { width: out.width, height: out.height };
    blur[still.id] = `data:image/webp;base64,${(
      await sharp(raw).resize(16, 16, { fit: 'inside' }).webp({ quality: 40 }).toBuffer()
    ).toString('base64')}`;
  }

  // Social card, composed from the completed development.
  const ogRaw = path.join(tmp, 'og.png');
  await ffmpeg(['-ss', String(LAST_FRAME_T), '-i', FILM, '-frames:v', '1', '-vf', 'crop=1280:672:0:24,scale=1200:630', ogRaw]);
  await sharp(ogRaw).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, 'og.jpg'));

  // Faststart MP4 for the reduced-motion and no-JavaScript paths.
  await ffmpeg([
    '-i', FILM,
    '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-g', '24',
    '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart',
    path.join(dir, 'model-town-film.mp4'),
  ]);

  await rm(tmp, { recursive: true, force: true });
  console.log(`  stills: ${stills.length} + og + mp4`);
  return { blur, size };
}

async function buildPhotos() {
  const dir = path.join(OUT, 'img');
  await mkdir(dir, { recursive: true });
  const blur = {};
  const size = {};
  const notes = {};

  for (const photo of PHOTOS) {
    const src = path.join(SOURCE_DIR, photo.file);
    const out = await graded(sharp(src)).webp({ quality: 82 }).toFile(path.join(dir, `${photo.id}.webp`));
    size[photo.id] = { width: out.width, height: out.height };
    blur[photo.id] = await blurPlaceholder(src);
    if (photo.note) notes[photo.id] = photo.note;
    console.log(`  ${photo.id}: ${out.width}x${out.height}${photo.note ? `  (${photo.note})` : ''}`);
  }
  return { blur, size, notes };
}

async function main() {
  console.log('Model Town — preparing media\n');
  await mkdir(OUT, { recursive: true });

  const cuts = {};
  for (const name of Object.keys(CUTS)) cuts[name] = await buildCut(name);
  const film = await buildStills();
  const photos = await buildPhotos();

  const manifest = {
    film: { duration: FILM_DURATION, cuts },
    blur: { ...film.blur, ...photos.blur },
    size: { ...film.size, ...photos.size },
    /** Source assets that need replacing before launch. */
    notes: photos.notes,
  };

  await writeFile(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  const ts = `// Generated by scripts/prepare-media.mjs — do not edit by hand.\n\nexport const media = ${JSON.stringify(
    manifest,
    null,
    2,
  )} as const;\n\nexport type FilmCut = keyof typeof media.film.cuts;\nexport type MediaId = keyof typeof media.size;\n`;
  await writeFile(path.resolve('src/lib/media.generated.ts'), ts);

  console.log('\nDone.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
