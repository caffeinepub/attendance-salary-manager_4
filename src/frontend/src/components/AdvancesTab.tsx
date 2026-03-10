import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../hooks/useAppData";
import type { Advance } from "../hooks/useAppData";

export default function AdvancesTab() {
  const {
    labours,
    activeContracts,
    advances,
    loadAdvances,
    addAdvance,
    editAdvance,
    removeAdvance,
  } = useAppData();

  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [selectedContractId, setSelectedContractId] = useState<bigint | null>(
    null,
  );
  const [showAdd, setShowAdd] = useState(false);
  const [editingAdv, setEditingAdv] = useState<Advance | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const [addLabourId, setAddLabourId] = useState("");
  const [addContractId, setAddContractId] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addNote, setAddNote] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: load when contract changes
  useEffect(() => {
    if (selectedContractId) loadAdvances(selectedContractId);
  }, [selectedContractId]);

  const cid = selectedContractId?.toString() ?? "";
  const contractAdvances: Advance[] = advances[cid] || [];

  const labourName = (id: bigint) =>
    labours.find((l) => l.id === id)?.name ?? "Unknown";
  const contractName = (id: bigint) =>
    activeContracts.find((c) => c.id === id)?.name ?? "Unknown";

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addLabourId || !addContractId || !addAmount)
      return toast.error("Fill all required fields");
    await addAdvance(
      BigInt(addLabourId),
      BigInt(addContractId),
      Number.parseFloat(addAmount),
      addNote,
    );
    setShowAdd(false);
    toast.success("Advance added");
    setAddLabourId("");
    setAddContractId("");
    setAddAmount("");
    setAddNote("");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdv) return;
    await editAdvance(
      editingAdv.id,
      editingAdv.labourId,
      editingAdv.contractId,
      Number.parseFloat(editAmount),
      editNote,
    );
    setEditingAdv(null);
    toast.success("Advance updated");
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    if (!selectedContractId) return;
    await removeAdvance(deletingId, selectedContractId);
    setDeletingId(null);
    toast.success("Advance deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Advances</h2>
        {isAdmin && (
          <Button
            onClick={() => setShowAdd(true)}
            data-ocid="advances.add.primary_button"
          >
            + Add Advance
          </Button>
        )}
      </div>

      <div className="flex gap-3 items-center">
        <div className="w-48">
          <Select
            value={selectedContractId?.toString() ?? ""}
            onValueChange={(v) => setSelectedContractId(BigInt(v))}
          >
            <SelectTrigger data-ocid="advances.contract.select">
              <SelectValue placeholder="Filter by contract" />
            </SelectTrigger>
            <SelectContent>
              {activeContracts.map((c) => (
                <SelectItem key={c.id.toString()} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedContractId && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="advances.empty_state"
        >
          Select a contract to view advances.
        </div>
      )}

      {selectedContractId && (
        <Table data-ocid="advances.table">
          <TableHeader>
            <TableRow>
              <TableHead>Labour</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Note</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractAdvances.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 5 : 4}
                  className="text-center text-muted-foreground"
                >
                  No advances for this contract.
                </TableCell>
              </TableRow>
            )}
            {contractAdvances.map((adv, i) => (
              <TableRow
                key={adv.id.toString()}
                data-ocid={`advances.row.${i + 1}`}
              >
                <TableCell>{labourName(adv.labourId)}</TableCell>
                <TableCell>{contractName(adv.contractId)}</TableCell>
                <TableCell>₹{adv.amount.toLocaleString()}</TableCell>
                <TableCell>{adv.note}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingAdv(adv);
                          setEditAmount(adv.amount.toString());
                          setEditNote(adv.note);
                        }}
                        data-ocid={`advances.item.${i + 1}.edit_button`}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingId(adv.id)}
                        data-ocid={`advances.item.${i + 1}.delete_button`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {isAdmin && (
        <>
          {/* Add Dialog */}
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogContent data-ocid="advances.add.dialog">
              <DialogHeader>
                <DialogTitle>Add Advance</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1">
                  <Label>Labour</Label>
                  <Select value={addLabourId} onValueChange={setAddLabourId}>
                    <SelectTrigger data-ocid="advances.add.labour.select">
                      <SelectValue placeholder="Select labour" />
                    </SelectTrigger>
                    <SelectContent>
                      {labours.map((l) => (
                        <SelectItem
                          key={l.id.toString()}
                          value={l.id.toString()}
                        >
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Contract</Label>
                  <Select
                    value={addContractId}
                    onValueChange={setAddContractId}
                  >
                    <SelectTrigger data-ocid="advances.add.contract.select">
                      <SelectValue placeholder="Select contract" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeContracts.map((c) => (
                        <SelectItem
                          key={c.id.toString()}
                          value={c.id.toString()}
                        >
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="0"
                    data-ocid="advances.add.amount.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Note</Label>
                  <Input
                    value={addNote}
                    onChange={(e) => setAddNote(e.target.value)}
                    placeholder="Optional note"
                    data-ocid="advances.add.note.input"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAdd(false)}
                    data-ocid="advances.add.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" data-ocid="advances.add.submit_button">
                    Add
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog
            open={!!editingAdv}
            onOpenChange={(o) => !o && setEditingAdv(null)}
          >
            <DialogContent data-ocid="advances.edit.dialog">
              <DialogHeader>
                <DialogTitle>Edit Advance</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="space-y-1">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    data-ocid="advances.edit.amount.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Note</Label>
                  <Input
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    data-ocid="advances.edit.note.input"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingAdv(null)}
                    data-ocid="advances.edit.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" data-ocid="advances.edit.submit_button">
                    Save
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirm */}
          <Dialog
            open={!!deletingId}
            onOpenChange={(o) => !o && setDeletingId(null)}
          >
            <DialogContent data-ocid="advances.delete.dialog">
              <DialogHeader>
                <DialogTitle>Delete Advance</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this advance?</p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeletingId(null)}
                  data-ocid="advances.delete.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  data-ocid="advances.delete.confirm_button"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
