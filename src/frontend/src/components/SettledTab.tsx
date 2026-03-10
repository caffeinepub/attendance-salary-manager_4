import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../hooks/useAppData";

export default function SettledTab() {
  const { settledContracts, removeContract, unsettleContract, loading } =
    useAppData();
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeContract(deletingId);
    setDeletingId(null);
    toast.success("Contract deleted");
  };

  const handleUnsettle = async (id: bigint) => {
    await unsettleContract(id);
    toast.success("Contract moved back to active");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Settled Contracts</h2>

      {loading && <p className="text-muted-foreground text-sm">Loading...</p>}

      {!loading && settledContracts.length === 0 && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="settled.empty_state"
        >
          No settled contracts yet.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {settledContracts.map((c, i) => (
          <Card key={c.id.toString()} data-ocid={`settled.item.${i + 1}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{c.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>Contract: ₹{c.contractAmount.toLocaleString()}</p>
              <p>Bed: ₹{c.bedAmount.toLocaleString()}</p>
              <p>Paper: ₹{c.paperAmount.toLocaleString()}</p>
              <p>Mesh: ₹{c.meshAmount.toLocaleString()}</p>
              <p>Machine Exp: ₹{c.machineExp.toLocaleString()}</p>
              {isAdmin && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnsettle(c.id)}
                    data-ocid={`settled.item.${i + 1}.secondary_button`}
                  >
                    <Undo2 className="w-3 h-3 mr-1" /> Unsettle
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeletingId(c.id)}
                    data-ocid={`settled.item.${i + 1}.delete_button`}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdmin && (
        <Dialog
          open={!!deletingId}
          onOpenChange={(o) => !o && setDeletingId(null)}
        >
          <DialogContent data-ocid="settled.delete.dialog">
            <DialogHeader>
              <DialogTitle>Delete Settled Contract</DialogTitle>
            </DialogHeader>
            <p>
              This will permanently delete the contract and all its data.
              Continue?
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeletingId(null)}
                data-ocid="settled.delete.cancel_button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                data-ocid="settled.delete.confirm_button"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
