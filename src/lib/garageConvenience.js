import { resolveIcon } from "./iconMap";

// "Garage" isn't a row in `amenities` — it's the numeric `garage` column on
// `properties` (see the dashboard's PropertyForm, which has a dedicated
// Garage number input separate from the amenities checklist). We still want
// it to behave like a convenience filter on the public site, so it's kept
// as a synthetic entry with an id that can never collide with a real
// amenity uuid.
export const GARAGE_CONVENIENCE = {
  id: "garage",
  name: "Garage",
  icon: resolveIcon("IoCarSportOutline"),
};
