export const templateLibrarySeed = {
  featureTemplateLibrary: {
    "word-cloud": {
      id: "word-cloud",
      title: "Word clouds",
      description:
        "Collect responses and highlight the most common ones in a beautiful word cloud! A very popular way to start or end a session.",
      templates: [
        {
          id: "blank-word-cloud",
          title: "Blank word cloud",
          prompt: "",
          background: "#ffffff",
          borderColor: "#0f0f0f",
          isBlank: true,
        },
        {
          id: "leadership-traits",
          title: "Leadership traits word cloud",
          prompt: "What's the most important trait for a great leader?",
          background: "#f2ece2",
          textColor: "#2b2a2a",
        },
        {
          id: "personal-reflection",
          title: "Personal reflection prompt",
          prompt: "In one word, what type of person do you aspire to be?",
          background: "#1b1f2a",
          textColor: "#f5f6f7",
        },
        {
          id: "weekly-opener",
          title: "Weekly team opener",
          prompt: "What are you looking forward to in the coming week?",
          background: "#e5e9ff",
          textColor: "#22263d",
        },
      ],
    },
    poll: {
      id: "poll",
      title: "Polls",
      description: "Ask a quick multiple-choice poll and show the results instantly.",
      templates: [
        {
          id: "blank-poll",
          title: "Blank poll",
          prompt: "",
          background: "#ffffff",
          borderColor: "#0f0f0f",
          isBlank: true,
        },
      ],
    },
    "open-ended": {
      id: "open-ended",
      title: "Open ended",
      description: "Collect longer, qualitative responses from your audience.",
      templates: [
        {
          id: "blank-open-ended",
          title: "Blank open ended",
          prompt: "",
          background: "#ffffff",
          borderColor: "#0f0f0f",
          isBlank: true,
        },
      ],
    },
    scales: {
      id: "scales",
      title: "Scales",
      description: "Gauge sentiment on a scale and compare results over time.",
      templates: [
        {
          id: "blank-scales",
          title: "Blank scales",
          prompt: "",
          background: "#ffffff",
          borderColor: "#0f0f0f",
          isBlank: true,
        },
      ],
    },
    ranking: {
      id: "ranking",
      title: "Ranking",
      description: "Let participants rank the most important ideas in sequence.",
      templates: [
        {
          id: "blank-ranking",
          title: "Blank ranking",
          prompt: "",
          background: "#ffffff",
          borderColor: "#0f0f0f",
          isBlank: true,
        },
      ],
    },
    "pin-on-image": {
      id: "pin-on-image",
      title: "Pin on image",
      description: "Turn diagrams and images into collaborative input surfaces.",
      templates: [
        {
          id: "blank-pin",
          title: "Blank pin on image",
          prompt: "",
          background: "#ffffff",
          borderColor: "#0f0f0f",
          isBlank: true,
        },
      ],
    },
  },
  templateCards: [
    {
      id: "team-icebreakers",
      title: "Get to know the team icebreakers",
      slides: 7,
      accent: "#FEF2F2",
      prompt: "What makes working with this team fun?",
      description: "Warm up a new group with fast prompts and playful exercises.",
    },
    {
      id: "stress-management",
      title: "Stress management training",
      slides: 8,
      accent: "#EFF6FF",
      prompt: "What is one thing you want to improve this week?",
      description: "Facilitate training sessions with quick personal reflection.",
    },
    {
      id: "initiative-prioritisation",
      title: "Initiative prioritisation",
      slides: 6,
      accent: "#F0FDFA",
      prompt: "Which initiative will have the highest impact this quarter?",
      description: "Stack-rank ideas and align teams around the next best move.",
    },
    {
      id: "meeting-icebreakers",
      title: "Fun meeting icebreakers",
      slides: 5,
      accent: "#F9FAFB",
      prompt: "Share one thing everyone here should know about you.",
      description: "Start recurring meetings with a fast, low-friction opener.",
    },
  ],
};
