import type { ImageSourcePropType } from 'react-native';
import type { AccommodationPhoto, DeepReadonly, GuideImage } from '../data/offsite-types';

// Literal requires let Metro include every image in native and web bundles.
const sources: Record<string, ImageSourcePropType> = {
  'assets/accommodation/bright-and-nice-torshov-1.jpg': require('../../assets/accommodation/bright-and-nice-torshov-1.jpg'),
  'assets/accommodation/bright-and-nice-torshov-2.jpg': require('../../assets/accommodation/bright-and-nice-torshov-2.jpg'),
  'assets/accommodation/bright-and-nice-torshov-3.jpg': require('../../assets/accommodation/bright-and-nice-torshov-3.jpg'),
  'assets/accommodation/large-loft-torshov-1.jpg': require('../../assets/accommodation/large-loft-torshov-1.jpg'),
  'assets/accommodation/large-loft-torshov-2.jpg': require('../../assets/accommodation/large-loft-torshov-2.jpg'),
  'assets/accommodation/large-loft-torshov-3.jpg': require('../../assets/accommodation/large-loft-torshov-3.jpg'),
  'assets/accommodation/large-loft-torshov-4.jpg': require('../../assets/accommodation/large-loft-torshov-4.jpg'),
  'assets/accommodation/top-apartment-torshov-1.jpg': require('../../assets/accommodation/top-apartment-torshov-1.jpg'),
  'assets/accommodation/top-apartment-torshov-2.jpg': require('../../assets/accommodation/top-apartment-torshov-2.jpg'),
  'assets/accommodation/top-apartment-torshov-3.jpg': require('../../assets/accommodation/top-apartment-torshov-3.jpg'),
  'assets/accommodation/top-apartment-torshov-4.jpg': require('../../assets/accommodation/top-apartment-torshov-4.jpg'),
  'assets/apps/cutters.jpg': require('../../assets/apps/cutters.jpg'),
  'assets/apps/digg.jpg': require('../../assets/apps/digg.jpg'),
  'assets/apps/dr-dropin.jpg': require('../../assets/apps/dr-dropin.jpg'),
  'assets/apps/take-take-take.jpg': require('../../assets/apps/take-take-take.jpg'),
  'assets/apps/thon-hotels.jpg': require('../../assets/apps/thon-hotels.jpg'),
  'assets/apps/vy.jpg': require('../../assets/apps/vy.jpg'),
  'assets/food/brunost.webp': require('../../assets/food/brunost.webp'),
  'assets/food/farikal.jpg': require('../../assets/food/farikal.jpg'),
  'assets/food/freia-melkesjokolade.webp': require('../../assets/food/freia-melkesjokolade.webp'),
  'assets/food/kanelbolle.jpg': require('../../assets/food/kanelbolle.jpg'),
  'assets/food/kaviar.jpg': require('../../assets/food/kaviar.jpg'),
  'assets/food/kvikk-lunsj.webp': require('../../assets/food/kvikk-lunsj.webp'),
  'assets/food/leverpostei.jpg': require('../../assets/food/leverpostei.jpg'),
  'assets/food/makrell-i-tomat.png': require('../../assets/food/makrell-i-tomat.png'),
  'assets/food/matpakke.jpg': require('../../assets/food/matpakke.jpg'),
  'assets/food/polse-med-lompe.jpg': require('../../assets/food/polse-med-lompe.jpg'),
  'assets/food/solo.png': require('../../assets/food/solo.png'),
  'assets/food/vaffel.jpg': require('../../assets/food/vaffel.jpg'),
  'assets/places/175c-k-fried.webp': require('../../assets/places/175c-k-fried.webp'),
  'assets/places/200.webp': require('../../assets/places/200.webp'),
  'assets/places/apent-bakeri-torshov.webp': require('../../assets/places/apent-bakeri-torshov.webp'),
  'assets/places/apostrophe.webp': require('../../assets/places/apostrophe.webp'),
  'assets/places/bar-lupo.webp': require('../../assets/places/bar-lupo.webp'),
  'assets/places/bff-torshov.webp': require('../../assets/places/bff-torshov.webp'),
  'assets/places/crow-bar.webp': require('../../assets/places/crow-bar.webp'),
  'assets/places/christian-home.jpg': require('../../assets/places/christian-home.jpg'),
  'assets/places/duken.webp': require('../../assets/places/duken.webp'),
  'assets/places/dumpling-as.webp': require('../../assets/places/dumpling-as.webp'),
  'assets/places/ekebergparken.jpg': require('../../assets/places/ekebergparken.jpg'),
  'assets/places/fabrikken-oslo.webp': require('../../assets/places/fabrikken-oslo.webp'),
  'assets/places/fiskeriet.webp': require('../../assets/places/fiskeriet.webp'),
  'assets/places/fourrage.webp': require('../../assets/places/fourrage.webp'),
  'assets/places/fuglen.webp': require('../../assets/places/fuglen.webp'),
  'assets/places/godt-brod.webp': require('../../assets/places/godt-brod.webp'),
  'assets/places/good-knight.jpg': require('../../assets/places/good-knight.jpg'),
  'assets/places/grotto.webp': require('../../assets/places/grotto.webp'),
  'assets/places/grunerlokka-brygghus.jpg': require('../../assets/places/grunerlokka-brygghus.jpg'),
  'assets/places/haralds-vaffel.webp': require('../../assets/places/haralds-vaffel.webp'),
  'assets/places/hos-peder.jpg': require('../../assets/places/hos-peder.jpg'),
  'assets/places/jamals-falafel.jpg': require('../../assets/places/jamals-falafel.jpg'),
  'assets/places/java-espressobar.webp': require('../../assets/places/java-espressobar.webp'),
  'assets/places/jungel-pizza.jpg': require('../../assets/places/jungel-pizza.jpg'),
  'assets/places/kaffistova.jpg': require('../../assets/places/kaffistova.jpg'),
  'assets/places/kiwi-vogts-gate.png': require('../../assets/places/kiwi-vogts-gate.png'),
  'assets/places/kork.webp': require('../../assets/places/kork.webp'),
  'assets/places/lorry.jpg': require('../../assets/places/lorry.jpg'),
  'assets/places/mocca-kaffebar.jpg': require('../../assets/places/mocca-kaffebar.jpg'),
  'assets/places/munch.jpg': require('../../assets/places/munch.jpg'),
  'assets/places/national-museum.webp': require('../../assets/places/national-museum.webp'),
  'assets/places/oslo-camping.webp': require('../../assets/places/oslo-camping.webp'),
  'assets/places/pao.jpg': require('../../assets/places/pao.jpg'),
  'assets/places/papegoye.webp': require('../../assets/places/papegoye.webp'),
  'assets/places/parkteatret.jpg': require('../../assets/places/parkteatret.jpg'),
  'assets/places/rebel-hangout.webp': require('../../assets/places/rebel-hangout.webp'),
  'assets/places/render.jpg': require('../../assets/places/render.jpg'),
  'assets/places/skaal.jpg': require('../../assets/places/skaal.jpg'),
  'assets/places/stykke-pizza.webp': require('../../assets/places/stykke-pizza.webp'),
  'assets/places/supreme-roastworks.webp': require('../../assets/places/supreme-roastworks.webp'),
  'assets/places/syverkiosken.jpg': require('../../assets/places/syverkiosken.jpg'),
  'assets/places/tim-wendelboe.jpg': require('../../assets/places/tim-wendelboe.jpg'),
  'assets/places/trancher.png': require('../../assets/places/trancher.png'),
  'assets/places/tyren-torshov.webp': require('../../assets/places/tyren-torshov.webp'),
  'assets/schedule/official-dinner.png': require('../../assets/schedule/official-dinner.png'),
  'assets/schedule/sauna.jpg': require('../../assets/schedule/sauna.jpg'),
  'assets/workspace/rebel.webp': require('../../assets/workspace/rebel.webp'),
};

function bundledSource(file: string) {
  const source = sources[file];
  if (!source) throw new Error(`Guide image is not bundled: ${file}`);
  return source;
}

/** Source URLs are provenance only. Rendering always uses the bundled file. */
export function getGuideImage(image: DeepReadonly<GuideImage> | null | undefined, name: string) {
  if (!image) return undefined;
  return {
    id: image.file,
    source: bundledSource(image.file),
    caption: image.type === 'photo' ? name : `${name} ${image.type}`,
    kind: image.type,
    credit: image.credit?.trim() || undefined,
    creditUrl: image.credit?.trim() ? image.sourcePage : undefined,
    licence: image.licenceUrl ? image.licence ?? undefined : undefined,
    licenceUrl: image.licenceUrl,
    aspectRatio: image.aspectRatio,
  };
}

export function getAccommodationPhotos(photos: readonly DeepReadonly<AccommodationPhoto>[]) {
  return photos.map((photo, index) => ({
    id: photo.file,
    source: bundledSource(photo.file),
    caption: photo.caption?.trim() || `Accommodation photo ${index + 1}`,
  }));
}
