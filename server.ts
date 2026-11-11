import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { VALID_CLASSES, ClassId, Teacher, Rating, WeeklyHistory, AppSettings, ClassSummary } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  teachers: Teacher[];
  settings: AppSettings;
  ratings: Rating[];
  history: WeeklyHistory[];
}

const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 't-admin-rwad',
    name: 'Rwad Evaluator',
    nameAr: 'رواد المقيّم',
    email: 'rwad4911@gmail.com',
    role: 'admin',
    subject: 'School Principal & Lead Evaluator',
    subjectAr: 'مدير المدرسة والمقيّم العام',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

const INITIAL_RATINGS: Rating[] = [];

const INITIAL_HISTORY: WeeklyHistory[] = [
  {
    id: 'hist-w43',
    weekId: '2026-W43',
    startDate: '2026-10-18',
    endDate: '2026-10-24',
    winningClasses: ['6/A'],
    winningScore: 9.3,
    totalRatings: 12,
    classesSummary: {
      '7/A': { averageScore: 8.5, ratingsCount: 3 },
      '6/A': { averageScore: 9.3, ratingsCount: 4 },
      '5/A': { averageScore: 7.8, ratingsCount: 2 },
      '4/A': { averageScore: 8.0, ratingsCount: 2 },
      '3/A': { averageScore: 7.5, ratingsCount: 1 }
    },
    finalizedAt: '2026-10-25T00:00:00.000Z',
    resetBy: 'Sarah Al-Mansoor'
  },
  {
    id: 'hist-w42',
    weekId: '2026-W42',
    startDate: '2026-10-11',
    endDate: '2026-10-17',
    winningClasses: ['5/A', '4/A'], // Example of tie preserved in history!
    winningScore: 9.0,
    totalRatings: 10,
    classesSummary: {
      '7/A': { averageScore: 8.1, ratingsCount: 2 },
      '6/A': { averageScore: 8.4, ratingsCount: 3 },
      '5/A': { averageScore: 9.0, ratingsCount: 2 },
      '4/A': { averageScore: 9.0, ratingsCount: 2 },
      '3/A': { averageScore: 6.8, ratingsCount: 1 }
    },
    finalizedAt: '2026-10-18T00:00:00.000Z',
    resetBy: 'Rwad Evaluator'
  }
];

function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      // Ensure all required fields exist
      if (!data.teachers || !Array.isArray(data.teachers)) data.teachers = DEFAULT_TEACHERS;
      if (!data.ratings || !Array.isArray(data.ratings)) data.ratings = INITIAL_RATINGS;
      if (!data.history || !Array.isArray(data.history)) data.history = INITIAL_HISTORY;
      if (!data.settings) {
        data.settings = {
          resetDayOfWeek: 0, // Sunday
          currentWeekId: '2026-W44',
          weekStartDate: '2026-10-25',
          schoolName: 'Al-Andalus School',
          schoolNameAr: 'مدارس الأندلس'
        };
      }
      return data;
    } catch (err) {
      console.error('Error parsing db.json, recreating with defaults:', err);
    }
  }

  const initialDb: DatabaseSchema = {
    teachers: DEFAULT_TEACHERS,
    settings: {
      resetDayOfWeek: 0, // Sunday
      currentWeekId: '2026-W44',
      weekStartDate: '2026-10-25',
      schoolName: 'Al-Andalus School',
      schoolNameAr: 'مدارس الأندلس'
    },
    ratings: INITIAL_RATINGS,
    history: INITIAL_HISTORY
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}

let db = loadDatabase();

// Connected Server-Sent Events (SSE) clients for real-time synchronization
const sseClients: Set<Response> = new Set();

