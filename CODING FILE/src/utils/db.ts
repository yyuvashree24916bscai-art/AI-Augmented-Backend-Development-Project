import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export let isConnectedToMongo = false;
export let isUsingMemoryStore = false;

// In-Memory store fallback in case MONGO_URI is not provided or unavailable
export interface MemoryStoreData {
  users: any[];
  materials: any[];
  summaries: any[];
  flashcards: any[];
  quizzes: any[];
  studyPlans: any[];
  embeddings: any[];
  chats: any[];
  activityLogs: any[];
  blogs: any[];
}

export const memoryStore: MemoryStoreData = {
  users: [],
  materials: [],
  summaries: [],
  flashcards: [],
  quizzes: [],
  studyPlans: [],
  embeddings: [],
  chats: [],
  activityLogs: [],
  blogs: [],
};

// Seed initial demo data for immediate demo-readiness
export async function seedDemoData() {
  if (memoryStore.users.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const primaryAdminPasswordHash = await bcrypt.hash('yuvashree@@2006', salt);
    const backupAdminPasswordHash = await bcrypt.hash('admin123', salt);
    const studentPasswordHash = await bcrypt.hash('student123', salt);

    const primaryAdminUser = {
      _id: '65f1a0000000000000000000',
      name: 'Yuvashree (Administrator)',
      email: 'yyuvashree24916bscai@gmail.com',
      password: primaryAdminPasswordHash,
      role: 'admin',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    };

    const adminUser = {
      _id: '65f1a0000000000000000001',
      name: 'System Administrator',
      email: 'admin@studybuddy.com',
      password: backupAdminPasswordHash,
      role: 'admin',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    };

    const studentUser = {
      _id: '65f1a0000000000000000002',
      name: 'Alex Johnson (Student)',
      email: 'student@studybuddy.com',
      password: studentPasswordHash,
      role: 'student',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    };

    memoryStore.users.push(primaryAdminUser, adminUser, studentUser);

    const sampleMaterial = {
      _id: '65f1b0000000000000000001',
      userId: studentUser._id,
      title: 'Operating Systems: Virtual Memory & Paging',
      subject: 'Computer Science',
      content: `Virtual memory is a storage allocation scheme in which secondary memory can be addressed as though it were part of main memory. The addresses a program may use to reference memory are distinguished from the addresses the memory system uses to identify physical storage sites, and program-generated addresses are translated automatically to the corresponding machine addresses.

Paging is a memory management scheme by which a computer stores and retrieves data from secondary storage for use in main memory. In this scheme, the operating system retrieves data from secondary storage in same-size blocks called pages. Paging is an important part of virtual memory implementations in modern computer operating systems, using secondary storage for data that doesn't fit into physical random-access memory (RAM).

Page Table: The page table is the data structure used by a virtual memory system in a computer operating system to store the mapping between virtual addresses and physical addresses. Virtual addresses are used by the program executed by the accessing process, while physical addresses are used by the hardware, or more specifically, by the RAM subsystem.

Page Fault: A page fault is an exception thrown by the memory management unit (MMU) when a program accesses a memory page that is currently not loaded in physical RAM. When a page fault occurs, the OS suspends the process, loads the required page from disk (swap space) into an available physical frame, updates the page table, and resumes the process.

Thrashing: Thrashing occurs when a computer's virtual memory subsystem is constantly paging, spending more time swapping pages into and out of memory than executing actual instructions.`,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    };

    memoryStore.materials.push(sampleMaterial);

    const sampleSummary = {
      _id: '65f1c0000000000000000001',
      userId: studentUser._id,
      materialId: sampleMaterial._id,
      summary: `• Virtual Memory decouples program address space from physical RAM via automatic address translation.
• Paging divides memory into fixed-size pages mapped to physical frames using page tables.
• Page Faults trigger OS interrupts to swap missing pages into RAM from secondary storage.
• Thrashing is a critical performance degradation state caused by excessive page swapping.`,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    };
    memoryStore.summaries.push(sampleSummary);

    const sampleFlashcards = [
      {
        _id: '65f1d0000000000000000001',
        userId: studentUser._id,
        materialId: sampleMaterial._id,
        question: 'What is a Page Fault in an Operating System?',
        answer: 'An interrupt/exception raised by the MMU when a requested memory page is not resident in physical RAM, prompting the OS to fetch it from disk.',
        createdAt: new Date(),
      },
      {
        _id: '65f1d0000000000000000002',
        userId: studentUser._id,
        materialId: sampleMaterial._id,
        question: 'What causes memory thrashing?',
        answer: 'Thrashing happens when the OS spends more time swapping pages between RAM and disk than executing instructions, typically due to insufficient physical memory.',
        createdAt: new Date(),
      },
      {
        _id: '65f1d0000000000000000003',
        userId: studentUser._id,
        materialId: sampleMaterial._id,
        question: 'What is the role of a Page Table?',
        answer: 'It stores the mapping between process virtual addresses and physical RAM frame addresses.',
        createdAt: new Date(),
      }
    ];
    memoryStore.flashcards.push(...sampleFlashcards);

    const sampleQuiz = {
      _id: '65f1e0000000000000000001',
      userId: studentUser._id,
      materialId: sampleMaterial._id,
      questions: [
        {
          question: 'Which component raises a page fault when an address is not in physical RAM?',
          options: ['ALU', 'Memory Management Unit (MMU)', 'PCIe Controller', 'Southbridge'],
          correctAnswer: 'Memory Management Unit (MMU)'
        },
        {
          question: 'What is thrashing in operating systems?',
          options: [
            'A high-speed cache optimization technique',
            'Excessive page swapping between RAM and secondary storage',
            'Overclocking CPU cycles for graphics rendering',
            'Deleting unused temporary files automatically'
          ],
          correctAnswer: 'Excessive page swapping between RAM and secondary storage'
        },
        {
          question: 'In paging, what are the fixed-size blocks in physical memory called?',
          options: ['Segments', 'Clusters', 'Frames', 'Sectors'],
          correctAnswer: 'Frames'
        }
      ],
      createdAt: new Date(),
    };
    memoryStore.quizzes.push(sampleQuiz);

    const samplePlan = {
      _id: '65f1f0000000000000000001',
      userId: studentUser._id,
      studyPlan: `### Personalized 5-Day Study Plan for Operating Systems Exam
- **Day 1: Virtual Memory & Address Spaces** (2 hours): Focus on 32-bit vs 64-bit address translation, MMU architecture.
- **Day 2: Paging & Page Tables** (2 hours): Multi-level page tables, TLB (Translation Lookaside Buffer) hit/miss math.
- **Day 3: Page Replacement Algorithms** (2.5 hours): Practice FIFO, LRU, Optimal (Belady's Anomaly), and Clock algorithms.
- **Day 4: Page Faults & Thrashing** (1.5 hours): Working set model, dirty bit writes, page fault frequency analysis.
- **Day 5: Comprehensive Quiz & Review** (2 hours): Solve past midterms and StudyBuddy flashcards.`,
      examDate: '2026-10-15',
      createdAt: new Date(),
    };
    memoryStore.studyPlans.push(samplePlan);

    // Initial activity logs
    memoryStore.activityLogs.push(
      {
        _id: '65f100000000000000000001',
        userId: adminUser._id,
        activity: 'System initialized & Administrator account ready',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        _id: '65f100000000000000000002',
        userId: studentUser._id,
        activity: 'Student Alex Johnson registered and accessed dashboard',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        _id: '65f100000000000000000003',
        userId: studentUser._id,
        activity: 'Uploaded study material: Operating Systems: Virtual Memory & Paging',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        _id: '65f100000000000000000004',
        userId: studentUser._id,
        activity: 'Generated AI Summary & Flashcards for Operating Systems',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }
    );

    // Seed sample blog posts
    memoryStore.blogs.push(
      {
        _id: '65f1c0000000000000000001',
        title: 'Mastering Operating Systems & Memory Management',
        content: 'Understanding virtual memory, paging, and page tables is fundamental for system design and operating system engineering exams.',
        author: 'Alex Johnson',
        userId: studentUser._id,
        category: 'Computer Science',
        tags: ['OS', 'Virtual Memory', 'Exams'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        _id: '65f1c0000000000000000002',
        title: 'How AI StudyBuddy Accelerates College Exam Prep',
        content: 'By leveraging RAG (Retrieval Augmented Generation) with Google Gemini 2.5 Flash, students can generate active recall flashcards, practice quizzes, and custom study timetables in seconds.',
        author: 'Yuvashree',
        userId: primaryAdminUser._id,
        category: 'Artificial Intelligence',
        tags: ['AI', 'Gemini', 'StudyBuddy', 'Machine Learning'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }
    );
  }
}

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri && !mongoUri.includes('your_mongodb_connection_string') && !mongoUri.includes('<username>')) {
    try {
      console.log('Connecting to MongoDB Atlas at:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnectedToMongo = true;
      isUsingMemoryStore = false;
      console.log('✅ Successfully connected to MongoDB Atlas database.');
      return;
    } catch (error: any) {
      console.warn('⚠️ Could not connect to provided MONGO_URI:', error.message);
      console.warn('Falling back to In-Memory Mongoose storage for seamless live preview demonstration.');
    }
  } else {
    console.log('ℹ️ MONGO_URI not configured or placeholder detected in .env.');
    console.log('Using Resilient In-Memory Mongoose database (seeded with demo users, materials, flashcards, quizzes).');
  }

  isUsingMemoryStore = true;
  isConnectedToMongo = false;
  await seedDemoData();
}
