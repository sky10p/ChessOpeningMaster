import { isToday, toLocalDateKey } from "./dateUtils";

describe("dateUtils", () => {
  describe("toLocalDateKey", () => {
    it("formats UTC date as YYYY-MM-DD", () => {
      const date = new Date(Date.UTC(2026, 0, 28, 5, 4, 3));
      expect(toLocalDateKey(date)).toBe("2026-01-28");
    });

    it("pads single-digit month and day", () => {
      const date = new Date(Date.UTC(2026, 8, 5, 0, 0, 0));
      expect(toLocalDateKey(date)).toBe("2026-09-05");
    });

    it("uses UTC when parsing timezone offsets", () => {
      const date = new Date("2026-01-28T01:00:00+10:00");
      expect(toLocalDateKey(date)).toBe("2026-01-27");
    });
  });

  describe("isToday", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(Date.UTC(2026, 0, 28, 12, 0, 0)));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("returns true for the same UTC day", () => {
      const date = new Date(Date.UTC(2026, 0, 28, 1, 0, 0));
      expect(isToday(date)).toBe(true);
    });

    it("returns false for a different UTC day", () => {
      const date = new Date(Date.UTC(2026, 0, 27, 23, 59, 59));
      expect(isToday(date)).toBe(false);
    });
  });
});
