import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

function mockJsonResponse(data, options = {}) {
  return Promise.resolve({
    ok: options.ok ?? true,
    headers: {
      get: () => "application/json",
    },
    json: async () => data,
  });
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, "", "/");
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test("renders scholarship data from the public API on the home page", async () => {
  fetch.mockImplementation(() =>
    mockJsonResponse([
      {
        id: "scholarship-1",
        title: "Merit Future Scholarship",
        provider: "National Education Trust",
        category: "Merit",
        amount: 50000,
        deadline: "2026-08-01",
        location: "Pan India",
        seats: 120,
      },
    ])
  );

  render(<App />);

  expect(
    screen.getByRole("heading", {
      name: /search, apply, upload, review, and approve from one place/i,
    })
  ).toBeInTheDocument();

  expect(await screen.findByText(/merit future scholarship/i)).toBeInTheDocument();
});

test("redirects unauthenticated users from the dashboard to login", async () => {
  window.history.pushState({}, "", "/dashboard");
  render(<App />);

  expect(
    await screen.findByRole("heading", { name: /sign in/i })
  ).toBeInTheDocument();
});

test("logs in and loads the student dashboard", async () => {
  window.history.pushState({}, "", "/login");

  fetch
    .mockImplementationOnce(() =>
      mockJsonResponse({
        token: "token-123",
        user: {
          id: "user-1",
          name: "Vikas",
          email: "vikas@example.com",
          role: "USER",
          course: "B.Tech",
          phoneNumber: "9999999999",
          city: "Delhi",
          state: "Delhi",
          profileComplete: true,
          emailVerified: true,
        },
      })
    )
    .mockImplementationOnce(() =>
      mockJsonResponse({
        summary: {
          totalScholarships: 4,
          applications: 1,
          underReview: 1,
          approved: 0,
          documents: 2,
        },
        profile: {
          id: "user-1",
          name: "Vikas",
          email: "vikas@example.com",
          role: "USER",
          course: "B.Tech",
          phoneNumber: "9999999999",
          city: "Delhi",
          state: "Delhi",
          profileComplete: true,
          emailVerified: true,
        },
        recentActivities: [
          {
            id: "activity-1",
            message: "Application submitted for Merit Future Scholarship.",
            createdAt: "2026-04-22T10:00:00.000Z",
          },
        ],
        featuredScholarships: [
          {
            id: "scholarship-1",
            title: "Merit Future Scholarship",
            provider: "National Education Trust",
            description: "Scholarship description",
            category: "Merit",
            amount: 50000,
            deadline: "2026-08-01",
          },
        ],
      })
    );

  render(<App />);

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "vikas@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/^password$/i, { selector: "input" }), {
    target: { value: "secure123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /open workspace/i }));

  expect(await screen.findByText(/welcome back, vikas/i)).toBeInTheDocument();
  await waitFor(() => {
    expect(
      screen.getByRole("heading", { name: /recommended opportunities/i })
    ).toBeInTheDocument();
  });
});
