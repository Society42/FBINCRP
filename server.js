const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: String, required: true },
  status: {
      type: String,
      enum: ['To-Do', 'In-Progress', 'Completed', 'Feedback'],
      default: 'To-Do'
  },
  priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
  },
  createdBy: { type: String, required: true }  
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

const staffApplicationSchema = new mongoose.Schema({
  status: { type: String, enum: ['open', 'closed'], default: 'closed' },
});

const StaffApplication = mongoose.model("StaffApplication", staffApplicationSchema);
module.exports = StaffApplication;

const applicationSchema = new mongoose.Schema({
  age: Number,
  question1: String,
  question2: String,
  question3: String,
  question4: String,
  question5: String,
  question6: String,
  question7: String,
  question8: String,
  question9: String,
  question10: String,
  question11: String,
  question12: String,
  question13: String,
  question14: String,
  question15: String,
  status: { type: String, default: "pending" },
  userId: { type: String, required: true },
});

const Application = mongoose.model("Application", applicationSchema);

const userApplicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: String,
  applications: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      age: Number,
      question1: String,
      question2: String,
      question3: String,
      question4: String,
      question5: String,
      question6: String,
      question7: String,
      question8: String,
      question9: String,
      question10: String,
      question11: String,
      question12: String,
      question13: String,
      question14: String,
      question15: String,
      status: { type: String, default: "pending" },
      submittedAt: { type: Date, default: Date.now },
      reviewer: { type: String, default: null },  
      reviewedAt: { type: Date, default: null },
      applicantUsername: { type: String, required: true, default: 'Unknown' }, 
    },
  ],
});

const UserApplication = mongoose.model("UserApplication", userApplicationSchema);

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || `http://raleighroleplay.xyz/callback`;
const GUILD_ID = process.env.GUILD_ID;

passport.use(
  new DiscordStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: REDIRECT_URI,
      scope: ["identify", "guilds"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await UserApplication.findOne({ userId: profile.id });
        if (!user) {
          user = new UserApplication({
            userId: profile.id,
            username: profile.username,
          });
          await user.save();
        }
        return done(null, profile);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/coming-soon", (req, res) => {
  res.render("coming-soon");
});

app.post('/open-application', async (req, res) => {
  await StaffApplication.updateOne({}, { status: 'open' }); 
  res.redirect('/application-panel');
});

app.post('/close-application', async (req, res) => {
  await StaffApplication.updateOne({}, { status: 'closed' });
  res.redirect('/application-panel');
});

app.get("/auth/discord", passport.authenticate("discord"));

app.get(
  "/callback",
  passport.authenticate("discord", { failureRedirect: "/access-denied" }),
  async (req, res) => {
    const guilds = req.user.guilds || [];
    const isInGuild = guilds.some((guild) => guild.id === GUILD_ID);

    if (isInGuild) {
      res.redirect("/forum");
    } else {
      req.logout(() => {});
      res.redirect("/access-denied");
    }
  }
);

app.get("/application-panel", isAuthenticated, async (req, res) => {
  if (!req.user || 
    (req.user.id !== "1065934093470158918" && 
    req.user.id !== "708001346816835624" && 
    req.user.id !== "928586046072029216")) {
    return res.redirect("/access-denied"); 
  }

  const statusFilter = req.query.status || "pending"; 
  try {
    const applications = await Application.find({ status: statusFilter });

    for (const application of applications) {
      const userApplication = await UserApplication.findOne({ userId: application.userId });
    
      if (userApplication) {
        const app = userApplication.applications.id(application._id);
        if (app) {
          application.applicantUsername = app.applicantUsername || 'Unknown'; 
          application.reviewerUsername = app.reviewer ? app.reviewer : 'Unknown';
          application.reviewedAtFormatted = app.reviewedAt ? app.reviewedAt.toLocaleString() : 'N/A';
        } else {
          application.applicantUsername = 'Unknown'; 
        }
      } else {
        application.applicantUsername = 'Unknown'; 
        application.reviewerUsername = 'Unknown';
        application.reviewedAtFormatted = 'N/A';
      }
    }    

    res.render("application-panel", { applications });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).send("An error occurred while fetching applications.");
  }
});

app.get("/staff-panel", isAuthenticated, (req, res) => {
  if (!req.user || 
    (req.user.id !== "1065934093470158918" && 
    req.user.id !== "708001346816835624" && 
    req.user.id !== "928586046072029216")) {
    return res.redirect("/access-denied"); 
  }

  res.render("staff-panel", { user: req.user });
});

