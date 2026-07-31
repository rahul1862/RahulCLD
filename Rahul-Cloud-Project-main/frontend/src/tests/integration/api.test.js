import { describe, test, expect, vi, beforeEach } from "vitest";
const mockHttp = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn(),
    },
    response: {
      use: vi.fn(),
    },
  },
}));
vi.mock("axios", () => ({
  default: {
    create: () => mockHttp,
  },
}));
const { userService, transactionService, authService, getToken, setToken } =
  await import("../../services/api");
describe("userService integration with axios", () => {
  beforeEach(() => {
    mockHttp.get.mockReset();
    mockHttp.post.mockReset();
    mockHttp.put.mockReset();
    mockHttp.delete.mockReset();
  });
  test("getAll requests /users and unwraps the response body", async () => {
    mockHttp.get.mockResolvedValue({
      data: [
        {
          _id: "1",
          name: "Alice Smith",
        },
      ],
    });
    const result = await userService.getAll();
    expect(mockHttp.get).toHaveBeenCalledWith("/users");
    expect(result).toEqual([
      {
        _id: "1",
        name: "Alice Smith",
      },
    ]);
  });
  test("create posts the payload to /user", async () => {
    mockHttp.post.mockResolvedValue({
      data: {
        _id: "2",
      },
    });
    const payload = {
      name: "Alice Smith",
      email: "alice@example.com",
      address: "123 Main Street",
    };
    const result = await userService.create(payload);
    expect(mockHttp.post).toHaveBeenCalledWith("/user", payload);
    expect(result).toEqual({
      _id: "2",
    });
  });
  test("update puts the payload to /update/user/:id", async () => {
    mockHttp.put.mockResolvedValue({
      data: {
        _id: "3",
        name: "Updated",
      },
    });
    await userService.update("3", {
      name: "Updated",
    });
    expect(mockHttp.put).toHaveBeenCalledWith("/update/user/3", {
      name: "Updated",
    });
  });
  test("remove issues a DELETE to /delete/user/:id", async () => {
    mockHttp.delete.mockResolvedValue({
      data: {
        message: "Deleted",
      },
    });
    await userService.remove("abc");
    expect(mockHttp.delete).toHaveBeenCalledWith("/delete/user/abc");
  });
  test("getById requests /user/:id", async () => {
    mockHttp.get.mockResolvedValue({
      data: {
        _id: "9",
      },
    });
    const result = await userService.getById("9");
    expect(mockHttp.get).toHaveBeenCalledWith("/user/9");
    expect(result).toEqual({
      _id: "9",
    });
  });
  test("stats requests /stats", async () => {
    mockHttp.get.mockResolvedValue({
      data: {
        total: 3,
      },
    });
    const result = await userService.stats();
    expect(mockHttp.get).toHaveBeenCalledWith("/stats");
    expect(result).toEqual({
      total: 3,
    });
  });
  test("search passes the query as a params object", async () => {
    mockHttp.get.mockResolvedValue({
      data: [],
    });
    await userService.search("alice");
    expect(mockHttp.get).toHaveBeenCalledWith("/search", {
      params: {
        q: "alice",
      },
    });
  });
  test("downloadPdf fetches a blob and triggers a client-side download", async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    URL.createObjectURL = vi.fn(() => "blob:pdf");
    URL.revokeObjectURL = vi.fn();
    mockHttp.get.mockResolvedValue({
      data: new Blob(["%PDF-"]),
    });
    await userService.downloadPdf("5", "alice.pdf");
    expect(mockHttp.get).toHaveBeenCalledWith("/user/5/pdf", {
      responseType: "blob",
    });
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pdf");
    clickSpy.mockRestore();
  });
});
describe("transactionService integration with axios", () => {
  beforeEach(() => {
    mockHttp.get.mockReset();
    mockHttp.post.mockReset();
    mockHttp.put.mockReset();
    mockHttp.delete.mockReset();
  });
  test("getAll requests /transactions", async () => {
    mockHttp.get.mockResolvedValue({
      data: [
        {
          _id: "t1",
        },
      ],
    });
    const result = await transactionService.getAll();
    expect(mockHttp.get).toHaveBeenCalledWith("/transactions");
    expect(result).toEqual([
      {
        _id: "t1",
      },
    ]);
  });
  test("getById requests /transaction/:id", async () => {
    mockHttp.get.mockResolvedValue({
      data: {
        _id: "t2",
      },
    });
    await transactionService.getById("t2");
    expect(mockHttp.get).toHaveBeenCalledWith("/transaction/t2");
  });
  test("create posts to /transaction", async () => {
    mockHttp.post.mockResolvedValue({
      data: {
        _id: "t3",
      },
    });
    const payload = {
      type: "income",
      category: "Fees",
      amount: 100,
      date: "2026-01-01",
    };
    await transactionService.create(payload);
    expect(mockHttp.post).toHaveBeenCalledWith("/transaction", payload);
  });
  test("update puts to /update/transaction/:id", async () => {
    mockHttp.put.mockResolvedValue({
      data: {
        _id: "t4",
      },
    });
    await transactionService.update("t4", {
      amount: 250,
    });
    expect(mockHttp.put).toHaveBeenCalledWith("/update/transaction/t4", {
      amount: 250,
    });
  });
  test("remove issues a DELETE to /delete/transaction/:id", async () => {
    mockHttp.delete.mockResolvedValue({
      data: {
        message: "Deleted",
      },
    });
    await transactionService.remove("t5");
    expect(mockHttp.delete).toHaveBeenCalledWith("/delete/transaction/t5");
  });
  test("pnl requests /pnl", async () => {
    mockHttp.get.mockResolvedValue({
      data: {
        netProfit: 10,
      },
    });
    const result = await transactionService.pnl();
    expect(mockHttp.get).toHaveBeenCalledWith("/pnl");
    expect(result).toEqual({
      netProfit: 10,
    });
  });
});
describe("authService", () => {
  test("login posts credentials to /auth/login and unwraps the token payload", async () => {
    mockHttp.post.mockResolvedValue({
      data: {
        token: "jwt-123",
        user: {
          email: "a@b.co",
        },
      },
    });
    const result = await authService.login("a@b.co", "secret");
    expect(mockHttp.post).toHaveBeenCalledWith("/auth/login", {
      email: "a@b.co",
      password: "secret",
    });
    expect(result).toEqual({
      token: "jwt-123",
      user: {
        email: "a@b.co",
      },
    });
  });
  test("me requests /auth/me", async () => {
    mockHttp.get.mockResolvedValue({
      data: {
        user: {
          email: "a@b.co",
        },
      },
    });
    const result = await authService.me();
    expect(mockHttp.get).toHaveBeenCalledWith("/auth/me");
    expect(result).toEqual({
      user: {
        email: "a@b.co",
      },
    });
  });
  test("register posts credentials to /auth/register and unwraps the token payload", async () => {
    mockHttp.post.mockResolvedValue({
      data: {
        token: "jwt-456",
        user: {
          email: "new@b.co",
          role: "user",
        },
      },
    });
    const result = await authService.register("new@b.co", "password123");
    expect(mockHttp.post).toHaveBeenCalledWith("/auth/register", {
      email: "new@b.co",
      password: "password123",
    });
    expect(result).toEqual({
      token: "jwt-456",
      user: {
        email: "new@b.co",
        role: "user",
      },
    });
  });
});
describe("token persistence helpers", () => {
  test("the success response interceptor returns the response unchanged", () => {
    const successHandler = mockHttp.interceptors.response.use.mock.calls[0][0];
    const res = {
      data: 42,
    };
    expect(successHandler(res)).toBe(res);
  });
  test("setToken stores a token and clears it when null", () => {
    setToken("abc");
    expect(localStorage.getItem("userhub_token")).toBe("abc");
    setToken(null);
    expect(localStorage.getItem("userhub_token")).toBeNull();
  });
  test("getToken returns null when storage access throws", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    expect(getToken()).toBeNull();
    spy.mockRestore();
  });
});
describe("request interceptor attaches the bearer token", () => {
  const requestHandler = () => mockHttp.interceptors.request.use.mock.calls[0][0];
  test("adds an Authorization header when a token is stored", () => {
    localStorage.setItem("userhub_token", "jwt-xyz");
    const config = requestHandler()({
      headers: {},
    });
    expect(config.headers.Authorization).toBe("Bearer jwt-xyz");
    localStorage.removeItem("userhub_token");
  });
  test("leaves the header unset when there is no token", () => {
    localStorage.removeItem("userhub_token");
    const config = requestHandler()({
      headers: {},
    });
    expect(config.headers.Authorization).toBeUndefined();
  });
});
describe("response error interceptor", () => {
  const rejectHandler = () => mockHttp.interceptors.response.use.mock.calls[0][1];
  test("maps a server error response to an Error carrying the API message", async () => {
    await expect(
      rejectHandler()({
        response: {
          data: {
            message: "Email already in use",
          },
        },
      })
    ).rejects.toThrow("Email already in use");
  });
  test("falls back to the raw error message when the response has no API message", async () => {
    await expect(rejectHandler()(new Error("Network Error"))).rejects.toThrow("Network Error");
  });
  test("a 401 clears the stored token and emits an auth:unauthorized event", async () => {
    localStorage.setItem("userhub_token", "expired");
    const spy = vi.fn();
    window.addEventListener("auth:unauthorized", spy);
    await expect(
      rejectHandler()({
        response: {
          status: 401,
          data: {},
        },
      })
    ).rejects.toThrow();
    expect(localStorage.getItem("userhub_token")).toBeNull();
    expect(spy).toHaveBeenCalled();
    window.removeEventListener("auth:unauthorized", spy);
  });
});
