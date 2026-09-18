// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AccountAvatar } from "./account-avatar";

afterEach(cleanup);

describe("AccountAvatar", () => {
  it("shows the photo and falls back to the user's initials if it fails", () => {
    const { container } = render(
      <AccountAvatar
        avatarUrl="https://example.test/avatar.png"
        fullName="Dra. Valentina Rossi"
      />,
    );

    const image = container.querySelector("img");
    expect(image).toBeTruthy();
    fireEvent.error(image as HTMLImageElement);

    expect(screen.getByText("VR")).toBeTruthy();
  });
});
