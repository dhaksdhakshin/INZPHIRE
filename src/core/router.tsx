import { createBrowserRouter, Navigate } from "react-router-dom";

import AppShell from "../components/dashboard/AppShell";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import HomePage from "./pages/HomePage";
import MyPresentationsPage from "./pages/MyPresentationsPage";
import NewInzphirePage from "./pages/NewInzphirePage";
import ParticipantPage from "./pages/ParticipantPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import StartWithAiPage from "./pages/StartWithAiPage";
import SharedWithMePage from "./pages/SharedWithMePage";
import TemplatesPage from "./pages/TemplatesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/app/home" replace />,
  },
  {
    path: "/app/new",
    element: <NewInzphirePage />,
  },
  {
    path: "/join",
    element: <ParticipantPage />,
  },
    {
      path: "/join/:code",
      element: <ParticipantPage />,
    },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "account-settings",
        element: <AccountSettingsPage />,
      },
      {
        path: "my-presentations",
        element: <MyPresentationsPage />,
      },
      {
        path: "start-with-ai",
        element: <StartWithAiPage />,
      },
      {
        path: "shared-with-me",
        element: <SharedWithMePage />,
      },
      {
        path: "workspace-presentations",
        element: <PlaceholderPage pageId="workspace-presentations" />,
      },
      {
        path: "shared-templates",
        element: <PlaceholderPage pageId="shared-templates" />,
      },
      {
        path: "templates",
        element: <TemplatesPage />,
      },
      {
        path: "integrations",
        element: <PlaceholderPage pageId="integrations" />,
      },
      {
        path: "academy",
        element: <PlaceholderPage pageId="academy" />,
      },
      {
        path: "help",
        element: <PlaceholderPage pageId="help" />,
      },
      {
        path: "trash",
        element: <PlaceholderPage pageId="trash" />,
      },
    ],
  },
]);
