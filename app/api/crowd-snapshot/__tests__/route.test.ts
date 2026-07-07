/**
 * @jest-environment node
 */
import { GET } from "../route";

describe("GET /api/crowd-snapshot", () => {
  it("returns status 200 and simulated crowd levels", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("levels");
    expect(typeof body.levels).toBe("object");
  });
});
