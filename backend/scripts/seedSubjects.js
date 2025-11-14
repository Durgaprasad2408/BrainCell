import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from '../models/Subject.js';
import User from '../models/User.js';

dotenv.config();

const defaultSubjects = [
  {
    name: 'Theory Of Computation',
    description: 'Study of abstract machines, automata theory, formal languages, and computability',
    icon: '🧮',
    lessons: 45,
    students: 2340
  },
  {
    name: 'Digital Logic Design',
    description: 'Fundamentals of digital circuits, Boolean algebra, and logic gates',
    icon: '💡',
    lessons: 38,
    students: 1890
  },
  {
    name: 'Computer Networks',
    description: 'Network protocols, architecture, and communication systems',
    icon: '🌐',
    lessons: 52,
    students: 2150
  },
  {
    name: 'Operating Systems',
    description: 'OS concepts including process management, memory management, and file systems',
    icon: '💻',
    lessons: 48,
    students: 2020
  },
  {
    name: 'Database Systems',
    description: 'Database design, SQL, normalization, and transaction management',
    icon: '🗄️',
    lessons: 42,
    students: 1950
  }
];

const seedSubjects = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    await Subject.deleteMany({});
    console.log('Cleared existing subjects');

    const subjectsWithCreator = defaultSubjects.map(subject => ({
      ...subject,
      createdBy: adminUser._id
    }));

    await Subject.insertMany(subjectsWithCreator);
    console.log(`Successfully seeded ${defaultSubjects.length} subjects`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding subjects:', error);
    process.exit(1);
  }
};

seedSubjects();
