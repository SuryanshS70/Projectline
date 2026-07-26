import { QueryClient } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  type AnyRouter,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

async function renderRoute(path: string): Promise<AnyRouter> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}

describe("application route smoke tests", () => {
  it("renders the application from the root route", async () => {
    await renderRoute("/");

    expect(await screen.findByRole("heading", { name: "Sign in to Projectline" })).toBeTruthy();
  });

  it("renders the login route", async () => {
    await renderRoute("/login");

    expect(await screen.findByRole("heading", { name: "Sign in to Projectline" })).toBeTruthy();
  });

  it("renders the not-found page for an unknown route", async () => {
    await renderRoute("/this-route-does-not-exist");

    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeTruthy();
  });
});
