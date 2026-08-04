import { useI18n } from "../../i18n";
import { LogoCollectionAdmin } from "../components/LogoCollectionAdmin";
import {
  listEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  reorderEquipment,
} from "../../services/endpoints/equipment";

export default function EquipmentAdminPage() {
  const { t } = useI18n();
  return (
    <LogoCollectionAdmin
      title={t.admin.equipmentModule}
      list={listEquipment}
      create={createEquipment}
      update={updateEquipment}
      remove={deleteEquipment}
      reorder={reorderEquipment}
    />
  );
}
