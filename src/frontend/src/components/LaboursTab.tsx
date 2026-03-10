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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../hooks/useAppData";
import type { Labour } from "../hooks/useAppData";

export default function LaboursTab() {
  const { labours, addLabour, editLabour, removeLabour, loading } =
    useAppData();

  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [showAdd, setShowAdd] = useState(false);
  const [editingLabour, setEditingLabour] = useState<Labour | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const openAdd = () => {
    setName("");
    setPhone("");
    setNotes("");
    setShowAdd(true);
  };
  const openEdit = (l: Labour) => {
    setName(l.name);
    setPhone(l.phone);
    setNotes(l.notes);
    setEditingLabour(l);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    await addLabour(name.trim(), phone, notes);
    setShowAdd(false);
    toast.success("Labour added");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLabour || !name.trim()) return;
    await editLabour(editingLabour.id, name.trim(), phone, notes);
    setEditingLabour(null);
    toast.success("Labour updated");
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeLabour(deletingId);
    setDeletingId(null);
    toast.success("Labour deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Labours</h2>
        {isAdmin && (
          <Button onClick={openAdd} data-ocid="labours.add.primary_button">
            + Add Labour
          </Button>
        )}
      </div>

      {loading && (
        <p
          className="text-muted-foreground text-sm"
          data-ocid="labours.loading_state"
        >
          Loading...
        </p>
      )}

      {!loading && labours.length === 0 && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="labours.empty_state"
        >
          No labours yet. Add your first labour.
        </div>
      )}

      {labours.length > 0 && (
        <Table data-ocid="labours.table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Notes</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {labours.map((l, i) => (
              <TableRow
                key={l.id.toString()}
                data-ocid={`labours.row.${i + 1}`}
              >
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell>{l.phone}</TableCell>
                <TableCell>{l.notes}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(l)}
                        data-ocid={`labours.item.${i + 1}.edit_button`}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingId(l.id)}
                        data-ocid={`labours.item.${i + 1}.delete_button`}
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
            <DialogContent data-ocid="labours.add.dialog">
              <DialogHeader>
                <DialogTitle>Add Labour</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    data-ocid="labours.add.name.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    data-ocid="labours.add.phone.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                    data-ocid="labours.add.notes.textarea"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAdd(false)}
                    data-ocid="labours.add.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" data-ocid="labours.add.submit_button">
                    Add
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog
            open={!!editingLabour}
            onOpenChange={(o) => !o && setEditingLabour(null)}
          >
            <DialogContent data-ocid="labours.edit.dialog">
              <DialogHeader>
                <DialogTitle>Edit Labour</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-ocid="labours.edit.name.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-ocid="labours.edit.phone.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    data-ocid="labours.edit.notes.textarea"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingLabour(null)}
                    data-ocid="labours.edit.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" data-ocid="labours.edit.submit_button">
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
            <DialogContent data-ocid="labours.delete.dialog">
              <DialogHeader>
                <DialogTitle>Delete Labour</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this labour?</p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeletingId(null)}
                  data-ocid="labours.delete.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  data-ocid="labours.delete.confirm_button"
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
