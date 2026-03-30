import { Router } from "express";
import { uploadBook } from "../controller/booksController/bookUpload/upload.controller.js";
import { requireRole, verifyJWT } from "../middleware/auth.middleware.js";
import { uploadBookFiles } from "../middleware/fileUpload.js";
import { countBook } from "../controller/booksController/bookCount/count.controller.js";
import { getBooks } from "../controller/booksController/getBooks/books.controller.js";
import { getBooksv2 } from "../controller/booksController/getBooks/bookv2.controller.js";
import { uploadBookMock } from "../controller/booksController/bookUpload/uploadmock.js";

const books_db_router = Router();

books_db_router.route("/booksdb/upload").post(verifyJWT, requireRole("admin"), uploadBookFiles, uploadBook);
books_db_router.route("/booksdb/uploadMock").post(verifyJWT, requireRole("admin"), uploadBookMock);
books_db_router.route("/booksdb/count").get(verifyJWT, countBook)
books_db_router.route("/booksdb/get_books").get(verifyJWT, requireRole("admin", "user"), getBooks)

export { books_db_router };
