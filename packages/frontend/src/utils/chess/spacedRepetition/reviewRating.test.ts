import { suggestReviewRating } from "./reviewRating";

describe("suggestReviewRating", () => {
  it("returns again for high wrong move count", () => {
    expect(suggestReviewRating(3, 0, 100)).toBe("again");
  });

  it("returns hard for medium difficulty", () => {
    expect(suggestReviewRating(2, 0, 100)).toBe("hard");
    expect(suggestReviewRating(1, 2, 100)).toBe("hard");
  });

  it("returns easy for flawless and fast review", () => {
    expect(suggestReviewRating(0, 0, 30)).toBe("easy");
  });

  it("returns good for flawless review above easy time threshold", () => {
    expect(suggestReviewRating(0, 0, 46)).toBe("good");
  });

  it("returns good for flawless review with zero time", () => {
    expect(suggestReviewRating(0, 0, 0)).toBe("good");
  });

  it("normalizes negative values before rating", () => {
    expect(suggestReviewRating(-1, -2, 30)).toBe("easy");
    expect(suggestReviewRating(-1, -2, -30)).toBe("good");
  });

  it("returns good as default", () => {
    expect(suggestReviewRating(1, 0, 120)).toBe("good");
  });
});
