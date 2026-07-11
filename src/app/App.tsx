import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

// ─── types ────────────────────────────────────────────────────────────────────
type Role = "landlord" | "tenant";
type LandlordTab = "home" | "rooms" | "bills" | "alerts";
type TenantTab = "home" | "bills" | "notices" | "profile";

// ─── constants / mock data ────────────────────────────────────────────────────
const BLUE = "#007aff";
const GREEN = "#34c759";
const ORANGE = "#ff9500";
const RED = "#ff3b30";
const PURPLE = "#af52de";

const initialRooms = [
  { id: "P101", floor: "Tầng 1", status: "rented", tenant: "Nguyễn Văn An", rent: 3500000, daysLeft: 45 },
  { id: "P102", floor: "Tầng 1", status: "rented", tenant: "Trần Thị Bình", rent: 3500000, daysLeft: 8 },
  { id: "P103", floor: "Tầng 1", status: "vacant", tenant: null, rent: 3500000, daysLeft: null },
  { id: "P201", floor: "Tầng 2", status: "rented", tenant: "Lê Hoàng Cường", rent: 4000000, daysLeft: 62 },
  { id: "P202", floor: "Tầng 2", status: "maintenance", tenant: null, rent: 4000000, daysLeft: null },
  { id: "P203", floor: "Tầng 2", status: "rented", tenant: "Phạm Minh Đức", rent: 4000000, daysLeft: 22 },
  { id: "P301", floor: "Tầng 3", status: "rented", tenant: "Hoàng Lan Anh", rent: 4500000, daysLeft: 14 },
  { id: "P302", floor: "Tầng 3", status: "vacant", tenant: null, rent: 4500000, daysLeft: null },
];

const initialInvoices = [
  { id: "HD-0724-101", room: "P101", tenant: "Nguyễn Văn An", rent: 3500000, electric: 280000, water: 60000, service: 100000, total: 3940000, status: "paid", month: "07/2026" },
  { id: "HD-0724-102", room: "P102", tenant: "Trần Thị Bình", rent: 3500000, electric: 310000, water: 75000, service: 100000, total: 3985000, status: "overdue", month: "07/2026" },
  { id: "HD-0724-201", room: "P201", tenant: "Lê Hoàng Cường", rent: 4000000, electric: 220000, water: 55000, service: 100000, total: 4375000, status: "pending", month: "07/2026" },
  { id: "HD-0724-203", room: "P203", tenant: "Phạm Minh Đức", rent: 4000000, electric: 190000, water: 48000, service: 100000, total: 4338000, status: "paid", month: "07/2026" },
  { id: "HD-0724-301", room: "P301", tenant: "Hoàng Lan Anh", rent: 4500000, electric: 350000, water: 90000, service: 100000, total: 5040000, status: "debt", month: "07/2026" },
];

const revenueData = [
  { month: "T2", revenue: 18200000, target: 20000000 },
  { month: "T3", revenue: 19800000, target: 20000000 },
  { month: "T4", revenue: 17500000, target: 20000000 },
  { month: "T5", revenue: 21000000, target: 20000000 },
  { month: "T6", revenue: 19400000, target: 20000000 },
  { month: "T7", revenue: 16200000, target: 20000000 },
];

const initialNotices = [
  { id: 1, type: "urgent", title: "Cúp điện khu A", body: "Điện sẽ bị cúp từ 8:00–12:00 ngày mai để bảo trì lưới điện.", time: "5 phút trước", icon: "⚡" },
  { id: 2, type: "info", title: "Lịch vệ sinh tháng 7", body: "Đội vệ sinh sẽ làm sạch hành lang các tầng vào sáng thứ 7.", time: "2 giờ trước", icon: "🧹" },
  { id: 3, type: "fire", title: "Cảnh báo cháy — P203", body: "Người thuê P203 vừa kích hoạt cảnh báo cháy. Hãy sơ tán ngay!", time: "Hôm qua", icon: "🔥" },
  { id: 4, type: "info", title: "Quy định gửi xe mới", body: "Từ 01/08, mỗi phòng chỉ được đăng ký tối đa 2 xe máy.", time: "3 ngày trước", icon: "🛵" },
];

const initialTenantBill = {
  month: "07/2026",
  room: "P201",
  building: "Khu trọ Hoàng Gia — Tầng 2",
  rent: 4000000,
  electric: { usage: 110, unit: 2000, total: 220000 },
  water: { usage: 5, unit: 11000, total: 55000 },
  service: 100000,
  total: 4375000,
  due: "15/07/2026",
  status: "pending",
  daysLeft: 6,
};

const initialPaymentHistory = [
  { month: "06/2026", total: 4280000, status: "paid", date: "10/06/2026" },
  { month: "05/2026", total: 4150000, status: "paid", date: "08/05/2026" },
  { month: "04/2026", total: 4390000, status: "paid", date: "12/04/2026" },
  { month: "03/2026", total: 4200000, status: "paid", date: "09/03/2026" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString("vi-VN") + "đ";

const statusColor: Record<string, string> = {
  paid: GREEN, pending: ORANGE, overdue: RED, debt: PURPLE,
  rented: BLUE, vacant: GREEN, maintenance: ORANGE,
};
const statusLabel: Record<string, string> = {
  paid: "Đã thanh toán", pending: "Chờ thanh toán", overdue: "Quá hạn", debt: "Đang nợ",
  rented: "Đang thuê", vacant: "Trống", maintenance: "Bảo trì",
};

// ─── shared atoms ─────────────────────────────────────────────────────────────
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/60 ${className}`}
      style={{
        background: "rgba(255,255,255,0.70)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(255,255,255,0.8) inset",
      }}
    >
      {children}
    </div>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${statusColor[status]}18`, color: statusColor[status] }}
    >
      {statusLabel[status]}
    </span>
  );
}

