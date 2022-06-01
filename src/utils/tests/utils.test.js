import { getFromState } from "../utils";

describe("should test utils module", function () {
  test("should test getFromState function", function () {
    const state = {
      obj1: {
        prop1: "a",
        prop2: "b",
      },
      obj2: {
        prop3: "c",
        prop4: "d",
        obj3: {
          prop5: "e",
          prop6: "f",
        },
      },
    };
    expect(getFromState(state, "obj1.prop1")).toBe("a");
    expect(getFromState(state, "obj1.prop2")).toBe("b");
    expect(getFromState(state, "obj2.prop3")).toBe("c");
    expect(getFromState(state, "obj2.prop4")).toBe("d");
    expect(getFromState(state, "obj2.obj3.prop5")).toBe("e");

    expect(getFromState(state, "obj2.prop5", [])).toStrictEqual([]);
    expect(getFromState(undefined, "", {})).toStrictEqual({});
    expect(getFromState(state, "")).toStrictEqual(state);
  });
});
