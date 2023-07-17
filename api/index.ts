import express, { Request, Response } from "express";
import dotenv from "dotenv";
const app = express();
dotenv.config();

const apiUrl = process.env.API_URL;

app.use(express.static("public"));

const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script type="text/javascript">
        localStorage.setItem('apiUrl', '${apiUrl}')
        window.location.href ='/';
    </script>
  </body>
</html>
`;

app.get("/api", (req: Request, res: Response) => {
  res.send(html);
});

app.get("/api/users", (req: Request, res: Response) => {
  res.send({ name: "wai", email: "wai@gmail.com" });
});

app.listen(9000, () => {
  console.log("Server is listening at port 9000");
});
