import Float "mo:core/Float";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

actor {
  // Types
  type Labour = {
    id : Nat;
    name : Text;
    phone : Text;
    notes : Text;
  };

  type Contract = {
    id : Nat;
    name : Text;
    multiplierValue : Float;
    contractAmount : Float;
    machineExp : Float;
    bedAmount : Float;
    paperAmount : Float;
    meshAmount : Float;
    settled : Bool;
    createdAt : Int;
  };

  type MeshColumn = {
    id : Nat;
    contractId : Nat;
    name : Text;
    position : Nat;
  };

  type AttendanceRecord = {
    id : Nat;
    contractId : Nat;
    labourId : Nat;
    columnType : Text;
    meshColumnId : Nat;
    value : Text;
  };

  type Advance = {
    id : Nat;
    labourId : Nat;
    contractId : Nat;
    amount : Float;
    note : Text;
    createdAt : Int;
  };

  // Storage
  let labours = Map.empty<Nat, Labour>();
  let contracts = Map.empty<Nat, Contract>();
  let meshColumns = Map.empty<Nat, MeshColumn>();
  let attendanceRecords = Map.empty<Nat, AttendanceRecord>();
  let advances = Map.empty<Nat, Advance>();

  // ID Generators
  var nextLabourId = 1;
  var nextContractId = 1;
  var nextMeshColumnId = 1;
  var nextAttendanceRecordId = 1;
  var nextAdvanceId = 1;

  // Labour CRUD
  public shared ({ caller }) func createLabour(name : Text, phone : Text, notes : Text) : async Labour {
    let labour : Labour = {
      id = nextLabourId;
      name;
      phone;
      notes;
    };
    labours.add(nextLabourId, labour);
    nextLabourId += 1;
    labour;
  };

  public query ({ caller }) func readLabour(id : Nat) : async Labour {
    switch (labours.get(id)) {
      case (null) { Runtime.trap("Labour not found") };
      case (?labour) { labour };
    };
  };

  public shared ({ caller }) func updateLabour(id : Nat, name : Text, phone : Text, notes : Text) : async Labour {
    switch (labours.get(id)) {
      case (null) { Runtime.trap("Labour not found") };
      case (?_) {
        let updated : Labour = {
          id;
          name;
          phone;
          notes;
        };
        labours.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteLabour(id : Nat) : async () {
    if (not labours.containsKey(id)) {
      Runtime.trap("Labour does not exist");
    };
    labours.remove(id);
  };

  // Contract CRUD
  public shared ({ caller }) func createContract(name : Text, multiplierValue : Float, contractAmount : Float, machineExp : Float, bedAmount : Float, paperAmount : Float, meshAmount : Float) : async Contract {
    let contract : Contract = {
      id = nextContractId;
      name;
      multiplierValue;
      contractAmount;
      machineExp;
      bedAmount;
      paperAmount;
      meshAmount;
      settled = false;
      createdAt = Time.now();
    };
    contracts.add(nextContractId, contract);
    nextContractId += 1;
    contract;
  };

  public query ({ caller }) func readContract(id : Nat) : async Contract {
    switch (contracts.get(id)) {
      case (null) { Runtime.trap("Contract not found") };
      case (?contract) { contract };
    };
  };

  public shared ({ caller }) func updateContract(id : Nat, name : Text, multiplierValue : Float, contractAmount : Float, machineExp : Float, bedAmount : Float, paperAmount : Float, meshAmount : Float) : async Contract {
    switch (contracts.get(id)) {
      case (null) { Runtime.trap("Contract not found") };
      case (?contract) {
        let updated : Contract = {
          id;
          name;
          multiplierValue;
          contractAmount;
          machineExp;
          bedAmount;
          paperAmount;
          meshAmount;
          settled = contract.settled;
          createdAt = contract.createdAt;
        };
        contracts.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteContract(id : Nat) : async () {
    if (not contracts.containsKey(id)) {
      Runtime.trap("Contract does not exist");
    };
    contracts.remove(id);
  };

  // MeshColumn CRUD
  public shared ({ caller }) func createMeshColumn(contractId : Nat, name : Text, position : Nat) : async MeshColumn {
    let meshColumn : MeshColumn = {
      id = nextMeshColumnId;
      contractId;
      name;
      position;
    };
    meshColumns.add(nextMeshColumnId, meshColumn);
    nextMeshColumnId += 1;
    meshColumn;
  };

  public query ({ caller }) func readMeshColumn(id : Nat) : async MeshColumn {
    switch (meshColumns.get(id)) {
      case (null) { Runtime.trap("MeshColumn not found") };
      case (?meshColumn) { meshColumn };
    };
  };

  public shared ({ caller }) func updateMeshColumn(id : Nat, contractId : Nat, name : Text, position : Nat) : async MeshColumn {
    switch (meshColumns.get(id)) {
      case (null) { Runtime.trap("MeshColumn not found") };
      case (?_) {
        let updated : MeshColumn = {
          id;
          contractId;
          name;
          position;
        };
        meshColumns.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteMeshColumn(id : Nat) : async () {
    if (not meshColumns.containsKey(id)) {
      Runtime.trap("MeshColumn does not exist");
    };
    meshColumns.remove(id);
  };

  // AttendanceRecord CRUD
  public shared ({ caller }) func createAttendanceRecord(contractId : Nat, labourId : Nat, columnType : Text, meshColumnId : Nat, value : Text) : async AttendanceRecord {
    let record : AttendanceRecord = {
      id = nextAttendanceRecordId;
      contractId;
      labourId;
      columnType;
      meshColumnId;
      value;
    };
    attendanceRecords.add(nextAttendanceRecordId, record);
    nextAttendanceRecordId += 1;
    record;
  };

  public query ({ caller }) func readAttendanceRecord(id : Nat) : async AttendanceRecord {
    switch (attendanceRecords.get(id)) {
      case (null) { Runtime.trap("AttendanceRecord not found") };
      case (?record) { record };
    };
  };

  public shared ({ caller }) func updateAttendanceRecord(id : Nat, contractId : Nat, labourId : Nat, columnType : Text, meshColumnId : Nat, value : Text) : async AttendanceRecord {
    switch (attendanceRecords.get(id)) {
      case (null) { Runtime.trap("AttendanceRecord not found") };
      case (?_) {
        let updated : AttendanceRecord = {
          id;
          contractId;
          labourId;
          columnType;
          meshColumnId;
          value;
        };
        attendanceRecords.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteAttendanceRecord(id : Nat) : async () {
    if (not attendanceRecords.containsKey(id)) {
      Runtime.trap("AttendanceRecord does not exist");
    };
    attendanceRecords.remove(id);
  };

  // Advance CRUD
  public shared ({ caller }) func createAdvance(labourId : Nat, contractId : Nat, amount : Float, note : Text) : async Advance {
    let advance : Advance = {
      id = nextAdvanceId;
      labourId;
      contractId;
      amount;
      note;
      createdAt = Time.now();
    };
    advances.add(nextAdvanceId, advance);
    nextAdvanceId += 1;
    advance;
  };

  public query ({ caller }) func readAdvance(id : Nat) : async Advance {
    switch (advances.get(id)) {
      case (null) { Runtime.trap("Advance not found") };
      case (?advance) { advance };
    };
  };

  public shared ({ caller }) func updateAdvance(id : Nat, labourId : Nat, contractId : Nat, amount : Float, note : Text) : async Advance {
    switch (advances.get(id)) {
      case (null) { Runtime.trap("Advance not found") };
      case (?_) {
        let updated : Advance = {
          id;
          labourId;
          contractId;
          amount;
          note;
          createdAt = Time.now();
        };
        advances.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteAdvance(id : Nat) : async () {
    if (not advances.containsKey(id)) {
      Runtime.trap("Advance does not exist");
    };
    advances.remove(id);
  };

  // Queries
  public query ({ caller }) func getContractsBySettled(settled : Bool) : async [Contract] {
    let result = List.empty<Contract>();
    for (contract in contracts.values()) {
      if (contract.settled == settled) {
        result.add(contract);
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getAttendanceRecordsByContract(contractId : Nat) : async [AttendanceRecord] {
    let result = List.empty<AttendanceRecord>();
    for (record in attendanceRecords.values()) {
      if (record.contractId == contractId) {
        result.add(record);
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getAdvancesByContract(contractId : Nat) : async [Advance] {
    let result = List.empty<Advance>();
    for (advance in advances.values()) {
      if (advance.contractId == contractId) {
        result.add(advance);
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getAdvancesByLabour(labourId : Nat) : async [Advance] {
    let result = List.empty<Advance>();
    for (advance in advances.values()) {
      if (advance.labourId == labourId) {
        result.add(advance);
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateContractSettled(contractId : Nat, settled : Bool) : async Contract {
    switch (contracts.get(contractId)) {
      case (null) { Runtime.trap("Contract not found") };
      case (?contract) {
        let updated : Contract = {
          id = contract.id;
          name = contract.name;
          multiplierValue = contract.multiplierValue;
          contractAmount = contract.contractAmount;
          machineExp = contract.machineExp;
          bedAmount = contract.bedAmount;
          paperAmount = contract.paperAmount;
          meshAmount = contract.meshAmount;
          settled;
          createdAt = contract.createdAt;
        };
        contracts.add(contractId, updated);
        updated;
      };
    };
  };
};
