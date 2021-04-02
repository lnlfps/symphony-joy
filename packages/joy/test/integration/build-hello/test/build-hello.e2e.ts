import "jest-playwright-preset";
import * as path from "path";
import { JoyTestContext } from "../../../util/joy-test-context";

describe("build-hello", () => {
  let start: number;
  let testContext: JoyTestContext;
  beforeAll(async () => {
    start = Date.now();
    console.log(">>>>> start dev server", start);
    const curPath = path.resolve(__dirname, "../");
    testContext = await JoyTestContext.createDevContext(curPath);
    console.log(">>>>> server prepared", testContext.port, Date.now() - start);
  }, 3000000);

  afterAll(async () => {
    await testContext.killServer();
    console.log(">>>>> server close", Date.now() - start);
  });

  test("should render hello page", async () => {
    // await page.goto(testContext.getUrl("/"));
    // const browser = await page.$eval("#message", (el: any) => el.innerHTML);
    // expect(browser).toContain("Welcome to Joy!");
  });
});