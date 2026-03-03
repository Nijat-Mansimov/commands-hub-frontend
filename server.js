import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.VITE_FRONTEND_PORT || 8080;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, "dist")));

// SPA routing - serve index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
});
