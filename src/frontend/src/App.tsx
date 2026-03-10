import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  LogOut,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import AdvancesTab from "./components/AdvancesTab";
import AttendanceTab from "./components/AttendanceTab";
import ContractsTab from "./components/ContractsTab";
import LaboursTab from "./components/LaboursTab";
import LoginPage from "./components/LoginPage";
import PaymentsTab from "./components/PaymentsTab";
import SettledTab from "./components/SettledTab";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppDataProvider } from "./hooks/useAppData";

function AppShell() {
  const { role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("contracts");
  const [attendanceContractId, setAttendanceContractId] = useState<
    bigint | null
  >(null);

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
          <main className="flex-1 overflow-auto p-4 pb-24">
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
            className="fixed bottom-0 left-0 right-0 z-50 h-auto rounded-none rounded-t-2xl border-t border-border bg-card shadow-nav grid grid-cols-6 gap-0 p-1 pb-safe"
          >
            <TabsTrigger
              value="contracts"
              data-ocid="contracts.tab"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <FileText className="w-5 h-5" />
              <span>Contracts</span>
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              data-ocid="attendance.tab"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <ClipboardList className="w-5 h-5" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger
              value="advances"
              data-ocid="advances.tab"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <Wallet className="w-5 h-5" />
              <span>Advances</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              data-ocid="payments.tab"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <CreditCard className="w-5 h-5" />
              <span>Payments</span>
            </TabsTrigger>
            <TabsTrigger
              value="labours"
              data-ocid="labours.tab"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <Users className="w-5 h-5" />
              <span>Labours</span>
            </TabsTrigger>
            <TabsTrigger
              value="settled"
              data-ocid="settled.tab"
              className="flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-semibold rounded-xl transition-all
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Settled</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Toaster />
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
