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
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../hooks/useAppData";
import type { MeshColumn } from "../hooks/useAppData";

const ATTENDANCE_OPTIONS = [
  "Absent",
  "Present",
  "0.33",
  "0.4",
  "0.5",
  "0.66",
  "0.7",
  "0.8",
  "0.9",
];

function getAttendanceColor(value: string): string {
  if (value === "Present")
    return "bg-green-100 text-green-800 border-green-300";
  if (value === "Absent") return "bg-red-100 text-red-800 border-red-300";
  // partial values
  const partials = ["0.33", "0.4", "0.5", "0.66", "0.7", "0.8", "0.9"];
  if (partials.includes(value))
    return "bg-amber-100 text-amber-800 border-amber-300";
  return "";
}

function getAttendanceItemColor(value: string): string {
  if (value === "Present") return "text-green-700 font-semibold";
  if (value === "Absent") return "text-red-700 font-semibold";
  return "text-amber-700";
}

function attValue(v: string): number {
  if (v === "Absent" || v === "") return 0;
  if (v === "Present") return 1;
  return Number.parseFloat(v) || 0;
}

interface Props {
  initialContractId: bigint | null;
}

export default function AttendanceTab({ initialContractId }: Props) {
  const {
    activeContracts,
    labours,
    meshColumns,
    attendanceRecords,
    loadAttendance,
    addMeshColumn,
    editMeshColumn,
    removeMeshColumn,
    saveAttendanceRecord,
    updateAttendanceRecord,
  } = useAppData();

  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [selectedContractId, setSelectedContractId] = useState<bigint | null>(
    initialContractId,
  );
  const [saving, setSaving] = useState(false);
  const [renamingCol, setRenamingCol] = useState<MeshColumn | null>(null);
  const [newColName, setNewColName] = useState("");
  const [showAddMesh, setShowAddMesh] = useState(false);
  const [newMeshName, setNewMeshName] = useState("");
  const [deletingCol, setDeletingCol] = useState<MeshColumn | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialContractId) setSelectedContractId(initialContractId);
  }, [initialContractId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: load when contract changes
  useEffect(() => {
    if (selectedContractId) {
      loadAttendance(selectedContractId);
      setEdits({});
    }
  }, [selectedContractId]);

  const contract = activeContracts.find((c) => c.id === selectedContractId);
  const cid = selectedContractId?.toString() ?? "";
  const records = attendanceRecords[cid] || [];
  const cols: MeshColumn[] = meshColumns[cid] || [];

  const getRecordValue = useCallback(
    (
      labourId: bigint,
      columnType: string,
      meshColumnId: bigint = BigInt(0),
    ): string => {
      const key = `${labourId}-${columnType}-${meshColumnId}`;
      if (key in edits) return edits[key];
      const rec = records.find(
        (r) =>
          r.labourId === labourId &&
          r.columnType === columnType &&
          r.meshColumnId === meshColumnId,
      );
      return rec?.value ?? "Absent";
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: edits and records are the dependencies
    [edits, records],
  );

  const setEdit = (
    labourId: bigint,
    columnType: string,
    meshColumnId: bigint,
    value: string,
  ) => {
    setEdits((prev) => ({
      ...prev,
      [`${labourId}-${columnType}-${meshColumnId}`]: value,
    }));
  };

  const calcSalaries = () => {
    if (!contract) return {};
    const salaries: Record<string, number> = {};

    for (const labour of labours) {
      let netSalary = 0;

      const bedSum = labours.reduce(
        (acc, l) => acc + attValue(getRecordValue(l.id, "bed", BigInt(0))),
        0,
      );
      if (bedSum > 0) {
        const labourBed = attValue(getRecordValue(labour.id, "bed", BigInt(0)));
        netSalary += (contract.bedAmount * labourBed) / bedSum;
      }

      const paperSum = labours.reduce(
        (acc, l) => acc + attValue(getRecordValue(l.id, "paper", BigInt(0))),
        0,
      );
      if (paperSum > 0) {
        const labourPaper = attValue(
          getRecordValue(labour.id, "paper", BigInt(0)),
        );
        netSalary += (contract.paperAmount * labourPaper) / paperSum;
      }

      const totalMeshSum = labours.reduce((acc, l) => {
        return (
          acc +
          cols.reduce(
            (s, col) => s + attValue(getRecordValue(l.id, "mesh", col.id)),
            0,
          )
        );
      }, 0);
      if (totalMeshSum > 0) {
        const labourMeshTotal = cols.reduce(
          (acc, col) =>
            acc + attValue(getRecordValue(labour.id, "mesh", col.id)),
          0,
        );
        netSalary += (contract.meshAmount * labourMeshTotal) / totalMeshSum;
      }

      salaries[labour.id.toString()] = netSalary;
    }
    return salaries;
  };

  const salaries = calcSalaries();

  const handleSave = async () => {
    if (!selectedContractId) return;
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(edits)) {
        const parts = key.split("-");
        const labourId = BigInt(parts[0]);
        const columnType = parts[1];
        const meshColumnId = BigInt(parts[2]);
        const existing = records.find(
          (r) =>
            r.labourId === labourId &&
            r.columnType === columnType &&
            r.meshColumnId === meshColumnId,
        );
        if (existing) {
          await updateAttendanceRecord(
            existing.id,
            selectedContractId,
            labourId,
            columnType,
            meshColumnId,
            value,
          );
        } else {
          await saveAttendanceRecord(
            selectedContractId,
            labourId,
            columnType,
            meshColumnId,
            value,
          );
        }
      }
      setEdits({});
      toast.success("Attendance saved");
      await loadAttendance(selectedContractId);
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMeshCol = async () => {
    if (!selectedContractId || !newMeshName.trim()) return;
    await addMeshColumn(
      selectedContractId,
      newMeshName.trim(),
      BigInt(cols.length),
    );
    setNewMeshName("");
    setShowAddMesh(false);
    toast.success("Mesh column added");
  };

  const handleRenameCol = async () => {
    if (!renamingCol || !newColName.trim()) return;
    await editMeshColumn(
      renamingCol.id,
      renamingCol.contractId,
      newColName.trim(),
      renamingCol.position,
    );
    setRenamingCol(null);
    toast.success("Column renamed");
  };

  const handleDeleteCol = async () => {
    if (!deletingCol || !selectedContractId) return;
    await removeMeshColumn(deletingCol.id, selectedContractId);
    setDeletingCol(null);
    toast.success("Column deleted");
  };

  // Compute column totals for the totals row
  const totalBed = labours.reduce(
    (acc, l) => acc + attValue(getRecordValue(l.id, "bed", BigInt(0))),
    0,
  );
  const totalPaper = labours.reduce(
    (acc, l) => acc + attValue(getRecordValue(l.id, "paper", BigInt(0))),
    0,
  );
  const totalMeshPerCol = cols.map((col) =>
    labours.reduce(
      (acc, l) => acc + attValue(getRecordValue(l.id, "mesh", col.id)),
      0,
    ),
  );
  const grandTotalSalary = labours.reduce(
    (acc, l) => acc + (salaries[l.id.toString()] || 0),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <Select
            value={selectedContractId?.toString() ?? ""}
            onValueChange={(v) => setSelectedContractId(BigInt(v))}
          >
            <SelectTrigger data-ocid="attendance.contract.select">
              <SelectValue placeholder="Select contract" />
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
        {selectedContractId && isAdmin && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddMesh(true)}
              data-ocid="attendance.addmesh.button"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Mesh Column
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              data-ocid="attendance.save.primary_button"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </>
        )}
      </div>

      {!selectedContractId && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="attendance.empty_state"
        >
          Select a contract to manage attendance.
        </div>
      )}

      {contract && (
        <>
          <div className="text-sm text-muted-foreground">
            Bed: ₹{contract.bedAmount.toLocaleString()} | Paper: ₹
            {contract.paperAmount.toLocaleString()} | Mesh: ₹
            {contract.meshAmount.toLocaleString()}
          </div>
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm border border-border rounded-md"
              data-ocid="attendance.table"
            >
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left border-b border-border">
                    Sl.No
                  </th>
                  <th className="px-3 py-2 text-left border-b border-border">
                    Labour
                  </th>
                  <th className="px-3 py-2 text-left border-b border-border">
                    Bed
                  </th>
                  <th className="px-3 py-2 text-left border-b border-border">
                    Paper
                  </th>
                  {cols.map((col) => (
                    <th
                      key={col.id.toString()}
                      className="px-3 py-2 text-left border-b border-border"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.name}</span>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setRenamingCol(col);
                                setNewColName(col.name);
                              }}
                              className="text-muted-foreground hover:text-foreground"
                              title="Rename"
                              data-ocid="attendance.mesh.edit_button"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCol(col)}
                              className="text-muted-foreground hover:text-destructive"
                              title="Delete"
                              data-ocid="attendance.mesh.delete_button"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left border-b border-border">
                    Net Salary
                  </th>
                </tr>
              </thead>
              <tbody>
                {labours.map((labour, i) => (
                  <tr
                    key={labour.id.toString()}
                    className="border-b border-border last:border-0"
                    data-ocid={`attendance.row.${i + 1}`}
                  >
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{labour.name}</td>
                    <td className="px-3 py-2">
                      <Select
                        value={getRecordValue(labour.id, "bed", BigInt(0))}
                        onValueChange={(v) =>
                          isAdmin
                            ? setEdit(labour.id, "bed", BigInt(0), v)
                            : undefined
                        }
                        disabled={!isAdmin}
                      >
                        <SelectTrigger
                          className={`w-24 h-8 ${getAttendanceColor(getRecordValue(labour.id, "bed", BigInt(0)))}`}
                          data-ocid={`attendance.bed.select.${i + 1}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ATTENDANCE_OPTIONS.map((o) => (
                            <SelectItem
                              key={o}
                              value={o}
                              className={getAttendanceItemColor(o)}
                            >
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        value={getRecordValue(labour.id, "paper", BigInt(0))}
                        onValueChange={(v) =>
                          isAdmin
                            ? setEdit(labour.id, "paper", BigInt(0), v)
                            : undefined
                        }
                        disabled={!isAdmin}
                      >
                        <SelectTrigger
                          className={`w-24 h-8 ${getAttendanceColor(getRecordValue(labour.id, "paper", BigInt(0)))}`}
                          data-ocid={`attendance.paper.select.${i + 1}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ATTENDANCE_OPTIONS.map((o) => (
                            <SelectItem
                              key={o}
                              value={o}
                              className={getAttendanceItemColor(o)}
                            >
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    {cols.map((col) => (
                      <td key={col.id.toString()} className="px-3 py-2">
                        <Select
                          value={getRecordValue(labour.id, "mesh", col.id)}
                          onValueChange={(v) =>
                            isAdmin
                              ? setEdit(labour.id, "mesh", col.id, v)
                              : undefined
                          }
                          disabled={!isAdmin}
                        >
                          <SelectTrigger
                            className={`w-24 h-8 ${getAttendanceColor(getRecordValue(labour.id, "mesh", col.id))}`}
                            data-ocid={`attendance.mesh.select.${i + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_OPTIONS.map((o) => (
                              <SelectItem
                                key={o}
                                value={o}
                                className={getAttendanceItemColor(o)}
                              >
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    ))}
                    <td className="px-3 py-2 font-semibold text-primary">
                      ₹{(salaries[labour.id.toString()] || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {labours.length > 0 && (
                  <tr className="border-t-2 border-border bg-muted/50">
                    <td colSpan={2} className="px-3 py-2 font-bold">
                      Total
                    </td>
                    <td className="px-3 py-2 font-bold text-primary">
                      {totalBed.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-bold text-primary">
                      {totalPaper.toFixed(2)}
                    </td>
                    {cols.map((col, idx) => (
                      <td
                        key={col.id.toString()}
                        className="px-3 py-2 font-bold text-primary"
                      >
                        {totalMeshPerCol[idx].toFixed(2)}
                      </td>
                    ))}
                    <td className="px-3 py-2 font-bold text-primary">
                      ₹{grandTotalSalary.toFixed(2)}
                    </td>
                  </tr>
                )}
                {labours.length === 0 && (
                  <tr>
                    <td
                      colSpan={4 + cols.length}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No labours found. Add labours in the Labours tab.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isAdmin && (
        <>
          <Dialog open={showAddMesh} onOpenChange={setShowAddMesh}>
            <DialogContent data-ocid="attendance.addmesh.dialog">
              <DialogHeader>
                <DialogTitle>Add Mesh Column</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label>Column Name</Label>
                <Input
                  value={newMeshName}
                  onChange={(e) => setNewMeshName(e.target.value)}
                  placeholder="e.g. Mesh 1"
                  data-ocid="attendance.meshname.input"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddMesh(false)}
                  data-ocid="attendance.addmesh.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMeshCol}
                  data-ocid="attendance.addmesh.confirm_button"
                >
                  Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!renamingCol}
            onOpenChange={(o) => !o && setRenamingCol(null)}
          >
            <DialogContent data-ocid="attendance.rename.dialog">
              <DialogHeader>
                <DialogTitle>Rename Column</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label>New Name</Label>
                <Input
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  data-ocid="attendance.rename.input"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRenamingCol(null)}
                  data-ocid="attendance.rename.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRenameCol}
                  data-ocid="attendance.rename.confirm_button"
                >
                  Rename
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!deletingCol}
            onOpenChange={(o) => !o && setDeletingCol(null)}
          >
            <DialogContent data-ocid="attendance.deletecol.dialog">
              <DialogHeader>
                <DialogTitle>Delete Mesh Column</DialogTitle>
              </DialogHeader>
              <p>
                Are you sure you want to delete column "{deletingCol?.name}"?
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeletingCol(null)}
                  data-ocid="attendance.deletecol.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteCol}
                  data-ocid="attendance.deletecol.confirm_button"
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
