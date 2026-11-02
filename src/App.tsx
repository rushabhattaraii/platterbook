import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import OrderForm from "./orders/OrderForm";
import KitchenPage from "./kitchen/KitchenPage";

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">PlatterBook</span>
        <NavLink to="/orders/new">New order</NavLink>
        <NavLink to="/kitchen">Kitchen</NavLink>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/orders/new" replace />} />
        <Route path="/orders/new" element={<OrderForm />} />
        <Route path="/kitchen" element={<KitchenPage />} />
      </Routes>
    </div>
  );
}
