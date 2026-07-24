export type TopicDetail = {
  core: string;
  mathConnection: string;
  mathMarkdown: string;
  example: {
    title: string;
    explanation: string;
    tryIt: string;
  };
  quiz: {
    question: string;
    answer: string;
  };
};
