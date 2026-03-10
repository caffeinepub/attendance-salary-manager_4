import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  Advance,
  AttendanceRecord,
  Contract,
  Labour,
  MeshColumn,
} from "../backend";
import { useActor } from "./useActor";

export type { Labour, Contract, MeshColumn, AttendanceRecord, Advance };

interface AppData {
  labours: Labour[];
  activeContracts: Contract[];
  settledContracts: Contract[];
  meshColumns: Record<string, MeshColumn[]>;
  attendanceRecords: Record<string, AttendanceRecord[]>;
  advances: Record<string, Advance[]>;
  loading: boolean;
  addLabour: (name: string, phone: string, notes: string) => Promise<void>;
  editLabour: (
    id: bigint,
    name: string,
    phone: string,
    notes: string,
  ) => Promise<void>;
  removeLabour: (id: bigint) => Promise<void>;
  addContract: (
    name: string,
    multiplierValue: number,
    contractAmount: number,
    machineExp: number,
    bedAmount: number,
    paperAmount: number,
    meshAmount: number,
  ) => Promise<Contract>;
  editContract: (
    id: bigint,
    name: string,
    multiplierValue: number,
    contractAmount: number,
    machineExp: number,
    bedAmount: number,
    paperAmount: number,
    meshAmount: number,
  ) => Promise<void>;
  removeContract: (id: bigint) => Promise<void>;
  settleContract: (id: bigint) => Promise<void>;
  unsettleContract: (id: bigint) => Promise<void>;
  addMeshColumn: (
    contractId: bigint,
    name: string,
    position: bigint,
  ) => Promise<MeshColumn>;
  editMeshColumn: (
    id: bigint,
    contractId: bigint,
    name: string,
    position: bigint,
  ) => Promise<void>;
  removeMeshColumn: (id: bigint, contractId: bigint) => Promise<void>;
  loadAttendance: (contractId: bigint) => Promise<void>;
  saveAttendanceRecord: (
    contractId: bigint,
    labourId: bigint,
    columnType: string,
    meshColumnId: bigint,
    value: string,
  ) => Promise<AttendanceRecord>;
  updateAttendanceRecord: (
    id: bigint,
    contractId: bigint,
    labourId: bigint,
    columnType: string,
    meshColumnId: bigint,
    value: string,
  ) => Promise<void>;
  deleteAttendanceRecord: (id: bigint, contractId: bigint) => Promise<void>;
  loadAdvances: (contractId: bigint) => Promise<void>;
  addAdvance: (
    labourId: bigint,
    contractId: bigint,
    amount: number,
    note: string,
  ) => Promise<void>;
  editAdvance: (
    id: bigint,
    labourId: bigint,
    contractId: bigint,
    amount: number,
    note: string,
  ) => Promise<void>;
  removeAdvance: (id: bigint, contractId: bigint) => Promise<void>;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { actor: backendActor } = useActor();
  const [labours, setLabours] = useState<Labour[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [settledContracts, setSettledContracts] = useState<Contract[]>([]);
  const [meshColumns, setMeshColumns] = useState<Record<string, MeshColumn[]>>(
    {},
  );
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord[]>
  >({});
  const [advances, setAdvances] = useState<Record<string, Advance[]>>({});
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    async function init() {
      try {
        const [active, settled] = await Promise.all([
          backendActor!.getContractsBySettled(false),
          backendActor!.getContractsBySettled(true),
        ]);
        setActiveContracts(active);
        setSettledContracts(settled);

        const ids: number[] = JSON.parse(
          localStorage.getItem("labourIds") || "[]",
        );
        if (ids.length > 0) {
          const loaded = await Promise.allSettled(
            ids.map((id) => backendActor!.readLabour(BigInt(id))),
          );
          const validLabours = loaded
            .filter(
              (r): r is PromiseFulfilledResult<Labour> =>
                r.status === "fulfilled",
            )
            .map((r) => r.value);
          setLabours(validLabours);
          localStorage.setItem(
            "labourIds",
            JSON.stringify(validLabours.map((l) => Number(l.id))),
          );
        }

        const meshColIds: Record<string, number[]> = JSON.parse(
          localStorage.getItem("meshColIds") || "{}",
        );
        const meshMap: Record<string, MeshColumn[]> = {};
        for (const [cid, colIds] of Object.entries(meshColIds)) {
          if (colIds.length > 0) {
            const loaded = await Promise.allSettled(
              colIds.map((id) => backendActor!.readMeshColumn(BigInt(id))),
            );
            const valid = loaded
              .filter(
                (r): r is PromiseFulfilledResult<MeshColumn> =>
                  r.status === "fulfilled",
              )
              .map((r) => r.value);
            meshMap[cid] = valid.sort(
              (a, b) => Number(a.position) - Number(b.position),
            );
          }
        }
        setMeshColumns(meshMap);
      } catch (e) {
        console.error("Init error", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const addLabour = async (name: string, phone: string, notes: string) => {
    const labour = await backendActor!.createLabour(name, phone, notes);
    setLabours((prev) => [...prev, labour]);
    const ids: number[] = JSON.parse(localStorage.getItem("labourIds") || "[]");
    ids.push(Number(labour.id));
    localStorage.setItem("labourIds", JSON.stringify(ids));
  };

  const editLabour = async (
    id: bigint,
    name: string,
    phone: string,
    notes: string,
  ) => {
    const updated = await backendActor!.updateLabour(id, name, phone, notes);
    setLabours((prev) => prev.map((l) => (l.id === id ? updated : l)));
  };

  const removeLabour = async (id: bigint) => {
    await backendActor!.deleteLabour(id);
    setLabours((prev) => prev.filter((l) => l.id !== id));
    const ids: number[] = JSON.parse(localStorage.getItem("labourIds") || "[]");
    localStorage.setItem(
      "labourIds",
      JSON.stringify(ids.filter((i) => i !== Number(id))),
    );
  };

  const addContract = async (
    name: string,
    multiplierValue: number,
    contractAmount: number,
    machineExp: number,
    bedAmount: number,
    paperAmount: number,
    meshAmount: number,
  ): Promise<Contract> => {
    const contract = await backendActor!.createContract(
      name,
      multiplierValue,
      contractAmount,
      machineExp,
      bedAmount,
      paperAmount,
      meshAmount,
    );
    setActiveContracts((prev) => [...prev, contract]);
    return contract;
  };

  const editContract = async (
    id: bigint,
    name: string,
    multiplierValue: number,
    contractAmount: number,
    machineExp: number,
    bedAmount: number,
    paperAmount: number,
    meshAmount: number,
  ) => {
    const updated = await backendActor!.updateContract(
      id,
      name,
      multiplierValue,
      contractAmount,
      machineExp,
      bedAmount,
      paperAmount,
      meshAmount,
    );
    setActiveContracts((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const removeContract = async (id: bigint) => {
    await backendActor!.deleteContract(id);
    setActiveContracts((prev) => prev.filter((c) => c.id !== id));
    setSettledContracts((prev) => prev.filter((c) => c.id !== id));
  };

  const settleContract = async (id: bigint) => {
    const updated = await backendActor!.updateContractSettled(id, true);
    setActiveContracts((prev) => prev.filter((c) => c.id !== id));
    setSettledContracts((prev) => [...prev, updated]);
  };

  const unsettleContract = async (id: bigint) => {
    const updated = await backendActor!.updateContractSettled(id, false);
    setSettledContracts((prev) => prev.filter((c) => c.id !== id));
    setActiveContracts((prev) => [...prev, updated]);
  };

  const addMeshColumn = async (
    contractId: bigint,
    name: string,
    position: bigint,
  ): Promise<MeshColumn> => {
    const col = await backendActor!.createMeshColumn(
      contractId,
      name,
      position,
    );
    const cid = contractId.toString();
    setMeshColumns((prev) => {
      const existing = prev[cid] || [];
      const updated = [...existing, col].sort(
        (a, b) => Number(a.position) - Number(b.position),
      );
      return { ...prev, [cid]: updated };
    });
    const meshColIds: Record<string, number[]> = JSON.parse(
      localStorage.getItem("meshColIds") || "{}",
    );
    meshColIds[cid] = [...(meshColIds[cid] || []), Number(col.id)];
    localStorage.setItem("meshColIds", JSON.stringify(meshColIds));
    return col;
  };

  const editMeshColumn = async (
    id: bigint,
    contractId: bigint,
    name: string,
    position: bigint,
  ) => {
    const updated = await backendActor!.updateMeshColumn(
      id,
      contractId,
      name,
      position,
    );
    const cid = contractId.toString();
    setMeshColumns((prev) => {
      const existing = prev[cid] || [];
      return {
        ...prev,
        [cid]: existing
          .map((c) => (c.id === id ? updated : c))
          .sort((a, b) => Number(a.position) - Number(b.position)),
      };
    });
  };

  const removeMeshColumn = async (id: bigint, contractId: bigint) => {
    await backendActor!.deleteMeshColumn(id);
    const cid = contractId.toString();
    setMeshColumns((prev) => {
      const existing = prev[cid] || [];
      return { ...prev, [cid]: existing.filter((c) => c.id !== id) };
    });
    const meshColIds: Record<string, number[]> = JSON.parse(
      localStorage.getItem("meshColIds") || "{}",
    );
    meshColIds[cid] = (meshColIds[cid] || []).filter((i) => i !== Number(id));
    localStorage.setItem("meshColIds", JSON.stringify(meshColIds));
  };

  const loadAttendance = async (contractId: bigint) => {
    const records =
      await backendActor!.getAttendanceRecordsByContract(contractId);
    setAttendanceRecords((prev) => ({
      ...prev,
      [contractId.toString()]: records,
    }));
  };

  const saveAttendanceRecord = async (
    contractId: bigint,
    labourId: bigint,
    columnType: string,
    meshColumnId: bigint,
    value: string,
  ): Promise<AttendanceRecord> => {
    const record = await backendActor!.createAttendanceRecord(
      contractId,
      labourId,
      columnType,
      meshColumnId,
      value,
    );
    const cid = contractId.toString();
    setAttendanceRecords((prev) => ({
      ...prev,
      [cid]: [...(prev[cid] || []), record],
    }));
    return record;
  };

  const updateAttendanceRecord = async (
    id: bigint,
    contractId: bigint,
    labourId: bigint,
    columnType: string,
    meshColumnId: bigint,
    value: string,
  ) => {
    const updated = await backendActor!.updateAttendanceRecord(
      id,
      contractId,
      labourId,
      columnType,
      meshColumnId,
      value,
    );
    const cid = contractId.toString();
    setAttendanceRecords((prev) => ({
      ...prev,
      [cid]: (prev[cid] || []).map((r) => (r.id === id ? updated : r)),
    }));
  };

  const deleteAttendanceRecord = async (id: bigint, contractId: bigint) => {
    await backendActor!.deleteAttendanceRecord(id);
    const cid = contractId.toString();
    setAttendanceRecords((prev) => ({
      ...prev,
      [cid]: (prev[cid] || []).filter((r) => r.id !== id),
    }));
  };

  const loadAdvances = async (contractId: bigint) => {
    const advs = await backendActor!.getAdvancesByContract(contractId);
    setAdvances((prev) => ({ ...prev, [contractId.toString()]: advs }));
  };

  const addAdvance = async (
    labourId: bigint,
    contractId: bigint,
    amount: number,
    note: string,
  ) => {
    const adv = await backendActor!.createAdvance(
      labourId,
      contractId,
      amount,
      note,
    );
    const cid = contractId.toString();
    setAdvances((prev) => ({ ...prev, [cid]: [...(prev[cid] || []), adv] }));
  };

  const editAdvance = async (
    id: bigint,
    labourId: bigint,
    contractId: bigint,
    amount: number,
    note: string,
  ) => {
    const updated = await backendActor!.updateAdvance(
      id,
      labourId,
      contractId,
      amount,
      note,
    );
    const cid = contractId.toString();
    setAdvances((prev) => ({
      ...prev,
      [cid]: (prev[cid] || []).map((a) => (a.id === id ? updated : a)),
    }));
  };

  const removeAdvance = async (id: bigint, contractId: bigint) => {
    await backendActor!.deleteAdvance(id);
    const cid = contractId.toString();
    setAdvances((prev) => ({
      ...prev,
      [cid]: (prev[cid] || []).filter((a) => a.id !== id),
    }));
  };

  const value: AppData = {
    labours,
    activeContracts,
    settledContracts,
    meshColumns,
    attendanceRecords,
    advances,
    loading,
    addLabour,
    editLabour,
    removeLabour,
    addContract,
    editContract,
    removeContract,
    settleContract,
    unsettleContract,
    addMeshColumn,
    editMeshColumn,
    removeMeshColumn,
    loadAttendance,
    saveAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    loadAdvances,
    addAdvance,
    editAdvance,
    removeAdvance,
  };

  return createElement(AppDataContext.Provider, { value }, children);
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
