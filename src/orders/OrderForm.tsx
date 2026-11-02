import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { checkAvailability, getMenu, sendOrder } from "../api";
import Button from "../components/Button";

type DishRow = { key: number; dish: string; quantity: string };

let nextKey = 1;
const emptyRow = (): DishRow => ({ key: nextKey++, dish: "", quantity: "" });

export default function OrderForm() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<string[]>([]);
  const [customer, setCustomer] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [rows, setRows] = useState<DishRow[]>([emptyRow()]);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState("");

  useEffect(() => {
    getMenu().then(setMenu);
  }, []);

  function updateRow(key: number, change: Partial<DishRow>) {
    setRows((current) => current.map((r) => (r.key === key ? { ...r, ...change } : r)));
  }

  async function showAvailability() {
    if (!eventDate) return;
    const result = await checkAvailability(eventDate);
    setAvailability(`${result.freeSlots} kitchen ${result.freeSlots === 1 ? "slot" : "slots"} free on ${result.date}`);
  }

  function addDish() {
    setRows((current) => [...current, emptyRow()]);
  }

  function removeDish(key: number) {
    setRows((current) => (current.length > 1 ? current.filter((r) => r.key !== key) : current));
  }

  async function placeOrder(e: FormEvent) {
    e.preventDefault();
    // Rows where no dish was chosen are left out of the order.
    const lines = rows
      .filter((r) => r.dish !== "")
      .map((r) => ({ dish: r.dish, quantity: Number(r.quantity) || 1 }));
    if (!customer || !eventDate || lines.length === 0) {
      setError("Please add the customer, the event date and at least one dish.");
      return;
    }
    await sendOrder({ customer, eventDate, lines });
    navigate("/kitchen");
  }

  return (
    <main>
      <h1>New catering order</h1>
      <form onSubmit={placeOrder}>
        <label>
          Customer or event
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} />
        </label>
        <label>
          Event date
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </label>
        <div className="availability">
          <Button onClick={showAvailability}>Check kitchen availability</Button>
          {availability && <span>{availability}</span>}
        </div>

        <div className="dishes-header">
          <h2>Dishes</h2>
          <Button onClick={addDish}>+ Add another dish</Button>
        </div>

        {rows.map((row) => (
          <div className="dish-row" key={row.key}>
            <select value={row.dish} onChange={(e) => updateRow(row.key, { dish: e.target.value })}>
              <option value="">Choose a dish…</option>
              {menu.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={row.quantity}
              onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
            />
            <Button type="button" variant="link" onClick={() => removeDish(row.key)}>
              Remove
            </Button>
          </div>
        ))}

        {error && <p className="error">{error}</p>}
        <Button variant="primary">Place order</Button>
      </form>
    </main>
  );
}
