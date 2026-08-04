import { useI18n } from "../../i18n";
import { LogoCollectionAdmin } from "../components/LogoCollectionAdmin";
import {
  listClients,
  createClient,
  updateClient,
  deleteClient,
  reorderClients,
} from "../../services/endpoints/clients";

export default function ClientsAdminPage() {
  const { t } = useI18n();
  return (
    <LogoCollectionAdmin
      title={t.admin.clientsModule}
      list={listClients}
      create={createClient}
      update={updateClient}
      remove={deleteClient}
      reorder={reorderClients}
    />
  );
}
