import { createLogoCollectionEndpoints } from "./logoCollectionFactory";

const seedEquipment = [
  "Sony",
  "Canon",
  "RED",
  "ARRI",
  "Blackmagic",
  "DJI",
  "Zeiss",
  "Atomos",
  "Aputure",
  "Sennheiser",
].map((name, index) => ({
  id: `equipment-seed-${index}`,
  name,
  logoUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=solid&backgroundColor=1c1b1d&textColor=ffba26`,
  order: index,
}));

const equipmentApi = createLogoCollectionEndpoints("equipment", seedEquipment);

export const listEquipment = equipmentApi.list;
export const createEquipment = equipmentApi.create;
export const updateEquipment = equipmentApi.update;
export const deleteEquipment = equipmentApi.remove;
export const reorderEquipment = equipmentApi.reorder;
