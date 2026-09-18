import { describe, expect, it } from "vitest";

import {
  getProfileInitials,
  validateProfileAvatarFile,
} from "./profile-avatar";

function imageFile(
  bytes: number[],
  type: string,
  name = "avatar.png",
) {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("getProfileInitials", () => {
  it("ignores professional titles and uses the first and last name", () => {
    expect(getProfileInitials("Dra. Valentina Rossi")).toBe("VR");
    expect(getProfileInitials("Dr Juan Carlos Pérez")).toBe("JP");
  });

  it("adapts to single names and empty values", () => {
    expect(getProfileInitials("  Ana  ")).toBe("A");
    expect(getProfileInitials(" ")).toBe("?");
  });
});

describe("validateProfileAvatarFile", () => {
  it("accepts a PNG whose content matches its declared type", async () => {
    const result = await validateProfileAvatarFile(
      imageFile([137, 80, 78, 71, 13, 10, 26, 10], "image/png"),
    );

    expect(result).toMatchObject({
      success: true,
      extension: "png",
    });
  });

  it("rejects empty, oversized, unsupported, and spoofed files", async () => {
    await expect(
      validateProfileAvatarFile(new File([], "empty.png", { type: "image/png" })),
    ).resolves.toMatchObject({ success: false });
    await expect(
      validateProfileAvatarFile(
        new File([new Uint8Array(2 * 1024 * 1024 + 1)], "large.png", {
          type: "image/png",
        }),
      ),
    ).resolves.toMatchObject({ success: false });
    await expect(
      validateProfileAvatarFile(
        imageFile([60, 115, 118, 103, 62], "image/svg+xml", "avatar.svg"),
      ),
    ).resolves.toMatchObject({ success: false });
    await expect(
      validateProfileAvatarFile(
        imageFile([60, 104, 116, 109, 108, 62], "image/png"),
      ),
    ).resolves.toMatchObject({ success: false });
  });
});
