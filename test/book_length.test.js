import { test, expect, request } from "@playwright/test";

test.describe("Books API Pagination", () => {
  test("should return first page with correct limit", async () => {
    const apiContext = await request.newContext({
      storageState: "auth.json", // ✅ correct place
    });

    const page = 1;
    const pageSize = 10;

    const response = await apiContext.get(
      `http://localhost:3636/api/booksdb/get_books?page=${page}&page_size=${pageSize}`
    );

    const text = await response.text();

    if (!response.ok()) {
      console.log("❌ API FAILED:", text);
      throw new Error("API request failed");
    }

    const res = JSON.parse(text);
    const data = res.data;

    // console.log(data)
    console.log("page length is: ",data.books.length)
    console.log("total books are: ",data.totalBooks)
    console.log("has next value: ",data.hasNext)
    console.log("has prev value: ",data.hasPrev)

    expect(data.currentPage).toBe(page);
    expect(data.pageSize).toBe(pageSize);
    expect(data.books.length).toBeLessThanOrEqual(pageSize);

    if (data.totalBooks > pageSize) {
      expect(data.hasNext).toBeTruthy();
    }

    if (page === 1) {
      expect(data.hasPrev).toBeFalsy();
    }
  });
});