function ChevronRight() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
      <path d="M1 1l5 5-5 5" stroke="#c7c7cc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-base font-bold text-[#1c1c1e]">{title}</h2>
      {action && <button className="text-xs font-semibold" style={{ color: BLUE }}>{action}</button>}
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-1">
      <span className="text-[15px] font-semibold text-[#1c1c1e]">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="3" width="3" height="9" rx="1" fill="#1c1c1e"/>
          <rect x="4.5" y="2" width="3" height="10" rx="1" fill="#1c1c1e"/>
          <rect x="9" y="0" width="3" height="12" rx="1" fill="#1c1c1e"/>
          <rect x="13.5" y="0" width="3" height="12" rx="1" fill="#1c1c1e" opacity="0.3"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 2C10.5 2 12.7 3.1 14.2 4.8L15.5 3.5C13.6 1.4 11 0 8 0C5 0 2.4 1.4 0.5 3.5L1.8 4.8C3.3 3.1 5.5 2 8 2Z" fill="#1c1c1e"/>
          <path d="M8 5C9.7 5 11.2 5.7 12.3 6.9L13.6 5.6C12.1 4 10.2 3 8 3C5.8 3 3.9 4 2.4 5.6L3.7 6.9C4.8 5.7 6.3 5 8 5Z" fill="#1c1c1e"/>
          <circle cx="8" cy="10" r="2" fill="#1c1c1e"/>
        </svg>
        <div className="flex items-center gap-0.5">
          <div className="w-6 h-3 rounded-sm border border-[#1c1c1e]/40 p-px flex items-center">
            <div className="h-full rounded-sm bg-[#1c1c1e]" style={{ width: "80%" }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LANDLORD SCREENS ─────────────────────────────────────────────────────────
function LandlordHome({
  rooms,
  invoices,
  openModal,
  onLogout,
}: {
  rooms: typeof initialRooms;
  invoices: typeof initialInvoices;
  openModal: (modal: string) => void;
  onLogout: () => void;
}) {
  const occupied = rooms.filter(r => r.status === "rented").length;
  const total = rooms.length;
  const occupancy = Math.round((occupied / total) * 100);
  const expiringSoon = rooms.filter(r => r.daysLeft !== null && r.daysLeft <= 14).length;

  const currentRevenue = invoices.filter(i => i.status === "paid").reduce((sum, inv) => sum + inv.total, 0);
  const pendingRevenue = invoices.filter(i => i.status === "pending" || i.status === "overdue").reduce((sum, inv) => sum + inv.total, 0);
  const debtRevenue = invoices.filter(i => i.status === "debt").reduce((sum, inv) => sum + inv.total, 0);

  const dynamicRevenueData = revenueData.map(d => {
    if (d.month === "T7") {
      return { ...d, revenue: currentRevenue };
    }
    return d;
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-bold tracking-wider text-white px-2 py-0.5 rounded-full"
              style={{ background: BLUE }}>
              RENTIFY
            </span>
            <span className="text-[9px] font-bold text-[#8e8e93] tracking-wider uppercase">Chủ nhà</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Khu trọ Hoàng Gia</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLogout} className="text-xs font-semibold px-2 py-1 rounded-lg bg-black/[0.05] text-[#ff3b30] active:opacity-70 transition-opacity">
            Đăng xuất
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})` }}>
            HG
          </div>
        </div>
      </div>

      {/* Hero stats card */}
      <div className="rounded-3xl p-5 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #1a3a5c 0%, ${BLUE} 65%, ${PURPLE} 100%)`,
          boxShadow: `0 8px 32px rgba(0,122,255,0.32)` }}>
        <div className="absolute inset-0 rounded-3xl"
          style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.02) 100%)" }}/>
        <div className="relative z-10">
          <p className="text-white/60 text-xs font-medium mb-1">Doanh thu đã thu tháng 7</p>
          <p className="text-3xl font-bold tracking-tight mb-4">{fmt(currentRevenue)}</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Tỷ lệ lấp đầy", value: `${occupancy}%`, icon: "🏠" },
              { label: "Chưa thu", value: fmt(pendingRevenue), icon: "⏳" },
              { label: "Đang nợ", value: fmt(debtRevenue), icon: "📋" },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl p-2"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
                <p className="text-base mb-0.5">{stat.icon}</p>
                <p className="text-white font-bold text-xs whitespace-nowrap overflow-hidden text-ellipsis">{stat.value}</p>
                <p className="text-white/50 text-[9px] leading-tight mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Tạo HĐ", icon: "📄", color: BLUE, action: () => openModal("create_contract") },
            { label: "Tính tiền", icon: "🧮", color: GREEN, action: () => openModal("create_bill") },
            { label: "Nhắc phí", icon: "🔔", color: ORANGE, action: () => openModal("send_reminders") },
            { label: "Báo cáo", icon: "📊", color: PURPLE, action: () => openModal("reports") },
          ].map(a => (
            <button key={a.label} onClick={a.action} className="flex flex-col items-center gap-2 py-1 active:opacity-70 transition-opacity">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                style={{ background: `${a.color}18` }}>
                {a.icon}
              </div>
              <span className="text-[11px] text-[#3c3c43] font-medium leading-tight text-center">{a.label}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Revenue chart */}
      <GlassCard className="p-4">
        <SectionHeader title="Doanh thu 6 tháng" action="Chi tiết"/>
        <div className="h-32 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dynamicRevenueData} margin={{ top: 0, right: 0, left: -32, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,60,67,0.08)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#8e8e93" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 9, fill: "#8e8e93" }} axisLine={false} tickLine={false}
                tickFormatter={v => (v / 1000000) + "M"}/>
              <Tooltip
                formatter={(v: number) => [fmt(v)]}
                contentStyle={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", border: "none",
                  borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 11 }}/>
              <Bar dataKey="target" fill="rgba(0,122,255,0.10)" radius={[4,4,0,0]}/>
              <Bar dataKey="revenue" fill={BLUE} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: BLUE }}/>
            <span className="text-[10px] text-[#8e8e93]">Thực thu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "rgba(0,122,255,0.2)" }}/>
            <span className="text-[10px] text-[#8e8e93]">Mục tiêu</span>
          </div>
        </div>
      </GlassCard>

      {/* Expiring contracts alert */}
      {expiringSoon > 0 && (
        <div className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: `${ORANGE}14`, border: `1px solid ${ORANGE}30` }}>
          <span className="text-2xl">⏰</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: ORANGE }}>
              {expiringSoon} hợp đồng sắp hết hạn
            </p>
            <p className="text-xs text-[#8e8e93] mt-0.5">
              Liên hệ cư dân để chuẩn bị gia hạn hợp đồng kịp thời.
            </p>
          </div>
        </div>
      )}

      {/* Room summary */}
      <GlassCard>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-base font-bold text-[#1c1c1e]">Tình trạng phòng</h2>
          <button className="text-xs font-semibold" style={{ color: BLUE }}>Tất cả</button>
        </div>
        <div className="grid grid-cols-3 gap-0 divide-x divide-black/[0.04] border-t border-black/[0.04]">
          {[
            { label: "Đang thuê", count: rooms.filter(r=>r.status==="rented").length, color: BLUE },
            { label: "Trống", count: rooms.filter(r=>r.status==="vacant").length, color: GREEN },
            { label: "Bảo trì", count: rooms.filter(r=>r.status==="maintenance").length, color: ORANGE },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center py-4">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
              <p className="text-[11px] text-[#8e8e93] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="h-1"/>
      </GlassCard>
    </div>
  );
}

function LandlordRooms({
  rooms,
  openModal,
}: {
  rooms: typeof initialRooms;
  openModal: (modal: string) => void;
}) {
  const [filter, setFilter] = useState<"all"|"rented"|"vacant"|"maintenance">("all");
  const filters = [
    { key: "all", label: "Tất cả" },
    { key: "rented", label: "Đang thuê" },
    { key: "vacant", label: "Trống" },
    { key: "maintenance", label: "Bảo trì" },
  ] as const;

  const filtered = filter === "all" ? rooms : rooms.filter(r => r.status === filter);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-4 pb-6">
      <div className="pt-2 pb-1">
        <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Quản lý phòng</h1>
        <p className="text-sm text-[#8e8e93]">{rooms.length} phòng · Khu trọ Hoàng Gia</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
            style={filter === f.key
              ? { background: BLUE, color: "#fff", boxShadow: `0 4px 12px ${BLUE}40` }
              : { background: "rgba(118,118,128,0.12)", color: "#3c3c43" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Room list grouped by floor */}
      {["Tầng 1","Tầng 2","Tầng 3"].map(floor => {
        const floorRooms = filtered.filter(r => r.floor === floor);
        if (!floorRooms.length) return null;
        return (
          <div key={floor}>
            <p className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-2 px-1">{floor}</p>
            <GlassCard className="divide-y divide-black/[0.04]">
              {floorRooms.map(room => (
                <button key={room.id} className="w-full flex items-center gap-3 px-4 py-3.5 active:opacity-70 transition-opacity">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs"
                    style={{ background: `${statusColor[room.status]}15`, color: statusColor[room.status] }}>
                    {room.id}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-[#1c1c1e]">
                      {room.tenant ?? "— Phòng trống —"}
                    </p>
                    <p className="text-xs text-[#8e8e93]">
                      {fmt(room.rent)}/tháng
                      {room.daysLeft !== null && ` · Còn ${room.daysLeft} ngày HĐ`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={room.status}/>
                    <ChevronRight/>
                  </div>
                </button>
              ))}
            </GlassCard>
          </div>
        );
      })}

      {/* Add room button */}
      <button onClick={() => openModal("add_room")} className="w-full h-12 rounded-2xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2 transition-opacity active:opacity-70"
        style={{ borderColor: `${BLUE}40`, color: BLUE }}>
        <span className="text-lg leading-none">+</span>
        Thêm phòng mới
      </button>
    </div>
  );
}

function LandlordBills({
  invoices,
  openModal,
}: {
  invoices: typeof initialInvoices;
  openModal: (modal: string) => void;
}) {
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const statuses = ["all","pending","paid","overdue","debt"] as const;
  const statusNames: Record<string,string> = { all:"Tất cả", pending:"Chờ thu", paid:"Đã thu", overdue:"Quá hạn", debt:"Nợ" };

  const filtered = activeStatus === "all" ? invoices : invoices.filter(i => i.status === activeStatus);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-4 pb-6">
      <div className="flex items-center justify-between pt-2 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Hóa đơn</h1>
          <p className="text-sm text-[#8e8e93]">Tháng 07/2026</p>
        </div>
        <button onClick={() => openModal("create_bill")} className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.05]"
          style={{ color: BLUE }}>
          <span className="text-xl font-bold">+</span>
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {statuses.map(s => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all"
            style={activeStatus === s
              ? { background: BLUE, color: "#fff", boxShadow: `0 4px 10px ${BLUE}35` }
              : { background: "rgba(118,118,128,0.12)", color: "#3c3c43" }}>
            {statusNames[s]}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      <GlassCard className="divide-y divide-black/[0.04]">
        {filtered.map(inv => (
          <button key={inv.id} className="w-full flex items-start gap-3 px-4 py-4 active:opacity-70 transition-opacity text-left">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
              style={{ background: `${statusColor[inv.status]}15` }}>
              🧾
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#1c1c1e]">{inv.room} — {inv.tenant}</p>
                  <p className="text-xs text-[#8e8e93] mt-0.5">{inv.id}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#1c1c1e]">{fmt(inv.total)}</p>
                  <Badge status={inv.status}/>
                </div>
              </div>
              <div className="flex gap-3 mt-2 text-[10px] text-[#8e8e93]">
                <span>Phòng: {fmt(inv.rent)}</span>
                <span>Điện: {fmt(inv.electric)}</span>
                <span>Nước: {fmt(inv.water)}</span>
              </div>
            </div>
          </button>
        ))}
      </GlassCard>

      {/* Send reminder */}
      <button onClick={() => openModal("send_reminders")} className="w-full h-12 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ background: `linear-gradient(135deg, ${ORANGE}, #ff6b00)`,
          boxShadow: `0 6px 20px ${ORANGE}40` }}>
        🔔 Gửi nhắc phí cho chưa nộp
      </button>
    </div>
  );
}

function LandlordAlerts({
  notices,
  setNotices,
  rooms,
  invoices,
  showToast,
}: {
  notices: typeof initialNotices;
  setNotices: React.Dispatch<React.SetStateAction<typeof initialNotices>>;
  rooms: typeof initialRooms;
  invoices: typeof initialInvoices;
  showToast: (msg: string) => void;
}) {
  const [showCompose, setShowCompose] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeType, setComposeType] = useState<"info" | "urgent" | "fire">("info");

  const handleSend = () => {
    if (!composeText.trim()) return;

    const newNotice = {
      id: Date.now(),
      type: composeType,
      title: composeType === "fire" ? "CẢNH BÁO CHÁY khẩn cấp" : composeType === "urgent" ? "Thông báo khẩn" : "Thông báo từ chủ nhà",
      body: composeText,
      time: "Vừa xong",
      icon: composeType === "fire" ? "🔥" : composeType === "urgent" ? "⚡" : "📢",
    };

    setNotices(prev => [newNotice, ...prev]);
    setComposeText("");
    setShowCompose(false);
    showToast("Đã gửi thông báo đến toàn bộ người thuê!");
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-4 pb-6">
      <div className="flex items-center justify-between pt-2 pb-1">
        <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Thông báo</h1>
        <button onClick={() => setShowCompose(!showCompose)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
          style={{ background: RED, boxShadow: `0 4px 12px ${RED}40` }}>
          {showCompose ? "Đóng" : "✍️ Gửi tin"}
        </button>
      </div>

      {showCompose && (
        <GlassCard className="p-4 space-y-3">
          <p className="text-sm font-bold text-[#1c1c1e]">Gửi thông báo toàn khu</p>

          <div className="flex gap-2">
            {(["info", "urgent", "fire"] as const).map(type => (
              <button key={type} onClick={() => setComposeType(type)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={composeType === type
                  ? { background: type === "fire" ? RED : type === "urgent" ? ORANGE : BLUE, color: "#fff" }
                  : { background: "rgba(118,118,128,0.12)", color: "#3c3c43" }}>
                {type === "fire" ? "🔥 Cháy" : type === "urgent" ? "⚡ Khẩn" : "📢 Thường"}
              </button>
            ))}
          </div>

          <textarea
            value={composeText}
            onChange={e => setComposeText(e.target.value)}
            placeholder="Nhập nội dung thông báo..."
            className="w-full text-sm rounded-xl p-3 border border-black/10 focus:outline-none focus:border-blue-500 bg-white/50"
            rows={3}
          />

          <button onClick={handleSend} className="w-full h-10 rounded-xl text-white font-semibold text-sm"
            style={{ background: composeType === "fire" ? RED : composeType === "urgent" ? ORANGE : BLUE }}>
            Gửi đến {rooms.filter(r=>r.status==="rented").length} người thuê
          </button>
        </GlassCard>
      )}

      {/* Notice list */}
      <GlassCard className="divide-y divide-black/[0.04]">
        {notices.map(n => (
          <div key={n.id} className="px-4 py-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: n.type === "urgent" ? `${ORANGE}15` : n.type === "fire" ? `${RED}15` : "rgba(118,118,128,0.1)" }}>
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-[#1c1c1e]">{n.title}</p>
                <p className="text-[10px] text-[#8e8e93] flex-shrink-0">{n.time}</p>
              </div>
              <p className="text-xs text-[#8e8e93] mt-0.5 leading-relaxed">{n.body}</p>
            </div>
          </div>
        ))}
      </GlassCard>

      {/* Debt management */}
      <SectionHeader title="Công nợ tháng này"/>
      <GlassCard className="p-4 space-y-3">
        {invoices.filter(i => i.status === "debt" || i.status === "overdue").map(inv => (
          <div key={inv.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1c1c1e]">{inv.tenant}</p>
              <p className="text-xs text-[#8e8e93]">{inv.room} · {inv.status === "debt" ? "Đang nợ" : "Quá hạn"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: statusColor[inv.status] }}>{fmt(inv.total)}</p>
              <button onClick={() => showToast(`Tính năng xử lý công nợ cho phòng ${inv.room}!`)} className="text-[10px]" style={{ color: BLUE }}>Xử lý</button>
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

// ─── TENANT SCREENS ───────────────────────────────────────────────────────────
function TenantHome({
  tenantBill,
  openModal,
}: {
  tenantBill: typeof initialTenantBill;
  openModal: (modal: string) => void;
}) {
  const bill = tenantBill;
  const isPending = bill.status === "pending";

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-4 pb-6">
      <div className="flex items-center justify-between pt-2 pb-1">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-bold tracking-wider text-white px-2 py-0.5 rounded-full"
              style={{ background: GREEN }}>
              RENTIFY
            </span>
            <span className="text-[9px] font-bold text-[#8e8e93] tracking-wider uppercase">Người thuê</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Lê Hoàng Cường</h1>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
          style={{ background: `linear-gradient(135deg, ${GREEN}, #2ba84a)` }}>
          LC
        </div>
      </div>

      {/* Current bill card */}
      <div className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: isPending
            ? `linear-gradient(135deg, #1a3a5c 0%, ${BLUE} 65%, #5856d6 100%)`
            : `linear-gradient(135deg, #1a4a2e 0%, ${GREEN} 100%)`,
          boxShadow: `0 8px 32px ${isPending ? BLUE : GREEN}32`,
        }}>
        <div className="absolute inset-0 rounded-3xl"
          style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.12) 0%,rgba(255,255,255,0.02) 100%)" }}/>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-white/60 text-xs font-medium">Hóa đơn tháng {bill.month}</p>
              <p className="text-white/80 text-xs mt-0.5">{bill.building} · {bill.room}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
              {isPending ? "Chờ thanh toán" : "Đã thanh toán"}
            </span>
          </div>
          <p className="text-4xl font-bold tracking-tight text-white mb-1">{fmt(bill.total)}</p>
          {isPending && (
            <p className="text-white/60 text-xs mb-4">
              Hạn thanh toán: {bill.due} · còn {bill.daysLeft} ngày
            </p>
          )}

          <div className="rounded-2xl p-3 space-y-2 mt-2"
            style={{ background: "rgba(0,0,0,0.2)" }}>
            {[
              { label: "Tiền phòng", value: bill.rent },
              { label: `Điện (${bill.electric.usage} kWh × ${bill.electric.unit.toLocaleString("vi-VN")}đ)`, value: bill.electric.total },
              { label: `Nước (${bill.water.usage} m³ × ${bill.water.unit.toLocaleString("vi-VN")}đ)`, value: bill.water.total },
              { label: "Dịch vụ", value: bill.service },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-white/60 text-xs">{row.label}</span>
                <span className="text-white text-xs font-semibold">{fmt(row.value)}</span>
              </div>
            ))}
          </div>

          {isPending && (
            <button onClick={() => openModal("payment")} className="w-full mt-3 h-11 rounded-2xl font-bold text-sm text-[#007aff]"
              style={{ background: "rgba(255,255,255,0.95)" }}>
              Thanh toán ngay
            </button>
          )}
        </div>
      </div>

      {/* Contract expiry warning */}
      <div className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: `${ORANGE}14`, border: `1px solid ${ORANGE}28` }}>
        <span className="text-xl">📋</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: ORANGE }}>Hợp đồng sắp hết hạn</p>
          <p className="text-xs text-[#8e8e93] mt-0.5">
            Hợp đồng của bạn còn <b>62 ngày</b> (hết hạn 10/09/2026). Liên hệ chủ nhà để gia hạn.
          </p>
        </div>
      </div>

      {/* Quick links */}
      <GlassCard className="divide-y divide-black/[0.04]">
        {[
          { label: "Lịch sử thanh toán", icon: "📅", color: BLUE },
          { label: "Xem hợp đồng thuê", icon: "📄", color: PURPLE },
          { label: "Tình trạng công nợ", icon: "💳", color: RED },
          { label: "Liên hệ chủ nhà", icon: "📞", color: GREEN },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center gap-3 px-4 py-3.5 active:opacity-70 transition-opacity">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${item.color}15` }}>
              <span className="text-base">{item.icon}</span>
            </div>
            <span className="flex-1 text-left text-sm font-medium text-[#1c1c1e]">{item.label}</span>
            <ChevronRight/>
          </button>
        ))}
      </GlassCard>
    </div>
  );
}