app.post("/update-application/:id", isAuthenticated, async (req, res) => {
  const { status } = req.body;
  const applicationId = req.params.id;
  const reviewerId = req.user.id;
  const reviewerUsername = req.user.username; 

  try {
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status }, 
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).send("Application not found.");
    }

    const userApplication = await UserApplication.findOne({ userId: updatedApplication.userId });

    if (userApplication) {
      const app = userApplication.applications.id(applicationId);

      if (app) {
        app.status = status;
        app.reviewer = reviewerUsername;  
        app.reviewedAt = new Date();  

        await userApplication.save();
      }
    }

    res.redirect("/application-panel");
  } catch (err) {
    console.error("Error updating application:", err);
    res.status(500).send("An error occurred while updating the application.");
  }
});



app.get("/access-denied", (req, res) => {
  res.render("access-denied");
});

app.get("/forum", isAuthenticated, async (req, res) => {
  try {
    if (!req.user) {
      console.error("User is not authenticated");
      return res.redirect("/login");
    }

    console.log("Authenticated user:", req.user);

    const staffAppStatus = await StaffApplication.findOne();

    const user = await UserApplication.findOne({ userId: req.user.id });

    const myApplications = user && user.applications ? user.applications : [];
    const username = req.user.username; 

    res.render("forum", { myApplications, userId: req.user.id, username, staffAppStatus });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).send("An error occurred while fetching applications.");
  }
});

app.get("/staff-application", isAuthenticated, (req, res) => {
  res.render("staff-application", { userId: req.user.id });
});

app.post("/submit-application", isAuthenticated, async (req, res) => {
  const { age, question1, question2, question3, question4, question5, question6, question7, question8, question9, question10, question11, question12, question13, question14, question15 } = req.body;
  const userId = req.user.id;
  const applicantUsername = req.user.username; 

  try {
    const userApplication = await UserApplication.findOne({ userId });

    if (userApplication) {
      const existingApplication = userApplication.applications.find(
        (app) => app.status !== "denied"
      );

      if (existingApplication) {
        return res.status(400).send("You have already applied. You can only reapply if your previous application was denied.");
      }
    }

    const newApplication = new Application({
      age,
      question1,
      question2,
      question3,
      question4,
      question5,
      question6,
      question7,
      question8,
      question9,
      question10,
      question11,
      question12,
      question13,
      question14,
      question15,
      userId, 
    });

    const savedApplication = await newApplication.save();

    if (!userApplication) {
      const newUserApplication = new UserApplication({
        userId,
        username: req.user.username,
        applications: [
          {
            ...savedApplication.toObject(),
            applicantUsername, 
          },
        ],
      });
      await newUserApplication.save();
    } else {
      userApplication.applications.push({
        ...savedApplication.toObject(),
        applicantUsername, 
      });
      await userApplication.save();
    }

    res.redirect("/thank-you");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting application.");
  }
});

app.post('/close-application/:id', async (req, res) => {
  try {
      const applicationId = req.params.id;
      
      const application = await Application.findByIdAndUpdate(applicationId, {
          status: 'Closed'
      }, { new: true });

      if (!application) {
          return res.status(404).send('Application not found');
      }

      res.redirect('/application-panel');
  } catch (err) {
      console.error('Error closing application:', err);
      res.status(500).send('Server error');
  }
});

app.get("/thank-you", isAuthenticated, (req, res) => {
  res.render("thank-you", { userId: req.user.id });
});

app.get("/staff-panel", isAuthenticated, async (req, res) => {
  if (!req.user || 
    (req.user.id !== "1065934093470158918" && 
      req.user.id !== "708001346816835624" && 
      req.user.id !== "1040357402647724082" && 
    req.user.id !== "1066462436443574385" && 
    req.user.id !== "928586046072029216")) {
    return res.redirect("/access-denied"); 
  }

  const statusFilter = req.query.status || "pending"; 
  try {
    const applications = await Application.find({ status: statusFilter });

    for (const application of applications) {
      const userApplication = await UserApplication.findOne({ userId: application.userId });

      if (userApplication) {
        const app = userApplication.applications.find(app => app._id.toString() === application._id.toString());
        application.applicantUsername = app ? app.applicantUsername : 'Unknown'; 
      } else {
        application.applicantUsername = 'Unknown';  
      }

      if (application.reviewer) {
        const reviewerApplication = await UserApplication.findOne({ userId: application.reviewer });
        if (reviewerApplication) {
          application.reviewerUsername = reviewerApplication.username || 'Unknown'; 
          application.reviewedAtFormatted = application.reviewedAt ? application.reviewedAt.toLocaleString() : 'N/A';
        } else {
          application.reviewerUsername = 'Unknown'; 
          application.reviewedAtFormatted = 'N/A';
        }
      } else {
        application.reviewerUsername = 'Not Reviewed Yet';
        application.reviewedAtFormatted = 'N/A';
      }
    }

    res.render("staff-panel", { applications });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).send("An error occurred while fetching applications.");
  }
});

