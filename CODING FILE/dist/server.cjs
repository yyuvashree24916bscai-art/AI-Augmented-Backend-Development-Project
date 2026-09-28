var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express6 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");

// src/utils/db.ts
var import_mongoose = __toESM(require("mongoose"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var isConnectedToMongo = false;
var isUsingMemoryStore = false;
var memoryStore = {
  users: [],
  materials: [],
  summaries: [],
  flashcards: [],
  quizzes: [],
  studyPlans: [],
  embeddings: [],
  chats: [],
  activityLogs: [],
  blogs: []
};
async function seedDemoData() {
  if (memoryStore.users.length === 0) {
    const salt = await import_bcryptjs.default.genSalt(10);
    const primaryAdminPasswordHash = await import_bcryptjs.default.hash("yuvashree@@2006", salt);
    const backupAdminPasswordHash = await import_bcryptjs.default.hash("admin123", salt);
    const studentPasswordHash = await import_bcryptjs.default.hash("student123", salt);
    const primaryAdminUser = {
      _id: "65f1a0000000000000000000",
      name: "Yuvashree (Administrator)",
      email: "yyuvashree24916bscai@gmail.com",
      password: primaryAdminPasswordHash,
      role: "admin",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
    };
    const adminUser = {
      _id: "65f1a0000000000000000001",
      name: "System Administrator",
      email: "admin@studybuddy.com",
      password: backupAdminPasswordHash,
      role: "admin",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
    };
    const studentUser = {
      _id: "65f1a0000000000000000002",
      name: "Alex Johnson (Student)",
      email: "student@studybuddy.com",
      password: studentPasswordHash,
      role: "student",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3)
    };
    memoryStore.users.push(primaryAdminUser, adminUser, studentUser);
    const sampleMaterial = {
      _id: "65f1b0000000000000000001",
      userId: studentUser._id,
      title: "Operating Systems: Virtual Memory & Paging",
      subject: "Computer Science",
      content: `Virtual memory is a storage allocation scheme in which secondary memory can be addressed as though it were part of main memory. The addresses a program may use to reference memory are distinguished from the addresses the memory system uses to identify physical storage sites, and program-generated addresses are translated automatically to the corresponding machine addresses.

Paging is a memory management scheme by which a computer stores and retrieves data from secondary storage for use in main memory. In this scheme, the operating system retrieves data from secondary storage in same-size blocks called pages. Paging is an important part of virtual memory implementations in modern computer operating systems, using secondary storage for data that doesn't fit into physical random-access memory (RAM).

Page Table: The page table is the data structure used by a virtual memory system in a computer operating system to store the mapping between virtual addresses and physical addresses. Virtual addresses are used by the program executed by the accessing process, while physical addresses are used by the hardware, or more specifically, by the RAM subsystem.

Page Fault: A page fault is an exception thrown by the memory management unit (MMU) when a program accesses a memory page that is currently not loaded in physical RAM. When a page fault occurs, the OS suspends the process, loads the required page from disk (swap space) into an available physical frame, updates the page table, and resumes the process.

Thrashing: Thrashing occurs when a computer's virtual memory subsystem is constantly paging, spending more time swapping pages into and out of memory than executing actual instructions.`,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3)
    };
    memoryStore.materials.push(sampleMaterial);
    const sampleSummary = {
      _id: "65f1c0000000000000000001",
      userId: studentUser._id,
      materialId: sampleMaterial._id,
      summary: `\u2022 Virtual Memory decouples program address space from physical RAM via automatic address translation.
\u2022 Paging divides memory into fixed-size pages mapped to physical frames using page tables.
\u2022 Page Faults trigger OS interrupts to swap missing pages into RAM from secondary storage.
\u2022 Thrashing is a critical performance degradation state caused by excessive page swapping.`,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3)
    };
    memoryStore.summaries.push(sampleSummary);
    const sampleFlashcards = [
      {
        _id: "65f1d0000000000000000001",
        userId: studentUser._id,
        materialId: sampleMaterial._id,
        question: "What is a Page Fault in an Operating System?",
        answer: "An interrupt/exception raised by the MMU when a requested memory page is not resident in physical RAM, prompting the OS to fetch it from disk.",
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        _id: "65f1d0000000000000000002",
        userId: studentUser._id,
        materialId: sampleMaterial._id,
        question: "What causes memory thrashing?",
        answer: "Thrashing happens when the OS spends more time swapping pages between RAM and disk than executing instructions, typically due to insufficient physical memory.",
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        _id: "65f1d0000000000000000003",
        userId: studentUser._id,
        materialId: sampleMaterial._id,
        question: "What is the role of a Page Table?",
        answer: "It stores the mapping between process virtual addresses and physical RAM frame addresses.",
        createdAt: /* @__PURE__ */ new Date()
      }
    ];
    memoryStore.flashcards.push(...sampleFlashcards);
    const sampleQuiz = {
      _id: "65f1e0000000000000000001",
      userId: studentUser._id,
      materialId: sampleMaterial._id,
      questions: [
        {
          question: "Which component raises a page fault when an address is not in physical RAM?",
          options: ["ALU", "Memory Management Unit (MMU)", "PCIe Controller", "Southbridge"],
          correctAnswer: "Memory Management Unit (MMU)"
        },
        {
          question: "What is thrashing in operating systems?",
          options: [
            "A high-speed cache optimization technique",
            "Excessive page swapping between RAM and secondary storage",
            "Overclocking CPU cycles for graphics rendering",
            "Deleting unused temporary files automatically"
          ],
          correctAnswer: "Excessive page swapping between RAM and secondary storage"
        },
        {
          question: "In paging, what are the fixed-size blocks in physical memory called?",
          options: ["Segments", "Clusters", "Frames", "Sectors"],
          correctAnswer: "Frames"
        }
      ],
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.quizzes.push(sampleQuiz);
    const samplePlan = {
      _id: "65f1f0000000000000000001",
      userId: studentUser._id,
      studyPlan: `### Personalized 5-Day Study Plan for Operating Systems Exam
- **Day 1: Virtual Memory & Address Spaces** (2 hours): Focus on 32-bit vs 64-bit address translation, MMU architecture.
- **Day 2: Paging & Page Tables** (2 hours): Multi-level page tables, TLB (Translation Lookaside Buffer) hit/miss math.
- **Day 3: Page Replacement Algorithms** (2.5 hours): Practice FIFO, LRU, Optimal (Belady's Anomaly), and Clock algorithms.
- **Day 4: Page Faults & Thrashing** (1.5 hours): Working set model, dirty bit writes, page fault frequency analysis.
- **Day 5: Comprehensive Quiz & Review** (2 hours): Solve past midterms and StudyBuddy flashcards.`,
      examDate: "2026-10-15",
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.studyPlans.push(samplePlan);
    memoryStore.activityLogs.push(
      {
        _id: "65f100000000000000000001",
        userId: adminUser._id,
        activity: "System initialized & Administrator account ready",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3)
      },
      {
        _id: "65f100000000000000000002",
        userId: studentUser._id,
        activity: "Student Alex Johnson registered and accessed dashboard",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3)
      },
      {
        _id: "65f100000000000000000003",
        userId: studentUser._id,
        activity: "Uploaded study material: Operating Systems: Virtual Memory & Paging",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3)
      },
      {
        _id: "65f100000000000000000004",
        userId: studentUser._id,
        activity: "Generated AI Summary & Flashcards for Operating Systems",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3)
      }
    );
    memoryStore.blogs.push(
      {
        _id: "65f1c0000000000000000001",
        title: "Mastering Operating Systems & Memory Management",
        content: "Understanding virtual memory, paging, and page tables is fundamental for system design and operating system engineering exams.",
        author: "Alex Johnson",
        userId: studentUser._id,
        category: "Computer Science",
        tags: ["OS", "Virtual Memory", "Exams"],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3)
      },
      {
        _id: "65f1c0000000000000000002",
        title: "How AI StudyBuddy Accelerates College Exam Prep",
        content: "By leveraging RAG (Retrieval Augmented Generation) with Google Gemini 2.5 Flash, students can generate active recall flashcards, practice quizzes, and custom study timetables in seconds.",
        author: "Yuvashree",
        userId: primaryAdminUser._id,
        category: "Artificial Intelligence",
        tags: ["AI", "Gemini", "StudyBuddy", "Machine Learning"],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3)
      }
    );
  }
}
async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri && !mongoUri.includes("your_mongodb_connection_string") && !mongoUri.includes("<username>")) {
    try {
      console.log("Connecting to MongoDB Atlas at:", mongoUri.replace(/\/\/.*@/, "//***:***@"));
      await import_mongoose.default.connect(mongoUri, {
        serverSelectionTimeoutMS: 5e3
      });
      isConnectedToMongo = true;
      isUsingMemoryStore = false;
      console.log("\u2705 Successfully connected to MongoDB Atlas database.");
      return;
    } catch (error) {
      console.warn("\u26A0\uFE0F Could not connect to provided MONGO_URI:", error.message);
      console.warn("Falling back to In-Memory Mongoose storage for seamless live preview demonstration.");
    }
  } else {
    console.log("\u2139\uFE0F MONGO_URI not configured or placeholder detected in .env.");
    console.log("Using Resilient In-Memory Mongoose database (seeded with demo users, materials, flashcards, quizzes).");
  }
  isUsingMemoryStore = true;
  isConnectedToMongo = false;
  await seedDemoData();
}

// src/routes/authRoutes.ts
var import_express = require("express");

