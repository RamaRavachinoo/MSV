// Edge Function: send-daily-alerts
//
// Disparada por un Schedule Trigger de n8n (HTTP POST con header x-webhook-secret).
// Revisa exámenes, eventos de calendario y cuentas fijas próximas a vencer, y manda
// una notificación push nativa a cada dispositivo suscripto — una sola vez por alerta
// (deduplicado en notification_log).
//
// Secrets a configurar en Supabase (Dashboard → Edge Functions → send-daily-alerts → Secrets):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, N8N_WEBHOOK_SECRET
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya vienen inyectados automáticamente por Supabase.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("N8N_WEBHOOK_SECRET")!;

const ALERT_WINDOW_DAYS = 7;

webpush.setVapidDetails("mailto:ramaravachino00@gmail.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

type Alert = { key: string; title: string; body: string; url: string };

function daysUntil(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

// Mirrors the recurrence logic in src/components/dashboard/TodayWidget.jsx
function nextOccurrence(event: { event_date: string; recurrence: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eDate = new Date(event.event_date);
  if (event.recurrence === "yearly") {
    const next = new Date(today.getFullYear(), eDate.getMonth(), eDate.getDate());
    if (next < today) next.setFullYear(next.getFullYear() + 1);
    return next;
  }
  if (event.recurrence === "monthly") {
    const next = new Date(today.getFullYear(), today.getMonth(), eDate.getDate());
    if (next < today) next.setMonth(next.getMonth() + 1);
    return next;
  }
  return eDate;
}

// Mirrors src/lib/bills.js
function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function dueDateThisMonth(dueDay: number) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const clamped = Math.min(dueDay, daysInMonth);
  return new Date(now.getFullYear(), now.getMonth(), clamped);
}

const daysLabel = (d: number) => (d === 0 ? "hoy" : d === 1 ? "en 1 día" : `en ${d} días`);

async function collectAlerts(): Promise<Alert[]> {
  const today = new Date().toISOString().split("T")[0];
  const alerts: Alert[] = [];

  const { data: exams } = await supabase.from("career_grades").select("*").gte("eval_date", today);
  for (const exam of exams || []) {
    const d = daysUntil(new Date(exam.eval_date));
    if (d >= 0 && d <= ALERT_WINDOW_DAYS) {
      alerts.push({
        key: `exam:${exam.id}`,
        title: "📚 Examen próximo",
        body: `${exam.eval_name} ${daysLabel(d)}`,
        url: "/carrera",
      });
    }
  }

  const { data: events } = await supabase.from("events").select("*");
  for (const event of events || []) {
    const next = nextOccurrence(event);
    const d = daysUntil(next);
    if (d >= 0 && d <= ALERT_WINDOW_DAYS) {
      alerts.push({
        key: `event:${event.id}:${next.toISOString().split("T")[0]}`,
        title: "📅 Fecha importante",
        body: `${event.title} ${daysLabel(d)}`,
        url: "/calendar",
      });
    }
  }

  const period = currentPeriod();
  const { data: bills } = await supabase.from("home_bills").select("*").eq("is_active", true);
  const { data: payments } = await supabase.from("home_bill_payments").select("bill_id").eq("period", period);
  const paidIds = new Set((payments || []).map((p: { bill_id: number }) => p.bill_id));
  for (const bill of bills || []) {
    if (paidIds.has(bill.id)) continue;
    const d = daysUntil(dueDateThisMonth(bill.due_day));
    if (d <= ALERT_WINDOW_DAYS) {
      const label = d < 0 ? `vencida hace ${Math.abs(d)} día(s)` : d === 0 ? "vence hoy" : `vence ${daysLabel(d)}`;
      alerts.push({
        key: `bill:${bill.id}:${period}`,
        title: "💸 Cuenta por vencer",
        body: `${bill.title} ${label}`,
        url: "/expenses",
      });
    }
  }

  return alerts;
}

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const alerts = await collectAlerts();
  if (alerts.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: "no alerts" }), { status: 200 });
  }

  const { data: alreadySent } = await supabase
    .from("notification_log")
    .select("alert_key")
    .in("alert_key", alerts.map((a) => a.key));
  const sentSet = new Set((alreadySent || []).map((r: { alert_key: string }) => r.alert_key));
  const newAlerts = alerts.filter((a) => !sentSet.has(a.key));

  if (newAlerts.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: "already notified" }), { status: 200 });
  }

  const { data: subscriptions } = await supabase.from("push_subscriptions").select("*");

  let sentCount = 0;
  for (const alert of newAlerts) {
    let deliveredToAny = false;
    for (const sub of subscriptions || []) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({ title: alert.title, body: alert.body, url: alert.url })
        );
        deliveredToAny = true;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        console.error(`Push failed for ${sub.endpoint}:`, err);
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }
    if (deliveredToAny) {
      await supabase.from("notification_log").insert({ alert_key: alert.key });
      sentCount++;
    }
  }

  return new Response(JSON.stringify({ sent: sentCount, total: newAlerts.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
