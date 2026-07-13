import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: () => <Outlet />,
  head: () => ({
    meta: [
      { title: "Admin — HalloweenTools" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
