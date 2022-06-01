import {
  makeToUrl,
  addBackslash,
  withQueryParams,
  makeGetUrl,
  removeBackslash,
} from "../urls";

describe("testing the urls module", () => {
  test("should test makeToUrl function", () => {
    expect(makeToUrl("api/test/")).toBe("api/test/");
    expect(makeToUrl("api/test/", "5")).toBe("api/test/5/");
    expect(makeToUrl("api/test", "5")).toBe("api/test/5/");
  });

  test("should test addBackslash function", () => {
    expect(addBackslash("api/test/")).toBe("api/test/");
    expect(addBackslash("api/test")).toBe("api/test/");
  });

  test("should test withQueryParams function", () => {
    expect(withQueryParams("api/test/")).toBe("api/test/");
    expect(withQueryParams("api/test/", ["id=adsf"])).toBe("api/test/?id=adsf");
    expect(withQueryParams("api/test", ["id=test", "a=tt"])).toBe(
      "api/test/?id=test&a=tt"
    );
  });

  test("should test makeGetUrl function", () => {
    expect(makeGetUrl("api/test/")).toBe("api/test/");
    expect(makeGetUrl("api/test/", "get")).toBe("api/test_get/");
    expect(makeGetUrl("api/test/", "post")).toBe("api/test/");
  });

  test("should test removeBackslash function", () => {
    expect(removeBackslash("api/test/")).toBe("api/test");
  });
});
