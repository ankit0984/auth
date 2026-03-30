import { test, request } from "@playwright/test";
import fs from "fs";

test("Login and save auth state", async () => {
  const apiContext = await request.newContext();

  const response = await apiContext.post("http://localhost:3636/api/auth/login", {
    data: {
      username: "ankit0984",
      password: "Pranjali@226547",
    },
  });

  console.log("STATUS:", response.status());

  // 🔥 Always debug first
  const text = await response.text();
  console.log("RAW RESPONSE:", text);

  if (!response.ok()) {
    throw new Error("Login failed ❌");
  }

  // ✅ Only parse JSON if valid
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error("Response is not JSON ❌");
  }

  // 🔥 Save cookies / session
  const storageState = await apiContext.storageState();
  fs.writeFileSync("auth.json", JSON.stringify(storageState, null, 2));

  console.log("✅ Auth state saved");
});
