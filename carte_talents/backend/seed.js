import bcrypt from 'bcryptjs';
import { initDatabase, getDb, saveDatabase } from './database/init.js';

async function seed() {
  console.log('🌱 Seeding database...');

  // Initialize database first
  await initDatabase();
  const db = getDb();

  // Créer un utilisateur admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  db.prepare('INSERT OR IGNORE INTO users (email, password, name) VALUES (?, ?, ?)').run('admin@cesi.fr', adminPassword, 'Admin CESI');

  // Données des talents avec leurs comptes utilisateurs
  const talentsData = [
    {
      name: 'Sophie Martin',
      email: 'sophie.martin@example.com',
      password: 'sophie123',
      bio: "Développeuse Full Stack passionnée par l'UX/UI et l'accessibilité web.",
      location: 'Paris',
      linkedin: 'sophie-martin',
      github: 'sophiemtn',
      verified: 1,
      skills: ['React', 'Node.js', 'UI/UX Design', 'MongoDB', 'TypeScript'],
      languages: ['Français', 'Anglais', 'Espagnol'],
      projects: [
        { title: 'Plateforme E-commerce', description: 'Application React avec paiement Stripe' },
        { title: 'Dashboard Analytics', description: 'Visualisation de données en temps réel' }
      ]
    },
    {
      name: 'Thomas Dubois',
      email: 'thomas.dubois@example.com',
      password: 'thomas123',
      bio: "Data Scientist & Machine Learning Engineer passionné par l'IA.",
      location: 'Lyon',
      linkedin: 'thomas-dubois',
      github: 'tdubois',
      verified: 1,
      skills: ['Python', 'TensorFlow', 'Data Analysis', 'SQL', 'Docker'],
      languages: ['Français', 'Anglais'],
      projects: [{ title: 'Prédiction de ventes', description: 'Modèle ML avec 95% de précision' }]
    },
    {
      name: 'Emma Lefebvre',
      email: 'emma.lefebvre@example.com',
      password: 'emma123',
      bio: 'Designer UI/UX et illustratrice créative.',
      location: 'Bordeaux',
      linkedin: 'emma-lefebvre',
      github: '',
      verified: 0,
      skills: ['Figma', 'Adobe XD', 'Illustration', 'Branding'],
      languages: ['Français', 'Anglais', 'Italien'],
      projects: [{ title: 'Refonte app mobile', description: 'Design system complet' }]
    },
    {
      name: 'Lucas Bernard',
      email: 'lucas.bernard@example.com',
      password: 'lucas123',
      bio: 'Développeur Backend expert en microservices.',
      location: 'Paris',
      linkedin: 'lucas-bernard',
      github: 'lucasbdev',
      verified: 1,
      skills: ['Java', 'Spring Boot', 'Kubernetes', 'AWS', 'PostgreSQL'],
      languages: ['Français', 'Anglais', 'Allemand'],
      projects: [{ title: 'Plateforme streaming', description: 'Backend pour 1M+ utilisateurs' }]
    },
    {
      name: 'Chloé Petit',
      email: 'chloe.petit@example.com',
      password: 'chloe123',
      bio: "Product Manager avec 5 ans d'expérience tech.",
      location: 'Nantes',
      linkedin: 'chloe-petit',
      github: '',
      verified: 1,
      skills: ['Product Strategy', 'Agile', 'User Research', 'Roadmapping'],
      languages: ['Français', 'Anglais'],
      projects: [{ title: 'App livraison', description: '0 à 100K utilisateurs en 6 mois' }]
    },
    {
      name: 'Maxime Roux',
      email: 'maxime.roux@example.com',
      password: 'maxime123',
      bio: "DevOps Engineer passionné d'automatisation.",
      location: 'Lyon',
      linkedin: 'maxime-roux',
      github: 'maxroux',
      verified: 1,
      skills: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
      languages: ['Français', 'Anglais'],
      projects: [{ title: 'Infrastructure as Code', description: 'Migration AWS avec Terraform' }]
    },
    {
      name: 'Julie Moreau',
      email: 'julie.moreau@example.com',
      password: 'julie123',
      bio: 'Développeuse mobile iOS et Android.',
      location: 'Toulouse',
      linkedin: 'julie-moreau',
      github: 'jmoreau',
      verified: 0,
      skills: ['React Native', 'Swift', 'Kotlin', 'Firebase'],
      languages: ['Français', 'Anglais', 'Portugais'],
      projects: [{ title: 'App fitness', description: '50K+ téléchargements' }]
    },
    {
      name: 'Alexandre Girard',
      email: 'alexandre.girard@example.com',
      password: 'alex123',
      bio: 'Expert cybersécurité et ethical hacking.',
      location: 'Paris',
      linkedin: 'alexandre-girard',
      github: 'alexsec',
      verified: 1,
      skills: ['Pentest', 'OWASP', 'Python', 'Network Security'],
      languages: ['Français', 'Anglais'],
      projects: [{ title: 'Audit sécurité', description: '50+ vulnérabilités corrigées' }]
    }
  ];

  // Insérer les talents avec leurs comptes utilisateurs
  for (const talent of talentsData) {
    // Créer d'abord le compte utilisateur
    const hashedPassword = await bcrypt.hash(talent.password, 10);
    const userResult = db.prepare('INSERT OR IGNORE INTO users (email, password, name) VALUES (?, ?, ?)').run(talent.email, hashedPassword, talent.name);
    
    // Récupérer l'ID de l'utilisateur (créé ou existant)
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(talent.email);
    const userId = user.id;

    // Vérifier si le talent existe déjà
    const existingTalent = db.prepare('SELECT id FROM talents WHERE email = ?').get(talent.email);
    if (existingTalent) {
      console.log(`⏭️ Skipped (exists): ${talent.name}`);
      continue;
    }

    // Insérer le talent lié à l'utilisateur
    const result = db.prepare(`
      INSERT INTO talents (user_id, name, email, bio, location, linkedin, github, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, talent.name, talent.email, talent.bio, talent.location, talent.linkedin, talent.github, talent.verified);

    const talentId = result.lastInsertRowid;

    // Insérer les skills
    for (const skillName of talent.skills) {
      let skill = db.prepare('SELECT id FROM skills WHERE name = ?').get(skillName);
      if (!skill) {
        const skillResult = db.prepare('INSERT INTO skills (name) VALUES (?)').run(skillName);
        skill = { id: skillResult.lastInsertRowid };
      }
      db.prepare('INSERT OR IGNORE INTO talent_skills (talent_id, skill_id) VALUES (?, ?)').run(talentId, skill.id);
    }

    // Insérer les langues
    for (const langName of talent.languages) {
      let lang = db.prepare('SELECT id FROM languages WHERE name = ?').get(langName);
      if (!lang) {
        const langResult = db.prepare('INSERT INTO languages (name) VALUES (?)').run(langName);
        lang = { id: langResult.lastInsertRowid };
      }
      db.prepare('INSERT OR IGNORE INTO talent_languages (talent_id, language_id) VALUES (?, ?)').run(talentId, lang.id);
    }

    // Insérer les projets
    for (const project of talent.projects) {
      db.prepare('INSERT INTO projects (talent_id, title, description) VALUES (?, ?, ?)').run(talentId, project.title, project.description);
    }

    console.log(`✅ Added: ${talent.name} (user_id: ${userId})`);
  }

  // Save all changes to disk
  saveDatabase();
  
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Comptes de test disponibles:');
  console.log('   Admin: admin@cesi.fr / admin123');
  console.log('   Sophie: sophie.martin@example.com / sophie123');
  console.log('   Thomas: thomas.dubois@example.com / thomas123');
  console.log('   Emma: emma.lefebvre@example.com / emma123');
  console.log('   Lucas: lucas.bernard@example.com / lucas123');
  console.log('   Chloé: chloe.petit@example.com / chloe123');
  console.log('   Maxime: maxime.roux@example.com / maxime123');
  console.log('   Julie: julie.moreau@example.com / julie123');
  console.log('   Alexandre: alexandre.girard@example.com / alex123');
}

seed().catch(console.error);