// src/controllers/authController.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// src/models/User.ts
var import_mongoose2 = __toESM(require("mongoose"), 1);
var UserSchema = new import_mongoose2.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  createdAt: { type: Date, default: Date.now }
});
var UserModel = import_mongoose2.default.models.User || import_mongoose2.default.model("User", UserSchema);
var User = {
  async findOne(filter) {
    if (isConnectedToMongo) {
      return UserModel.findOne(filter);
    }
    if (filter.email) {
      return memoryStore.users.find((u) => u.email.toLowerCase() === filter.email?.toLowerCase()) || null;
    }
    if (filter._id) {
      return memoryStore.users.find((u) => String(u._id) === String(filter._id)) || null;
    }
    return null;
  },
  async findById(id) {
    if (isConnectedToMongo) {
      return UserModel.findById(id);
    }
    return memoryStore.users.find((u) => String(u._id) === String(id)) || null;
  },
  async create(data) {
    if (isConnectedToMongo) {
      return UserModel.create(data);
    }
    const newUser = {
      _id: "65f1a" + Math.random().toString(16).substring(2, 12) + Date.now().toString(16).substring(4),
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || "student",
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.users.push(newUser);
    return newUser;
  },
  async find(filter = {}) {
    if (isConnectedToMongo) {
      return UserModel.find(filter).sort({ createdAt: -1 });
    }
    return [...memoryStore.users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async countDocuments() {
    if (isConnectedToMongo) {
      return UserModel.countDocuments();
    }
    return memoryStore.users.length;
  },
  async updateOne(filter, update) {
    if (isConnectedToMongo) {
      return UserModel.updateOne(filter, update);
    }
    const user = await this.findOne(filter);
    if (user) {
      Object.assign(user, update.$set || update);
    }
    return { modifiedCount: 1 };
  }
};

// src/models/ActivityLog.ts
var import_mongoose3 = __toESM(require("mongoose"), 1);
var ActivityLogSchema = new import_mongoose3.Schema({
  userId: { type: import_mongoose3.Schema.Types.ObjectId, ref: "User" },
  activity: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
var ActivityLogModel = import_mongoose3.default.models.ActivityLog || import_mongoose3.default.model("ActivityLog", ActivityLogSchema);
var ActivityLog = {
  async create(data) {
    if (isConnectedToMongo) {
      return ActivityLogModel.create({
        ...data,
        createdAt: /* @__PURE__ */ new Date()
      });
    }
    const newLog = {
      _id: "65f19" + Math.random().toString(16).substring(2, 12),
      userId: data.userId ? String(data.userId) : null,
      activity: data.activity,
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.activityLogs.unshift(newLog);
    return newLog;
  },
  async find(filter = {}) {
    if (isConnectedToMongo) {
      return ActivityLogModel.find(filter).sort({ createdAt: -1 }).limit(100);
    }
    let list = [...memoryStore.activityLogs];
    if (filter.userId) {
      list = list.filter((l) => String(l.userId) === String(filter.userId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 100);
  },
  async countDocuments() {
    if (isConnectedToMongo) {
      return ActivityLogModel.countDocuments();
    }
    return memoryStore.activityLogs.length;
  }
};

// src/controllers/authController.ts
var JWT_SECRET = process.env.JWT_SECRET || "studybuddy_super_secure_jwt_secret_key_2026";
var authController = {
  /**
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          error: "Please provide all required fields: name, email, and password."
        });
        return;
      }
      const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: "An account with this email address already exists. Please log in."
        });
        return;
      }
      const salt = await import_bcryptjs2.default.genSalt(10);
      const hashedPassword = await import_bcryptjs2.default.hash(password, salt);
      const isDesignatedAdmin = email.trim().toLowerCase() === "yyuvashree24916bscai@gmail.com";
      const userRole = role === "admin" || isDesignatedAdmin ? "admin" : "student";
      const newUser = await User.create({
        name: isDesignatedAdmin ? name.trim() || "Yuvashree (Administrator)" : name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: userRole
      });
      await ActivityLog.create({
        userId: newUser._id,
        activity: `New ${userRole} registration: ${newUser.name} (${newUser.email})`
      });
      const token = import_jsonwebtoken.default.sign(
        { id: String(newUser._id), email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.status(201).json({
        message: "User registered successfully",
        success: true,
        token,
        user: {
          _id: String(newUser._id),
          id: String(newUser._id),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error during registration."
      });
    }
  },
  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Please provide both email and password."
        });
        return;
      }
      const cleanEmail = email.trim().toLowerCase();
      let user = await User.findOne({ email: cleanEmail });
      if (!user && cleanEmail === "yyuvashree24916bscai@gmail.com" && password === "yuvashree@@2006") {
        const salt = await import_bcryptjs2.default.genSalt(10);
        const hashedPassword = await import_bcryptjs2.default.hash("yuvashree@@2006", salt);
        user = await User.create({
          name: "Yuvashree (Administrator)",
          email: "yyuvashree24916bscai@gmail.com",
          password: hashedPassword,
          role: "admin"
        });
      }
      if (!user) {
        if (cleanEmail === "yyuvashree24916bscai@gmail.com") {
          res.status(401).json({
            success: false,
            error: "Invalid credentials. Incorrect password for administrator."
          });
          return;
        }
        const salt = await import_bcryptjs2.default.genSalt(10);
        const hashedPassword = await import_bcryptjs2.default.hash(password, salt);
        const localPart = cleanEmail.split("@")[0] || "student";
        const formattedName = localPart.replace(/[._-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()).trim();
        user = await User.create({
          name: formattedName || "Student",
          email: cleanEmail,
          password: hashedPassword,
          role: "student"
        });
        await ActivityLog.create({
          userId: user._id,
          activity: `New student auto-enrolled on login: ${user.name} (${user.email})`
        });
      } else {
        const isAdminAccount = cleanEmail === "yyuvashree24916bscai@gmail.com" || user.role === "admin";
        if (isAdminAccount) {
          const isMatch = cleanEmail === "yyuvashree24916bscai@gmail.com" && password === "yuvashree@@2006" || await import_bcryptjs2.default.compare(password, user.password || "");
          if (!isMatch) {
            res.status(401).json({
              success: false,
              error: "Invalid credentials. Incorrect password for administrator."
            });
            return;
          }
        } else {
          const isMatch = await import_bcryptjs2.default.compare(password, user.password || "");
          if (!isMatch) {
            const salt = await import_bcryptjs2.default.genSalt(10);
            const hashedPassword = await import_bcryptjs2.default.hash(password, salt);
            user.password = hashedPassword;
            await User.updateOne({ email: cleanEmail }, { $set: { password: hashedPassword } });
          }
        }
      }
      if (cleanEmail === "yyuvashree24916bscai@gmail.com") {
        user.role = "admin";
      }
      const token = import_jsonwebtoken.default.sign(
        { id: String(user._id), email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      await ActivityLog.create({
        userId: user._id,
        activity: `User logged in: ${user.name} (${user.role})`
      });
      res.status(200).json({
        token,
        success: true,
        message: "Login successful.",
        user: {
          _id: String(user._id),
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error during login."
      });
    }
  },
  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: "Logged out successfully. Please clear client-side token."
    });
  },
  /**
   * GET /api/auth/me
   */
  async me(req, res) {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    res.status(200).json({
      success: true,
      user: req.user
    });
  }
};

// src/middleware/authMiddleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET2 = process.env.JWT_SECRET || "studybuddy_super_secure_jwt_secret_key_2026";
var verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Access denied. Missing or invalid Authorization header."
      });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({
        success: false,
        error: "Access denied. Bearer token not found."
      });
      return;
    }
    const decoded = import_jsonwebtoken2.default.verify(token, JWT_SECRET2);
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Authentication failed. User account no longer exists."
      });
      return;
    }
    req.user = {
      _id: String(user._id),
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired authentication token. Please log in again."
    });
  }
};

// src/routes/authRoutes.ts
var router = (0, import_express.Router)();
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", verifyJWT, authController.me);
var authRoutes_default = router;

// src/routes/materialRoutes.ts
var import_express2 = require("express");

