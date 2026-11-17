import type es from './es';

const en: typeof es = {
  meta: {
    title: 'Manuel Carretero | Technology built around your business',
    description:
      'Independent consultant and developer. Internal systems, new apps, upgrades to your software and interactive experiences, built around your business.',
    ogDescription: 'Technology built around your business, not the other way around. Tell me what you need.'
  },
  skip: 'Skip to content',
  nav: {
    label: 'Sections',
    menu: 'Menu',
    services: 'Services',
    build: 'Build your system',
    proof: 'Results',
    process: 'How I work',
    about: 'About',
    contact: 'Email me',
    language: 'Language'
  },
  hero: {
    eyebrow: 'Independent consultant and developer',
    title: 'Technology built around your business, not the other way around.',
    text: 'You tell me the problem. I find the right solution and build it: sometimes that means automating, sometimes connecting what you already use, sometimes a new app.',
    primary: 'Tell me what you need',
    secondary: 'See how I work',
    points: [
      '5+ years at companies in the US and Mexico',
      'You work directly with the person who builds it',
      'No technical jargon'
    ],
    stageAria: 'A 3D view of four things I can build, one for each type of service',
    stageFallback: '3D not available',
    stepsLabel: 'Types of service',
    ctaSay1: 'Tell me what is in your way. We talk it through without jargon.',
    ctaSay2: 'Here I explain how I work, step by step.',
    stageSay: 'This is how it is built:'
  },
  services: {
    tag: 'SERVICES',
    title: 'What I can solve for you',
    sub: 'Four kinds of work. Tell me your problem and we decide together which one fits.',
    painLabel: 'You feel it',
    doLabel: 'What I do',
    proofLabel: 'Proof',
    items: [
      {
        title: 'Internal systems and automation',
        pain: 'Your team spends the day between Excel, WhatsApp and paper, and orders or tasks get lost along the way.',
        does: 'I bring everything into one system made for you, and I automate the tasks that are done by hand today.',
        proof: 'For an industrial staffing agency, the system ranks available workers by experience and distance for every request.',
        say: 'Does your team live in spreadsheets? We put it in order.'
      },
      {
        title: 'New apps and products',
        pain: 'You have an idea, or you want customers to buy and book from their phone, and you do not know where to start.',
        does: 'I help you define a simple first version and I build it for iOS, Android and the web.',
        proof: 'For an education organization, I built one app with a single codebase for iOS, Android and web.',
        say: 'Got an idea? Let us start with the simplest part.'
      },
      {
        title: 'Improving existing software',
        pain: 'Your system or website is slow, it is getting old, and every small change takes weeks.',
        does: 'I find where it gets stuck, speed it up and update it piece by piece, without stopping your operation.',
        proof: 'At a digital advertising company, pages went from loading in about 3 seconds to about 0.7.',
        say: 'Is your system slow? We tune it.'
      },
      {
        title: 'Interactive experiences',
        pain: 'You want your brand to stand out, and you want people to touch, play and remember, not just look.',
        does: 'I create interactive content in 2D, 3D and augmented reality, and I measure how each visitor uses it.',
        proof: 'Interactive ads with 2D, 3D, augmented reality and physics, with real-time tracking.',
        say: 'Want your brand to be touchable? We make it 3D.'
      }
    ],
    noteTag: 'ALSO AVAILABLE',
    noteTitle: 'Know your customers better to sell more',
    noteText:
      'I help you organize your data to see what sells, who comes back and what works, so you can make better decisions.',
    noteSay: 'If you know what your customers like, you sell better.'
  },
  build: {
    tag: 'BUILD YOUR SYSTEM',
    title: 'Build your system',
    sub: 'Mark what is happening in your business and see how we could solve it.',
    stageAria: 'A 3D view of what we could build, one part for each area',
    stageFallback: '3D not available',
    counterNone: 'Nothing selected',
    counter: '{n} of 4 areas under way',
    clear: 'Clear all',
    resultTag: 'WHAT WE COULD BUILD',
    empty: 'Mark what is happening and you will see here how we could help.',
    send: 'Tell Manuel about this',
    greeting: 'Hi! Tell me what keeps you up at night and we build it.',
    removed: 'Done, I took it out.',
    lines: [
      {
        id: 'ops',
        n: '01',
        title: 'Operations and data',
        module: 'Your business panel',
        chips: [
          {
            id: 'ops1',
            label: 'I run my business with Excel, WhatsApp and notebooks',
            say: 'Everything in one place. What a relief.',
            benefit: 'Your whole business in one place, no loose sheets.'
          },
          {
            id: 'ops2',
            label: 'I lose orders, appointments or tasks',
            say: 'Nothing slips by: I warn you in time.',
            benefit: 'Every order, appointment and task in sight, with alerts so nothing is forgotten.'
          },
          {
            id: 'ops3',
            label: 'I do the same tasks by hand every week',
            say: 'A computer can do that. You look after your customers.',
            benefit: 'Repeated tasks run on their own and you get your time back.'
          },
          {
            id: 'ops4',
            label: 'I can never find the information when I need it',
            say: 'Everything in order and one click away.',
            benefit: 'Any piece of data, one click away, right when you need it.'
          }
        ]
      },
      {
        id: 'app',
        n: '02',
        title: 'New app or idea',
        module: 'Your app',
        chips: [
          {
            id: 'app1',
            label: 'I have an idea and I do not know where to start',
            say: 'An idea! Let us start with the simplest part.',
            benefit: 'A simple first version to test your idea with real people, without overspending.'
          },
          {
            id: 'app2',
            label: 'I want my customers to buy or book online',
            say: 'Your business open at any hour.',
            benefit: 'Your customers buy or book online, whenever they want.'
          },
          {
            id: 'app3',
            label: 'I want an app for my customers or my team',
            say: 'An app made for you, easy to use.',
            benefit: 'An app made for your customers or your team, easy to use.'
          }
        ]
      },
      {
        id: 'soft',
        n: '03',
        title: 'Existing software',
        module: 'Your system, improved',
        chips: [
          {
            id: 'soft1',
            label: 'My website or system takes too long to load',
            say: 'Let us see where it gets stuck.',
            benefit: 'Your website or system responds faster and nobody waits.'
          },
          {
            id: 'soft2',
            label: 'My system is old and nobody dares to touch it',
            say: 'It gets renewed in parts, without throwing away what works.',
            benefit: 'Your current system is renewed little by little, without stopping your business.'
          },
          {
            id: 'soft3',
            label: 'Every small change takes weeks',
            say: 'A small change should not be this hard.',
            benefit: 'Small changes happen quickly and without scares.'
          }
        ]
      },
      {
        id: 'exp',
        n: '04',
        title: 'Experiences and data',
        module: 'Your brand and your customers',
        chips: [
          {
            id: 'exp1',
            label: 'I want my brand to stand out online',
            say: 'Let them see you and remember you!',
            benefit: 'An online experience that makes your brand look different and stay in memory.'
          },
          {
            id: 'exp2',
            label: 'I want to know my customers better to sell more',
            say: 'If you know what they like, you sell better.',
            benefit: 'Know your customers better and see what sells most and what works.'
          }
        ]
      }
    ]
  },
  proof: {
    tag: 'RESULTS',
    title: 'What I have already built',
    sub: 'More than 5 years building software for companies in the US and Mexico. Four examples, told by what they changed for the business.',
    prev: 'Previous',
    next: 'Next',
    slideOf: 'of',
    items: [
      {
        kind: 'Client · Industrial staffing agency in the US',
        org: 'JBC Manpower',
        headline: 'The right worker for every request',
        text: 'When a company asks for staff, the system ranks the available workers by experience, distance and fit for the job. The team finds the right person faster.',
        facts: [
          'Admin panel the recruiting team uses every day',
          'Worker ranking with maps: experience, distance and profile',
          'Website and online sign-up for job seekers'
        ]
      },
      {
        kind: 'Client · Education platform',
        org: 'WRSI',
        headline: 'Four separate tools, one platform',
        text: 'One platform replaced Squarespace, Monday.com, Google Drive and WhatsApp. Counselors use it every day and there are no duplicate records.',
        facts: [
          '300 registered users',
          'One codebase for iOS, Android and the web',
          'Three roles: student, counselor and administrator'
        ]
      },
      {
        kind: 'Company · Digital advertising (adtech) · Oct 2022 – Apr 2026',
        org: 'Evolve Media LLC',
        headline: 'Pages that load about 4 times faster',
        text: 'From about 3 seconds to about 0.7. I also upgraded old systems (React 16 to 19, Angular 10 to 18) without stopping operations.',
        facts: [
          'More than 20 standardized forms and screens with more than 1,000 records',
          'Automated tests that protect what already worked',
          'Interactive ads in 2D, 3D, augmented reality and physics, with real-time event tracking'
        ]
      },
      {
        kind: 'Company · Financial technology (fintech) · Jul 2021 – Jul 2022',
        org: 'UnDosTres',
        headline: 'Software that handles real money',
        text: 'I have built software that moves real money, at a financial technology company.',
        facts: ['Account statements', 'Payment flows', 'APIs']
      }
    ]
  },
  process: {
    tag: 'HOW I WORK',
    title: 'How I work',
    sub: 'Four steps, no surprises.',
    steps: [
      {
        title: 'Understand the need',
        text: 'We talk about your business and what gets in your way. No jargon: I ask the questions.'
      },
      {
        title: 'Propose a solution',
        text: 'I explain what I would do, what it includes and what it costs, with a clear scope from the start.'
      },
      {
        title: 'Build it',
        text: 'I build in stages and show you progress as I go, so you can correct course in time.'
      },
      {
        title: 'Keep improving it',
        text: 'After launch I stay with you: maintenance and improvements as your business grows.'
      }
    ],
    note: 'Each project has a defined price and scope, paid in monthly installments. After launch, maintenance continues.'
  },
  about: {
    tag: 'ABOUT',
    title: 'About me',
    photoAlt: 'Portrait of Manuel Carretero',
    paragraphs: [
      'I am Manuel Carretero, an independent consultant and developer.',
      'I work alone: you talk directly to the person who builds what you need, with no middlemen.',
      'I have more than 5 years of experience at companies in the US and Mexico, from internal systems to apps and interactive experiences.',
      'I am not a graphic designer. What I deliver are functional, easy-to-use interfaces.'
    ],
    languages: 'I work in Spanish and in English.'
  },
  contact: {
    tag: 'CONTACT',
    title: 'Tell me what you need',
    sub: 'Write to me in your own words, no jargon. I answer you myself.',
    emailLabel: 'Or write to me at',
    email: 'manuelalejandrosac@gmail.com',
    name: 'Name',
    mail: 'Email',
    message: 'Message',
    submit: 'Send message',
    sending: 'Sending…',
    refresh: 'Update with my selection',
    errName: 'Enter your name.',
    errEmail: 'Enter a valid email, for example name@email.com.',
    errMessage: 'Tell me a little about what you need.',
    success: 'Thank you. I got your message and I will answer soon.',
    error: 'I could not send the message. Write to me directly at',
    errorLink: 'manuelalejandrosac@gmail.com',
    messageEmpty: 'Hi Manuel. I would like to talk about my business.',
    messageIntro: 'Hi Manuel. I would like to solve this:',
    mailSubject: 'I want to talk about my business'
  },
  footer: {
    tagline: 'Technology built around your business, not the other way around.',
    role: 'Independent consultant and developer',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    newTab: '(opens in a new tab)',
    language: 'Language',
    rights: 'Manuel Carretero'
  },
  crocky: {
    label: 'Crocky, the site mascot',
    pet: 'Pet Crocky',
    hide: 'Hide Crocky',
    show: 'Show Crocky',
    name: 'Crocky',
    greeting: 'Hi! I am Crocky. What would you like to solve?',
    petLines: ['Hehe, thanks!', 'I like that!'],
    sections: {
      inicio: 'Hi! I am Crocky. What would you like to solve?',
      servicios: 'Four paths. Tell me which one looks most like yours.',
      'arma-tu-sistema': 'Mark what is happening and watch us build it.',
      resultados: 'Manuel already built these. No empty promises.',
      'como-trabajo': 'Four steps and no surprises.',
      'sobre-mi': 'This is Manuel. He works alone, so you talk to him directly.',
      contacto: 'Tell him what you need. I will keep watch.'
    },
    proofSay: 'A real case, told by what changed.',
    stepSay: 'One step at a time.'
  }
};

export default en;
