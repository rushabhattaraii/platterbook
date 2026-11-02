// Small in-memory API for local development. Data resets when the dev server restarts.
import type { IncomingMessage, ServerResponse } from "node:http";

type OrderLine = { dish: string; quantity: number };
type Order = { id: number; customer: string; eventDate: string; lines: OrderLine[]; receivedAt: string; note?: string };

const menu = [
  "Mini falafel wraps",
  "Caprese skewers",
  "Chicken satay",
  "Vegetable samosas",
  "Smoked salmon blinis",
  "Lemon tartlets",
];

let nextId = 101;
const orders: Order[] = [
  {
    id: nextId++,
    customer: "Harbour Room wedding",
    eventDate: "2026-11-14",
    lines: [
      { dish: "Caprese skewers", quantity: 80 },
      { dish: "Lemon tartlets", quantity: 60 },
    ],
    receivedAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
];

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

export async function ordersApi(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (!url.pathname.startsWith("/api/")) return next();

  if (req.method === "GET" && url.pathname === "/api/menu") return send(res, 200, menu);
  if (req.method === "GET" && url.pathname === "/api/availability") {
    const date = url.searchParams.get("date") ?? "";
    const booked = orders.filter((o) => o.eventDate === date).length;
    return send(res, 200, { date, freeSlots: Math.max(0, 3 - booked) });
  }
  const noteMatch = url.pathname.match(/^\/api\/orders\/(\d+)\/note$/);
  if (noteMatch && req.method === "POST") {
    const order = orders.find((o) => o.id === Number(noteMatch[1]));
    if (!order) return send(res, 404, { error: "order not found" });
    order.note = (JSON.parse(await readBody(req)) as { note: string }).note;
    return send(res, 200, order);
  }
  if (url.pathname === "/api/orders") {
    if (req.method === "GET") return send(res, 200, [...orders].reverse());
    if (req.method === "POST") {
      const body = JSON.parse(await readBody(req)) as Omit<Order, "id" | "receivedAt">;
      const order = { ...body, id: nextId++, receivedAt: new Date().toISOString() };
      orders.push(order);
      return send(res, 201, order);
    }
  }
  send(res, 404, { error: "not found" });
}
