const express = require("express");
const dbConnect = require("./config/db/dbConnect");
const cors = require("cors");
const dotenv = require("dotenv");

const bodyParser = require("body-parser");
const userRoutes = require("./routes/users/userRoutes");
const roleRoutes = require("./routes/roles/roleRoutes");
const planRoutes = require("./routes/plans/planRoutes");
const customerRoutes = require("./routes/customer/customerRoutes");
const businessRoutes = require("./routes/business/businessRoute");
const upgradeRoutes = require("./routes/upgrade/planUpgradeRoute");
const profileRoutes = require("./routes/profile/profileRoutes");
const branchRoutes = require("./routes/branch/branchRoutes");

dotenv.config();
const app = express();

dbConnect();
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json({ limit: "1000000mb" }));
// Global error handling middleware

app.use(express.json());

const corsOptions = {
  origin: "*", // Allow any origin
  credentials: true, // Allow cookies
  allowedHeaders: ["Authorization", "Content-Type", "Accept"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable CORS for all resources

app.use("/api/user", userRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/upgrade", upgradeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/branch", branchRoutes);
 
const PORT = process.env.PORT || 5001;

app.listen(PORT, console.log(`Server is running ${PORT}`));

