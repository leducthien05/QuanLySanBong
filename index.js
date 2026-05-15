const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;
// database
const database = require('./config/database');
database.connect();
// prefixAdmin
const systemConfig = require("./config/system");
app.locals.prefixAdmin = systemConfig.systemConfig.prefixAdmin;
// method-override
const methodOverride = require("method-override"); 
app.use(methodOverride('_method'));
// req.body
// app.use(express.urlencoded({ extended: true }));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// View
app.set("views", `${__dirname}/view`);
app.set("view engine", "pug");
// Public
app.use(express.static(`${__dirname}/public/`));
// Router 
const routerAdmin = require("./router/admin/index.router");
routerAdmin(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});