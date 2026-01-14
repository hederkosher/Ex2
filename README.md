# AI News Aggregator - Ex2

אגרגטור חדשות AI/ML המרכז טרנדים שבועיים מעולם ה-AI/ML. המערכת מציגה רשימה של פרויקטים פופולריים מ-GitHub, ומאפשרת לסכם אותם בעזרת LLM.

## 🚀 טכנולוגיות

- **Framework**: Next.js 14
- **Frontend**: React 18 (Functional Components)
- **Backend**: Next.js API Routes (Serverless Functions)
- **Styling**: Vanilla CSS (CSS Modules) - ללא ספריות עיצוב
- **Storage**: LocalStorage (שמירת מפתחות API בצד הלקוח)

## 📋 תכונות

### Backend (API Routes)

1. **`/api/github`** - איסוף נתונים מ-GitHub API
   - מושך פרויקטים עם הכי הרבה כוכבים ב-24 השעות האחרונות
   - מסנן לפי תגיות "AI" או "Machine Learning"
   - מטמון של 5 דקות להפחתת בקשות API

2. **`/api/summarize`** - סיכום טקסט עם AI
   - תומך ב-3 ספקים: Groq (חינמי), OpenAI, Anthropic Claude
   - מחזיר סיכום של עד 3 שורות
   - משתמש במפתח API מהלקוח

### Frontend

- **דף הבית**: תצוגת Feed של כרטיסים עם פרויקטים
- **כרטיס חדשות (NewsCard)**: מציג שם, תיאור, כוכבים, שפת תכנות וכפתור סיכום
- **מסך הגדרות**: Modal להזנת מפתח API אישי (נשמר ב-LocalStorage)

## 🎨 עיצוב

עיצוב מינימליסטי בהשראת Apple:
- רקע לבן/אפור בהיר (#F5F5F7)
- טקסט שחור/אפור כהה (#1d1d1f)
- פינות מעוגלות (12px)
- צללים עדינים
- טיפוגרפיה Sans-serif

## 🛠️ התקנה והרצה

### דרישות מוקדמות

- Node.js 18+ 
- npm או yarn

### שלבי התקנה

1. התקנת תלויות:
```bash
npm install
```

2. הרצת שרת פיתוח:
```bash
npm run dev
```

3. פתיחת הדפדפן בכתובת:
```
http://localhost:3000
```

### בנייה לייצור

```bash
npm run build
npm start
```

## 🔑 הגדרת מפתח API

1. לחץ על כפתור "Settings" בחלק העליון
2. בחר ספק AI:
   - **Groq** (מומלץ - חינמי): [console.groq.com](https://console.groq.com)
   - **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Anthropic Claude**: [console.anthropic.com](https://console.anthropic.com)
3. הזן את מפתח ה-API שלך
4. לחץ "Save"

המפתח נשמר ב-LocalStorage של הדפדפן ולא נשלח לשרתים שלנו (רק ל-API של הספק).

## 📡 API Endpoints

### GET `/api/github`

מחזיר רשימת פרויקטים פופולריים מ-GitHub.

**Response:**
```json
[
  {
    "id": 123456,
    "name": "project-name",
    "fullName": "owner/project-name",
    "description": "Project description",
    "url": "https://github.com/owner/project-name",
    "stars": 1234,
    "language": "TypeScript",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
]
```

### POST `/api/summarize`

מסכם טקסט בעזרת AI.

**Request Body:**
```json
{
  "text": "Text to summarize",
  "apiKey": "your-api-key",
  "provider": "groq" // או "openai" או "anthropic"
}
```

**Response:**
```json
{
  "summary": "Summarized text in up to 3 sentences..."
}
```

## 🚢 פריסה ל-Vercel

1. ודא שהפרויקט שלך ב-GitHub
2. היכנס ל-[vercel.com](https://vercel.com)
3. לחץ על "New Project"
4. בחר את ה-repository שלך
5. Vercel יזהה אוטומטית שזה Next.js
6. לחץ "Deploy"

האתר יהיה זמין תוך דקות!

## 📁 מבנה הפרויקט

```
Ex2/
├── components/
│   ├── NewsCard.tsx          # רכיב כרטיס חדשות
│   └── SettingsModal.tsx     # מודל הגדרות
├── pages/
│   ├── api/
│   │   ├── github.ts         # API לאיסוף מ-GitHub
│   │   └── summarize.ts       # API לסיכום עם AI
│   ├── _app.tsx              # App wrapper
│   └── index.tsx              # דף הבית
├── styles/
│   ├── globals.css           # עיצוב גלובלי
│   ├── Home.module.css       # עיצוב דף הבית
│   ├── NewsCard.module.css   # עיצוב כרטיס
│   └── SettingsModal.module.css # עיצוב מודל
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🔒 אבטחה

- מפתחות API נשמרים רק ב-LocalStorage של הלקוח
- מפתחות API נשלחים ישירות לספק ה-AI (לא דרך השרת שלנו)
- אין שמירת נתונים אישיים בשרת

## 📝 הערות

- המטמון של GitHub API הוא 5 דקות
- כל משתמש משתמש במפתח API שלו (לא חריגה ממגבלות)
- Groq מציע חבילה חינמית נדיבה - מומלץ להתחיל איתו

## 🌐 כתובת האתר

לאחר פריסה ל-Vercel, האתר יהיה זמין בכתובת:
```
https://your-project-name.vercel.app
```

## 📄 רישיון

פרויקט זה נוצר כחלק מתרגיל אקדמי.

---

**שם הפרויקט ב-GitHub**: Ex2
