// import { test, request } from "@playwright/test";
// import { faker } from "@faker-js/faker";
// import { v4 as uuidv4 } from "uuid";
//
// test("Seed books safely", async () => {
//   const apiContext = await request.newContext({
//     storageState: "auth.json", // ✅ FIXED
//   });
//
//   const genres = ["programming", "science", "fiction", "history"];
//   const languages = ["english", "hindi", "spanish"];
//
//   for (let i = 0; i < 5; i++) {
//     const bookData = {
//       title: faker.lorem.words(3) + "-" + i,
//       author: faker.person.fullName(),
//       genre: faker.helpers.arrayElement(genres),
//       description: faker.lorem.sentence(),
//       coverImage: faker.image.url(),
//       coverImageFileId: uuidv4(),
//       pdf: `https://dummyfile.com/${uuidv4()}.pdf`,
//       pdfFileId: uuidv4(),
//       language: faker.helpers.arrayElement(languages),
//       uuid: uuidv4(),
//     };
//
//     const response = await apiContext.post("http://localhost:3636/api/booksdb/upload", {
//       data: bookData,
//     });
//
//     const text = await response.text();
//
//     if (!response.ok()) {
//       console.log(`❌ Failed at ${i + 1}:`, text);
//       continue;
//     }
//
//     const result = JSON.parse(text);
//
//     console.log(`✅ ${i + 1} inserted:`, result.data?.title);
//
//     // 🔥 prevent rate limit
//     await new Promise((resolve) => setTimeout(resolve, 200));
//   }
//
//   console.log("🔥 Done seeding");
// });

import { test, request } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

test("Seed mock books (full dynamic)", async () => {
  const apiContext = await request.newContext({
    storageState: "auth.json",
  });

  for (let i = 0; i < 1000; i++) {
    const response = await apiContext.post("http://localhost:3636/api/booksdb/uploadMock", {
      data: {
        title: faker.lorem.words(3) + "-" + i,
        author: faker.person.fullName(),
        description: faker.lorem.sentence(),
        genre: faker.helpers.arrayElement(["programming", "science", "fiction"]),
        language: "english",

        // 🔥 dynamic mock URLs
        coverImage: `https://picsum.photos/seed/${uuidv4()}/600/400`,
        coverImageFileId: uuidv4(),

        pdf: `https://example.com/${uuidv4()}.pdf`,
        pdfFileId: uuidv4(),
      },
    });

    const result = await response.json();

    console.log(`✅ ${i + 1}`, result.data.book.title);
  }
});