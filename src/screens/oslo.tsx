import { useState } from 'react';

import { getFoodPlaces, offsite, offsiteData } from '@/data/offsite';
import type { GuideCardModel } from '@/presentation/guide-card';
import { OsloView } from '@/presentation/oslo-view';
import { PlacesBrowser } from '@/screens/places';

const sections = [
  { id: 'places', label: 'Places to explore' },
  { id: 'stay', label: 'Stay & logistics' },
  { id: 'food', label: 'Norwegian food' },
  { id: 'packing', label: 'What to pack' },
  { id: 'apps', label: 'Expo customer apps' },
  { id: 'faq', label: 'Good to know' },
];

export default function OsloScreen() {
  const [section, setSection] = useState('places');
  const { workspace, accommodation, packing, packingNote, foodToTry, expoCustomerApps, logistics, faq } = offsiteData;
  const cardsBySection: Record<string, GuideCardModel[]> = {
    stay: [
      { id: 'stay', title: `Staying in ${accommodation.area}`, description: accommodation.note },
      ...accommodation.options.map((flat) => ({
        id: flat.url, title: flat.name, eyebrow: flat.status === 'booked' ? 'BOOKED' : flat.status,
        description: flat.address ?? 'Address and check-in details to follow.',
        links: [{ url: flat.url, label: 'View apartment' }],
      })),
      { id: 'flights', title: 'Flights & travel details', description: `${logistics.flights}\n${logistics.travelDoc}` },
      { id: 'registration', title: 'Registration', description: logistics.registration },
    ],
    food: [
      ...foodToTry.outAndAbout.map((food) => ({
        id: food.name, title: food.name, eyebrow: 'OUT & ABOUT', description: food.description,
        details: getFoodPlaces(food).map((place) => [place.name, place.address].filter(Boolean).join(' · ')),
      })),
      ...foodToTry.fromSupermarket.map((food) => ({
        id: food.name, title: food.name, eyebrow: 'FROM THE SUPERMARKET',
        description: [food.description, food.priceNok ? `Price in NOK: ${food.priceNok}` : null].filter(Boolean).join('\n'),
      })),
    ],
    packing: [
      { id: 'packing', title: 'Ready for September', description: packingNote },
      ...packing.map((item) => ({ id: item.item, title: item.item, description: item.notes.join('\n') })),
    ],
    apps: expoCustomerApps.map((app) => ({
      id: app.name, title: `${app.emoji} ${app.name}`, description: app.description,
      links: [{ url: app.appStoreUrl, label: 'View in App Store' },
        ...(app.siteUrl ? [{ url: app.siteUrl, label: 'Visit website' }] : [])],
    })),
    faq: faq.map((item) => ({ id: item.question, title: item.question, description: item.answer })),
  };
  return (
    <OsloView
      location={offsite.location}
      workspace={{ id: 'workspace', eyebrow: 'OUR OSLO BASE', title: workspace.name,
        description: `${workspace.address} · ${workspace.area}\n${workspace.notes}`,
        links: [{ url: workspace.url, label: 'Visit Rebel' }] }}
      sections={sections}
      section={section}
      onSectionChange={setSection}
      cards={cardsBySection[section] ?? []}
      places={section === 'places' ? <PlacesBrowser /> : undefined}
    />
  );
}
