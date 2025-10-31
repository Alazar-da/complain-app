export const departments = {
  general: {
    am: "አጠቃላይ",
    en: "General",
    om: "Waliigalaa",
    subDepartments: [],
  },
  educationTech: {
    am: "የስርዓተ ትምህርት መረጃና ቴኪኖሎጆ ስራዎች አስተባባራ",
    en: "Education Information & Technology Administration",
    om: "Hojii Odeeffannoo fi Teeknooloojii Barnootaa",
    subDepartments: [
      {
        am: "የት/ት መረጃና ቴክኖሎጂ ቡዱን",
        en: "Education Data & Technology Unit",
        om: "Kutaa Odeeffannoo fi Teeknooloojii",
      },
      {
        am: "የአፋን ኦሮሞ ስርዓተ ት/ት ክትትል ቡዱን",
        en: "Afaan Oromoo Curriculum Supervision Unit",
        om: "Kutaa Qorannoo Kurikula Afaan Oromoo",
      },
      {
        am: "የስርዓተ ትምህርት ት/ክ/ት ቡዱን መራ",
        en: "Curriculum Leadership Unit",
        om: "Kutaa Bulchiinsa Kurikulaa",
      },
    ],
  },
  teacherTraining: {
    am: "የት/መና የመም/ል/የልዩ/ፍ/የሱፐ/ስራ ቡዱን አስተባባራ",
    en: "Teacher Training & Special Programs Administration",
    om: "Leenjii Barattootaa fi Sagantaa Addaa",
    subDepartments: [
      {
        am: "የአጠዋለይ 2ኛ ደረጃ ት/ቤት አስተባባራ",
        en: "General Secondary School Administration",
        om: "Bulchiinsa Mana Barnootaa Sadarkaa Lammaffaa",
      },
      {
        am: "የልዩ ፍ/አ/ት/ዘ/ብ/ጉዳዩችቡዱን ቡዱን",
        en: "Special Needs Education Unit",
        om: "Kutaa Barnoota Dandeetti Addaa",
      },
      {
        am: "የት/ትመሻሻልና የግባዓትአቅርቦት ቡዱን",
        en: "Education Improvement & Performance Unit",
        om: "Kutaa Fooyya’insaa fi Hojii Gaarii",
      },
      {
        am: "የመ/ራን እና ትም/አመራር ቡዱን",
        en: "Leadership & Management Unit",
        om: "Kutaa Bulchiinsa fi Leenjii",
      },
    ],
  },
} as const;

export type DepartmentKey = keyof typeof departments;
