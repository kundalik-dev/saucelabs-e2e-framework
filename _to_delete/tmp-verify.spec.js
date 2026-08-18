import { test, expect } from "../fixtures/pages.fixture";

test("pages.fixture stays anonymous (no storageState)", async ({
  storageState,
}) => {
  expect(storageState).toBeUndefined();
});