function broadcastEvent(eventType: string, payload: unknown) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Helper to compute summaries for all five classes
function computeClassSummaries(ratings: Rating[], currentWeekId: string): ClassSummary[] {
  const currentWeekRatings = ratings.filter(r => r.weekId === currentWeekId);

  // Compute stats for each of the 5 classes
  const rawList = VALID_CLASSES.map(classId => {
    const classRatings = currentWeekRatings.filter(r => r.classId === classId);
    if (classRatings.length === 0) {
      return {
        classId,
        averageScore: null,
        ratingsCount: 0,
        ratings: []
      };
    }
    const sum = classRatings.reduce((acc, curr) => acc + curr.score, 0);
    const average = Number((sum / classRatings.length).toFixed(2));
    return {
      classId,
      averageScore: average,
      ratingsCount: classRatings.length,
      ratings: classRatings
    };
  });

  // Calculate ranks
  // Classes with ratings are ranked above unrated classes, sorted by averageScore descending
  const ratedClasses = rawList.filter(c => c.averageScore !== null);
  ratedClasses.sort((a, b) => (b.averageScore as number) - (a.averageScore as number));

  const highestScore = ratedClasses.length > 0 ? (ratedClasses[0].averageScore as number) : null;

  // Rank assignment handling ties
  let currentRank = 1;
  const rankedMap = new Map<ClassId, { rank: number; isWinner: boolean }>();

  for (let i = 0; i < ratedClasses.length; i++) {
    if (i > 0 && ratedClasses[i].averageScore !== ratedClasses[i - 1].averageScore) {
      currentRank = i + 1;
    }
    const isWinner = highestScore !== null && ratedClasses[i].averageScore === highestScore;
    rankedMap.set(ratedClasses[i].classId, { rank: currentRank, isWinner });
  }

  return rawList.map(item => {
    if (item.averageScore === null) {
      return {
        ...item,
        rank: ratedClasses.length + 1,
        isWinner: false
      };
    }
    const rankInfo = rankedMap.get(item.classId)!;
    return {
      ...item,
      rank: rankInfo.rank,
      isWinner: rankInfo.isWinner
    };
  });
}