app.get("/development-board", async (req, res) => {
  try {
    const tasks = await Task.find({});
    
    const tasksByStatus = {
      Feedback: [],
      "To-Do": [],
      "In-Progress": [],
      Completed: []
    };

    tasks.forEach(task => {
      tasksByStatus[task.status].push(task);
    });

    res.render("development-board", { tasksByStatus });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).send("An error occurred while fetching tasks.");
  }
});

app.get('/development-panel', isAuthenticated, async (req, res) => {
  if (!req.user || 
    (req.user.id !== "1065934093470158918" && 
      req.user.id !== "708001346816835624" && 
      req.user.id !== "1040357402647724082" && 
    req.user.id !== "1066462436443574385" && 
    req.user.id !== "928586046072029216")) {
    return res.redirect("/access-denied"); 
  }

  try {
      const statusFilter = req.query.status || '';
      let tasks;
      
      if (statusFilter) {
          tasks = await Task.find({ status: statusFilter });
      } else {
          tasks = await Task.find({});
      }

      res.render('development-panel', { tasks: tasks });
  } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/create-task', async (req, res) => {
  try {
      const { title, description, assignedTo, status, priority } = req.body;

      const task = new Task({
          title: title,
          description: description,
          assignedTo: assignedTo,
          status: status,
          priority: priority,
          createdBy: req.user.username  
      });

      await task.save();

      res.redirect('/development-panel');
  } catch (err) {
      console.error("Error creating task:", err);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/update-status', async (req, res) => {
  const { taskId, newStatus } = req.body;

  await Task.findByIdAndUpdate(taskId, { status: newStatus });
  res.redirect('/development-panel');
});

app.get('/delete-task/:id', async (req, res) => {
  const taskId = req.params.id;
  await Task.findByIdAndDelete(taskId);
  res.redirect('/development-panel');
});

app.get("/view-application/:id", isAuthenticated, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('userId'); 
    if (!application) {
      return res.status(404).send('Application not found');
    }

    const userApplication = await UserApplication.findOne({ userId: application.userId });
    const applicantUsername = userApplication ? userApplication.username : 'Unknown'; 

    res.send(`
      <div>
        <p><strong>What is your age?</strong> ${application.age}</p>
        <p><strong>What time zone are you in, and how active can you be weekly?</strong> ${application.question1}</p>
        <p><strong>Do you have any prior staff experience in other FiveM servers or similar communities?</strong> ${application.question2}</p>
        <p><strong>What is RDM?</strong> ${application.question3}</p>
        <p><strong>What is VDM?</strong> ${application.question4}</p>
        <p><strong>What is FRP?</strong> ${application.question5}</p>
        <p><strong>what is meta gaming?</strong> ${application.question6}</p>
        <p><strong>How would you handle a player who is clearly breaking the rules but denies it when confronted?</strong> ${application.question7}</p>
        <p><strong>If two players are arguing in chat and it's escalating, how would you intervene?</strong> ${application.question8}</p>
        <p><strong>A player reports someone for using a mod menu. What steps would you take to confirm it?</strong> ${application.question9}</p>
        <p><strong>A popular streamer joins the server and is griefed by other players. How would you handle the situation quickly and professionally?</strong> ${application.question10}</p>
        <p><strong>What would you do if you discovered another staff member abusing their powers?</strong> ${application.question11}</p>
        <p><strong>What do you think makes a good staff member?</strong> ${application.question12}</p>
        <p><strong>How would you contribute to maintaining a fun, fair, and welcoming community?</strong> ${application.question13}</p>
        <p><strong>Why do you want to become a staff member?</strong> ${application.question14}</p>
        <p><strong>What strengths are your stengths and weaknesses?</strong> ${application.question15}</p>
        <p><strong>Status:</strong> ${application.status}</p>
      </div>
    `);
  } catch (err) {
    console.error("Error fetching application details:", err);
    res.status(500).send("An error occurred while fetching application details.");
  }
});

app.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://raleighroleplay.xyz:${PORT}`);
});
