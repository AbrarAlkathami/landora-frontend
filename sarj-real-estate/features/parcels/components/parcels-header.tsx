import { AddParcelDialog } from "./add-parcel-dialog";

export function ParcelsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Parcels</h1>
        <p className="text-sm text-muted-foreground">
          Manage the land portfolio.
        </p>
      </div>

      <AddParcelDialog />
    </div>
  );
}