require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const productRoutes = require("./routes/products");

app.use("/products",productRoutes);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});