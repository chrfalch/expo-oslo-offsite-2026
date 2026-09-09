import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { guideImageTypes, offsiteData, type AccommodationPhoto, type GuideImage } from '../src/data/offsite';

function loadRegistry() {
  const root = process.cwd();
  const filename = join(root, 'src/media/guide-images.ts');
  const { transpileModule, ModuleKind } = createRequire(join(root, 'package.json'))('typescript') as typeof import('typescript');
  const { outputText } = transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ModuleKind.CommonJS } });
  const exports = {} as {
    getAccommodationPhotos: (photos: readonly AccommodationPhoto[]) => { id: string; source: string; caption: string }[];
    getGuideImage: (image: GuideImage | null | undefined, name: string) => { id: string; source: string; caption: string; kind: string; credit?: string } | undefined;
  };
  const bundled = new Set<string>();
  // Stand in for Metro's asset loader while running the actual registry and selector.
  runInNewContext(outputText, { exports, require: (relativePath: string) => {
    assert.match(relativePath, /^\.\.\/\.\.\/assets\/(accommodation|places|food|apps|schedule|workspace)\/[a-z0-9-]+\.(jpg|png|webp)$/);
    const file = resolve(dirname(filename), relativePath);
    const bytes = readFileSync(file);
    if (file.endsWith('.jpg')) assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff', file);
    else if (file.endsWith('.png')) assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', file);
    else {
      assert.equal(bytes.subarray(0, 4).toString(), 'RIFF', file);
      assert.equal(bytes.subarray(8, 12).toString(), 'WEBP', file);
    }
    bundled.add(file);
    return file;
  }, fetch: () => { throw new Error('Network unavailable'); } });

  return { exports, bundled, root };
}

test('every gallery photo resolves to a real bundled JPEG without accessing the network', () => {
  const { exports, root } = loadRegistry();
  const photos = offsiteData.accommodation.options.flatMap((flat) => flat.photos);
  const models = exports.getAccommodationPhotos!(photos);
  assert.equal(models.length, 11);
  models.forEach((model, index) => {
    assert.equal(model.id, photos[index].file);
    assert.equal(model.source, join(root, photos[index].file));
    assert.equal(model.caption, photos[index].caption);
  });
  assert.equal(exports.getAccommodationPhotos!([{ ...photos[0], caption: null }])[0].caption, 'Accommodation photo 1');
  assert.equal(exports.getAccommodationPhotos!([]).length, 0);
  assert.throws(() => exports.getAccommodationPhotos!([{ ...photos[0], file: 'assets/accommodation/missing.jpg' }]), /not bundled/);
});


test('all entity images resolve locally with the right media type and accessible label', () => {
  const { exports, bundled, root } = loadRegistry();
  const entities = [
    ...offsiteData.places,
    ...offsiteData.schedule.map((event) => ({ ...event, name: event.location })),
    ...offsiteData.foodToTry.fromSupermarket, ...offsiteData.foodToTry.outAndAbout,
    ...offsiteData.expoCustomerApps, offsiteData.workspace, offsiteData.support.home,
  ];
  const referenced = new Set(offsiteData.accommodation.options.flatMap((flat) => flat.photos.map((photo) => join(root, photo.file))));
  assert.equal(entities.length, 65);
  for (const entity of entities) {
    const image = entity.image!;
    const model = exports.getGuideImage(image, entity.name)!;
    referenced.add(model.source);
    assert.equal(model.id, image.file);
    assert.equal(model.source, join(root, image.file));
    assert.equal(model.kind, image.type);
    assert.equal(model.caption, image.type === 'photo' ? entity.name : `${entity.name} ${image.type}`);
    assert.equal(model.credit, image.credit ?? undefined);
  }
  assert.deepEqual(bundled, referenced, 'Registry must match every JSON image, with no missing or unused files');
});

test('optional images stay absent, credits survive, and unbundled paths fail clearly', () => {
  const { exports } = loadRegistry();
  assert.equal(exports.getGuideImage(null, 'No image'), undefined);
  assert.equal(exports.getGuideImage(undefined, 'No image'), undefined);
  const image = offsiteData.workspace.image!;
  assert.equal(exports.getGuideImage({ ...image, credit: '  Photo by photographer  ' }, 'Rebel')?.credit, 'Photo by photographer');
  assert.throws(() => exports.getGuideImage({ ...image, file: 'assets/workspace/missing.webp' }, 'Rebel'), /not bundled/);
});

test('image metadata retains supported types, local folders and original provenance', () => {
  const groups = {
    places: [...offsiteData.places, offsiteData.support.home],
    schedule: offsiteData.schedule,
    food: [...offsiteData.foodToTry.fromSupermarket, ...offsiteData.foodToTry.outAndAbout],
    apps: offsiteData.expoCustomerApps,
    workspace: [offsiteData.workspace],
  };
  assert.equal(offsiteData.schemaVersion, '1.4');
  assert.ok(offsiteData.assets.rightsNote.length > 0);
  for (const [folder, entities] of Object.entries(groups)) {
    const assetFolder = offsiteData.assets.folders[folder as keyof typeof groups];
    for (const entity of entities) {
      const image = entity.image!;
      assert.ok(image.file.startsWith(`${assetFolder}/`));
      assert.ok(offsiteData.assets.imageFormats.includes(image.file.split('.').at(-1)!));
      assert.ok(guideImageTypes.includes(image.type));
      // Some originals use HTTP. These URLs are provenance, never image requests.
      assert.ok(['http:', 'https:'].includes(new URL(image.sourceUrl).protocol));
      assert.equal(new URL(image.sourcePage).protocol, 'https:');
      assert.ok(image.sourceDomain.length > 0);
      for (const value of [image.credit, image.licence]) assert.ok(value === null || typeof value === 'string');
      assert.ok(Object.isFrozen(image));
    }
  }
});