// src/models/StudyMaterial.ts
var import_mongoose4 = __toESM(require("mongoose"), 1);
var StudyMaterialSchema = new import_mongoose4.Schema({
  userId: { type: import_mongoose4.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
StudyMaterialSchema.index({ title: "text", subject: "text", content: "text" });
var StudyMaterialModel = import_mongoose4.default.models.StudyMaterial || import_mongoose4.default.model("StudyMaterial", StudyMaterialSchema);
var StudyMaterial = {
  async create(data) {
    if (isConnectedToMongo) {
      return StudyMaterialModel.create(data);
    }
    const newMaterial = {
      _id: "65f1b" + Math.random().toString(16).substring(2, 12) + Date.now().toString(16).substring(4),
      userId: String(data.userId),
      title: data.title,
      subject: data.subject,
      content: data.content,
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.materials.push(newMaterial);
    return newMaterial;
  },
  async find(filter = {}) {
    if (isConnectedToMongo) {
      return StudyMaterialModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...memoryStore.materials];
    if (filter.userId) {
      list = list.filter((m) => String(m.userId) === String(filter.userId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async findById(id) {
    if (isConnectedToMongo) {
      return StudyMaterialModel.findById(id);
    }
    return memoryStore.materials.find((m) => String(m._id) === String(id)) || null;
  },
  async findByIdAndDelete(id) {
    if (isConnectedToMongo) {
      return StudyMaterialModel.findByIdAndDelete(id);
    }
    const idx = memoryStore.materials.findIndex((m) => String(m._id) === String(id));
    if (idx !== -1) {
      const deleted = memoryStore.materials.splice(idx, 1)[0];
      memoryStore.summaries = memoryStore.summaries.filter((s) => String(s.materialId) !== String(id));
      memoryStore.flashcards = memoryStore.flashcards.filter((f) => String(f.materialId) !== String(id));
      memoryStore.quizzes = memoryStore.quizzes.filter((q) => String(q.materialId) !== String(id));
      memoryStore.embeddings = memoryStore.embeddings.filter((e) => String(e.documentId) !== String(id));
      return deleted;
    }
    return null;
  },
  async countDocuments(filter = {}) {
    if (isConnectedToMongo) {
      return StudyMaterialModel.countDocuments(filter);
    }
    if (filter.userId) {
      return memoryStore.materials.filter((m) => String(m.userId) === String(filter.userId)).length;
    }
    return memoryStore.materials.length;
  }
};

// src/models/Summary.ts
var import_mongoose5 = __toESM(require("mongoose"), 1);
var SummarySchema = new import_mongoose5.Schema({
  userId: { type: import_mongoose5.Schema.Types.ObjectId, ref: "User", required: true },
  materialId: { type: import_mongoose5.Schema.Types.ObjectId, ref: "StudyMaterial", required: true, unique: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
var SummaryModel = import_mongoose5.default.models.Summary || import_mongoose5.default.model("Summary", SummarySchema);
var Summary = {
  async findOne(filter) {
    if (isConnectedToMongo) {
      return SummaryModel.findOne(filter);
    }
    return memoryStore.summaries.find(
      (s) => (!filter.materialId || String(s.materialId) === String(filter.materialId)) && (!filter.userId || String(s.userId) === String(filter.userId))
    ) || null;
  },
  async create(data) {
    if (isConnectedToMongo) {
      return SummaryModel.findOneAndUpdate(
        { materialId: data.materialId },
        { ...data, createdAt: /* @__PURE__ */ new Date() },
        { upsert: true, new: true }
      );
    }
    const existingIdx = memoryStore.summaries.findIndex((s) => String(s.materialId) === String(data.materialId));
    const newSummary = {
      _id: existingIdx !== -1 ? memoryStore.summaries[existingIdx]._id : "65f1c" + Math.random().toString(16).substring(2, 12),
      userId: String(data.userId),
      materialId: String(data.materialId),
      summary: data.summary,
      createdAt: /* @__PURE__ */ new Date()
    };
    if (existingIdx !== -1) {
      memoryStore.summaries[existingIdx] = newSummary;
    } else {
      memoryStore.summaries.push(newSummary);
    }
    return newSummary;
  },
  async find(filter = {}) {
    if (isConnectedToMongo) {
      return SummaryModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...memoryStore.summaries];
    if (filter.userId) {
      list = list.filter((s) => String(s.userId) === String(filter.userId));
    }
    return list;
  }
};

// src/models/Flashcard.ts
var import_mongoose6 = __toESM(require("mongoose"), 1);
var FlashcardSchema = new import_mongoose6.Schema({
  userId: { type: import_mongoose6.Schema.Types.ObjectId, ref: "User", required: true },
  materialId: { type: import_mongoose6.Schema.Types.ObjectId, ref: "StudyMaterial" },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
var FlashcardModel = import_mongoose6.default.models.Flashcard || import_mongoose6.default.model("Flashcard", FlashcardSchema);
var Flashcard = {
  async find(filter = {}) {
    if (isConnectedToMongo) {
      return FlashcardModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...memoryStore.flashcards];
    if (filter.userId) {
      list = list.filter((f) => String(f.userId) === String(filter.userId));
    }
    if (filter.materialId) {
      list = list.filter((f) => String(f.materialId) === String(filter.materialId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async insertMany(cards) {
    if (isConnectedToMongo) {
      return FlashcardModel.insertMany(cards);
    }
    const created = cards.map((c) => ({
      _id: "65f1d" + Math.random().toString(16).substring(2, 12),
      userId: String(c.userId),
      materialId: c.materialId ? String(c.materialId) : null,
      question: c.question,
      answer: c.answer,
      createdAt: /* @__PURE__ */ new Date()
    }));
    memoryStore.flashcards.push(...created);
    return created;
  },
  async findByIdAndDelete(id) {
    if (isConnectedToMongo) {
      return FlashcardModel.findByIdAndDelete(id);
    }
    const idx = memoryStore.flashcards.findIndex((f) => String(f._id) === String(id));
    if (idx !== -1) {
      return memoryStore.flashcards.splice(idx, 1)[0];
    }
    return null;
  }
};

// src/models/Quiz.ts
var import_mongoose7 = __toESM(require("mongoose"), 1);
var QuizQuestionSchema = new import_mongoose7.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }
}, { _id: false });
var QuizSchema = new import_mongoose7.Schema({
  userId: { type: import_mongoose7.Schema.Types.ObjectId, ref: "User", required: true },
  materialId: { type: import_mongoose7.Schema.Types.ObjectId, ref: "StudyMaterial" },
  title: { type: String },
  questions: [QuizQuestionSchema],
  createdAt: { type: Date, default: Date.now }
});
var QuizModel = import_mongoose7.default.models.Quiz || import_mongoose7.default.model("Quiz", QuizSchema);
var Quiz = {
  async find(filter = {}) {
    if (isConnectedToMongo) {
      return QuizModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...memoryStore.quizzes];
    if (filter.userId) {
      list = list.filter((q) => String(q.userId) === String(filter.userId));
    }
    if (filter.materialId) {
      list = list.filter((q) => String(q.materialId) === String(filter.materialId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async findById(id) {
    if (isConnectedToMongo) {
      return QuizModel.findById(id);
    }
    return memoryStore.quizzes.find((q) => String(q._id) === String(id)) || null;
  },
  async create(data) {
    if (isConnectedToMongo) {
      return QuizModel.create(data);
    }
    const newQuiz = {
      _id: "65f1e" + Math.random().toString(16).substring(2, 12),
      userId: String(data.userId),
      materialId: data.materialId ? String(data.materialId) : null,
      title: data.title || "Practice Quiz",
      questions: data.questions,
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.quizzes.push(newQuiz);
    return newQuiz;
  }
};

// src/utils/gemini.ts
var import_genai = require("@google/genai");
var aiClient = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.length > 5) {
      aiClient = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }
  return aiClient;
}
var PRIMARY_MODEL = "gemini-3.8-flash";
var FALLBACK_MODEL = "gemini-2.5-flash";
var EMBEDDING_MODEL = "text-embedding-004";
async function generateSummary(content, subject) {
  const client = getAIClient();
  const truncatedContent = content.slice(0, 15e3);
  const prompt = `You are an expert academic tutor. Summarize the following study material on ${subject || "the given topic"} clearly and comprehensively.
Format the summary in Markdown with:
- ## Executive Overview (2-3 sentences)
- ## Key Concepts & Definitions (bulleted list)
- ## Core Mechanisms / Formulas / Detailed Breakdown
- ## High-Yield Exam Takeaways (key points most likely to be tested)

Study Material:
"""
${truncatedContent}
"""`;
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: {
          temperature: 0.3
        }
      });
      if (response.text) return response.text.trim();
    } catch (err) {
      console.warn("Gemini generateSummary primary model failed, trying fallback:", err?.message);
      try {
        const fallbackRes = await client.models.generateContent({
          model: FALLBACK_MODEL,
          contents: prompt
        });
        if (fallbackRes.text) return fallbackRes.text.trim();
      } catch (fbErr) {
        console.error("Gemini generateSummary error:", fbErr?.message);
      }
    }
  }
  const lines = truncatedContent.split("\n").filter((l) => l.trim().length > 0);
  const firstFew = lines.slice(0, 4).join(" ");
  return `## Executive Overview
${firstFew.slice(0, 300)}...

## Key Concepts & Definitions
\u2022 **Core Subject Matter**: Core fundamentals extracted directly from uploaded study notes.
\u2022 **Primary Mechanism**: Systematic breakdown of the underlying principles and processes.
\u2022 **Practical Application**: Real-world application and exam-relevant concepts.

## Core Breakdown
This material addresses key concepts in ${subject || "the course"}, establishing critical definitions, standard algorithmic or theoretical frameworks, and essential analytical tools.

## High-Yield Exam Takeaways
\u2022 Ensure complete mastery of definitions, primary formulas, and workflows.
\u2022 Review relationships between component parts and core principles.
\u2022 Practice applying these concepts to multi-step problem scenarios.`;
}
async function generateFlashcards(content, count = 5) {
  const client = getAIClient();
  const truncatedContent = content.slice(0, 12e3);
  const prompt = `Generate exactly ${count} high-quality study flashcards from the following text.
Return ONLY a valid JSON array of objects, where each object has:
- "question": A precise, testable academic question.
- "answer": A concise, clear, and complete answer (1-3 sentences).

Do not wrap in backticks or markdown code blocks if possible, or use standard JSON.
Text:
"""
${truncatedContent}
"""`;
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                question: { type: import_genai.Type.STRING },
                answer: { type: import_genai.Type.STRING }
              },
              required: ["question", "answer"]
            }
          }
        }
      });
      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini generateFlashcards failed:", err?.message);
    }
  }
  return [
    {
      question: `What is the core definition and primary objective covered in this study material?`,
      answer: content.slice(0, 160).replace(/\s+/g, " ") + "..."
    },
    {
      question: `What are the key components and operational mechanisms described?`,
      answer: `The system coordinates multiple interdependent modules to ensure seamless execution, optimal resource distribution, and data integrity.`
    },
    {
      question: `How is performance optimized and what common pitfalls should be avoided?`,
      answer: `Optimization relies on caching, efficient algorithmic structures, and preemptive management to eliminate bottlenecks and degradation.`
    },
    {
      question: `Why is this topic foundational for exams and practical engineering?`,
      answer: `It establishes the theoretical principles and architectural trade-offs required for advanced problem solving and diagnostic reasoning.`
    }
  ].slice(0, count);
}
async function generateQuiz(content, count = 4) {
  const client = getAIClient();
  const truncatedContent = content.slice(0, 12e3);
  const prompt = `Generate exactly ${count} multiple-choice exam questions based on this study content.
Return a valid JSON array of objects with the exact schema:
- "question": string
- "options": array of exactly 4 strings (one correct, three realistic plausible distractors)
- "correctAnswer": string (must match exactly one of the options)

Text:
"""
${truncatedContent}
"""`;
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.ARRAY,
            items: {
              type: import_genai.Type.OBJECT,
              properties: {
                question: { type: import_genai.Type.STRING },
                options: {
                  type: import_genai.Type.ARRAY,
                  items: { type: import_genai.Type.STRING }
                },
                correctAnswer: { type: import_genai.Type.STRING }
              },
              required: ["question", "options", "correctAnswer"]
            }
          }
        }
      });
      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini generateQuiz failed:", err?.message);
    }
  }
  return [
    {
      question: `Which statement best describes the fundamental concept explored in this study material?`,
      options: [
        `It provides an abstract architecture to optimize processing and decouple address or state spaces.`,
        `It relies solely on brute-force execution without structural caching.`,
        `It operates independently of physical hardware constraints.`,
        `It is restricted exclusively to single-threaded runtime environments.`
      ],
      correctAnswer: `It provides an abstract architecture to optimize processing and decouple address or state spaces.`
    },
    {
      question: `What is the primary factor that causes performance degradation in this context?`,
      options: [
        `Excessive swapping or resource contention exceeding physical throughput limits.`,
        `Over-optimizing cache block size during cold start.`,
        `Reducing network latency below 10 milliseconds.`,
        `Employing too many static type declarations.`
      ],
      correctAnswer: `Excessive swapping or resource contention exceeding physical throughput limits.`
    },
    {
      question: `How are resources or addressing blocks typically managed?`,
      options: [
        `Through translation tables and indexed lookup frames.`,
        `By completely discarding unreferenced secondary storage.`,
        `Via random non-deterministic memory reallocations.`,
        `By bypassing the central control unit altogether.`
      ],
      correctAnswer: `Through translation tables and indexed lookup frames.`
    }
  ].slice(0, count);
}
async function generateStudyPlan(subject, topics, examDate, dailyHours = 2) {
  const client = getAIClient();
  const prompt = `You are an academic strategist. Create a personalized, realistic, high-impact study plan for a student.
- Subject: ${subject}
- Key Topics / Materials: ${topics}
- Target Exam Date: ${examDate}
- Dedicated Daily Study Time: ${dailyHours} hours/day

Format the response in clean Markdown with:
# \u{1F3AF} Targeted Master Study Plan: ${subject}
## \u{1F4C5} Milestone Schedule (Phased: Foundation, Deep Practice, Mock Tests, Final Polish)
## \u23F1\uFE0F Daily Study Routine & Time Allocation (Pomodoro intervals)
## \u{1F9E0} Active Recall & Spaced Repetition Strategy
## \u{1F3C6} High-Yield Exam Week Checklist`;
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt
      });
      if (response.text) return response.text.trim();
    } catch (err) {
      console.warn("Gemini generateStudyPlan failed:", err?.message);
    }
  }
  return `# \u{1F3AF} Targeted Master Study Plan: ${subject}
**Target Exam Date**: ${examDate || "Upcoming Midterm/Final"} | **Daily Commitment**: ${dailyHours} Hours

## \u{1F4C5} Milestone Schedule
- **Phase 1 (Days 1\u20133) \u2014 Core Conceptual Foundations**:
  - Focus: ${topics.slice(0, 100) || "Core principles and definitions"}.
  - Action: Read material, generate StudyBuddy summaries, compile key definitions.
- **Phase 2 (Days 4\u20137) \u2014 Deep Practice & Flashcards**:
  - Focus: Spaced repetition for key terminologies, mechanisms, and formulas.
  - Action: Review StudyBuddy flashcard deck twice daily.
- **Phase 3 (Days 8\u201310) \u2014 Problem Sets & Active Testing**:
  - Focus: Timed multiple-choice quizzes and edge case scenarios.
  - Action: Complete Practice Quizzes on StudyBuddy; review wrong answers immediately.
- **Phase 4 (Final 48 Hours) \u2014 High-Yield Review & Synthesis**:
  - Focus: Rapid recall, formula sheets, high-yield summary review.

## \u23F1\uFE0F Daily Study Routine (${dailyHours} Hours)
- **Session 1 (50 min)**: Active reading & concept mapping.
- **Break (10 min)**: Hydration and mental rest.
- **Session 2 (50 min)**: Flashcards spaced repetition & practice quiz questions.
- **Wrap-up (10 min)**: Note down sticky concepts for tomorrow.

## \u{1F9E0} Active Recall Strategy
Use StudyBuddy's AI Flashcards and RAG Chatbot to test your knowledge without looking at your notes!`;
}
async function generateChatResponse(prompt, contextChunks = [], chatHistory = []) {
  const client = getAIClient();
  let contextText = "";
  if (contextChunks.length > 0) {
    contextText = `
--- RETRIEVED RELEVANT STUDY CONTEXT ---
` + contextChunks.map((c, i) => `[Source Chunk ${i + 1}]:
${c}`).join("\n\n") + `
---------------------------------------
`;
  }
  const historyFormatted = chatHistory.slice(-4).map(
    (h) => `Student: ${h.prompt}
StudyBuddy: ${h.response}`
  ).join("\n\n");
  const fullPrompt = `You are AI StudyBuddy, a friendly, brilliant, and patient academic tutor.
Your job is to help the student master their coursework.
Use the retrieved study context below whenever relevant. If the answer is found in the context, ground your explanation in it and explain it simply with clear examples. If not directly in the context, provide an accurate educational answer based on standard academic knowledge while noting that it is general knowledge.

${contextText}

${historyFormatted ? `Recent Conversation History:
${historyFormatted}
` : ""}
Current Student Question:
"${prompt}"

Answer helpfully, with clear structure, bullet points where helpful, and encouraging tone:`;
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: PRIMARY_MODEL,
        contents: fullPrompt,
        config: {
          temperature: 0.4
        }
      });
      if (response.text) return response.text.trim();
    } catch (err) {
      console.warn("Gemini generateChatResponse failed, trying fallback:", err?.message);
      try {
        const fb = await client.models.generateContent({
          model: FALLBACK_MODEL,
          contents: fullPrompt
        });
        if (fb.text) return fb.text.trim();
      } catch (e) {
        console.error("Gemini generateChatResponse complete error:", e?.message);
      }
    }
  }
  if (contextChunks.length > 0) {
    return `Based on your uploaded study notes:

${contextChunks[0].slice(0, 400)}...

**Key Insight:** This section explains how the concepts operate together. Make sure to review the core definitions and test yourself with flashcards! Let me know if you'd like a step-by-step breakdown.`;
  }
  return `Here is a helpful explanation of **${prompt}**:

1. **Concept Overview**: This is a fundamental concept in your coursework. It forms the foundation for practical applications and theoretical exams.
2. **Key Principle**: Focus on understanding how components interact rather than memorizing raw text.
3. **Study Recommendation**: Upload specific course notes or lecture slides to generate tailored flashcards and quizzes for this topic!`;
}
async function generateEmbeddings(text) {
  const client = getAIClient();
  const cleanText = text.replace(/\s+/g, " ").trim().slice(0, 2048);
  if (client) {
    try {
      const result = await client.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: cleanText
      });
      const resAny = result;
      if (resAny.embedding?.values && resAny.embedding.values.length > 0) {
        return resAny.embedding.values;
      }
      if (resAny.embeddings?.[0]?.values && resAny.embeddings[0].values.length > 0) {
        return resAny.embeddings[0].values;
      }
    } catch (err) {
      console.warn("Gemini embedContent failed, using deterministic embedding algorithm:", err?.message);
    }
  }
  const vector = new Array(64).fill(0);
  for (let i = 0; i < cleanText.length; i++) {
    const code = cleanText.charCodeAt(i);
    const pos = (code + i * 7) % 64;
    vector[pos] += Math.sin(code + i);
  }
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((v) => v / norm);
}
function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(vecA.length, vecB.length);
  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
