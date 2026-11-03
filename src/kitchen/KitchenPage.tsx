import { useEffect, useState, type FormEvent } from "react";
import { getOrders, saveNote, type Order } from "../api";
import Button from "../components/Button";

function NoteForm({ order, onSaved }: { order: Order; onSaved: (o: Order) => void }) {
  const [note, setNote] = useState(order.note ?? "");

  async function submitNote(e: FormEvent) {
    e.preventDefault();
    onSaved(await saveNote(order.id, note));
  }

  return (
    <form className="note-form" onSubmit={submitNote}>
      <input placeholder="Kitchen note" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button type="submit">Save note</Button>
    </form>
  );
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  function replaceOrder(saved: Order) {
    setOrders((current) => current.map((o) => (o.id === saved.id ? saved : o)));
  }

  return (
    <main>
      <h1>Kitchen: received orders ({orders.length})</h1>
      {orders.map((o) => (
        <section className="order" key={o.id}>
          <h2>#{o.id} · {o.customer || <em>no customer</em>} · {o.eventDate || <em>no date</em>}</h2>
          <ul>
            {o.lines.map((l, i) => (
              <li key={i} className={l.dish ? "" : "missing"}>
                {l.dish ? `${l.quantity} × ${l.dish}` : "(empty dish line)"}
              </li>
            ))}
          </ul>
          {o.note && <p className="note">Note: {o.note}</p>}
          <NoteForm order={o} onSaved={replaceOrder} />
        </section>
      ))}
    </main>
  );
}
