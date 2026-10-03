import {
  IoHomeOutline,
  IoBusinessOutline,
  IoStorefrontOutline,
  IoBedOutline,
  IoWaterOutline,
  IoCarSportOutline,
  IoCarOutline,
  IoWifiOutline,
  IoSnowOutline,
  IoSunnyOutline,
  IoLeafOutline,
  IoBarbellOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoTvOutline,
  IoRestaurantOutline,
  IoCafeOutline,
  IoConstructOutline,
  IoSparklesOutline,
  IoPawOutline,
  IoPeopleOutline,
  IoFlashOutline,
  IoThermometerOutline,
  IoBoatOutline,
} from "react-icons/io5";

// Mirrors the dashboard's `Dashboard/shared/curatedIcons.js` exactly — the
// admin's icon picker only ever writes one of these keys to `categories.icon`
// / `amenities.icon`, so this map is guaranteed to cover every value that
// can come back from Supabase. Keep the two lists in sync if either changes.
const ICONS_BY_KEY = {
  IoHomeOutline,
  IoBusinessOutline,
  IoStorefrontOutline,
  IoBedOutline,
  IoWaterOutline,
  IoCarSportOutline,
  IoCarOutline,
  IoWifiOutline,
  IoSnowOutline,
  IoSunnyOutline,
  IoLeafOutline,
  IoBarbellOutline,
  IoShieldCheckmarkOutline,
  IoLockClosedOutline,
  IoTvOutline,
  IoRestaurantOutline,
  IoCafeOutline,
  IoConstructOutline,
  IoSparklesOutline,
  IoPawOutline,
  IoPeopleOutline,
  IoFlashOutline,
  IoThermometerOutline,
  IoBoatOutline,
};

// `key` can be null/undefined/an unrecognized string (e.g. an icon added to
// the curated list later on one app but not yet mirrored here) — always
// fall back to something renderable rather than crashing.
export function resolveIcon(key) {
  return (key && ICONS_BY_KEY[key]) || IoHomeOutline;
}
