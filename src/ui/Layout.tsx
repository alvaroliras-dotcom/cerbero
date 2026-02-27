import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <Outlet />
    </div>
  );
}