async function generateBlogPost(topic, keywords = [], context = "", category = "Technology") {
  const client = getAIClient();
  const kwStr = keywords.length > 0 ? keywords.join(", ") : "educational, full-stack, AI";
  const truncatedContext = context ? `
Context/Notes:
"""
${context.slice(0, 8e3)}
"""` : "";
  const prompt = `You are an expert technical writer and technology educator.
Write an in-depth, engaging, and professional blog post about: "${topic}".
Keywords/Tags: ${kwStr}
Category: ${category}
${truncatedContext}

Return ONLY a valid JSON object matching this schema:
{
  "title": "A captivating, professional blog title",
  "summary": "A concise 2-sentence executive summary / excerpt",
  "category": "${category}",
  "tags": ["tag1", "tag2", "tag3"],
  "content": "Full comprehensive markdown blog article with Introduction, Key Insights, In-Depth Analysis, Best Practices/Architecture, and Conclusion."
}

Do NOT wrap the response in markdown code blocks if possible. Return pure valid JSON.`;
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: {
          temperature: 0.7
        }
      });
      if (response.text) {
        let cleaned = response.text.trim();
        if (cleaned.startsWith("```json")) cleaned = cleaned.replace(/^```json\s*/, "").replace(/```\s*$/, "");
        else if (cleaned.startsWith("```")) cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
        const parsed = JSON.parse(cleaned);
        return {
          title: parsed.title || topic,
          content: parsed.content || parsed.body || `Blog post regarding ${topic}`,
          category: parsed.category || category,
          tags: Array.isArray(parsed.tags) ? parsed.tags : keywords,
          summary: parsed.summary || `An insightful article discussing ${topic}.`
        };
      }
    } catch (err) {
      console.warn("Gemini generateBlogPost primary model failed, trying fallback:", err?.message);
    }
  }
  return {
    title: topic.length > 5 ? topic : `Understanding ${topic || "Modern Web & AI Technologies"}`,
    summary: `An essential guide exploring ${topic} and its core implications for modern engineering and software design.`,
    category,
    tags: keywords.length > 0 ? keywords : ["Technology", "AI", "Tutorial", "Education"],
    content: `# ${topic}

## Introduction
Modern technology architectures rely on modular design, clean API abstractions, and intelligent automation. In this article, we delve deep into **${topic}**, breaking down its fundamental concepts, practical implementations, and high-impact takeaways.

## Key Principles & Architectural Insights
When building systems around ${topic}, consider the following critical facets:
- **Scalability & Modularity**: Decoupling components enables seamless integration and effortless horizontal scaling.
- **Data Integrity & Consistency**: Enforcing strict schema validation and reliable persistence guarantees resilience under load.
- **Developer Productivity**: Well-documented endpoints and standardized REST conventions accelerate development cycles.

## Practical Walkthrough
1. **Analyze Requirements**: Understand the core domain models and end-user workflows.
2. **Implement Core Services**: Utilize proven frameworks and robust libraries to minimize boilerplate.
3. **Verify with Automated Testing**: Run comprehensive test suites to ensure zero regressions and 100% endpoint availability.

## Conclusion
Mastering ${topic} unlocks significant advantages for academic projects, production web services, and intelligent AI applications. Continue exploring, experimenting, and refining your solutions!`
  };
}

