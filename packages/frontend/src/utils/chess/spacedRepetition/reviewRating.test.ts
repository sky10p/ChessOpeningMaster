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

  it("returns good as default", () => {
    expect(suggestReviewRating(1, 0, 120)).toBe("good");
  });
});
