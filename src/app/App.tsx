import { RouterProvider } from "react-router-dom";

import { DashboardProvider } from "./dashboard-context";
import { router } from "./router";

export default function App() {
  return (
    <DashboardProvider>
      <RouterProvider router={router} />
    </DashboardProvider>
  );
}
