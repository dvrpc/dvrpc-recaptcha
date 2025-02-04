import path from "path";
import express from "express";
import createAssessment from "./recaptcha";
import cors from "cors";

const port = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: ["https://www.dvrpc.org/", "https://alpha.dvrpc.org/"],
  }),
);

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

router.post("/v3", async (req, res) => {
  const secret = process.env.SITESECRET;
  const token = req.body.token;
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

  fetch(url, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((google_response) => res.status(200).json({ google_response }))
    .catch((error) => res.status(500).json({ error }));
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
