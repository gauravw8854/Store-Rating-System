require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required. Configure backend/.env first.");
}

app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
