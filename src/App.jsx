import React, { useMemo, useState, useEffect } from "react";
import { useUVData } from "./useUVData";
import { motion } from "framer-motion";

import {
  Sun,
  MapPin,
  Shield,
  Bell,
  Share2,
  Shirt,
  Info,
  ChevronRight,
  Droplets,
  TriangleAlert,
  CloudSun,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const uvTrendData = [
  { month: "Jan", uv: 11 },
  { month: "Feb", uv: 10 },
  { month: "Mar", uv: 8 },
  { month: "Apr", uv: 6 },
  { month: "May", uv: 4 },
  { month: "Jun", uv: 3 },
  { month: "Jul", uv: 4 },
  { month: "Aug", uv: 5 },
  { month: "Sep", uv: 7 },
  { month: "Oct", uv: 9 },
  { month: "Nov", uv: 10 },
  { month: "Dec", uv: 11 },
];

const riskData = [
  { label: "Low", value: 15 },
  { label: "Moderate", value: 28 },
  { label: "High", value: 39 },
  { label: "Extreme", value: 18 },
];

const mythFacts = [
  {
    title: "You only need sunscreen on sunny days",
    type: "Myth",
    content:
      "UV can still be strong on cloudy days. Daily protection matters even when the weather looks mild.",
  },
  {
    title: "Darker skin tones can still be affected by UV damage",
    type: "Fact",
    content:
      "All skin tones can experience UV damage, pigmentation changes, and long-term skin risks. Protection is still important.",
  },
  {
    title: "Reapplying sunscreen matters during long outdoor periods",
    type: "Fact",
    content:
      "Sweat, water, and time reduce sunscreen effectiveness. Reapplication helps maintain protection throughout the day.",
  },
  {
    title: "A hat alone is enough for full UV protection",
    type: "Myth",
    content:
      "A hat helps, but the best protection combines sunscreen, shade, sunglasses, and suitable clothing.",
  },
];

const skinToneOptions = [
  {
    id: "fair",
    name: "Very Fair",
    description: "Burns very easily, rarely tans",
    sensitivity: "Very high UV sensitivity",
    advice: "Use SPF 50+, reapply every 2 hours, wear a hat and seek shade during peak UV.",
    swatch: "#F7D9C7",
  },
  {
    id: "light",
    name: "Light",
    description: "Burns easily, tans slightly",
    sensitivity: "High UV sensitivity",
    advice: "Use SPF 50+, sunglasses, and protective clothing when UV is high or extreme.",
    swatch: "#EAC3A2",
  },
  {
    id: "medium",
    name: "Medium",
    description: "Sometimes burns, gradually tans",
    sensitivity: "Moderate UV sensitivity",
    advice: "Use sunscreen consistently and add clothing protection on high UV days.",
    swatch: "#C98B62",
  },
  {
    id: "olive",
    name: "Olive",
    description: "Rarely burns, tans easily",
    sensitivity: "Moderate UV sensitivity",
    advice: "Protection is still important during prolonged exposure, especially in the Australian sun.",
    swatch: "#A96B46",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Rarely burns",
    sensitivity: "Lower visible burn risk, but UV damage still matters",
    advice: "Use sunscreen for extended outdoor time and support protection with shade and clothing.",
    swatch: "#6E4228",
  },
];

const clothingByRisk = {
  Low: ["Cap or sunglasses optional", "Lightweight short sleeves", "Stay aware if outside for long periods"],
  Moderate: ["Sunglasses recommended", "Light breathable layers", "Use sunscreen on exposed skin"],
  High: ["Wide-brim hat", "Long-sleeve breathable top", "Sunglasses + shade breaks"],
  Extreme: ["Wide-brim hat", "Long sleeves and covered shoulders", "Minimise direct sun and stay in shade"],
};

const sunscreenByRisk = {
  Low: "Light daily coverage is usually enough for shorter exposure.",
  Moderate: "Apply a standard full-face and exposed-skin layer before going out.",
  High: "Use generous SPF 50+ coverage on all exposed skin and reapply on schedule.",
  Extreme: "Apply SPF 50+ generously, reapply carefully, and combine with clothing and shade.",
};

function getUvMeta(uv) {
  if (uv <= 2) {
    return {
      level: "Low",
      message: "You're not at immediate risk of UV damage, but basic protection is still a good habit.",
      badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
      ring: "from-emerald-400 to-lime-300",
    };
  }
  if (uv <= 5) {
    return {
      level: "Moderate",
      message: "Be cautious outdoors and protect exposed skin if you're staying outside for longer.",
      badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ring: "from-yellow-400 to-amber-300",
    };
  }
  if (uv <= 7) {
    return {
      level: "High",
      message: "Warning: Your skin is at risk of UV damage. Use sunscreen, clothing protection, and shade.",
      badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
      ring: "from-orange-500 to-amber-400",
    };
  }
  return {
    level: "Extreme",
    message: "Warning: Your skin is at risk of UV damage. Limit direct sun exposure and use maximum protection.",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    ring: "from-rose-500 to-fuchsia-500",
  };
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function SunSmartUIMockup() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [uvIndex, setUvIndex] = useState(9);
  const [location, setLocation] = useState("Melbourne, VIC");
  const [latitude, setLatitude] = useState(-37.8136);
const [longitude, setLongitude] = useState(144.9631);
  const { uvIndex: realUV, loading: uvLoading } = useUVData(latitude, longitude);
  const displayUV = realUV ?? uvIndex;

  const [skinTone, setSkinTone] = useState(skinToneOptions[1]);
  const [email, setEmail] = useState("student@monash.edu");
  const [startTime, setStartTime] = useState("09:00");
  const [interval, setInterval] = useState("2 hours");
  const [intervalValue, setIntervalValue] = useState(2);
  const [intervalUnit, setIntervalUnit] = useState("hours");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const reminderRef = React.useRef(null);
  const alertedRef = React.useRef(false);

  const uvMeta = useMemo(() => getUvMeta(displayUV), [displayUV]);
  const clothingTips = clothingByRisk[uvMeta.level];
  const sunscreenTip = sunscreenByRisk[uvMeta.level];

  useEffect(() => {
    if (displayUV >= 3 && !alertedRef.current) {
      alertedRef.current = true;
      new Notification("⚠️ UV Alert - SunSmart", {
        body: `UV index is now ${displayUV} (${uvMeta.level}) in ${location}. Apply sunscreen before going outside!`,
      });
    }
  }, [displayUV]);

  const handleEnableReminder = async () => {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Please allow notifications to enable reminders.");
      return;
    }

    if (reminderRef.current) clearInterval(reminderRef.current);

    const unitMs = intervalUnit === "minutes" ? 60 * 1000 : intervalUnit === "hours" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const intervalMs = intervalValue * unitMs;

    const [hours, minutes] = startTime.split(":").map(Number);
    const firstReminder = new Date();
    firstReminder.setHours(hours, minutes, 0, 0);

    if (firstReminder < new Date()) {
      firstReminder.setDate(firstReminder.getDate() + 1);
    }

    const delayMs = firstReminder - new Date();

    setTimeout(() => {
      new Notification("☀️ SunSmart Reminder", {
        body: `UV is ${displayUV} (${uvMeta.level}) in ${location}. Time to reapply sunscreen!`,
      });

      reminderRef.current = setInterval(() => {
        new Notification("☀️ SunSmart Reminder", {
          body: `UV is ${displayUV} (${uvMeta.level}) in ${location}. Time to reapply sunscreen!`,
        });
      }, intervalMs);
    }, delayMs);

    setReminderEnabled(true);
    alert(`Reminder set! First notification at ${startTime}, then every ${intervalValue} ${intervalUnit}.`);
  };

  const handleDisableReminder = () => {
    if (reminderRef.current) {
      clearInterval(reminderRef.current);
      reminderRef.current = null;
    }
    setReminderEnabled(false);
    alert("Reminder disabled.");
  };

  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support GPS.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const geoData = await geoRes.json();
          const suburb = geoData.address.suburb || geoData.address.city || geoData.address.town || geoData.address.state;
          const state = geoData.address.state_code || geoData.address.state;
          setLocation(`${suburb}, ${state}`);
        } catch {
          setLocation(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
        }
        setGpsLoading(false);
      },
      (error) => {
        alert("Could not get your location. Please allow location access.");
        setGpsLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eff6ff_0%,#f8fafc_38%,#eefdf6_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <Sun className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">SunSmart</h1>
                  <Badge variant="outline" className="rounded-full border-slate-200 bg-white/80">
                    UV Awareness
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">
                  A calm, mobile-first dashboard for UV alerts, awareness, and daily protection planning.
                </p>
              </div>
            </div>

            <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              {[
                ["dashboard", "Dashboard"],
                ["awareness", "Awareness"],
                ["skin", "Skin Tone"],
                ["planner", "Protection Planner"],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  variant={selectedTab === value ? "default" : "outline"}
                  className={`rounded-full ${selectedTab === value ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white/80"}`}
                  onClick={() => setSelectedTab(value)}
                >
                  {label}
                </Button>
              ))}
            </nav>
          </div>
        </motion.header>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="overflow-hidden rounded-[28px] border-white/60 bg-white/75 shadow-sm backdrop-blur">
              <CardContent className="p-0">
                <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="p-6 sm:p-8">
                    <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      Live localised alert
                    </div>
                    <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                      Real-time UV guidance that feels simple, clear, and actually useful.
                    </h2>
                    <p className="mt-4 max-w-2xl text-slate-600">
                      The landing experience is built around the core story requirement: current location, current UV index,
                      risk messaging, and immediate protection suggestions in one glance.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <StatPill icon={MapPin} label="Location" value={location} />
                      <StatPill icon={TriangleAlert} label="Risk level" value={uvMeta.level} />
                      <StatPill icon={Bell} label="Reminder mode" value="Email / Push ready" />
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center bg-slate-950 p-6 text-white sm:p-8">
                    <div className={`absolute inset-0 bg-gradient-to-br ${uvMeta.ring} opacity-85`} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.24),transparent_35%)]" />
                    <div className="relative w-full rounded-[28px] border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm text-white/80">Current UV Index</span>
                        <CloudSun className="h-5 w-5 text-white/90" />
                      </div>
                      <div className="flex items-end gap-3">
                        <span className="text-7xl font-bold leading-none">{displayUV}</span>
                        <Badge className="mb-2 rounded-full border-0 bg-white/15 px-3 py-1 text-white shadow-none">
                          {uvMeta.level}
                        </Badge>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-white/90">{uvMeta.message}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full rounded-[28px] border-white/60 bg-white/75 shadow-sm backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5" /> Quick controls
                </CardTitle>
                <CardDescription>Use these inputs to demo the UI and test connected features later.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Demo location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl bg-white" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>UV index</Label>
                    <span className="text-sm text-slate-500">1–11+</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={11}
                    value={uvIndex}
                    onChange={(e) => setUvIndex(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                <Button className="rounded-xl bg-slate-900 hover:bg-slate-800" onClick={handleGetGPS}>
  <MapPin className="mr-2 h-4 w-4" /> {gpsLoading ? "Getting location..." : "Use current GPS"}
</Button>
                  <Button variant="outline" className="rounded-xl bg-white/70">
                    <Share2 className="mr-2 h-4 w-4" /> Share alert
                  </Button>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                  This design keeps the primary alert above the fold, then uses modular sections for awareness, skin tone,
                  sunscreen, clothing, and reminder tasks.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="hidden" />

          <TabsContent value="dashboard" className="mt-0 space-y-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <Card className="rounded-[28px] border-white/60 bg-white/75 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TriangleAlert className="h-5 w-5" /> UV alert and response
                  </CardTitle>
                  <CardDescription>
                    Supports the acceptance criteria for colour-coded UV alerts, warning text, and suggested measures.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div>
                      <p className="text-sm text-slate-500">Current status</p>
                      <p className="mt-1 text-xl font-semibold">{uvMeta.level} UV exposure risk</p>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{uvMeta.message}</p>
                    </div>
                    <Badge className={`rounded-full border ${uvMeta.badgeClass}`}>{uvMeta.level}</Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Droplets className="h-4 w-4" /> Sunscreen quantity
                      </div>
                      <p className="text-sm leading-6 text-slate-600">{sunscreenTip}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Shirt className="h-4 w-4" /> Clothing suggestion
                      </div>
                      <ul className="space-y-2 text-sm text-slate-600">
                        {clothingTips.map((tip) => (
                          <li key={tip} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-slate-400" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-white/60 bg-white/75 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" /> Sunscreen reminder
                  </CardTitle>
                  <CardDescription>
                    Designed as a clean settings card so your teammate can connect email, SMS, or push logic later.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Initial application time</Label>
                      <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Reminder interval</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={intervalValue}
                          onChange={(e) => setIntervalValue(e.target.value)}
                          className="rounded-xl w-24"
                          placeholder="e.g. 2"
                        />
                        <select
                          value={intervalUnit}
                          onChange={(e) => setIntervalUnit(e.target.value)}
                          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email destination</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="rounded-xl bg-slate-900 hover:bg-slate-800"
                      onClick={reminderEnabled ? handleDisableReminder : handleEnableReminder}
                    >
                      {reminderEnabled ? "Reminder On ✓ (click to disable)" : "Enable reminder"}
                    </Button>
                    <Button variant="outline" className="rounded-xl bg-white">Preview notification</Button>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    Next reminder preview: <span className="font-medium text-slate-900">{startTime}</span> → every <span className="font-medium text-slate-900">{intervalValue} {intervalUnit}</span>.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="awareness" className="mt-0 space-y-6">
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-[28px] border-white/60 bg-white/75 shadow-sm">
                <CardHeader>
                  <CardTitle>Australia UV trends</CardTitle>
                  <CardDescription>
                    Interactive chart space for Epic 2: awareness visuals with hover-friendly explanations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px] w-full text-slate-700">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={uvTrendData}>
                        <defs>
                          <linearGradient id="uvFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="currentColor" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="currentColor" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} domain={[0, 12]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="uv" stroke="currentColor" fill="url(#uvFill)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    The chart area gives your team a polished placeholder for local or national UV data while already meeting the visual interaction expectation in the acceptance criteria.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-white/60 bg-white/75 shadow-sm">
                <CardHeader>
                  <CardTitle>Risk awareness snapshot</CardTitle>
                  <CardDescription>Simple, social-friendly graphics are easier to understand and easier to share.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px] w-full text-slate-700">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button className="rounded-xl bg-slate-900 hover:bg-slate-800">
                      <Share2 className="mr-2 h-4 w-4" /> Share visual
                    </Button>
                    <Button variant="outline" className="rounded-xl bg-white">
                      <ChevronRight className="mr-2 h-4 w-4" /> View explanation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[28px] border-white/60 bg-white/75 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" /> Know your facts
                </CardTitle>
                <CardDescription>
                  Built as expandable cards instead of dense paragraphs so the page feels more modern and easier to scan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="grid gap-3">
                  {mythFacts.map((item, index) => (
                    <AccordionItem
                      key={item.title}
                      value={`item-${index}`}
                      className="rounded-2xl border border-slate-100 px-4 data-[state=open]:bg-slate-50"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <Badge className={`rounded-full ${item.type === "Fact" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                            {item.type}
                          </Badge>
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-6 text-slate-600">{item.content}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skin" className="mt-0 space-y-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
              <Card className="rounded-[28px] border-white/60 bg-white/75 shadow-sm">
                <CardHeader>
                  <CardTitle>Skin tone and UV sensitivity</CardTitle>
                  <CardDescription>
                    Uses tile selection to match your acceptance criteria while keeping the interface friendly and visually current.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {skinToneOptions.map((option) => {
                      const active = skinTone.id === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSkinTone(option)}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            active
                              ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="mb-3 flex items-center gap-3">
                            <span
                              className="h-8 w-8 rounded-full border border-black/10"
                              style={{ backgroundColor: option.swatch }}
                            />
                            <div>
                              <p className="font-semibold">{option.name}</p>
                              <p className={`text-xs ${active ? "text-white/70" : "text-slate-500"}`}>{option.description}</p>
                            </div>
                          </div>
                          <p className={`text-sm leading-6 ${active ? "text-white/85" : "text-slate-600"}`}>{option.sensitivity}</p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-white/60 bg-white/75 shadow-sm">
                <CardHeader>
                  <CardTitle>Selected protection guidance</CardTitle>
                  <CardDescription>Clear recommendation text makes this page educational without feeling heavy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="h-10 w-10 rounded-full border border-black/10" style={{ backgroundColor: skinTone.swatch }} />
                      <div>
                        <p className="text-lg font-semibold">{skinTone.name}</p>
                        <p className="text-sm text-slate-500">{skinTone.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full bg-white">
                      {skinTone.sensitivity}
                    </Badge>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{skinTone.advice}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Shield className="h-4 w-4" /> Protection goal
                      </div>
                      <p className="text-sm leading-6 text-slate-600">Choose advice that feels inclusive and avoids implying only one skin type needs protection.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Sun className="h-4 w-4" /> UX note
                      </div>
                      <p className="text-sm leading-6 text-slate-600">Tiles are faster to scan than dropdowns and look more polished on both desktop and mobile.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="planner" className="mt-0 space-y-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <Card className="rounded-[28px] border-white/60 bg-white/75 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shirt className="h-5 w-5" /> Clothing recommendation planner
                  </CardTitle>
                  <CardDescription>
                    This section turns UV risk into action-oriented clothing suggestions with a cleaner card-based layout.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Recommended for today</p>
                        <p className="text-xl font-semibold">{uvMeta.level} UV outfit guidance</p>
                      </div>
                      <Badge className={`rounded-full border ${uvMeta.badgeClass}`}>{uvMeta.level}</Badge>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                      {clothingTips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-slate-400" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { title: "Head", text: "Hat or cap for direct sun" },
                      { title: "Eyes", text: "Sunglasses for bright exposure" },
                      { title: "Body", text: "Breathable long-sleeve protection" },
                    ].map((item) => (
                      <div key={item.title} className="rounded-2xl border border-slate-100 p-4">
                        <p className="font-medium">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-white/60 bg-white/75 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" /> Share awareness content
                  </CardTitle>
                  <CardDescription>
                    Kept intentionally simple so the team can implement a practical share flow without overengineering the prototype.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-3xl bg-slate-950 p-5 text-white">
                    <p className="text-sm text-white/70">Preview caption</p>
                    <p className="mt-3 text-lg font-semibold">Today's UV in {location} is {displayUV} ({uvMeta.level}). Protect your skin and remind your friends to stay sun smart.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button className="rounded-xl bg-slate-900 hover:bg-slate-800">Share to Instagram</Button>
                    <Button variant="outline" className="rounded-xl bg-white">Copy share text</Button>
                    <Button variant="outline" className="rounded-xl bg-white">Download awareness card</Button>
                    <Button variant="outline" className="rounded-xl bg-white">Open social preview</Button>
                  </div>

                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm leading-6 text-slate-600">
                    For the prototype, a share button and preview card are enough. Later, your teammate can connect actual platform logic or a simple native share workflow.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <footer className="mt-8 rounded-[28px] border border-white/70 bg-white/70 p-5 text-sm text-slate-500 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>Designed for your SunSmart UV awareness prototype with a stronger mainstream UI/UX direction.</p>
            <p>React + shadcn/ui + Framer Motion + Recharts</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
