import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const BLUE = "#1651A3", CORAL = "#E85410", SEA = "#446D98", NAVY = "#14335E";
const axis = { fontSize: 11, fill: "rgba(38,54,79,.55)" };
const tip = { background: "rgba(255,255,255,.9)", border: "1px solid rgba(255,255,255,.7)", borderRadius: 12, fontSize: 12, boxShadow: "0 8px 30px rgba(30,54,79,.15)" };

export function CollectionArea({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: -18, right: 6, top: 8 }}>
        <defs>
          <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity={0.35} /><stop offset="100%" stopColor={BLUE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(38,54,79,.07)" vertical={false} />
        <XAxis dataKey="m" tickLine={false} axisLine={false} tick={axis} />
        <YAxis tickLine={false} axisLine={false} tick={axis} width={44} tickFormatter={(v) => `${v/1000}k`} />
        <Tooltip contentStyle={tip} formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Collected"]} />
        <Area type="monotone" dataKey="v" stroke={BLUE} strokeWidth={2.5} fill="url(#gBlue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AdmissionsBar({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -20, right: 6, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(38,54,79,.07)" vertical={false} />
        <XAxis dataKey="m" tickLine={false} axisLine={false} tick={axis} />
        <YAxis tickLine={false} axisLine={false} tick={axis} width={30} />
        <Tooltip contentStyle={tip} cursor={{ fill: "rgba(30,86,168,.06)" }} />
        <Bar dataKey="v" radius={[6,6,0,0]} fill={CORAL} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendanceDonut({ present = 88 }) {
  const data = [{ name: "Present", value: present }, { name: "Absent", value: 100 - present }];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={62} outerRadius={82} startAngle={90} endAngle={-270} stroke="none">
          <Cell fill={SEA} /><Cell fill="rgba(38,54,79,.10)" />
        </Pie>
        <text x="50%" y="47%" textAnchor="middle" style={{ fontFamily: "Fredoka", fontSize: 26, fill: NAVY }}>{present}%</text>
        <text x="50%" y="60%" textAnchor="middle" style={{ fontSize: 11, fill: "rgba(38,54,79,.5)" }}>present today</text>
      </PieChart>
    </ResponsiveContainer>
  );
}