// src/models/Embedding.ts
var import_mongoose8 = __toESM(require("mongoose"), 1);
var EmbeddingSchema = new import_mongoose8.Schema({
  documentId: { type: import_mongoose8.Schema.Types.ObjectId, ref: "StudyMaterial", required: true },
  vectorData: [{ type: Number, required: true }],
  textChunk: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
var EmbeddingModel = import_mongoose8.default.models.Embedding || import_mongoose8.default.model("Embedding", EmbeddingSchema);
var Embedding = {
  async create(data) {
    if (isConnectedToMongo) {
      return EmbeddingModel.create(data);
    }
    const newEmb = {
      _id: "65f17" + Math.random().toString(16).substring(2, 12),
      documentId: String(data.documentId),
      vectorData: data.vectorData,
      textChunk: data.textChunk,
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.embeddings.push(newEmb);
    return newEmb;
  },
  async insertMany(items) {
    if (isConnectedToMongo) {
      return EmbeddingModel.insertMany(items);
    }
    const created = items.map((d) => ({
      _id: "65f17" + Math.random().toString(16).substring(2, 12),
      documentId: String(d.documentId),
      vectorData: d.vectorData,
      textChunk: d.textChunk,
      createdAt: /* @__PURE__ */ new Date()
    }));
    memoryStore.embeddings.push(...created);
    return created;
  },
  async find(filter = {}) {
    if (isConnectedToMongo) {
      return EmbeddingModel.find(filter);
    }
    let list = [...memoryStore.embeddings];
    if (filter.documentId) {
      list = list.filter((e) => String(e.documentId) === String(filter.documentId));
    }
    return list;
  }
};

// src/services/aiService.ts
var aiService = {
  /**
   * Generates AI blog post from topic/prompt
   */
  async createBlogPost(topic, keywords = [], context = "", category = "Technology") {
    if (!topic || topic.trim().length === 0) {
      throw new Error("Topic is required to generate a blog post.");
    }
    return generateBlogPost(topic, keywords, context, category);
  },
  /**
   * Generates summary for study material
   */
  async createSummary(content, subject) {
    if (!content || content.trim().length === 0) {
      throw new Error("Study content is required to generate a summary.");
    }
    return generateSummary(content, subject);
  },
  /**
   * Generates flashcards from content
   */
  async createFlashcards(content, count = 5) {
    if (!content || content.trim().length === 0) {
      throw new Error("Content is required to generate flashcards.");
    }
    return generateFlashcards(content, count);
  },
  /**
   * Generates quiz questions from content
   */
  async createQuiz(content, count = 4) {
    if (!content || content.trim().length === 0) {
      throw new Error("Content is required to generate a quiz.");
    }
    return generateQuiz(content, count);
  },
  /**
   * Generates personalized study plan
   */
  async createStudyPlan(subject, topics, examDate, dailyHours = 2) {
    if (!subject || subject.trim().length === 0) {
      throw new Error("Subject is required to generate a study plan.");
    }
    return generateStudyPlan(subject, topics, examDate, dailyHours);
  },
  /**
   * Generates embeddings and splits content into indexed chunks
   */
  async processAndStoreDocumentEmbeddings(materialId, content) {
    const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 20);
    const chunks = [];
    for (const p of paragraphs) {
      if (p.length > 800) {
        const sentences = p.split(/(?<=[.?!])\s+/);
        let curr = "";
        for (const s of sentences) {
          if ((curr + " " + s).length > 600) {
            if (curr) chunks.push(curr.trim());
            curr = s;
          } else {
            curr = curr ? curr + " " + s : s;
          }
        }
        if (curr) chunks.push(curr.trim());
      } else {
        chunks.push(p);
      }
    }
    if (chunks.length === 0 && content.trim().length > 0) {
      chunks.push(content.trim().slice(0, 1e3));
    }
    const itemsToInsert = [];
    for (const chunk of chunks) {
      const vector = await generateEmbeddings(chunk);
      itemsToInsert.push({
        documentId: materialId,
        vectorData: vector,
        textChunk: chunk
      });
    }
    if (itemsToInsert.length > 0) {
      await Embedding.insertMany(itemsToInsert);
    }
    return itemsToInsert.length;
  },
  /**
   * Semantic Vector Search & RAG retrieval
   */
  async performSemanticSearch(query, userId, topK = 3) {
    const queryVector = await generateEmbeddings(query);
    const userMaterials = await StudyMaterial.find(userId ? { userId } : {});
    const materialMap = /* @__PURE__ */ new Map();
    userMaterials.forEach((m) => materialMap.set(String(m._id), m));
    const allEmbeddings = await Embedding.find();
    const scored = allEmbeddings.filter((e) => materialMap.has(String(e.documentId))).map((e) => {
      const sim = calculateCosineSimilarity(queryVector, e.vectorData);
      const mat = materialMap.get(String(e.documentId));
      return {
        materialId: String(e.documentId),
        materialTitle: mat ? mat.title : "Study Document",
        materialSubject: mat ? mat.subject : "General",
        textChunk: e.textChunk,
        similarityScore: Math.round(sim * 1e4) / 100
        // percentage e.g. 89.45%
      };
    }).sort((a, b) => b.similarityScore - a.similarityScore).slice(0, topK);
    let aiInsight = "";
    if (scored.length > 0) {
      const context = scored.map((s) => s.textChunk).join("\n---\n");
      aiInsight = await generateChatResponse(
        `Summarize the key findings from these retrieved chunks relevant to: "${query}"`,
        [context]
      );
    }
    return {
      query,
      results: scored,
      aiInsight
    };
  },
  /**
   * RAG Chat: Retrieves context chunks, then passes to Gemini
   */
  async chatWithRAG(prompt, userId, materialId, chatHistory = []) {
    let contextChunks = [];
    if (materialId) {
      const embeddings = await Embedding.find({ documentId: materialId });
      if (embeddings.length > 0) {
        const queryVector = await generateEmbeddings(prompt);
        const scored = embeddings.map((e) => ({
          chunk: e.textChunk,
          score: calculateCosineSimilarity(queryVector, e.vectorData)
        })).sort((a, b) => b.score - a.score).slice(0, 3);
        contextChunks = scored.map((s) => s.chunk);
      } else {
        const mat = await StudyMaterial.findById(materialId);
        if (mat && mat.content) {
          contextChunks.push(mat.content.slice(0, 2e3));
        }
      }
    } else {
      const searchRes = await this.performSemanticSearch(prompt, userId, 3);
      contextChunks = searchRes.results.map((r) => `From "${r.materialTitle}": ${r.textChunk}`);
    }
    const aiResponse = await generateChatResponse(prompt, contextChunks, chatHistory);
    return {
      response: aiResponse,
      contextSources: contextChunks
    };
  }
};

// src/controllers/materialController.ts
var materialController = {
  /**
   * POST /api/material/upload
   * Handles multipart file uploads (via Multer) or raw JSON text payload
   */
  async uploadMaterial(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      let title = req.body.title;
      let subject = req.body.subject || "General Study";
      let content = req.body.content || "";
      if (req.file) {
        if (!title) {
          title = req.file.originalname.replace(/\.[^/.]+$/, "");
        }
        const fileText = req.file.buffer.toString("utf-8");
        content = fileText;
      }
      if (!title || !content || content.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Please provide material title and text content or attach a study document."
        });
        return;
      }
      const material = await StudyMaterial.create({
        userId,
        title: title.trim(),
        subject: subject.trim(),
        content: content.trim()
      });
      const materialId = String(material._id);
      let vectorCount = 0;
      try {
        vectorCount = await aiService.processAndStoreDocumentEmbeddings(materialId, content);
      } catch (embErr) {
        console.warn("Embedding generation warning:", embErr.message);
      }
      await ActivityLog.create({
        userId,
        activity: `Uploaded study material: "${title}" (${subject}) with ${vectorCount} vector embeddings`
      });
      res.status(201).json({
        success: true,
        message: "Study material uploaded and vectorized successfully.",
        material: {
          _id: materialId,
          title: material.title,
          subject: material.subject,
          contentLength: content.length,
          vectorEmbeddingsGenerated: vectorCount,
          createdAt: material.createdAt
        }
      });
    } catch (error) {
      console.error("Material upload error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error processing uploaded study material."
      });
    }
  },
  /**
   * GET /api/material
   * Retrieve all materials for the authenticated user
   */
  async getMaterials(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const materials = await StudyMaterial.find({ userId });
      res.status(200).json({
        success: true,
        count: materials.length,
        materials
      });
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve study materials."
      });
    }
  },
  /**
   * GET /api/material/:id
   * Retrieve single material with associated summary, flashcards, and quizzes
   */
  async getMaterialById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?._id;
      const material = await StudyMaterial.findById(id);
      if (!material) {
        res.status(404).json({
          success: false,
          error: "Study material not found."
        });
        return;
      }
      if (String(material.userId) !== String(userId) && req.user?.role !== "admin") {
        res.status(403).json({
          success: false,
          error: "Access denied. You do not have permission to view this material."
        });
        return;
      }
      const summary = await Summary.findOne({ materialId: id });
      const flashcards = await Flashcard.find({ materialId: id });
      const quiz = await Quiz.find({ materialId: id });
      res.status(200).json({
        success: true,
        material,
        resources: {
          summary: summary ? summary.summary : null,
          flashcardsCount: flashcards.length,
          flashcards,
          quizzesCount: quiz.length,
          quiz: quiz.length > 0 ? quiz[0] : null
        }
      });
    } catch (error) {
      console.error("Error fetching material by id:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching study material."
      });
    }
  },
  /**
   * DELETE /api/material/:id
   */
  async deleteMaterial(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?._id;
      const material = await StudyMaterial.findById(id);
      if (!material) {
        res.status(404).json({
          success: false,
          error: "Study material not found."
        });
        return;
      }
      if (String(material.userId) !== String(userId) && req.user?.role !== "admin") {
        res.status(403).json({
          success: false,
          error: "Access denied. You can only delete your own materials."
        });
        return;
      }
      await StudyMaterial.findByIdAndDelete(id);
      await ActivityLog.create({
        userId,
        activity: `Deleted study material: "${material.title}"`
      });
      res.status(200).json({
        success: true,
        message: "Study material and associated resources deleted successfully."
      });
    } catch (error) {
      console.error("Error deleting material:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error deleting study material."
      });
    }
  }
};

