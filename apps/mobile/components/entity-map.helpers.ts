interface EntityMapRegionPoint {
  lat: number;
  lng: number;
}

interface EntityMapRegionPin {
  id: string;
  location: EntityMapRegionPoint;
}

export function buildEntityMapRegionKey(
  revierCenter: EntityMapRegionPoint | undefined,
  pins: ReadonlyArray<EntityMapRegionPin>
) {
  const centerKey = revierCenter
    ? `center:${revierCenter.lat}:${revierCenter.lng}`
    : "center:default";
  const pinKey = pins
    .map((pin) => `${pin.id}:${pin.location.lat}:${pin.location.lng}`)
    .sort()
    .join("|");

  return `${centerKey};pins:${pinKey}`;
}
