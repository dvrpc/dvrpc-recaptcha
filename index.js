import path from "path";
import express from "express";
import createAssessment from "./recaptcha";

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());

const router = express.Router();
app.use("/recaptcha", router);

router.use("/test", express.static(path.join(__dirname, "tests")));

router.post("/", async (req, res) => {
  try {
    const content = await createAssessment(req.body.token, req.body.action);
    res.status(200).json(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