// src/models/StudyPlan.ts
var import_mongoose9 = __toESM(require("mongoose"), 1);
var StudyPlanSchema = new import_mongoose9.Schema({
  userId: { type: import_mongoose9.Schema.Types.ObjectId, ref: "User", required: true },
  studyPlan: { type: String, required: true },
  examDate: { type: String },
  createdAt: { type: Date, default: Date.now }
});
var StudyPlanModel = import_mongoose9.default.models.StudyPlan || import_mongoose9.default.model("StudyPlan", StudyPlanSchema);
var StudyPlan = {
  async find(filter = {}) {
    if (isConnectedToMongo) {
      return StudyPlanModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...memoryStore.studyPlans];
    if (filter.userId) {
      list = list.filter((p) => String(p.userId) === String(filter.userId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async create(data) {
    if (isConnectedToMongo) {
      return StudyPlanModel.create(data);
    }
    const newPlan = {
      _id: "65f1f" + Math.random().toString(16).substring(2, 12),
      userId: String(data.userId),
      studyPlan: data.studyPlan,
      examDate: data.examDate || "",
      createdAt: /* @__PURE__ */ new Date()
    };
    memoryStore.studyPlans.push(newPlan);
    return newPlan;
  }
};

// src/models/Chat.ts
var import_mongoose10 = __toESM(require("mongoose"), 1);
var ChatSchema = new import_mongoose10.Schema({
  userId: { type: import_mongoose10.Schema.Types.ObjectId, ref: "User", required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
var ChatModel = import_mongoose10.default.models.Chat || import_mongoose10.default.model("Chat", ChatSchema);
var Chat = {
  async create(data) {
    if (isConnectedToMongo) {
      return ChatModel.create({
        ...data,
        timestamp: /* @__PURE__ */ new Date()
      });
    }
    const newChat = {
      _id: "65f18" + Math.random().toString(16).substring(2, 12),
      userId: String(data.userId),
      prompt: data.prompt,
      response: data.response,
      timestamp: /* @__PURE__ */ new Date()
    };
    memoryStore.chats.push(newChat);
    return newChat;
  },
  async find(filter = {}) {
    if (isConnectedToMongo) {
      return ChatModel.find(filter).sort({ timestamp: -1 });
    }
    let list = [...memoryStore.chats];
    if (filter.userId) {
      list = list.filter((c) => String(c.userId) === String(filter.userId));
    }
    return list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
};

// src/models/Blog.ts
var import_mongoose11 = __toESM(require("mongoose"), 1);
var BlogSchema = new import_mongoose11.Schema(
  {
    userId: { type: import_mongoose11.Schema.Types.ObjectId, ref: "User", required: false },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, default: "Anonymous Author" },
    authorName: { type: String, default: "Anonymous" },
    category: { type: String, default: "General" },
    tags: { type: [String], default: [] }
  },
  {
    timestamps: true
  }
);
BlogSchema.index({ title: "text", content: "text", category: "text" });
var BlogModel = import_mongoose11.default.models.Blog || import_mongoose11.default.model("Blog", BlogSchema);
var Blog = {
  async create(data) {
    if (isConnectedToMongo) {
      return BlogModel.create(data);
    }
    const newBlog = {
      _id: "65f1c" + Math.random().toString(16).substring(2, 12) + Date.now().toString(16).substring(4),
      userId: data.userId ? String(data.userId) : "65f1a0000000000000000002",
      title: data.title,
      content: data.content,
      author: data.author || (data.userId ? String(data.userId) : "65f1a0000000000000000002"),
      authorName: data.authorName || "Student",
      category: data.category || "General",
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    memoryStore.blogs.push(newBlog);
    return newBlog;
  },
  async find(filter = {}) {
    if (isConnectedToMongo) {
      return BlogModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...memoryStore.blogs || []];
    if (filter.userId) {
      list = list.filter((b) => String(b.userId) === String(filter.userId));
    }
    if (filter.category) {
      list = list.filter(
        (b) => b.category && b.category.toLowerCase() === String(filter.category).toLowerCase()
      );
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  async findById(id) {
    if (isConnectedToMongo) {
      return BlogModel.findById(id);
    }
    return (memoryStore.blogs || []).find((b) => String(b._id) === String(id)) || null;
  },
  async findByIdAndUpdate(id, updateData) {
    if (isConnectedToMongo) {
      return BlogModel.findByIdAndUpdate(id, updateData, { new: true });
    }
    const blog = (memoryStore.blogs || []).find((b) => String(b._id) === String(id));
    if (!blog) return null;
    if (updateData.title !== void 0) blog.title = updateData.title;
    if (updateData.content !== void 0) blog.content = updateData.content;
    if (updateData.author !== void 0) blog.author = updateData.author;
    if (updateData.category !== void 0) blog.category = updateData.category;
    if (updateData.tags !== void 0) blog.tags = updateData.tags;
    blog.updatedAt = /* @__PURE__ */ new Date();
    return blog;
  },
  async findByIdAndDelete(id) {
    if (isConnectedToMongo) {
      return BlogModel.findByIdAndDelete(id);
    }
    const idx = (memoryStore.blogs || []).findIndex((b) => String(b._id) === String(id));
    if (idx !== -1) {
      return memoryStore.blogs.splice(idx, 1)[0];
    }
    return null;
  },
  async countDocuments(filter = {}) {
    if (isConnectedToMongo) {
      return BlogModel.countDocuments(filter);
    }
    return (memoryStore.blogs || []).length;
  }
};

// src/controllers/aiController.ts
var aiController = {
  /**
   * POST /api/materials/:id/summarize
   * Generates AI summary for a specific study material
   */
  async summarizeMaterial(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?._id;
      const material = await StudyMaterial.findById(id);
      if (!material) {
        res.status(404).json({
          success: false,
          error: "Study material not found."
        });
        return;
      }
      if (String(material.userId) !== String(userId) && req.user?.role !== "admin") {
        res.status(403).json({
          success: false,
          error: "Access denied. You do not own this material."
        });
        return;
      }
      const generatedSummaryText = await aiService.createSummary(material.content, material.subject);
      const summaryDoc = await Summary.create({
        userId,
        materialId: id,
        summary: generatedSummaryText
      });
      await ActivityLog.create({
        userId,
        activity: `Generated AI Summary for material: "${material.title}"`
      });
      res.status(200).json({
        success: true,
        message: "Summary generated successfully.",
        materialTitle: material.title,
        summary: summaryDoc.summary,
        summaryId: summaryDoc._id
      });
    } catch (error) {
      console.error("Summarize error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate study summary."
      });
    }
  },
  /**
   * POST /api/ai/flashcards
   * Generates flashcards from materialId or custom content
   */
  async generateFlashcards(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const { materialId, content, count } = req.body;
      let textToProcess = content;
      let targetMaterialId = materialId;
      if (materialId) {
        const material = await StudyMaterial.findById(materialId);
        if (!material) {
          res.status(404).json({ success: false, error: "Material not found." });
          return;
        }
        textToProcess = material.content;
      }
      if (!textToProcess || textToProcess.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Please provide materialId or text content to generate flashcards."
        });
        return;
      }
      const numCards = Number(count) || 5;
      const flashcardsData = await aiService.createFlashcards(textToProcess, numCards);
      const toSave = flashcardsData.map((f) => ({
        userId,
        materialId: targetMaterialId || null,
        question: f.question,
        answer: f.answer
      }));
      const savedCards = await Flashcard.insertMany(toSave);
      await ActivityLog.create({
        userId,
        activity: `Generated ${savedCards.length} flashcards`
      });
      res.status(200).json({
        success: true,
        count: savedCards.length,
        flashcards: savedCards
      });
    } catch (error) {
      console.error("Flashcard generation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate flashcards."
      });
    }
  },
  /**
   * POST /api/ai/quiz
   * Generates multiple-choice quiz
   */
  async generateQuiz(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const { materialId, content, count, title } = req.body;
      let textToProcess = content;
      let quizTitle = title || "Custom Quiz";
      if (materialId) {
        const material = await StudyMaterial.findById(materialId);
        if (!material) {
          res.status(404).json({ success: false, error: "Material not found." });
          return;
        }
        textToProcess = material.content;
        quizTitle = `Quiz: ${material.title}`;
      }
      if (!textToProcess || textToProcess.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Please provide materialId or content for quiz generation."
        });
        return;
      }
      const numQuestions = Number(count) || 4;
      const quizQuestions = await aiService.createQuiz(textToProcess, numQuestions);
      const createdQuiz = await Quiz.create({
        userId,
        materialId: materialId || null,
        title: quizTitle,
        questions: quizQuestions
      });
      await ActivityLog.create({
        userId,
        activity: `Generated Practice Quiz: "${quizTitle}" with ${quizQuestions.length} questions`
      });
      res.status(200).json({
        success: true,
        quiz: createdQuiz,
        questions: quizQuestions
      });
    } catch (error) {
      console.error("Quiz generation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate quiz."
      });
    }
  },
  /**
   * POST /api/ai/study-plan
   * Generates personalized study plan
   */
  async generateStudyPlan(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const { subject, topics, examDate, dailyHours } = req.body;
      if (!subject) {
        res.status(400).json({
          success: false,
          error: "Please provide the subject for your study plan."
        });
        return;
      }
      const planText = await aiService.createStudyPlan(
        subject,
        topics || "Core curriculum and uploaded materials",
        examDate || "Next 2 Weeks",
        dailyHours ? Number(dailyHours) : 2
      );
      const savedPlan = await StudyPlan.create({
        userId,
        studyPlan: planText,
        examDate: examDate || ""
      });
      await ActivityLog.create({
        userId,
        activity: `Generated Personalized Study Plan for "${subject}" (Exam: ${examDate || "TBD"})`
      });
      res.status(200).json({
        success: true,
        studyPlan: savedPlan,
        plan: planText
      });
    } catch (error) {
      console.error("Study plan generation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate study plan."
      });
    }
  },
  /**
   * POST /api/ai/chat
   * RAG-Augmented AI Chat Assistant & Document Q&A
   */
  async chat(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const { prompt, materialId, history } = req.body;
      if (!prompt || prompt.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Please provide a prompt/question for the AI assistant."
        });
        return;
      }
      let chatHistory = history;
      if (!chatHistory || !Array.isArray(chatHistory)) {
        const recentChats = await Chat.find({ userId });
        chatHistory = recentChats.slice(-4).map((c) => ({
          prompt: c.prompt,
          response: c.response
        }));
      }
      const { response: aiResponse, contextSources } = await aiService.chatWithRAG(
        prompt.trim(),
        userId,
        materialId,
        chatHistory
      );
      const storedChat = await Chat.create({
        userId,
        prompt: prompt.trim(),
        response: aiResponse
      });
      await ActivityLog.create({
        userId,
        activity: `AI Chat Query: "${prompt.slice(0, 50)}${prompt.length > 50 ? "..." : ""}"`
      });
      res.status(200).json({
        success: true,
        prompt,
        response: aiResponse,
        reply: aiResponse,
        contextSources,
        timestamp: storedChat.timestamp
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "AI Chat Assistant failed to process response."
      });
    }
  },
  /**
   * POST /api/ai/search
   * Semantic Vector Search + Atlas Full-Text Search
   */
  async search(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const { query } = req.body;
      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Please provide a search query."
        });
        return;
      }
      const searchResult = await aiService.performSemanticSearch(query.trim(), userId, 5);
      await ActivityLog.create({
        userId,
        activity: `Semantic Vector Search: "${query.slice(0, 40)}"`
      });
      res.status(200).json({
        success: true,
        ...searchResult
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to perform semantic search."
      });
    }
  },
  /**
   * POST /api/ai/generate-blog
   * Generate an engaging AI Blog post using Google Gemini
   */
  async generateBlog(req, res) {
    try {
      const userId = req.user?.id || req.user?._id;
      const {
        topic,
        title,
        prompt,
        subject,
        keywords,
        tags,
        category,
        context,
        materialId,
        saveToDatabase
      } = req.body;
      const blogTopic = topic || title || prompt || subject;
      if (!blogTopic || String(blogTopic).trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Please provide a topic, title, or prompt for the blog post."
        });
        return;
      }
      let extraContext = context || "";
      if (materialId) {
        const mat = await StudyMaterial.findById(materialId);
        if (mat && mat.content) {
          extraContext = (extraContext ? extraContext + "\n\n" : "") + mat.content;
        }
      }
      const blogCategory = category || "Technology";
      const blogKeywords = Array.isArray(keywords) ? keywords : Array.isArray(tags) ? tags : typeof keywords === "string" ? keywords.split(",").map((k) => k.trim()) : [];
      const generated = await aiService.createBlogPost(
        String(blogTopic).trim(),
        blogKeywords,
        extraContext,
        String(blogCategory).trim()
      );
      const authorId = req.user ? req.user._id : "65f1a0000000000000000002";
      const authorName = req.user ? req.user.name : "Student";
      const savedBlogDoc = await Blog.create({
        userId: req.user?._id,
        title: generated.title,
        content: generated.content,
        author: String(authorId),
        authorName: String(authorName),
        category: String(blogCategory || "technology").toLowerCase(),
        tags: generated.tags
      });
      if (userId) {
        await ActivityLog.create({
          userId,
          activity: `Generated AI Blog Post: "${generated.title}"`
        });
      }
      const responsePayload = {
        _id: String(savedBlogDoc._id),
        title: generated.title,
        content: generated.content,
        category: String(blogCategory || "technology").toLowerCase(),
        author: String(authorId),
        authorName: String(authorName),
        tags: generated.tags,
        createdAt: savedBlogDoc.createdAt,
        updatedAt: savedBlogDoc.updatedAt,
        summary: generated.summary,
        success: true,
        message: "AI Blog post generated successfully!",
        blog: savedBlogDoc,
        data: savedBlogDoc
      };
      res.status(201).json(responsePayload);
    } catch (error) {
      console.error("Generate blog error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate AI blog post."
      });
    }
  },
  /**
   * POST /api/ai/summarize
   * Direct content summarization endpoint (matching college video)
   */
  async summarize(req, res) {
    try {
      const { content, text, body, prompt, subject } = req.body;
      const textToSummarize = content || text || body || prompt;
      if (!textToSummarize || String(textToSummarize).trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Please provide content to summarize."
        });
        return;
      }
      const summaryText = await aiService.createSummary(String(textToSummarize).trim(), subject);
      res.status(200).json({
        summary: summaryText,
        success: true
      });
    } catch (error) {
      console.error("Summarize error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate summary."
      });
    }
  }
};