function TenantBills({
  tenantBill,
  paymentHistory,
}: {
  tenantBill: typeof initialTenantBill;
  paymentHistory: typeof initialPaymentHistory;
}) {
  const bill = tenantBill;
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-4 pb-6">
      <div className="pt-2 pb-1">
        <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Lịch sử hóa đơn</h1>
        <p className="text-sm text-[#8e8e93]">Phòng {bill.room} · Khu trọ Hoàng Gia</p>
      </div>

      {/* Current month */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-[#8e8e93] font-medium">Tháng hiện tại</p>
            <p className="text-lg font-bold text-[#1c1c1e]">{bill.month}</p>
          </div>
          <Badge status={bill.status}/>
        </div>
        <div className="space-y-2">
          {[
            { label: "Tiền phòng", v: bill.rent },
            { label: `Tiền điện (${bill.electric.usage} kWh)`, v: bill.electric.total },
            { label: `Tiền nước (${bill.water.usage} m³)`, v: bill.water.total },
            { label: "Dịch vụ", v: bill.service },
          ].map(r => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-[#8e8e93]">{r.label}</span>
              <span className="font-semibold text-[#1c1c1e]">{fmt(r.v)}</span>
            </div>
          ))}
          <div className="border-t border-black/[0.06] pt-2 flex justify-between">
            <span className="text-sm font-bold text-[#1c1c1e]">Tổng</span>
            <span className="text-sm font-bold" style={{ color: BLUE }}>{fmt(bill.total)}</span>
          </div>
        </div>
      </GlassCard>

      {/* History */}
      <SectionHeader title="Các tháng trước"/>
      <GlassCard className="divide-y divide-black/[0.04]">
        {paymentHistory.map(h => (
          <button key={h.month} className="w-full flex items-center gap-3 px-4 py-4 active:opacity-70 transition-opacity flex-row">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${GREEN}15` }}>
              <span className="text-base">✅</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-[#1c1c1e]">Tháng {h.month}</p>
              <p className="text-xs text-[#8e8e93]">Thanh toán ngày {h.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#1c1c1e]">{fmt(h.total)}</p>
              <Badge status="paid"/>
            </div>
          </button>
        ))}
      </GlassCard>

      {/* Debt section */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/10">
            <span className="text-lg">🟢</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1c1c1e]">Không có công nợ</p>
            <p className="text-xs text-[#8e8e93]">Tất cả các khoản đã được thanh toán đúng hạn</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function TenantNotices({
  notices,
  setNotices,
  showToast,
}: {
  notices: typeof initialNotices;
  setNotices: React.Dispatch<React.SetStateAction<typeof initialNotices>>;
  showToast: (msg: string) => void;
}) {
  const [fireAlert, setFireAlert] = useState(false);

  const handleConfirmFire = () => {
    const newNotice = {
      id: Date.now(),
      type: "fire" as const,
      title: "CẢNH BÁO CHÁY khẩn cấp",
      body: "Cư dân P201 vừa kích hoạt hệ thống báo cháy khẩn cấp. Vui lòng sơ tán!",
      time: "Vừa xong",
      icon: "🔥",
    };
    setNotices(prev => [newNotice, ...prev]);
    setFireAlert(false);
    showToast("Đã kích hoạt hệ thống báo động cháy!");
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-4 pb-6">
      <div className="flex items-center justify-between pt-2 pb-1">
        <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Bảng tin</h1>
        <button onClick={() => setFireAlert(!fireAlert)}
          className="px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1"
          style={{ background: RED, boxShadow: `0 4px 12px ${RED}40` }}>
          🔥 Báo cháy
        </button>
      </div>

      {fireAlert && (
        <div className="rounded-2xl p-4 space-y-3 border-2"
          style={{ background: `${RED}10`, borderColor: RED }}>
          <p className="text-sm font-bold text-[#1c1c1e]">⚠️ Xác nhận gửi cảnh báo cháy?</p>
          <p className="text-xs text-[#8e8e93]">
            Thông báo sẽ được gửi ngay lập tức đến <b>toàn bộ cư dân</b> và chủ nhà của khu trọ.
            Chỉ sử dụng khi thực sự có sự cố cháy.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setFireAlert(false)}
              className="flex-1 h-10 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(118,118,128,0.12)", color: "#3c3c43" }}>
              Hủy
            </button>
            <button onClick={handleConfirmFire} className="flex-1 h-10 rounded-xl text-white text-sm font-bold"
              style={{ background: RED }}>
              Xác nhận báo cháy
            </button>
          </div>
        </div>
      )}

      {/* Notices */}
      <GlassCard className="divide-y divide-black/[0.04]">
        {notices.map(n => (
          <div key={n.id} className="px-4 py-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{
                background: n.type === "fire" ? `${RED}15` : n.type === "urgent" ? `${ORANGE}15` : "rgba(118,118,128,0.08)"
              }}>
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-[#1c1c1e]">{n.title}</p>
                <p className="text-[10px] text-[#8e8e93] flex-shrink-0">{n.time}</p>
              </div>
              <p className="text-xs text-[#8e8e93] mt-0.5 leading-relaxed">{n.body}</p>
              {n.type === "fire" && (
                <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${RED}18`, color: RED }}>
                  Khẩn cấp
                </span>
              )}
              {n.type === "urgent" && (
                <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${ORANGE}18`, color: ORANGE }}>
                  Thông báo khẩn
                </span>
              )}
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

function TenantProfile({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-4 pb-6">
      <div className="pt-2 pb-1">
        <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Hồ sơ</h1>
      </div>

      {/* Profile card */}
      <GlassCard className="p-5 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
          style={{ background: `linear-gradient(135deg, ${GREEN}, #2ba84a)` }}>
          LC
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#1c1c1e]">Lê Hoàng Cường</p>
          <p className="text-sm text-[#8e8e93]">Phòng P201 · Tầng 2</p>
          <p className="text-xs text-[#8e8e93]">Khu trọ Hoàng Gia</p>
        </div>
        <div className="flex gap-6 pt-1 border-t border-black/[0.06] w-full justify-center">
          <div className="text-center">
            <p className="text-base font-bold text-[#1c1c1e]">62</p>
            <p className="text-[10px] text-[#8e8e93]">Ngày còn lại</p>
          </div>
          <div className="w-px bg-black/10"/>
          <div className="text-center">
            <p className="text-base font-bold" style={{ color: GREEN }}>Đúng hạn</p>
            <p className="text-[10px] text-[#8e8e93]">Lịch sử nộp</p>
          </div>
          <div className="w-px bg-black/10"/>
          <div className="text-center">
            <p className="text-base font-bold text-[#1c1c1e]">0đ</p>
            <p className="text-[10px] text-[#8e8e93]">Công nợ</p>
          </div>
        </div>
      </GlassCard>

      {/* Contract info */}
      <p className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider px-1">Thông tin hợp đồng</p>
      <GlassCard className="divide-y divide-black/[0.04]">
        {[
          { label: "Ngày bắt đầu", value: "10/07/2025" },
          { label: "Ngày kết thúc", value: "10/09/2026" },
          { label: "Giá thuê", value: "4.000.000đ/tháng" },
          { label: "Tiền cọc", value: "8.000.000đ" },
          { label: "Hạn thanh toán", value: "Ngày 15 hàng tháng" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-[#8e8e93]">{item.label}</span>
            <span className="text-sm font-semibold text-[#1c1c1e]">{item.value}</span>
          </div>
        ))}
      </GlassCard>

      <p className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider px-1">Tài khoản</p>
      <GlassCard className="divide-y divide-black/[0.04]">
        {[
          { label: "Thông tin cá nhân", icon: "👤" },
          { label: "Thông báo & nhắc nhở", icon: "🔔" },
          { label: "Bảo mật & đăng nhập", icon: "🔐" },
          { label: "Trợ giúp", icon: "❓" },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center gap-3 px-4 py-4 active:opacity-70 transition-opacity">
            <span className="text-xl">{item.icon}</span>
            <span className="flex-1 text-left text-sm font-medium text-[#1c1c1e]">{item.label}</span>
            <ChevronRight/>
          </button>
        ))}
      </GlassCard>

      <GlassCard>
        <button onClick={onLogout} className="w-full px-4 py-4 text-sm font-semibold text-center" style={{ color: RED }}>
          Đăng xuất
        </button>
      </GlassCard>
    </div>
  );
}

// ─── tab configs ──────────────────────────────────────────────────────────────
const landlordTabs = [
  { id: "home" as LandlordTab, label: "Tổng quan", icon: (a: boolean) => (
    <svg width="24" height="24" fill={a?BLUE:"none"} stroke={a?BLUE:"#8e8e93"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { id: "rooms" as LandlordTab, label: "Phòng", icon: (a: boolean) => (
    <svg width="24" height="24" fill="none" stroke={a?BLUE:"#8e8e93"} strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { id: "bills" as LandlordTab, label: "Hóa đơn", icon: (a: boolean) => (
    <svg width="24" height="24" fill="none" stroke={a?BLUE:"#8e8e93"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  )},
  { id: "alerts" as LandlordTab, label: "Cảnh báo", icon: (a: boolean) => (
    <svg width="24" height="24" fill={a?BLUE:"none"} stroke={a?BLUE:"#8e8e93"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  )},
];

const tenantTabs = [
  { id: "home" as TenantTab, label: "Trang chủ", icon: (a: boolean) => (
    <svg width="24" height="24" fill={a?GREEN:"none"} stroke={a?GREEN:"#8e8e93"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { id: "bills" as TenantTab, label: "Hóa đơn", icon: (a: boolean) => (
    <svg width="24" height="24" fill="none" stroke={a?GREEN:"#8e8e93"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  )},
  { id: "notices" as TenantTab, label: "Bảng tin", icon: (a: boolean) => (
    <svg width="24" height="24" fill={a?GREEN:"none"} stroke={a?GREEN:"#8e8e93"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  )},
  { id: "profile" as TenantTab, label: "Hồ sơ", icon: (a: boolean) => (
    <svg width="24" height="24" fill="none" stroke={a?GREEN:"#8e8e93"} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )},
];

// ─── LoginPage component ──────────────────────────────────────────────────────
function LoginPage({
  onLogin,
}: {
  onLogin: (role: Role) => void;
}) {
  const [role, setRole] = useState<Role>("landlord");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(role);
  };

  return (
    <div className="flex-1 flex flex-col px-6 justify-between pb-10 pt-4 overflow-y-auto scrollbar-hide">
      <div className="flex-1 flex flex-col justify-center">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-8 select-none">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-xl mb-4"
            style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${GREEN} 100%)` }}>
            R
          </div>
          <h2 className="text-3xl font-extrabold text-[#1c1c1e] tracking-tight">Rentify</h2>
          <p className="text-xs text-[#8e8e93] font-medium mt-1">Quản lý phòng trọ trong tầm tay</p>
        </div>

        {/* Role Select tab */}
        <div className="flex rounded-xl p-1 gap-1 mb-6 bg-black/[0.05]">
          <button type="button" onClick={() => setRole("landlord")}
            className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all text-center"
            style={role === "landlord" ? { background: BLUE, color: "#fff", boxShadow: "0 2px 8px rgba(0,122,255,0.25)" } : { color: "#8e8e93" }}>
            🏠 Chủ nhà
          </button>
          <button type="button" onClick={() => setRole("tenant")}
            className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all text-center"
            style={role === "tenant" ? { background: GREEN, color: "#fff", boxShadow: "0 2px 8px rgba(52,199,89,0.25)" } : { color: "#8e8e93" }}>
            👤 Người thuê
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="rounded-xl border border-black/10 px-3.5 py-2 bg-white/60 focus-within:border-blue-500 transition-colors">
              <label className="block text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={role === "landlord" ? "0901234567" : "0987654321"}
                className="w-full text-sm bg-transparent border-none p-0 focus:outline-none text-[#1c1c1e] mt-0.5"
              />
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-black/10 px-3.5 py-2 bg-white/60 focus-within:border-blue-500 transition-colors">
              <label className="block text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full text-sm bg-transparent border-none p-0 focus:outline-none text-[#1c1c1e] mt-0.5"
              />
            </div>
          </div>

          <button type="submit" className="w-full h-12 rounded-xl text-white font-bold text-sm shadow-md transition-all active:opacity-90 mt-2"
            style={{ background: role === "landlord" ? BLUE : GREEN, boxShadow: `0 4px 16px ${role === "landlord" ? BLUE : GREEN}30` }}>
            Đăng nhập
          </button>
        </form>

        {/* Quick login shortcuts for prototype testing */}
        <div className="mt-8">
          <p className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider text-center mb-3">Đăng nhập nhanh</p>
          <div className="space-y-2">
            <button onClick={() => { setRole("landlord"); onLogin("landlord"); }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold border bg-white/50 active:bg-white border-black/5 flex items-center justify-center gap-2">
              <span>🏠</span> Đăng nhập làm <b>Chủ nhà</b>
            </button>
            <button onClick={() => { setRole("tenant"); onLogin("tenant"); }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold border bg-white/50 active:bg-white border-black/5 flex items-center justify-center gap-2">
              <span>👤</span> Đăng nhập làm <b>Người thuê (P201)</b>
            </button>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-[#8e8e93] text-center font-medium mt-6">
        Bản thử nghiệm Rentify · Phiên bản 1.0.0
      </p>
    </div>
  );
}

// ─── ModalSheet component ─────────────────────────────────────────────────────
function ModalSheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] z-40 flex flex-col justify-end">
      {/* Tap background to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Sheet Content */}
      <div className="rounded-t-[32px] p-5 pb-8 space-y-4 max-h-[85%] overflow-y-auto bg-[#f2f2f7] border-t border-white/60 shadow-2xl relative"
        style={{
          boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
        }}>
        {/* Notch */}
        <div className="w-10 h-1.5 rounded-full bg-black/15 mx-auto mb-2" onClick={onClose}/>

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-[#1c1c1e]">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center text-xs font-bold text-[#8e8e93] active:bg-black/[0.15]">
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>("landlord");
  const [landlordTab, setLandlordTab] = useState<LandlordTab>("home");
  const [tenantTab, setTenantTab] = useState<TenantTab>("home");

  // Dynamic States
  const [roomsState, setRoomsState] = useState(initialRooms);
  const [invoicesState, setInvoicesState] = useState(initialInvoices);
  const [noticesState, setNoticesState] = useState(initialNotices);
  const [tenantBillState, setTenantBillState] = useState(initialTenantBill);
  const [paymentHistoryState, setPaymentHistoryState] = useState(initialPaymentHistory);

  // Overlay states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);

  // Form states
  const [newRoomId, setNewRoomId] = useState("");
  const [newRoomFloor, setNewRoomFloor] = useState("Tầng 1");
  const [newRoomRent, setNewRoomRent] = useState(3000000);
  const [newRoomStatus, setNewRoomStatus] = useState<"vacant" | "maintenance">("vacant");

  const [contractRoomId, setContractRoomId] = useState("");
  const [contractTenantName, setContractTenantName] = useState("");
  const [contractRent, setContractRent] = useState(0);
  const [contractDeposit, setContractDeposit] = useState(0);

  const [billRoomId, setBillRoomId] = useState("");
  const [billElectric, setBillElectric] = useState(110);
  const [billWater, setBillWater] = useState(5);
  const [billService, setBillService] = useState(100000);

  const [paymentMethod, setPaymentMethod] = useState("bank");

  const accent = role === "landlord" ? BLUE : GREEN;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
    showToast(`Đăng nhập thành công!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast("Đã đăng xuất!");
  };

  const renderLandlord = () => {
    switch (landlordTab) {
      case "home":
        return (
          <LandlordHome
            rooms={roomsState}
            invoices={invoicesState}
            openModal={setActiveModal}
            onLogout={handleLogout}
          />
        );
      case "rooms":
        return (
          <LandlordRooms
            rooms={roomsState}
            openModal={setActiveModal}
          />
        );
      case "bills":
        return (
          <LandlordBills
            invoices={invoicesState}
            openModal={setActiveModal}
          />
        );
      case "alerts":
        return (
          <LandlordAlerts
            notices={noticesState}
            setNotices={setNoticesState}
            rooms={roomsState}
            invoices={invoicesState}
            showToast={showToast}
          />
        );
    }
  };

  const renderTenant = () => {
    switch (tenantTab) {
      case "home":
        return (
          <TenantHome
            tenantBill={tenantBillState}
            openModal={setActiveModal}
          />
        );
      case "bills":
        return (
          <TenantBills
            tenantBill={tenantBillState}
            paymentHistory={paymentHistoryState}
          />
        );
      case "notices":
        return (
          <TenantNotices
            notices={noticesState}
            setNotices={setNoticesState}
            showToast={showToast}
          />
        );
      case "profile":
        return (
          <TenantProfile
            onLogout={handleLogout}
          />
        );
    }
  };

  const renderModal = () => {
    if (!activeModal) return null;

    if (activeModal === "add_room") {
      const handleSubmit = () => {
        if (!newRoomId.trim()) return;
        const newRoom = {
          id: newRoomId,
          floor: newRoomFloor,
          status: newRoomStatus,
          tenant: null,
          rent: newRoomRent,
          daysLeft: null
        };
        setRoomsState(prev => [...prev, newRoom]);
        setActiveModal(null);
        setNewRoomId("");
        showToast(`Đã thêm phòng ${newRoomId} thành công!`);
      };

      return (
        <ModalSheet title="Thêm phòng mới" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#8e8e93] mb-1">Mã số phòng</label>
              <input
                type="text"
                value={newRoomId}
                onChange={e => setNewRoomId(e.target.value)}
                placeholder="Ví dụ: P303"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-blue-500 bg-white text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#8e8e93] mb-1">Tầng</label>
                <select
                  value={newRoomFloor}
                  onChange={e => setNewRoomFloor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none bg-white text-sm"
                >
                  <option value="Tầng 1">Tầng 1</option>
                  <option value="Tầng 2">Tầng 2</option>
                  <option value="Tầng 3">Tầng 3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8e8e93] mb-1">Trạng thái</label>
                <select
                  value={newRoomStatus}
                  onChange={e => setNewRoomStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none bg-white text-sm"
                >
                  <option value="vacant">Trống</option>
                  <option value="maintenance">Bảo trì</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8e8e93] mb-1">Đơn giá thuê (đ/tháng)</label>
              <input
                type="number"
                value={newRoomRent}
                onChange={e => setNewRoomRent(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-blue-500 bg-white text-sm"
              />
            </div>
            <button onClick={handleSubmit} className="w-full h-12 rounded-xl text-white font-bold text-sm bg-[#007aff] mt-2 shadow-md">
              Thêm phòng
            </button>
          </div>
        </ModalSheet>
      );
    }

    if (activeModal === "create_contract") {
      const vacantRooms = roomsState.filter(r => r.status === "vacant");

      const handleRoomChange = (roomId: string) => {
        setContractRoomId(roomId);
        const r = roomsState.find(x => x.id === roomId);
        if (r) {
          setContractRent(r.rent);
          setContractDeposit(r.rent * 2);
        }
      };

      const handleSubmit = () => {
        if (!contractRoomId || !contractTenantName.trim()) return;
        setRoomsState(prev => prev.map(r => {
          if (r.id === contractRoomId) {
            return { ...r, status: "rented" as const, tenant: contractTenantName, rent: contractRent, daysLeft: 30 };
          }
          return r;
        }));

        const newNotice = {
          id: Date.now(),
          type: "info" as const,
          title: `Hợp đồng mới — Phòng ${contractRoomId}`,
          body: `Chào mừng ${contractTenantName} đã thuê phòng ${contractRoomId}. Hợp đồng có hiệu lực từ hôm nay.`,
          time: "Vừa xong",
          icon: "📄"
        };
        setNoticesState(prev => [newNotice, ...prev]);

        setActiveModal(null);
        setContractRoomId("");
        setContractTenantName("");
        showToast(`Đã ký hợp đồng phòng ${contractRoomId}!`);
      };

      return (
        <ModalSheet title="Tạo hợp đồng mới" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            {vacantRooms.length === 0 ? (
              <p className="text-sm text-center text-[#8e8e93] py-4">Hiện không còn phòng trống nào.</p>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#8e8e93] mb-1">Chọn phòng trống</label>
                  <select
                    value={contractRoomId}
                    onChange={e => handleRoomChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none bg-white text-sm"
                  >
                    <option value="">-- Chọn phòng --</option>
                    {vacantRooms.map(r => (
                      <option key={r.id} value={r.id}>{r.id} ({fmt(r.rent)}/thg)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8e8e93] mb-1">Tên người thuê</label>
                  <input
                    type="text"
                    value={contractTenantName}
                    onChange={e => setContractTenantName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-blue-500 bg-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#8e8e93] mb-1">Giá thuê (đ/thg)</label>
                    <input
                      type="number"
                      value={contractRent}
                      onChange={e => setContractRent(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8e8e93] mb-1">Tiền cọc (đ)</label>
                    <input
                      type="number"
                      value={contractDeposit}
                      onChange={e => setContractDeposit(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none bg-white text-sm"
                    />
                  </div>
                </div>
                <button onClick={handleSubmit} className="w-full h-12 rounded-xl text-white font-bold text-sm bg-[#007aff] mt-2 shadow-md">
                  Ký hợp đồng
                </button>
              </>
            )}
          </div>
        </ModalSheet>
      );
    }

    if (activeModal === "create_bill") {
      const rentedRooms = roomsState.filter(r => r.status === "rented");

      const handleSubmit = () => {
        if (!billRoomId) return;
        const room = roomsState.find(r => r.id === billRoomId);
        if (!room) return;

        const rentPrice = room.rent;
        const electricPrice = billElectric * 2000;
        const waterPrice = billWater * 11000;
        const total = rentPrice + electricPrice + waterPrice + billService;

        const newInvoice = {
          id: `HD-0724-${billRoomId.replace("P", "")}`,
          room: billRoomId,
          tenant: room.tenant || "Người thuê",
          rent: rentPrice,
          electric: electricPrice,
          water: waterPrice,
          service: billService,
          total: total,
          status: "pending" as const,
          month: "07/2026"
        };

        setInvoicesState(prev => [newInvoice, ...prev]);

        if (billRoomId === "P201") {
          setTenantBillState({
            month: "07/2026",
            room: "P201",
            building: "Khu trọ Hoàng Gia — Tầng 2",
            rent: rentPrice,
            electric: { usage: billElectric, unit: 2000, total: electricPrice },
            water: { usage: billWater, unit: 11000, total: waterPrice },
            service: billService,
            total: total,
            due: "15/07/2026",
            status: "pending",
            daysLeft: 6
          });
        }

        setActiveModal(null);
        setBillRoomId("");
        showToast(`Đã lập hóa đơn phòng ${billRoomId}!`);
      };

      return (
        <ModalSheet title="Tính tiền phòng" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#8e8e93] mb-1">Chọn phòng thanh toán</label>
              <select
                value={billRoomId}
                onChange={e => setBillRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none bg-white text-sm"
              >
                <option value="">-- Chọn phòng --</option>
                {rentedRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.id} - {r.tenant}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#8e8e93] mb-1">Điện sử dụng (kWh)</label>
                <input
                  type="number"
                  value={billElectric}
                  onChange={e => setBillElectric(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8e8e93] mb-1">Nước sử dụng (m³)</label>
                <input
                  type="number"
                  value={billWater}
                  onChange={e => setBillWater(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none bg-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8e8e93] mb-1">Phí dịch vụ cố định (đ)</label>
              <input
                type="number"
                value={billService}
                onChange={e => setBillService(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none bg-white text-sm"
              />
            </div>
            <button onClick={handleSubmit} className="w-full h-12 rounded-xl text-white font-bold text-sm bg-[#007aff] mt-2 shadow-md">
              Lập hóa đơn
            </button>
          </div>
        </ModalSheet>
      );
    }

    if (activeModal === "send_reminders") {
      const pendingInvoices = invoicesState.filter(i => i.status === "pending" || i.status === "overdue" || i.status === "debt");

      const handleToggleSelect = (id: string) => {
        setSelectedReminders(prev =>
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
      };

      const handleSelectAllToggle = () => {
        if (selectedReminders.length === pendingInvoices.length) {
          setSelectedReminders([]);
        } else {
          setSelectedReminders(pendingInvoices.map(i => i.id));
        }
      };

      const triggerReminderBatch = (invoicesToRemind: typeof pendingInvoices) => {
        if (invoicesToRemind.length === 0) return;

        const newNotices = invoicesToRemind.map(inv => ({
          id: Date.now() + Math.random(),
          type: "urgent" as const,
          title: "Nhắc đóng tiền phòng",
          body: `Hóa đơn phòng ${inv.room} của bạn đã lập với số tiền ${fmt(inv.total)}. Vui lòng thanh toán trước hạn.`,
          time: "Vừa xong",
          icon: "🔔",
        }));

        setNoticesState(prev => [...newNotices, ...prev]);
        showToast(`Đã nhắc phí tới ${invoicesToRemind.length} phòng!`);
        setActiveModal(null);
        setSelectedReminders([]);
      };

      return (
        <ModalSheet title="Gửi nhắc đóng phí" onClose={() => { setActiveModal(null); setSelectedReminders([]); }}>
          <div className="space-y-4">
            {pendingInvoices.length === 0 ? (
              <p className="text-sm text-center text-[#8e8e93] py-4">Tất cả hóa đơn đã được thanh toán.</p>
            ) : (
              <>
                {/* Header Action Bar */}
                <div className="flex items-center justify-between px-1 text-xs">
                  <button onClick={handleSelectAllToggle} className="text-[#007aff] font-bold">
                    {selectedReminders.length === pendingInvoices.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </button>
                  <span className="text-[#8e8e93] font-medium">Đã chọn: {selectedReminders.length}/{pendingInvoices.length}</span>
                </div>

                {/* List of Pending Invoices with Checkboxes */}
                <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                  {pendingInvoices.map(inv => {
                    const isChecked = selectedReminders.includes(inv.id);
                    return (
                      <div key={inv.id} onClick={() => handleToggleSelect(inv.id)}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white border border-black/5 shadow-xs cursor-pointer active:bg-black/[0.02] transition-colors">
                        {/* Custom Checkbox */}
                        <div className="w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0"
                          style={{
                            borderColor: isChecked ? BLUE : "rgba(0,0,0,0.15)",
                            background: isChecked ? BLUE : "transparent"
                          }}>
                          {isChecked && <span className="text-white text-[10px] font-bold">✓</span>}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1c1c1e]">{inv.room} · {inv.tenant}</p>
                          <p className="text-[10px] font-semibold text-[#ff9500] mt-0.5">{fmt(inv.total)}</p>
                        </div>

                        <button onClick={(e) => {
                          e.stopPropagation();
                          triggerReminderBatch([inv]);
                        }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#007aff]12 text-[#007aff] text-[10px] font-bold shadow-xs active:bg-[#007aff]25">
                          Nhắc riêng
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={() => triggerReminderBatch(pendingInvoices)}
                    className="h-11 rounded-xl bg-[#8e8e93]/15 text-[#3c3c43] text-xs font-bold active:opacity-75 transition-all">
                    Nhắc tất cả ({pendingInvoices.length})
                  </button>
                  <button onClick={() => triggerReminderBatch(pendingInvoices.filter(i => selectedReminders.includes(i.id)))}
                    disabled={selectedReminders.length === 0}
                    className="h-11 rounded-xl text-white text-xs font-bold shadow-md active:opacity-90 transition-all disabled:opacity-40"
                    style={{ background: BLUE, boxShadow: selectedReminders.length > 0 ? `0 4px 12px ${BLUE}30` : "none" }}>
                    Nhắc đã chọn ({selectedReminders.length})
                  </button>
                </div>
              </>
            )}
          </div>
        </ModalSheet>
      );
    }

    if (activeModal === "payment") {
      const handlePay = () => {
        setActiveModal("payment_processing");
        setTimeout(() => {
          setTenantBillState(prev => ({ ...prev, status: "paid" }));

          const newHistoryItem = {
            month: tenantBillState.month,
            total: tenantBillState.total,
            status: "paid",
            date: new Date().toLocaleDateString("vi-VN")
          };
          setPaymentHistoryState(prev => [newHistoryItem, ...prev]);

          setInvoicesState(prev => prev.map(inv => {
            if (inv.room === "P201" && inv.month === tenantBillState.month) {
              return { ...inv, status: "paid" as const };
            }
            return inv;
          }));

          const paymentNotice = {
            id: Date.now(),
            type: "info" as const,
            title: `Thanh toán thành công — Phòng P201`,
            body: `Bạn đã thanh toán thành công hóa đơn tháng ${tenantBillState.month} số tiền ${fmt(tenantBillState.total)}.`,
            time: "Vừa xong",
            icon: "✅",
          };
          setNoticesState(prev => [paymentNotice, ...prev]);

          setActiveModal(null);
          showToast("Thanh toán thành công!");
        }, 1500);
      };

      return (
        <ModalSheet title="Thanh toán hóa đơn" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-black/5 text-center">
              <p className="text-xs text-[#8e8e93]">Tổng tiền cần thanh toán</p>
              <p className="text-3xl font-extrabold text-[#1c1c1e] mt-1">{fmt(tenantBillState.total)}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-[#8e8e93]">Chọn phương thức thanh toán</p>
              {[
                { id: "bank", label: "Chuyển khoản Vietcombank", icon: "🏦" },
                { id: "momo", label: "Ví điện tử MoMo", icon: "👛" },
                { id: "vnpay", label: "Cổng thanh toán VNPay", icon: "💳" }
              ].map(method => (
                <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border bg-white text-left transition-colors text-sm font-semibold"
                  style={{ borderColor: paymentMethod === method.id ? GREEN : "rgba(0,0,0,0.06)", background: paymentMethod === method.id ? `${GREEN}08` : "white" }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{method.icon}</span>
                    <span>{method.label}</span>
                  </div>
                  {paymentMethod === method.id && <span className="text-[#34c759] font-bold text-sm">✓</span>}
                </button>
              ))}
            </div>

            <button onClick={handlePay} className="w-full h-12 rounded-xl text-white font-bold text-sm bg-[#34c759] shadow-md active:opacity-90 mt-2">
              Xác nhận thanh toán
            </button>
          </div>
        </ModalSheet>
      );
    }

    if (activeModal === "payment_processing") {
      return (
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] z-50 flex items-center justify-center p-6">
          <GlassCard className="p-6 max-w-xs text-center flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-t-green-500 border-green-100 animate-spin"/>
            <div>
              <p className="text-sm font-bold text-[#1c1c1e]">Đang xử lý giao dịch</p>
              <p className="text-xs text-[#8e8e93] mt-1">Vui lòng không đóng ứng dụng...</p>
            </div>
          </GlassCard>
        </div>
      );
    }

    if (activeModal === "reports") {
      const paidInvoices = invoicesState.filter(i => i.status === "paid");
      const totalPaid = paidInvoices.reduce((sum, i) => sum + i.total, 0);

      return (
        <ModalSheet title="Báo cáo doanh thu" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-black/5">
                <p className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">Thực thu tháng này</p>
                <p className="text-lg font-bold text-[#34c759] mt-0.5">{fmt(totalPaid)}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-black/5">
                <p className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider">Mục tiêu</p>
                <p className="text-lg font-bold text-[#1c1c1e] mt-0.5">20.000.000đ</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-[#8e8e93] uppercase tracking-wider px-1">Lịch sử nhận tiền tháng 7</p>
              <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                {paidInvoices.map(inv => (
                  <div key={inv.id} className="flex justify-between items-center p-2.5 rounded-lg bg-white border border-black/5">
                    <div>
                      <p className="text-xs font-bold text-[#1c1c1e]">{inv.room} · {inv.tenant}</p>
                      <p className="text-[10px] text-[#8e8e93] mt-0.5">Đã thu: {fmt(inv.total)}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#34c759] bg-[#34c759]10 px-2 py-0.5 rounded-full">Đã nhận</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setActiveModal(null)} className="w-full h-11 rounded-xl bg-black/[0.06] text-sm font-semibold text-[#1c1c1e] transition-colors active:bg-black/[0.12]">
              Đóng
            </button>
          </div>
        </ModalSheet>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 py-8"
      style={{ background: "linear-gradient(135deg, #dce8ff 0%, #e8deff 50%, #d4f0e8 100%)" }}>

      {/* Brand Header */}
      <div className="flex flex-col items-center gap-1.5 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
            style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${GREEN} 100%)` }}>
            R
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-[#1c1c1e]">
            Rentify
          </span>
        </div>
        <p className="text-[10px] text-[#8e8e93] font-bold tracking-wider uppercase">HỆ THỐNG QUẢN LÝ NHÀ TRỌ THÔNG MINH</p>
      </div>

      {/* Role switcher — outside phone (only shown when logged in) */}
      {isLoggedIn && (
        <div className="flex rounded-2xl p-1 gap-1"
          style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          {([["landlord","🏠 Chủ nhà"],["tenant","👤 Người thuê"]] as [Role,string][]).map(([r, label]) => (
            <button key={r} onClick={() => setRole(r)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={role === r
                ? { background: r === "landlord" ? BLUE : GREEN, color: "#fff",
                    boxShadow: `0 4px 12px ${r === "landlord" ? BLUE : GREEN}40` }
                : { color: "#8e8e93" }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Phone frame */}
      <div className="relative flex flex-col overflow-hidden"
        style={{
          width: 390, height: 844, borderRadius: 54,
          background: "#f2f2f7",
          boxShadow: "0 40px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.3) inset, 0 2px 0 rgba(255,255,255,0.6) inset",
        }}>
        {/* Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex justify-center pt-3">
          <div className="rounded-full bg-black" style={{ width: 126, height: 37 }}/>
        </div>

        {/* Status bar */}
        <div className="relative z-10 pt-14">
          <StatusBar/>
        </div>

        {/* Screen */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {isLoggedIn ? (
            role === "landlord" ? renderLandlord() : renderTenant()
          ) : (
            <LoginPage onLogin={handleLogin} />
          )}

          {/* Render active modal if any */}
          {isLoggedIn && activeModal && renderModal()}

          {/* Render toast notification */}
          {toast && (
            <div className="absolute top-24 left-4 right-4 z-50 rounded-2xl p-3 bg-black/85 text-white text-xs font-semibold text-center shadow-lg flex items-center justify-center gap-2"
              style={{ backdropFilter: "blur(8px)", animation: "fade-in 0.3s ease-out" }}>
              <span>💡</span> {toast}
            </div>
          )}
        </div>

        {/* Tab bar (only when logged in) */}
        {isLoggedIn && (
          <div className="relative flex-shrink-0"
            style={{
              background: "rgba(242,242,247,0.85)",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              borderTop: "0.5px solid rgba(60,60,67,0.12)",
            }}>
            <div className="flex items-center pb-6 pt-2 px-2">
              {role === "landlord"
                ? landlordTabs.map(tab => (
                  <button key={tab.id} onClick={() => setLandlordTab(tab.id)}
                    className="flex-1 flex flex-col items-center gap-1 py-1 active:opacity-70 transition-all">
                    {tab.icon(landlordTab === tab.id)}
                    <span className="text-[10px] font-medium"
                      style={{ color: landlordTab === tab.id ? accent : "#8e8e93" }}>
                      {tab.label}
                    </span>
                  </button>
                ))
                : tenantTabs.map(tab => (
                  <button key={tab.id} onClick={() => setTenantTab(tab.id)}
                    className="flex-1 flex flex-col items-center gap-1 py-1 active:opacity-70 transition-all">
                    {tab.icon(tenantTab === tab.id)}
                    <span className="text-[10px] font-medium"
                      style={{ color: tenantTab === tab.id ? accent : "#8e8e93" }}>
                      {tab.label}
                    </span>
                  </button>
                ))
              }
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
