import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  KeyRound,
  LogOut,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AdvancesTab from "./components/AdvancesTab";
import AttendanceTab from "./components/AttendanceTab";
import ContractsTab from "./components/ContractsTab";
import LaboursTab from "./components/LaboursTab";
import LoginPage from "./components/LoginPage";
import PaymentsTab from "./components/PaymentsTab";
import SettledTab from "./components/SettledTab";
import { AuthProvider, type Credentials, useAuth } from "./context/AuthContext";
import { AppDataProvider } from "./hooks/useAppData";

function getUsernameForRole(
  credentials: Credentials,
  role: "admin" | "guest",
): string {
  for (const [k, v] of Object.entries(credentials)) {
    if (v.role === role) return k;
  }
  return role;
}

function CredentialForm({
  type,
  credentials,
  updateCredentials,
  onClose,
}: {
  type: "admin" | "guest";
  credentials: Credentials;
  updateCredentials: (
    type: "admin" | "guest",
    newUsername: string,
    newPassword: string,
  ) => void;
  onClose: () => void;
}) {
  const currentUsername = getUsernameForRole(credentials, type);
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    confirm?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!newUsername.trim()) e.username = "Username is required";
    if (newPassword.length < 4)
      e.password = "Password must be at least 4 characters";
    if (newPassword !== confirmPassword) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateCredentials(type, newUsername.trim(), newPassword);
    toast.success(
      `${type === "admin" ? "Admin" : "Guest"} credentials updated successfully`,
    );
    onClose();
  };

  const prefix =
    type === "admin" ? "admin.credentials.admin" : "admin.credentials.guest";

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          Current Username
        </Label>
        <div className="h-9 px-3 flex items-center bg-muted/50 rounded-md text-sm font-medium text-foreground border border-border">
          {currentUsername}
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${type}-username`} className="text-sm font-semibold">
          New Username
        </Label>
        <Input
          id={`${type}-username`}
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="Enter new username"
          data-ocid={`${prefix}_username_input`}
          className="h-9 focus-visible:ring-primary"
        />
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${type}-password`} className="text-sm font-semibold">
          New Password
        </Label>
        <Input
          id={`${type}-password`}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Min. 4 characters"
          data-ocid={`${prefix}_password_input`}
          className="h-9 focus-visible:ring-primary"
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${type}-confirm`} className="text-sm font-semibold">
          Confirm Password
        </Label>
        <Input
          id={`${type}-confirm`}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat new password"
          data-ocid={`${prefix}_confirm_input`}
          className="h-9 focus-visible:ring-primary"
        />
        {errors.confirm && (
          <p className="text-xs text-destructive">{errors.confirm}</p>
        )}
      </div>
      <Button
        onClick={handleSave}
        data-ocid={`${prefix}_save_button`}
        className="w-full h-9 font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        Save {type === "admin" ? "Admin" : "Guest"} Credentials
      </Button>
    </div>
  );
}

function AppShell() {
  const { role, logout, credentials, updateCredentials } = useAuth();
  const [activeTab, setActiveTab] = useState("contracts");
  const [attendanceContractId, setAttendanceContractId] = useState<
    bigint | null
  >(null);
  const [credDialogOpen, setCredDialogOpen] = useState(false);
  const [credTab, setCredTab] = useState<"admin" | "guest">("admin");

  if (!role) return <LoginPage />;

  const openAttendance = (contractId: bigint) => {
    setAttendanceContractId(contractId);
    setActiveTab("attendance");
  };

  return (
    <AppDataProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card px-4 py-3 shadow-xs flex-shrink-0 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary tracking-tight font-display">
            Attendance &amp; Salary Manager
          </h1>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                role === "admin"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {role === "admin" ? "Admin" : "Guest"}
            </span>

            {role === "admin" && (
              <Dialog open={credDialogOpen} onOpenChange={setCredDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    data-ocid="admin.credentials.open_modal_button"
                    title="Change credentials"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary/10"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Credentials</span>
                  </button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-sm"
                  data-ocid="admin.credentials.dialog"
                >
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold">
                      Change Credentials
                    </DialogTitle>
                  </DialogHeader>
                  <Tabs
                    value={credTab}
                    onValueChange={(v) => setCredTab(v as "admin" | "guest")}
                    className="mt-1"
                  >
                    <TabsList className="w-full">
                      <TabsTrigger
                        value="admin"
                        className="flex-1 text-xs"
                        data-ocid="admin.credentials.admin.tab"
                      >
                        Admin
                      </TabsTrigger>
                      <TabsTrigger
                        value="guest"
                        className="flex-1 text-xs"
                        data-ocid="admin.credentials.guest.tab"
                      >
                        Guest
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="admin" className="mt-4">
                      <CredentialForm
                        type="admin"
                        credentials={credentials}
                        updateCredentials={updateCredentials}
                        onClose={() => setCredDialogOpen(false)}
                      />
                    </TabsContent>
                    <TabsContent value="guest" className="mt-4">
                      <CredentialForm
                        type="guest"
                        credentials={credentials}
                        updateCredentials={updateCredentials}
                        onClose={() => setCredDialogOpen(false)}
                      />
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10"
              data-ocid="header.logout.button"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 min-h-0"
        >
          <main className="flex-1 overflow-auto p-4 pb-28">
            <TabsContent value="contracts" className="mt-0">
              <ContractsTab onOpenAttendance={openAttendance} />
            </TabsContent>
            <TabsContent value="attendance" className="mt-0">
              <AttendanceTab initialContractId={attendanceContractId} />
            </TabsContent>
            <TabsContent value="advances" className="mt-0">
              <AdvancesTab />
            </TabsContent>
            <TabsContent value="payments" className="mt-0">
              <PaymentsTab />
            </TabsContent>
            <TabsContent value="labours" className="mt-0">
              <LaboursTab />
            </TabsContent>
            <TabsContent value="settled" className="mt-0">
              <SettledTab />
            </TabsContent>
          </main>

          {/* Bottom Navigation Bar */}
          <TabsList
            data-ocid="nav.tabs"
            className="fixed bottom-0 left-0 right-0 z-50 h-auto rounded-none rounded-t-2xl border-t border-border bg-card shadow-nav grid grid-cols-6 gap-0 p-2 pb-safe"
          >
            <TabsTrigger
              value="contracts"
              data-ocid="contracts.tab"
              className="flex flex-col items-center gap-1 py-3 px-1 text-[11px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <FileText className="w-6 h-6" />
              <span>Contracts</span>
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              data-ocid="attendance.tab"
              className="flex flex-col items-center gap-1 py-3 px-1 text-[11px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <ClipboardList className="w-6 h-6" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger
              value="advances"
              data-ocid="advances.tab"
              className="flex flex-col items-center gap-1 py-3 px-1 text-[11px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <Wallet className="w-6 h-6" />
              <span>Advances</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              data-ocid="payments.tab"
              className="flex flex-col items-center gap-1 py-3 px-1 text-[11px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <CreditCard className="w-6 h-6" />
              <span>Payments</span>
            </TabsTrigger>
            <TabsTrigger
              value="labours"
              data-ocid="labours.tab"
              className="flex flex-col items-center gap-1 py-3 px-1 text-[11px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <Users className="w-6 h-6" />
              <span>Labours</span>
            </TabsTrigger>
            <TabsTrigger
              value="settled"
              data-ocid="settled.tab"
              className="flex flex-col items-center gap-1 py-3 px-1 text-[11px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>Settled</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Toaster position="top-right" />
    </AppDataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