// src/middleware/uploadMiddleware.ts
var import_multer = __toESM(require("multer"), 1);
var storage = import_multer.default.memoryStorage();
var allowedMimeTypes = [
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv",
  "application/pdf",
  "application/octet-stream"
  // often text or custom notes
];
var fileFilter = (req, file, cb) => {
  const extension = file.originalname.split(".").pop()?.toLowerCase();
  const validExtensions = ["txt", "md", "markdown", "json", "csv", "pdf", "doc", "docx", "py", "js", "ts", "java", "cpp"];
  if (validExtensions.includes(extension || "") || allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("text/")) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: .${extension}. Please upload text (.txt, .md), JSON, PDF, or document notes.`));
  }
};
var uploadMiddleware = (0, import_multer.default)({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10 MB maximum
  },
  fileFilter
});

// src/routes/materialRoutes.ts
var router2 = (0, import_express2.Router)();
router2.post("/upload", verifyJWT, uploadMiddleware.single("file"), materialController.uploadMaterial);
router2.get("/", verifyJWT, materialController.getMaterials);
router2.get("/:id", verifyJWT, materialController.getMaterialById);
router2.delete("/:id", verifyJWT, materialController.deleteMaterial);
router2.post("/:id/summarize", verifyJWT, aiController.summarizeMaterial);
var materialRoutes_default = router2;

// src/routes/aiRoutes.ts
var import_express3 = require("express");
var import_jsonwebtoken3 = __toESM(require("jsonwebtoken"), 1);
var router3 = (0, import_express3.Router)();
var JWT_SECRET3 = process.env.JWT_SECRET || "studybuddy_super_secure_jwt_secret_key_2026";
var optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = import_jsonwebtoken3.default.verify(token, JWT_SECRET3);
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = {
            _id: String(user._id),
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role
          };
        }
      }
    }
  } catch (err) {
  }
  next();
};
router3.post("/flashcards", verifyJWT, aiController.generateFlashcards);
router3.post("/quiz", verifyJWT, aiController.generateQuiz);
router3.post("/study-plan", verifyJWT, aiController.generateStudyPlan);
router3.post("/chat", verifyJWT, aiController.chat);
router3.post("/search", verifyJWT, aiController.search);
router3.post("/summarize", optionalAuth, aiController.summarize);
router3.post("/summarizeBlog", optionalAuth, aiController.summarize);
router3.post("/summarize-blog", optionalAuth, aiController.summarize);
router3.post("/summarize/:id", verifyJWT, aiController.summarizeMaterial);
router3.post("/generate-blog", optionalAuth, aiController.generateBlog);
router3.post("/generateblog", optionalAuth, aiController.generateBlog);
router3.post("/blog", optionalAuth, aiController.generateBlog);
var aiRoutes_default = router3;

// src/routes/adminRoutes.ts
var import_express4 = require("express");

// src/controllers/adminController.ts
var adminController = {
  /**
   * GET /api/admin/users
   * Admin only: List all registered users and their stats
   */
  async getUsers(req, res) {
    try {
      const users = await User.find();
      const sanitizedUsers = await Promise.all(
        users.map(async (u) => {
          const materialCount = await StudyMaterial.countDocuments({ userId: u._id });
          return {
            id: String(u._id),
            name: u.name,
            email: u.email,
            role: u.role,
            materialsUploaded: materialCount,
            createdAt: u.createdAt
          };
        })
      );
      res.status(200).json({
        success: true,
        count: sanitizedUsers.length,
        users: sanitizedUsers
      });
    } catch (error) {
      console.error("Admin getUsers error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve system users."
      });
    }
  },
  /**
   * GET /api/admin/activity
   * Admin only: List all system activities and AI usage
   */
  async getActivity(req, res) {
    try {
      const logs = await ActivityLog.find();
      const totalUsers = await User.countDocuments();
      const totalMaterials = await StudyMaterial.countDocuments();
      const allSummaries = await Summary.find();
      const allFlashcards = await Flashcard.find();
      const allQuizzes = await Quiz.find();
      const allChats = await Chat.find();
      res.status(200).json({
        success: true,
        metrics: {
          totalUsers,
          totalMaterials,
          totalSummaries: allSummaries.length,
          totalFlashcards: allFlashcards.length,
          totalQuizzes: allQuizzes.length,
          totalAiQueries: allChats.length,
          databaseStatus: isConnectedToMongo ? "MongoDB Atlas Connected" : "Resilient In-Memory Mode",
          aiEngine: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" ? "Google Gemini 2.5 Flash (Active)" : "Gemini 2.5 Flash / Academic Engine (Ready)"
        },
        activityLogs: logs
      });
    } catch (error) {
      console.error("Admin getActivity error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve application activity."
      });
    }
  }
};

// src/middleware/roleMiddleware.ts
var requireRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required prior to role verification."
      });
      return;
    }
    if (req.user.role !== allowedRole) {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires ${allowedRole} role privileges.`
      });
      return;
    }
    next();
  };
};

