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
} from 'react-icons/io5'

// Curated set shared by the Categories and Conveniences icon pickers.
// Keeping this list closed (rather than free text) means the public site
// can always trust that a category/amenity has a renderable icon.
export const CURATED_ICONS = [
  { key: 'IoHomeOutline', label: 'House', Icon: IoHomeOutline },
  { key: 'IoBusinessOutline', label: 'Building', Icon: IoBusinessOutline },
  { key: 'IoStorefrontOutline', label: 'Storefront', Icon: IoStorefrontOutline },
  { key: 'IoBedOutline', label: 'Bed', Icon: IoBedOutline },
  { key: 'IoWaterOutline', label: 'Pool / water', Icon: IoWaterOutline },
  { key: 'IoCarSportOutline', label: 'Garage', Icon: IoCarSportOutline },
  { key: 'IoCarOutline', label: 'Parking', Icon: IoCarOutline },
  { key: 'IoWifiOutline', label: 'Wifi', Icon: IoWifiOutline },
  { key: 'IoSnowOutline', label: 'Air conditioning', Icon: IoSnowOutline },
  { key: 'IoSunnyOutline', label: 'Sunny / terrace', Icon: IoSunnyOutline },
  { key: 'IoLeafOutline', label: 'Garden', Icon: IoLeafOutline },
  { key: 'IoBarbellOutline', label: 'Gym', Icon: IoBarbellOutline },
  { key: 'IoShieldCheckmarkOutline', label: 'Security', Icon: IoShieldCheckmarkOutline },
  { key: 'IoLockClosedOutline', label: 'Alarm / lock', Icon: IoLockClosedOutline },
  { key: 'IoTvOutline', label: 'TV / entertainment', Icon: IoTvOutline },
  { key: 'IoRestaurantOutline', label: 'Kitchen', Icon: IoRestaurantOutline },
  { key: 'IoCafeOutline', label: 'Cafe nearby', Icon: IoCafeOutline },
  { key: 'IoConstructOutline', label: 'New build', Icon: IoConstructOutline },
  { key: 'IoSparklesOutline', label: 'Luxury', Icon: IoSparklesOutline },
  { key: 'IoPawOutline', label: 'Pet friendly', Icon: IoPawOutline },
  { key: 'IoPeopleOutline', label: 'Shared space', Icon: IoPeopleOutline },
  { key: 'IoFlashOutline', label: 'Generator', Icon: IoFlashOutline },
  { key: 'IoThermometerOutline', label: 'Heating', Icon: IoThermometerOutline },
  { key: 'IoBoatOutline', label: 'Waterfront', Icon: IoBoatOutline },
]

export function getIconByKey(key) {
  return CURATED_ICONS.find((entry) => entry.key === key)?.Icon ?? IoHomeOutline
}
