import { describe, expect, it } from 'vitest';
import { mapHeritageApiItem } from '../utils/heritageMapping';

const fallbackImages = ['fallback-a', 'fallback-b'];

const withSafeCoordinates = (item) => ({ ...item, lat: item.lat, lng: item.lng });

describe('mapHeritageApiItem', () => {
  it('prefers a database image_url over the placeholder fallback', () => {
    const result = mapHeritageApiItem(
      {
        title: 'Volcanoes National Park',
        category: 'Wildlife',
        location: 'Musanze',
        lat: '-1.4696',
        lng: '29.4906',
        description: 'A park description',
        image_url: 'https://cdn.example/volcano.jpg',
      },
      0,
      fallbackImages,
      withSafeCoordinates
    );

    expect(result.image).toBe('https://cdn.example/volcano.jpg');
    expect(result.desc).toBe('A park description');
  });

  it('uses image when image_url is not present', () => {
    const result = mapHeritageApiItem(
      {
        title: 'Lake Kivu',
        category: 'Lakes',
        location: 'Rubavu',
        lat: '-1.7025',
        lng: '29.2569',
        description: 'Lake description',
        image: 'https://cdn.example/lake.jpg',
      },
      1,
      fallbackImages,
      withSafeCoordinates
    );

    expect(result.image).toBe('https://cdn.example/lake.jpg');
  });

  it('falls back to the local placeholder when the image is a relative asset path', () => {
    const result = mapHeritageApiItem(
      {
        title: "The King's Palace",
        category: 'Architecture',
        location: 'Nyanza',
        lat: '-2.358',
        lng: '29.546',
        description: 'A palace description',
        image_url: '/assets/explore/nyanza.jpg',
      },
      2,
      fallbackImages,
      withSafeCoordinates
    );

    expect(result.image).toBe('fallback-a');
  });

  it('falls back to the local placeholder when no image is provided', () => {
    const result = mapHeritageApiItem(
      {
        title: 'Akagera National Park',
        category: 'Wildlife',
        location: 'Kayonza',
        lat: '-1.8656',
        lng: '30.7397',
        description: 'A park description',
      },
      2,
      fallbackImages,
      withSafeCoordinates
    );

    expect(result.image).toBe('fallback-a');
  });
});
