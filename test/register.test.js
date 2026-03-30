import { test, request } from "@playwright/test";
import { faker } from "@faker-js/faker";

test("register user", async () => {
  const apiContext = await request.newContext();

  const batchSize = 10;

  for (let i = 0; i < 100; i += batchSize) {
    const requests = [];

    for (let j = 0; j < batchSize; j++) {
      const index = i + j;

      requests.push(
        apiContext.post("http://localhost:3636/api/auth/register", {
          data: {
            username: faker.internet.username() + "-" + index,
            firstname: faker.person.firstName(),
            lastname: faker.person.lastName(),
            email: `user${Date.now()}${index}@test.com`,
            password: "Test@1234",
          },
        })
      );
    }

    const responses = await Promise.all(requests);

    for (let k = 0; k < responses.length; k++) {
      const res = responses[k];
      const text = await res.text();

      if (!res.ok()) {
        console.log(`❌ Failed ${i + k + 1}:`, text);
        continue;
      }

      const result = JSON.parse(text);
      console.log(`✅ ${i + k + 1}`, result?.data?.user?.username);
    }
  }});