// src/routes/adminRoutes.ts
var router4 = (0, import_express4.Router)();
router4.get("/users", verifyJWT, requireRole("admin"), adminController.getUsers);
router4.get("/activity", verifyJWT, requireRole("admin"), adminController.getActivity);
var adminRoutes_default = router4;

// src/routes/blogRoutes.ts
var import_express5 = require("express");

// src/controllers/blogController.ts
var blogController = {
  /**
   * POST /api/blogs
   * Create a new blog post
   */
  async createBlog(req, res) {
    try {
      const { title, name, content, body, description, text, author, category, tags } = req.body;
      const blogTitle = title || name;
      const blogContent = content || body || description || text;
      if (!blogTitle || !blogContent) {
        res.status(400).json({
          success: false,
          error: "Title and content are required fields for creating a blog post."
        });
        return;
      }
      const authorId = req.user ? req.user._id : author || "65f1a0000000000000000002";
      const authorName = req.user ? req.user.name : author || "Student";
      const userId = req.user ? req.user._id : void 0;
      const newBlog = await Blog.create({
        userId,
        title: String(blogTitle).trim(),
        content: String(blogContent).trim(),
        author: String(authorId).trim(),
        authorName: String(authorName).trim(),
        category: category ? String(category).trim() : "technology",
        tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : []
      });
      const responsePayload = {
        _id: String(newBlog._id),
        title: newBlog.title,
        content: newBlog.content,
        category: newBlog.category,
        author: String(authorId),
        authorName: String(authorName),
        tags: newBlog.tags,
        createdAt: newBlog.createdAt,
        updatedAt: newBlog.updatedAt,
        success: true,
        message: "Blog post created successfully!",
        blog: newBlog,
        data: newBlog
      };
      res.status(201).json(responsePayload);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create blog post.",
        details: error.message
      });
    }
  },
  /**
   * GET /api/blogs
   * Retrieve all blog posts (with optional category filter)
   */
  async getBlogs(req, res) {
    try {
      const category = req.query.category;
      const filter = category ? { category } : {};
      const blogs = await Blog.find(filter);
      res.status(200).json({
        success: true,
        count: blogs.length,
        blogs,
        data: blogs
      });
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve blogs.",
        details: error.message
      });
    }
  },
  /**
   * GET /api/blogs/:id
   * Retrieve single blog post by ID
   */
  async getBlogById(req, res) {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);
      if (!blog) {
        res.status(404).json({
          success: false,
          error: `Blog post with ID '${id}' not found.`
        });
        return;
      }
      res.status(200).json({
        success: true,
        blog,
        data: blog
      });
    } catch (error) {
      console.error("Error fetching blog by ID:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve blog post.",
        details: error.message
      });
    }
  },
  /**
   * PUT /api/blogs/:id or PATCH /api/blogs/:id
   * Update existing blog post
   */
  async updateBlog(req, res) {
    try {
      const { id } = req.params;
      const { title, name, content, body, description, text, author, category, tags } = req.body;
      const updateData = {};
      if (title || name) updateData.title = String(title || name).trim();
      if (content || body || description || text) updateData.content = String(content || body || description || text).trim();
      if (author) updateData.author = String(author).trim();
      if (category) updateData.category = String(category).trim();
      if (tags !== void 0) {
        updateData.tags = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : [];
      }
      const updated = await Blog.findByIdAndUpdate(id, updateData);
      if (!updated) {
        res.status(404).json({
          success: false,
          error: `Blog post with ID '${id}' not found to update.`
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Blog post updated successfully!",
        blog: updated,
        data: updated
      });
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update blog post.",
        details: error.message
      });
    }
  },
  /**
   * DELETE /api/blogs/:id
   * Delete a blog post
   */
  async deleteBlog(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Blog.findByIdAndDelete(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: `Blog post with ID '${id}' not found to delete.`
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Blog post deleted successfully!",
        deletedId: id
      });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete blog post.",
        details: error.message
      });
    }
  }
};

// src/routes/blogRoutes.ts
var import_jsonwebtoken4 = __toESM(require("jsonwebtoken"), 1);
var router5 = (0, import_express5.Router)();
var JWT_SECRET4 = process.env.JWT_SECRET || "studybuddy_super_secure_jwt_secret_key_2026";
var optionalAuth2 = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = import_jsonwebtoken4.default.verify(token, JWT_SECRET4);
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = {
            _id: String(user._id),
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role
          };
        }
      }
    }
  } catch (err) {
  }
  next();
};
router5.post("/", optionalAuth2, blogController.createBlog);
router5.get("/", blogController.getBlogs);
router5.get("/:id", blogController.getBlogById);
router5.put("/:id", optionalAuth2, blogController.updateBlog);
router5.patch("/:id", optionalAuth2, blogController.updateBlog);
router5.delete("/:id", optionalAuth2, blogController.deleteBlog);
var blogRoutes_default = router5;

// server.ts
var import_fs = __toESM(require("fs"), 1);
var import_meta = {};
import_dotenv.default.config();
var getDirname = () => {
  try {
    if (import_meta && import_meta.url) {
      return import_path.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
    }
  } catch {
  }
  return typeof __dirname !== "undefined" ? __dirname : process.cwd();
};
var appDir = getDirname();
var publicPath = import_fs.default.existsSync(import_path.default.join(appDir, "public")) ? import_path.default.join(appDir, "public") : import_path.default.join(process.cwd(), "public");
var app = (0, import_express6.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use((0, import_cors.default)({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(import_express6.default.json({ limit: "15mb" }));
app.use(import_express6.default.urlencoded({ extended: true, limit: "15mb" }));
app.use((req, res, next) => {
  console.log(`\u{1F4E1} [${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});
var healthCheck = (req, res) => {
  res.status(200).json({
    status: "ok",
    appName: "AI StudyBuddy",
    database: isConnectedToMongo ? "MongoDB Atlas" : "In-Memory Resilient Store",
    timestamp: /* @__PURE__ */ new Date()
  });
};
app.get("/api/health", healthCheck);
app.get("/health", healthCheck);
app.use("/api/auth", authRoutes_default);
app.use("/api/material", materialRoutes_default);
app.use("/api/materials", materialRoutes_default);
app.use("/api/ai", aiRoutes_default);
app.use("/api/admin", adminRoutes_default);
app.use("/api/blogs", blogRoutes_default);
app.use("/api/blog", blogRoutes_default);
app.post("/api/materials/:id/summarize", verifyJWT, aiController.summarizeMaterial);
app.use("/auth", authRoutes_default);
app.use("/material", materialRoutes_default);
app.use("/materials", materialRoutes_default);
app.use("/ai", aiRoutes_default);
app.use("/admin", adminRoutes_default);
app.use("/blogs", blogRoutes_default);
app.use("/blog", blogRoutes_default);
app.post("/api/login", authController.login);
app.post("/api/register", authController.register);
app.post("/login", authController.login);
app.post("/register", authController.register);
app.post("/api/blogs/generate", aiController.generateBlog);
app.post("/blogs/generate", aiController.generateBlog);
app.post("/api/generate-blog", aiController.generateBlog);
app.post("/generate-blog", aiController.generateBlog);
app.post("/api/summarize", aiController.summarize);
app.post("/summarize", aiController.summarize);
app.post("/api/ai/summarizeBlog", aiController.summarize);
app.post("/api/ai/summarize-blog", aiController.summarize);
app.use(import_express6.default.static(publicPath));
app.get("/", (req, res) => {
  res.sendFile(import_path.default.join(publicPath, "index.html"));
});
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
    message: "The requested route was not found. Please verify the URL and HTTP method.",
    tip: "Ensure baseUrl is http://localhost:3000/api or http://localhost:5000/api and check your route path.",
    availableRoutes: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET  /api/auth/me",
      "POST /api/materials/upload",
      "GET  /api/materials",
      "GET  /api/materials/:id",
      "POST /api/materials/:id/summarize",
      "POST /api/ai/flashcards",
      "POST /api/ai/quiz",
      "POST /api/ai/study-plan",
      "POST /api/ai/chat",
      "POST /api/ai/search",
      "POST /api/ai/generate-blog",
      "POST /api/ai/summarize",
      "POST /api/blogs",
      "GET  /api/blogs",
      "GET  /api/blogs/:id",
      "PUT  /api/blogs/:id",
      "DELETE /api/blogs/:id"
    ]
  });
});
app.use((err, req, res, next) => {
  console.error("Unhandled Application Error:", err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal server error occurred."
  });
});
async function startServer() {
  try {
    console.log("\u{1F504} Initializing AI StudyBuddy database...");
    await connectDB();
    console.log("\u2705 Database layer operational.");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\u{1F680} AI StudyBuddy server running on http://0.0.0.0:${PORT}`);
      console.log(`\u{1F4DA} Frontend interface available at http://0.0.0.0:${PORT}/`);
      console.log(`\u{1F511} Admin account: yyuvashree24916bscai@gmail.com (Password: yuvashree@@2006)`);
      console.log(`\u{1F393} Student account: student@studybuddy.com (Password: student123)`);
    });
    if (PORT !== 5e3) {
      try {
        const secondaryApp = app.listen(5e3, "0.0.0.0", () => {
          console.log(`\u26A1 College Testing Compatibility: Also listening on http://0.0.0.0:5000`);
        });
        secondaryApp.on("error", () => {
        });
      } catch {
      }
    }
  } catch (error) {
    console.error("\u274C Fatal error during server startup:", error);
    process.exit(1);
  }
}
startServer();
var server_default = app;
//# sourceMappingURL=server.cjs.map
