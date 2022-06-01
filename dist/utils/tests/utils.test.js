"use strict";

var _utils = require("../utils");

describe("should test utils module", function () {
  test("should test getFromState function", function () {
    var state = {
      obj1: {
        prop1: "a",
        prop2: "b"
      },
      obj2: {
        prop3: "c",
        prop4: "d",
        obj3: {
          prop5: "e",
          prop6: "f"
        }
      }
    };
    expect((0, _utils.getFromState)(state, "obj1.prop1")).toBe("a");
    expect((0, _utils.getFromState)(state, "obj1.prop2")).toBe("b");
    expect((0, _utils.getFromState)(state, "obj2.prop3")).toBe("c");
    expect((0, _utils.getFromState)(state, "obj2.prop4")).toBe("d");
    expect((0, _utils.getFromState)(state, "obj2.obj3.prop5")).toBe("e");
    expect((0, _utils.getFromState)(state, "obj2.prop5", [])).toStrictEqual([]);
    expect((0, _utils.getFromState)(undefined, "", {})).toStrictEqual({});
    expect((0, _utils.getFromState)(state, "")).toStrictEqual(state);
  });
});