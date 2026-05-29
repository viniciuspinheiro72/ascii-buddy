import { PhraseType } from "@/domain/value-objects/phrase-context.js";

const PHRASES_BY_TYPE: Readonly<Record<PhraseType, readonly string[]>> = {
  [PhraseType.MOTIVATIONAL]: [
    "The best code is the code you delete.",
    "Any fool can write code a computer understands. Few can write code humans do.",
    "A good commit message is worth a thousand lines of comments.",
    "The best architecture is the one your team can actually understand on Monday morning.",
    "Rubber duck debugging proves the problem was in your explanation, not the code.",
    "You can't fix what you can't measure. You also can't measure what you won't instrument.",
    "The junior dev asks how. The senior dev asks why. The principal dev asks if.",
    "Ship it and keep iterating. A live product beats a perfect design doc.",
    "Tests are the love letter you write to the next person who touches this code.",
    "Every expert was once a beginner who refused to quit after the third segfault.",
  ],
  [PhraseType.SARCASTIC]: [
    "It works on my machine. Ship the machine.",
    "If it compiles, ship it. I'm kidding. Run the tests. Or don't. Ship it anyway.",
    "Deploy on Friday. I dare you.",
    "The cloud is just someone else's computer that you blame when it breaks.",
    "Microservices: turning a monolith problem into a distributed systems problem.",
    "Docker: because it worked in the container on my laptop counts as production-ready.",
    "Serverless: still servers. Still cold starts. Still your problem.",
    "An API without versioning is a promise you will break with grace.",
    "Continuous integration: the art of breaking things on someone else's machine first.",
    "Ten minute build time means ten minutes of pretending to be productive.",
  ],
  [PhraseType.WISE]: [
    "The first rule of optimization: don't. The second: don't yet.",
    "You don't understand recursion until you understand recursion.",
    "Premature optimization is the root of all evil. So is premature abstraction.",
    "YAGNI until you desperately need it, then you YAGNI'd too hard.",
    "Technical debt: the mortgage on your architecture. You're always paying interest.",
    "The most dangerous phrase in software: we've always done it this way.",
    "Type safety is not just a compiler feature, it's a lifestyle choice.",
    "A senior dev is just someone who has been bitten by more edge cases.",
    "The database is not a message queue. The database should not be a message queue.",
    "Eventual consistency: everything is fine, eventually.",
  ],
  [PhraseType.FUNNY]: [
    "99 little bugs in the code. Take one down, patch it around. 127 bugs in the code.",
    "Real programmers count from zero. So this is actually phrase number zero.",
    "Tabs vs spaces killed a friendship and you know which side you're on.",
    "There are only two hard things in CS: cache invalidation, naming, and off-by-one errors.",
    "Stack overflow: where developers go to feel simultaneously smart and stupid.",
    "Every regex is write-only. Including the one you wrote five minutes ago.",
    "Merge conflict: two developers who didn't talk to each other, exposed.",
    "The null pointer is the billion dollar mistake. TypeScript is the billion dollar apology.",
    "undefined is not a function. My undefined is a lifestyle.",
    "Documentation is a love letter to your future self. You never write it.",
  ],
  [PhraseType.ROAST]: [
    "A PR with no comments means either your code is perfect or nobody read it.",
    "The test suite is green. The users are screaming. Both things are true.",
    "Your abstraction is leaking. It was always leaking. You just noticed.",
    "Legacy code is just code without tests written by someone who has since left.",
    "A code review is just someone else judging your midnight decisions.",
    "Git blame exists so you can congratulate yourself six months later.",
    "Refactoring: changing all the code while claiming nothing fundamentally changed.",
    "Environment variables: the config you didn't want to commit and then forgot about.",
    "The best error message is the one you spend two hours Googling at 2am.",
    "You can't have both fast, correct, and cheap. Pick two. You'll pick none.",
  ],
};

const ALL_PHRASES: readonly string[] = Object.values(PHRASES_BY_TYPE).flat();

export const FallbackPhraseStore = {
  getByType(phraseType: PhraseType): string {
    const pool = PHRASES_BY_TYPE[phraseType];
    const index = Math.floor(Math.random() * pool.length);
    return pool[index] ?? ALL_PHRASES[0] ?? "Keep coding.";
  },

  getRandom(): string {
    const index = Math.floor(Math.random() * ALL_PHRASES.length);
    return ALL_PHRASES[index] ?? "Keep coding.";
  },

  getAll(): readonly string[] {
    return ALL_PHRASES;
  },
};
