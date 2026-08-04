import { createLogoCollectionEndpoints } from "./logoCollectionFactory";

const seedClients = [
  "TEDx",
  "MBC Group",
  "OSN",
  "Jeddah Intl. Travel & Tourism Exhibition",
  "Park Hyatt",
  "Sofitel",
  "L'azurde",
  "Lancôme Paris",
  "Sephora",
  "Coca-Cola",
  "Pepsi",
  "Red Bull",
  "Nestlé",
  "Samsung",
  "Huawei",
  "LG",
  "Nokia",
  "McLaren",
  "Saudi Tourism Authority",
  "Jeddah Chamber",
].map((name, index) => ({
  id: `client-seed-${index}`,
  name,
  logoUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=solid&backgroundColor=1c1b1d&textColor=ffb59e`,
  order: index,
}));

const clientsApi = createLogoCollectionEndpoints("clients", seedClients);

export const listClients = clientsApi.list;
export const createClient = clientsApi.create;
export const updateClient = clientsApi.update;
export const deleteClient = clientsApi.remove;
export const reorderClients = clientsApi.reorder;
