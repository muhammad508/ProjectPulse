import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import { BCRYPT_COST, DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("hashes with the configured cost and verifies the right password only", async () => {
    const hash = await hashPassword("a-long-enough-password");

    expect(bcrypt.getRounds(hash)).toBe(BCRYPT_COST);
    expect(await verifyPassword("a-long-enough-password", hash)).toBe(true);
    expect(await verifyPassword("another-password", hash)).toBe(false);
  });

  it("uses a dummy hash with the same cost as real hashes, so unknown emails take as long to reject", () => {
    expect(bcrypt.getRounds(DUMMY_PASSWORD_HASH)).toBe(BCRYPT_COST);
  });

  it("never accepts a password for a missing account", async () => {
    expect(await verifyPassword("not-a-real-password", undefined)).toBe(false);
  });
});
