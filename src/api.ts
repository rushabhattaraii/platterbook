export type OrderLine = { dish: string; quantity: number };
export type Order = { id: number; customer: string; eventDate: string; lines: OrderLine[]; receivedAt: string; note?: string };
export type NewOrder = Omit<Order, "id" | "receivedAt" | "note">;

export async function getMenu(): Promise<string[]> {
  const res = await fetch("/api/menu");
  return res.json();
}

export async function getOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders");
  return res.json();
}

export async function sendOrder(order: NewOrder): Promise<Order> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  return res.json();
}

export async function checkAvailability(date: string): Promise<{ date: string; freeSlots: number }> {
  const res = await fetch(`/api/availability?date=${encodeURIComponent(date)}`);
  return res.json();
}

export async function saveNote(orderId: number, note: string): Promise<Order> {
  const res = await fetch(`/api/orders/${orderId}/note`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  return res.json();
}
