"use strict";

var _urls = require("../urls");

describe("testing the urls module", function () {
  test("should test makeToUrl function", function () {
    expect((0, _urls.makeToUrl)("api/test/")).toBe("api/test/");
    expect((0, _urls.makeToUrl)("api/test/", "5")).toBe("api/test/5/");
    expect((0, _urls.makeToUrl)("api/test", "5")).toBe("api/test/5/");
  });
  test("should test addBackslash function", function () {
    expect((0, _urls.addBackslash)("api/test/")).toBe("api/test/");
    expect((0, _urls.addBackslash)("api/test")).toBe("api/test/");
  });
  test("should test withQueryParams function", function () {
    expect((0, _urls.withQueryParams)("api/test/")).toBe("api/test/");
    expect((0, _urls.withQueryParams)("api/test/", ["id=adsf"])).toBe("api/test/?id=adsf");
    expect((0, _urls.withQueryParams)("api/test", ["id=test", "a=tt"])).toBe("api/test/?id=test&a=tt");
  });
  test("should test makeGetUrl function", function () {
    expect((0, _urls.makeGetUrl)("api/test/")).toBe("api/test/");
    expect((0, _urls.makeGetUrl)("api/test/", "get")).toBe("api/test_get/");
    expect((0, _urls.makeGetUrl)("api/test/", "post")).toBe("api/test/");
  });
  test("should test removeBackslash function", function () {
    expect((0, _urls.removeBackslash)("api/test/")).toBe("api/test");
  });
});