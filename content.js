// Portfolio content supplied in club_penguin_portfolio_spec (3).md.
// Project demo and repository URLs can be added when available.
window.portfolioContent = {
  name: 'Kenneth Gonzalez',
  headline: 'Hi, my name is Kenneth Gonzalez, an aspiring Software Engineer',
  coins: 9999,
  github: 'https://github.com/Kenxeth',
  resume: './assets/Kenneth-Gonzalez-Resume.pdf',
  about: 'Hi, I’m Kenneth Gonzalez, an aspiring Software Engineer. My work includes cloud-based event processing, real-time assistive technology, and AI-powered family document tools.',
  aboutDetails: 'This portfolio brings the playful spirit of classic Club Penguin to my projects, experience, and technical skills.',
  experiences: [
    { company: 'Intuit Credit Karma', role: 'Software Engineering Intern', team: 'Assets Servicing and Admin team', icon: 'creditkarma', label: 'Internship' },
    { company: 'Google', role: 'CodeNext Student', icon: 'google', label: 'CodeNext' },
    { company: 'Mastercard', role: 'Software Engineering Intern', team: 'MACS (Mastercard Checkout Service)', icon: 'mastercard', label: 'Internship' },
    { company: 'Mastercard', role: 'Software Engineering Intern', team: 'MACS (Mastercard Checkout Service)', icon: 'mastercard', label: 'Internship' },
  ],
  projects: [
    {
      title: 'Serverless Event Processing Pipeline',
      caption: 'Serverless Event Processing Pipeline',
      description: 'Built an event-driven processing pipeline to save information on the cloud to handle heavy load.',
      tags: ['AWS Lambda', 'AWS DynamoDB', 'AWS S3', 'AWS SQS', 'Terraform', 'TypeScript', 'Node.js'],
      icon: 'pipeline',
      demo: 'https://amzn-s3bucket-videodemo.s3.us-east-1.amazonaws.com/video3785142383.mp4',
      github: null,
    },
    {
      title: 'Mira',
      caption: 'Mira',
      description: 'Won 1st place among 70+ teams by building a real-time assistive web app that identifies people, vehicles, and obstacles and delivers spoken alerts for visually impaired users.',
      tags: ['Python', 'FastAPI', 'YOLOv8', 'React', 'Google Gemini', 'ElevenLabs API'],
      icon: 'mira',
      demo: 'https://www.youtube.com/watch?v=bWBrbfu0Abs',
      github: null,
    },
    {
      title: 'FamilyOS',
      caption: 'FamilyOS',
      description: 'A secure AI-powered document vault where families can upload documents and FamilyOS auto-organizes those documents into different sections. Families are able to ask the chatbot questions regarding uploaded documents.',
      tags: ['React', 'Python', 'Node.js', 'AI/LLM Integration'],
      icon: 'familyos',
      demo: "https://hackmhc.vercel.app/",
      github: "https://github.com/Kenxeth/hackmhc",
    },
  ],
  skills: [
    {
      category: 'Languages & Core Web',
      items: [
        { name: 'HTML', icon: 'html' },
        { name: 'CSS', icon: 'css' },
        { name: 'JavaScript', icon: 'javascript' },
        { name: 'TypeScript', icon: 'typescript' },
        { name: 'Python', icon: 'python' },
        { name: 'C++', icon: 'cpp' },
        { name: 'Java', icon: 'java' },
      ],
    },
    {
      category: 'Backend & Frameworks',
      items: [
        { name: 'Node.js / Express.js', icon: 'node' },
        { name: 'React', icon: 'react' },
        { name: 'FastAPI', icon: 'fastapi' },
        { name: 'Spring Boot', icon: 'spring' },
        { name: 'GraphQL', icon: 'graphql' },
      ],
    },
    {
      category: 'Cloud & DevOps',
      items: [
        { name: 'AWS', icon: 'aws' },
        { name: 'AWS Lambda', icon: 'lambda' },
        { name: 'DynamoDB', icon: 'dynamodb' },
        { name: 'S3', icon: 's3' },
        { name: 'SQS', icon: 'sqs' },
        { name: 'Terraform', icon: 'terraform' },
      ],
    },
    {
      category: 'Databases & Messaging',
      items: [
        { name: 'PostgreSQL', icon: 'postgresql' },
        { name: 'MongoDB', icon: 'mongodb' },
        { name: 'RabbitMQ', icon: 'rabbitmq' },
      ],
    },
    { category: 'Tools & Version Control', items: [{ name: 'Git', icon: 'git' }] },
  ],
};
