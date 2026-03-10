import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useAppData } from "../hooks/useAppData";

function attValue(v: string): number {
  if (!v || v === "Absent") return 0;
  if (v === "Present") return 1;
  return Number.parseFloat(v) || 0;
}

export default function PaymentsTab() {
  const {
    labours,
    activeContracts,
    meshColumns,
    attendanceRecords,
    advances,
    loadAttendance,
    loadAdvances,
  } = useAppData();

  const [selectedContractIds, setSelectedContractIds] = useState<bigint[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const toggleContract = (id: bigint) => {
    setSelectedContractIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: load data for selected contracts
  useEffect(() => {
    for (const id of selectedContractIds) {
      const cid = id.toString();
      if (!attendanceRecords[cid]) loadAttendance(id);
      if (!advances[cid]) loadAdvances(id);
    }
  }, [selectedContractIds]);

  const calcContractEarnings = (contractId: bigint) => {
    const contract = activeContracts.find((c) => c.id === contractId);
    if (!contract) return {};
    const cid = contractId.toString();
    const records = attendanceRecords[cid] || [];
    const cols = meshColumns[cid] || [];

    const getVal = (
      labourId: bigint,
      columnType: string,
      meshColumnId: bigint = BigInt(0),
    ) => {
      const rec = records.find(
        (r) =>
          r.labourId === labourId &&
          r.columnType === columnType &&
          r.meshColumnId === meshColumnId,
      );
      return attValue(rec?.value ?? "Absent");
    };

    const earnings: Record<string, number> = {};
    for (const labour of labours) {
      let net = 0;
      const bedSum = labours.reduce((a, l) => a + getVal(l.id, "bed"), 0);
      if (bedSum > 0)
        net += (contract.bedAmount * getVal(labour.id, "bed")) / bedSum;

      const paperSum = labours.reduce((a, l) => a + getVal(l.id, "paper"), 0);
      if (paperSum > 0)
        net += (contract.paperAmount * getVal(labour.id, "paper")) / paperSum;

      const totalMeshSum = labours.reduce(
        (a, l) =>
          a + cols.reduce((s, col) => s + getVal(l.id, "mesh", col.id), 0),
        0,
      );
      if (totalMeshSum > 0) {
        const labourMesh = cols.reduce(
          (a, col) => a + getVal(labour.id, "mesh", col.id),
          0,
        );
        net += (contract.meshAmount * labourMesh) / totalMeshSum;
      }
      earnings[labour.id.toString()] = net;
    }
    return earnings;
  };

  const selectedContracts = activeContracts.filter((c) =>
    selectedContractIds.includes(c.id),
  );

  const paymentData = labours.map((labour) => {
    const perContract: Record<string, number> = {};
    let totalEarnings = 0;
    for (const contract of selectedContracts) {
      const e = calcContractEarnings(contract.id);
      const earned = e[labour.id.toString()] || 0;
      perContract[contract.id.toString()] = earned;
      totalEarnings += earned;
    }

    const totalAdvances = selectedContractIds.reduce((acc, cid) => {
      const advList = advances[cid.toString()] || [];
      return (
        acc +
        advList
          .filter((a) => a.labourId === labour.id)
          .reduce((s, a) => s + a.amount, 0)
      );
    }, 0);

    return {
      labour,
      perContract,
      totalEarnings,
      totalAdvances,
      netSalary: totalEarnings - totalAdvances,
    };
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Payment Calculator</h2>

      <div className="space-y-2">
        <Label className="font-medium">Select Contracts</Label>
        <div className="flex flex-wrap gap-4">
          {activeContracts.map((c, i) => (
            <div
              key={c.id.toString()}
              className="flex items-center gap-2"
              data-ocid={`payments.contract.item.${i + 1}`}
            >
              <Checkbox
                id={`contract-${c.id}`}
                checked={selectedContractIds.includes(c.id)}
                onCheckedChange={() => toggleContract(c.id)}
                data-ocid={`payments.contract.checkbox.${i + 1}`}
              />
              <Label htmlFor={`contract-${c.id}`} className="cursor-pointer">
                {c.name}
              </Label>
            </div>
          ))}
          {activeContracts.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No active contracts.
            </p>
          )}
        </div>
      </div>

      {selectedContractIds.length > 0 && (
        <div className="flex items-center gap-3">
          <Switch
            checked={showBreakdown}
            onCheckedChange={setShowBreakdown}
            id="breakdown-toggle"
            data-ocid="payments.breakdown.switch"
          />
          <Label htmlFor="breakdown-toggle">Show Breakdown per Contract</Label>
        </div>
      )}

      {selectedContractIds.length === 0 && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="payments.empty_state"
        >
          Select one or more contracts to calculate payments.
        </div>
      )}

      {selectedContractIds.length > 0 && (
        <div className="overflow-x-auto">
          <Table data-ocid="payments.table">
            <TableHeader>
              <TableRow>
                <TableHead>Sl.No</TableHead>
                <TableHead>Labour</TableHead>
                {showBreakdown &&
                  selectedContracts.map((c) => (
                    <TableHead key={c.id.toString()}>
                      {c.name} Earnings
                    </TableHead>
                  ))}
                <TableHead>Total Earnings</TableHead>
                <TableHead>Total Advances</TableHead>
                <TableHead>Net Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentData.map((row, i) => (
                <TableRow
                  key={row.labour.id.toString()}
                  data-ocid={`payments.row.${i + 1}`}
                >
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">
                    {row.labour.name}
                  </TableCell>
                  {showBreakdown &&
                    selectedContracts.map((c) => (
                      <TableCell key={c.id.toString()}>
                        ₹{(row.perContract[c.id.toString()] || 0).toFixed(2)}
                      </TableCell>
                    ))}
                  <TableCell>₹{row.totalEarnings.toFixed(2)}</TableCell>
                  <TableCell className="text-destructive">
                    -₹{row.totalAdvances.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    ₹{row.netSalary.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {labours.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4 + selectedContracts.length}
                    className="text-center text-muted-foreground"
                  >
                    No labours found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
