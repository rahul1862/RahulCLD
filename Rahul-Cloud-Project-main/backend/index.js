import app from "./appFactory.js";
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`UserHub API listening on http://localhost:${PORT}`));