function getFullAppState(reqTeacherId?: string) {
  const summaries = computeClassSummaries(db.ratings, db.settings.currentWeekId);
  const currentWeekRatings = db.ratings.filter(r => r.weekId === db.settings.currentWeekId);
  const currentTeacher = reqTeacherId ? db.teachers.find(t => t.id === reqTeacherId) || null : null;

  return {
    currentTeacher,
    teachers: db.teachers.map(({ ...rest }) => rest), // sanitized if needed
    settings: db.settings,
    classes: VALID_CLASSES,
    summaries,
    currentWeekRatings,
    history: db.history,
    serverTime: new Date().toISOString()
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Teacher identification middleware
  app.use((req: Request, _res: Response, next) => {
    const authHeader = req.headers['x-teacher-id'] as string;
    if (authHeader) {
      (req as unknown as { teacherId: string }).teacherId = authHeader;
    }
    next();
  });

  // 1. GET State
  app.get('/api/state', (req: Request, res: Response) => {
    const teacherId = (req as unknown as { teacherId?: string }).teacherId;
    res.json(getFullAppState(teacherId));
  });

  // 2. Real-time SSE sync endpoint
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial ping and state
    res.write(`event: connected\ndata: {"time":"${new Date().toISOString()}"}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // 3. Auth: Switch or Login as Teacher
  app.post('/api/auth/select-teacher', (req: Request, res: Response) => {
    const { teacherId } = req.body;
    const teacher = db.teachers.find(t => t.id === teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json({ teacher, state: getFullAppState(teacher.id) });
  });

  // Register a new teacher account
  app.post('/api/auth/register-teacher', (req: Request, res: Response) => {
    const { name, nameAr, email, subject, subjectAr, role } = req.body;
    if (!name || !email || !subject) {
      return res.status(400).json({ error: 'Name, email, and subject are required' });
    }

    const existing = db.teachers.find(t => t.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'A teacher with this email already exists' });
    }

    const newTeacher: Teacher = {
      id: `t-${Date.now()}`,
      name: name.trim(),
      nameAr: nameAr?.trim() || name.trim(),
      email: email.trim().toLowerCase(),
      role: role === 'admin' ? 'admin' : 'teacher',
      subject: subject.trim(),
      subjectAr: subjectAr?.trim() || subject.trim(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    };

    db.teachers.push(newTeacher);
    saveDatabase(db);
    broadcastEvent('state_updated', getFullAppState());

    res.status(201).json({ teacher: newTeacher, state: getFullAppState(newTeacher.id) });
  });

  // Delete a specific teacher
  app.delete('/api/teachers/:id', (req: Request, res: Response) => {
    const teacherId = req.params.id;
    const index = db.teachers.findIndex(t => t.id === teacherId);
    if (index === -1) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const deletedTeacher = db.teachers.splice(index, 1)[0];
    // Also remove ratings associated with this teacher
    db.ratings = db.ratings.filter(r => r.teacherId !== teacherId);

    saveDatabase(db);
    const fullState = getFullAppState();
    broadcastEvent('state_updated', fullState);

    res.json({ success: true, deletedTeacher, state: fullState });
  });

  // Clear / delete all teachers
  app.post('/api/teachers/clear-all', (_req: Request, res: Response) => {
    db.teachers = [];
    db.ratings = [];
    saveDatabase(db);
    const fullState = getFullAppState();
    broadcastEvent('state_updated', fullState);
    res.json({ success: true, state: fullState });
  });

  // 4. Submit or Update Rating
  app.post('/api/ratings', (req: Request, res: Response) => {
    const teacherId = (req as unknown as { teacherId?: string }).teacherId || req.body.teacherId;
    const { classId, score, comment } = req.body;

    if (!teacherId) {
      return res.status(401).json({ error: 'Teacher authentication required' });
    }

    const teacher = db.teachers.find(t => t.id === teacherId);
    if (!teacher) {
      return res.status(403).json({ error: 'Invalid teacher identity' });
    }

    // Validate class ID: MUST be exactly one of the 5 classes
    if (!VALID_CLASSES.includes(classId as ClassId)) {
      return res.status(400).json({ error: `Invalid class. Must be one of: ${VALID_CLASSES.join(', ')}` });
    }

    // Validate score: minimum 0, maximum 10
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      return res.status(400).json({ error: 'Rating must be a number between 0 and 10' });
    }

    const currentWeekId = db.settings.currentWeekId;
    const nowIso = new Date().toISOString();

    // Check for existing rating by this teacher for this class in current week
    const existingIndex = db.ratings.findIndex(
      r => r.weekId === currentWeekId && r.classId === classId && r.teacherId === teacher.id
    );

    let savedRating: Rating;
    let isUpdate = false;

    if (existingIndex >= 0) {
      // Prevent teachers from changing other teachers' ratings: verified by teacherId filter
      isUpdate = true;
      db.ratings[existingIndex] = {
        ...db.ratings[existingIndex],
        score: numScore,
        comment: comment ? String(comment).slice(0, 500) : db.ratings[existingIndex].comment,
        updatedAt: nowIso
      };
      savedRating = db.ratings[existingIndex];
    } else {
      savedRating = {
        id: `r-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        weekId: currentWeekId,
        classId: classId as ClassId,
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherNameAr: teacher.nameAr,
        teacherSubject: teacher.subject,
        score: numScore,
        comment: comment ? String(comment).slice(0, 500) : '',
        createdAt: nowIso,
        updatedAt: nowIso
      };
      db.ratings.push(savedRating);
    }

    saveDatabase(db);
    const fullState = getFullAppState(teacher.id);
    broadcastEvent('state_updated', fullState);

    res.json({
      success: true,
      action: isUpdate ? 'updated' : 'submitted',
      rating: savedRating,
      state: fullState
    });
  });

  // 5. Admin: Reset Week Ratings with Archive & Winner Preservation
  app.post('/api/admin/reset-week', (req: Request, res: Response) => {
    const teacherId = (req as unknown as { teacherId?: string }).teacherId || req.body.adminId;

    if (!teacherId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const teacher = db.teachers.find(t => t.id === teacherId);
    if (!teacher || teacher.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied: Reset is restricted to authorized administrators only' });
    }

    const currentWeekId = db.settings.currentWeekId;
    const currentWeekRatings = db.ratings.filter(r => r.weekId === currentWeekId);

    // Compute current week's summaries to determine Class of the Week
    const summaries = computeClassSummaries(db.ratings, currentWeekId);
    const ratedSummaries = summaries.filter(s => s.averageScore !== null);

    let winningClasses: ClassId[] = [];
    let winningScore = 0;

    if (ratedSummaries.length > 0) {
      const maxScore = Math.max(...ratedSummaries.map(s => s.averageScore as number));
      winningScore = maxScore;
      winningClasses = ratedSummaries.filter(s => s.averageScore === maxScore).map(s => s.classId);
    }

    const classesSummaryRecord: Record<ClassId, { averageScore: number | null; ratingsCount: number }> = {
      '7/A': { averageScore: null, ratingsCount: 0 },
      '6/A': { averageScore: null, ratingsCount: 0 },
      '5/A': { averageScore: null, ratingsCount: 0 },
      '4/A': { averageScore: null, ratingsCount: 0 },
      '3/A': { averageScore: null, ratingsCount: 0 }
    };

    for (const s of summaries) {
      classesSummaryRecord[s.classId] = {
        averageScore: s.averageScore,
        ratingsCount: s.ratingsCount
      };
    }

    // Archive current week into history if there were any ratings or to preserve record
    if (currentWeekRatings.length > 0 || ratedSummaries.length > 0) {
      const historyEntry: WeeklyHistory = {
        id: `hist-${Date.now()}`,
        weekId: currentWeekId,
        startDate: db.settings.weekStartDate,
        endDate: new Date().toISOString().split('T')[0],
        winningClasses,
        winningScore,
        totalRatings: currentWeekRatings.length,
        classesSummary: classesSummaryRecord,
        finalizedAt: new Date().toISOString(),
        resetBy: teacher.name
      };
      db.history.unshift(historyEntry);
    }

    // Reset current week's ratings without deleting class names or previous weekly winners!
    // Filter out current week's ratings
    db.ratings = db.ratings.filter(r => r.weekId !== currentWeekId);

    // Increment week ID
    const weekNumMatch = currentWeekId.match(/(\d{4})-W(\d+)/);
    let nextWeekId = `2026-W${Date.now()}`;
    if (weekNumMatch) {
      const year = weekNumMatch[1];
      const nextNum = String(parseInt(weekNumMatch[2], 10) + 1).padStart(2, '0');
      nextWeekId = `${year}-W${nextNum}`;
    }

    db.settings.currentWeekId = nextWeekId;
    db.settings.weekStartDate = new Date().toISOString().split('T')[0];

    saveDatabase(db);
    const fullState = getFullAppState(teacher.id);
    broadcastEvent('state_updated', fullState);

    res.json({
      success: true,
      message: 'Current week ratings successfully reset and preserved in history.',
      state: fullState
    });
  });

  // 6. Admin: Update Settings (Reset day, school name)
  app.post('/api/admin/settings', (req: Request, res: Response) => {
    const teacherId = (req as unknown as { teacherId?: string }).teacherId || req.body.adminId;

    if (!teacherId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const teacher = db.teachers.find(t => t.id === teacherId);
    if (!teacher || teacher.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied: Settings updates are restricted to administrators' });
    }

    const { resetDayOfWeek, schoolName, schoolNameAr } = req.body;

    if (resetDayOfWeek !== undefined) {
      const dayNum = Number(resetDayOfWeek);
      if (dayNum >= 0 && dayNum <= 6) {
        db.settings.resetDayOfWeek = dayNum;
      }
    }

    if (schoolName) db.settings.schoolName = String(schoolName).slice(0, 100);
    if (schoolNameAr) db.settings.schoolNameAr = String(schoolNameAr).slice(0, 100);

    saveDatabase(db);
    const fullState = getFullAppState(teacher.id);
    broadcastEvent('state_updated', fullState);

    res.json({ success: true, settings: db.settings, state: fullState });
  });

  // Serve Vite in dev mode or static in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Class Champion server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
