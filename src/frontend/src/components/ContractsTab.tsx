import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../hooks/useAppData";
import type { Contract } from "../hooks/useAppData";

interface Props {
  onOpenAttendance: (contractId: bigint) => void;
}

function ContractForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: Contract;
  onSubmit: (data: {
    name: string;
    multiplierValue: number;
    contractAmount: number;
    machineExp: number;
    bedAmount: number;
    paperAmount: number;
    meshAmount: number;
  }) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [multiplier, setMultiplier] = useState(
    initial?.multiplierValue?.toString() ?? "",
  );
  const [contractAmount, setContractAmount] = useState(
    initial?.contractAmount?.toString() ?? "",
  );
  const [machineExp, setMachineExp] = useState(
    initial?.machineExp?.toString() ?? "",
  );
  const [bedOverride, setBedOverride] = useState<string | null>(
    initial ? initial.bedAmount.toString() : null,
  );
  const [paperOverride, setPaperOverride] = useState<string | null>(
    initial ? initial.paperAmount.toString() : null,
  );
  const [saving, setSaving] = useState(false);

  const mult = Number.parseFloat(multiplier) || 0;
  const ca = Number.parseFloat(contractAmount) || 0;
  const me = Number.parseFloat(machineExp) || 0;

  const autoBed = 11000 * mult;
  const autoPaper = 7000 * mult;

  const bedAmount =
    bedOverride !== null ? Number.parseFloat(bedOverride) || 0 : autoBed;
  const paperAmount =
    paperOverride !== null ? Number.parseFloat(paperOverride) || 0 : autoPaper;
  const meshAmount = ca - bedAmount - paperAmount - me;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Contract name is required");
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        multiplierValue: mult,
        contractAmount: ca,
        machineExp: me,
        bedAmount,
        paperAmount,
        meshAmount,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Contract Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contract name"
            data-ocid="contract.name.input"
          />
        </div>
        <div className="space-y-1">
          <Label>Multiplier Value</Label>
          <Input
            type="number"
            step="any"
            value={multiplier}
            onChange={(e) => setMultiplier(e.target.value)}
            placeholder="e.g. 2"
            data-ocid="contract.multiplier.input"
          />
        </div>
        <div className="space-y-1">
          <Label>Contract Amount (₹)</Label>
          <Input
            type="number"
            step="any"
            value={contractAmount}
            onChange={(e) => setContractAmount(e.target.value)}
            placeholder="0"
            data-ocid="contract.amount.input"
          />
        </div>
        <div className="space-y-1">
          <Label>Machine Exp (₹)</Label>
          <Input
            type="number"
            step="any"
            value={machineExp}
            onChange={(e) => setMachineExp(e.target.value)}
            placeholder="0"
            data-ocid="contract.machineexp.input"
          />
        </div>
        <div className="space-y-1">
          <Label>
            Bed Amount (₹){" "}
            <span className="text-xs text-muted-foreground">
              auto: {autoBed.toLocaleString()}
            </span>
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="any"
              value={bedOverride !== null ? bedOverride : autoBed.toString()}
              onChange={(e) => setBedOverride(e.target.value)}
              data-ocid="contract.bed.input"
            />
            {bedOverride !== null && bedOverride !== autoBed.toString() && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setBedOverride(null)}
                title="Reset to auto"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <Label>
            Paper Amount (₹){" "}
            <span className="text-xs text-muted-foreground">
              auto: {autoPaper.toLocaleString()}
            </span>
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="any"
              value={
                paperOverride !== null ? paperOverride : autoPaper.toString()
              }
              onChange={(e) => setPaperOverride(e.target.value)}
              data-ocid="contract.paper.input"
            />
            {paperOverride !== null &&
              paperOverride !== autoPaper.toString() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setPaperOverride(null)}
                  title="Reset to auto"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
          </div>
        </div>
      </div>
      <div className="rounded-md bg-muted p-3 text-sm space-y-1">
        <p>
          <span className="font-medium">Bed Amount:</span> ₹
          {bedAmount.toLocaleString()}
        </p>
        <p>
          <span className="font-medium">Paper Amount:</span> ₹
          {paperAmount.toLocaleString()}
        </p>
        <p>
          <span className="font-medium">Mesh Amount:</span> ₹
          {meshAmount.toLocaleString()}
        </p>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="contract.form.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          data-ocid="contract.form.submit_button"
        >
          {saving ? "Saving..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function ContractsTab({ onOpenAttendance }: Props) {
  const {
    activeContracts,
    addContract,
    editContract,
    settleContract,
    loading,
  } = useAppData();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [showAdd, setShowAdd] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAdd = async (data: {
    name: string;
    multiplierValue: number;
    contractAmount: number;
    machineExp: number;
    bedAmount: number;
    paperAmount: number;
    meshAmount: number;
  }) => {
    await addContract(
      data.name,
      data.multiplierValue,
      data.contractAmount,
      data.machineExp,
      data.bedAmount,
      data.paperAmount,
      data.meshAmount,
    );
    setShowAdd(false);
    toast.success("Contract added");
  };

  const handleEdit = async (data: {
    name: string;
    multiplierValue: number;
    contractAmount: number;
    machineExp: number;
    bedAmount: number;
    paperAmount: number;
    meshAmount: number;
  }) => {
    if (!editingContract) return;
    await editContract(
      editingContract.id,
      data.name,
      data.multiplierValue,
      data.contractAmount,
      data.machineExp,
      data.bedAmount,
      data.paperAmount,
      data.meshAmount,
    );
    setEditingContract(null);
    toast.success("Contract updated");
  };

  const handleSettle = async (id: bigint) => {
    await settleContract(id);
    toast.success("Contract marked as settled");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-display text-foreground">
          Active Contracts
        </h2>
        {isAdmin && (
          <Button
            onClick={() => setShowAdd(true)}
            data-ocid="contracts.add.primary_button"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            + New Contract
          </Button>
        )}
      </div>

      {loading && <p className="text-muted-foreground text-sm">Loading...</p>}

      {!loading && activeContracts.length === 0 && (
        <div
          className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border bg-muted/30"
          data-ocid="contracts.empty_state"
        >
          <p className="text-base font-medium">No contracts yet</p>
          <p className="text-sm mt-1">
            Create your first contract to get started.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {activeContracts.map((c, i) => {
          const idStr = c.id.toString();
          const isExpanded = expandedIds.has(idStr);
          return (
            <Card
              key={idStr}
              data-ocid={`contracts.item.${i + 1}`}
              className="overflow-hidden border border-border shadow-xs hover:shadow-sm transition-shadow"
            >
              {/* Collapsed header — always visible */}
              <CardHeader
                className="pb-0 cursor-pointer select-none"
                onClick={() => toggleExpanded(idStr)}
              >
                <div className="flex items-center justify-between py-1">
                  <span className="font-semibold font-display text-foreground text-base truncate pr-2">
                    {c.name}
                  </span>
                  <button
                    type="button"
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    data-ocid={`contracts.item.${i + 1}.toggle`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </CardHeader>

              {/* Expanded details */}
              {isExpanded && (
                <CardContent className="text-sm space-y-2 pt-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">
                        Multiplier:
                      </span>{" "}
                      {c.multiplierValue}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Contract:
                      </span>{" "}
                      ₹{c.contractAmount.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Machine Exp:
                      </span>{" "}
                      ₹{c.machineExp.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Bed:</span>{" "}
                      ₹{c.bedAmount.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Paper:
                      </span>{" "}
                      ₹{c.paperAmount.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Mesh:</span>{" "}
                      ₹{c.meshAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenAttendance(c.id)}
                      data-ocid={`contracts.item.${i + 1}.button`}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" /> Attendance
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingContract(c)}
                          data-ocid={`contracts.item.${i + 1}.edit_button`}
                        >
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSettle(c.id)}
                          data-ocid={`contracts.item.${i + 1}.secondary_button`}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Settle
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Dialog */}
      {isAdmin && (
        <>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogContent
              className="max-w-2xl"
              data-ocid="contract.add.dialog"
            >
              <DialogHeader>
                <DialogTitle>New Contract</DialogTitle>
              </DialogHeader>
              <ContractForm
                onSubmit={handleAdd}
                onCancel={() => setShowAdd(false)}
                submitLabel="Add Contract"
              />
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog
            open={!!editingContract}
            onOpenChange={(o) => !o && setEditingContract(null)}
          >
            <DialogContent
              className="max-w-2xl"
              data-ocid="contract.edit.dialog"
            >
              <DialogHeader>
                <DialogTitle>Edit Contract</DialogTitle>
              </DialogHeader>
              {editingContract && (
                <ContractForm
                  initial={editingContract}
                  onSubmit={handleEdit}
                  onCancel={() => setEditingContract(null)}
                  submitLabel="Save Changes"
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
