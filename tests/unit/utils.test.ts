import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("lib/utils - cn", () => {
  it("should merge class names correctly", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("should resolve tailwind conflicts with priority to the last class", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("should handle conditional and falsy values", () => {
    expect(cn("base-class", false && "not-included", undefined, null, "included")).toBe(
      "base-class included"
    );
  });

  it("should handle array of class names", () => {
    expect(cn(["class-a", "class-b"], { "class-c": true, "class-d": false })).toBe(
      "class-a class-b class-c"
    );
  });
});
