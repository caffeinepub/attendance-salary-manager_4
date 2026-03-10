import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Labour {
    id: bigint;
    name: string;
    notes: string;
    phone: string;
}
export interface MeshColumn {
    id: bigint;
    name: string;
    position: bigint;
    contractId: bigint;
}
export interface Contract {
    id: bigint;
    settled: boolean;
    name: string;
    createdAt: bigint;
    machineExp: number;
    bedAmount: number;
    paperAmount: number;
    meshAmount: number;
    contractAmount: number;
    multiplierValue: number;
}
export interface AttendanceRecord {
    id: bigint;
    columnType: string;
    value: string;
    labourId: bigint;
    meshColumnId: bigint;
    contractId: bigint;
}
export interface Advance {
    id: bigint;
    note: string;
    labourId: bigint;
    createdAt: bigint;
    amount: number;
    contractId: bigint;
}
export interface backendInterface {
    createAdvance(labourId: bigint, contractId: bigint, amount: number, note: string): Promise<Advance>;
    createAttendanceRecord(contractId: bigint, labourId: bigint, columnType: string, meshColumnId: bigint, value: string): Promise<AttendanceRecord>;
    createContract(name: string, multiplierValue: number, contractAmount: number, machineExp: number, bedAmount: number, paperAmount: number, meshAmount: number): Promise<Contract>;
    createLabour(name: string, phone: string, notes: string): Promise<Labour>;
    createMeshColumn(contractId: bigint, name: string, position: bigint): Promise<MeshColumn>;
    deleteAdvance(id: bigint): Promise<void>;
    deleteAttendanceRecord(id: bigint): Promise<void>;
    deleteContract(id: bigint): Promise<void>;
    deleteLabour(id: bigint): Promise<void>;
    deleteMeshColumn(id: bigint): Promise<void>;
    getAdvancesByContract(contractId: bigint): Promise<Array<Advance>>;
    getAdvancesByLabour(labourId: bigint): Promise<Array<Advance>>;
    getAttendanceRecordsByContract(contractId: bigint): Promise<Array<AttendanceRecord>>;
    getContractsBySettled(settled: boolean): Promise<Array<Contract>>;
    readAdvance(id: bigint): Promise<Advance>;
    readAttendanceRecord(id: bigint): Promise<AttendanceRecord>;
    readContract(id: bigint): Promise<Contract>;
    readLabour(id: bigint): Promise<Labour>;
    readMeshColumn(id: bigint): Promise<MeshColumn>;
    updateAdvance(id: bigint, labourId: bigint, contractId: bigint, amount: number, note: string): Promise<Advance>;
    updateAttendanceRecord(id: bigint, contractId: bigint, labourId: bigint, columnType: string, meshColumnId: bigint, value: string): Promise<AttendanceRecord>;
    updateContract(id: bigint, name: string, multiplierValue: number, contractAmount: number, machineExp: number, bedAmount: number, paperAmount: number, meshAmount: number): Promise<Contract>;
    updateContractSettled(contractId: bigint, settled: boolean): Promise<Contract>;
    updateLabour(id: bigint, name: string, phone: string, notes: string): Promise<Labour>;
    updateMeshColumn(id: bigint, contractId: bigint, name: string, position: bigint): Promise<MeshColumn>;
}
