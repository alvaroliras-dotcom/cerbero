import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../ui/Layout";
import { RequireAuth } from "../ui/RequireAuth";
import { LoginPage } from "../pages/LoginPage";
import { WorkerPage } from "../pages/WorkerPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      {
        path: "/worker",
        element: (
          <RequireAuth>
            <WorkerPage />
          </RequireAuth>
        ),
      },
      { path: "*", element: <LoginPage /> },
    ],
  },
]);