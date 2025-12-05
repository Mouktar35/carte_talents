import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { getDb, saveDatabase } from '../database/init.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper: Récupérer les skills d'un talent
const getTalentSkills = (talentId) => {
  const db = getDb();
  return db.prepare(`
    SELECT s.name FROM skills s
    JOIN talent_skills ts ON s.id = ts.skill_id
    WHERE ts.talent_id = ?
  `).all(talentId).map(s => s.name);
};

// Helper: Récupérer les langues d'un talent
const getTalentLanguages = (talentId) => {
  const db = getDb();
  return db.prepare(`
    SELECT l.name FROM languages l
    JOIN talent_languages tl ON l.id = tl.language_id
    WHERE tl.talent_id = ?
  `).all(talentId).map(l => l.name);
};

// Helper: Récupérer les projets d'un talent
const getTalentProjects = (talentId) => {
  const db = getDb();
  return db.prepare('SELECT id, title, description FROM projects WHERE talent_id = ?').all(talentId);
};

// Helper: Enrichir un talent avec ses relations
const enrichTalent = (talent) => {
  if (!talent) return null;
  return {
    ...talent,
    verified: !!talent.verified,
    skills: getTalentSkills(talent.id),
    languages: getTalentLanguages(talent.id),
    projects: getTalentProjects(talent.id)
  };
};

// GET tous les talents
router.get('/', optionalAuth, (req, res) => {
  try {
    const db = getDb();
    const { search, skill, location, verified, sort = 'name' } = req.query;
    
    let query = 'SELECT * FROM talents WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR bio LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (verified === 'true') {
      query += ' AND verified = 1';
    }

    // Tri
    if (sort === 'name') {
      query += ' ORDER BY name ASC';
    } else if (sort === 'recent') {
      query += ' ORDER BY created_at DESC';
    }

    let talents = db.prepare(query).all(...params);

    // Filtrer par skill si spécifié
    if (skill) {
      talents = talents.filter(t => {
        const skills = getTalentSkills(t.id);
        return skills.includes(skill);
      });
    }

    // Enrichir chaque talent
    talents = talents.map(enrichTalent);

    res.json(talents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des talents' });
  }
});

// GET un talent par ID
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.id);
    if (!talent) {
      return res.status(404).json({ error: 'Talent non trouvé' });
    }
    res.json(enrichTalent(talent));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST créer un talent
router.post('/', authenticateToken, [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('bio').optional().trim(),
  body('location').optional().trim(),
  body('skills').optional().isArray(),
  body('languages').optional().isArray(),
  body('projects').optional().isArray()
], (req, res) => {
  try {
    const db = getDb();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, bio, location, linkedin, github, skills = [], languages = [], projects = [] } = req.body;

    // Créer le talent
    const result = db.prepare(`
      INSERT INTO talents (user_id, name, email, bio, location, linkedin, github)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, name, email, bio, location, linkedin, github);

    const talentId = result.lastInsertRowid;

    // Ajouter les skills
    for (const skillName of skills) {
      let skill = db.prepare('SELECT id FROM skills WHERE name = ?').get(skillName);
      if (!skill) {
        const skillResult = db.prepare('INSERT INTO skills (name) VALUES (?)').run(skillName);
        skill = { id: skillResult.lastInsertRowid };
      }
      db.prepare('INSERT OR IGNORE INTO talent_skills (talent_id, skill_id) VALUES (?, ?)').run(talentId, skill.id);
    }

    // Ajouter les langues
    for (const langName of languages) {
      let lang = db.prepare('SELECT id FROM languages WHERE name = ?').get(langName);
      if (!lang) {
        const langResult = db.prepare('INSERT INTO languages (name) VALUES (?)').run(langName);
        lang = { id: langResult.lastInsertRowid };
      }
      db.prepare('INSERT OR IGNORE INTO talent_languages (talent_id, language_id) VALUES (?, ?)').run(talentId, lang.id);
    }

    // Ajouter les projets
    for (const project of projects) {
      db.prepare('INSERT INTO projects (talent_id, title, description) VALUES (?, ?, ?)').run(talentId, project.title, project.description);
    }

    saveDatabase();
    const newTalent = db.prepare('SELECT * FROM talents WHERE id = ?').get(talentId);
    res.status(201).json(enrichTalent(newTalent));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création du talent' });
  }
});

// PUT mettre à jour un talent
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.id);
    if (!talent) {
      return res.status(404).json({ error: 'Talent non trouvé' });
    }

    // Vérifier que l'utilisateur est propriétaire
    if (talent.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const { name, email, bio, location, linkedin, github, skills, languages, projects } = req.body;

    // Mettre à jour le talent
    db.prepare(`
      UPDATE talents SET name = ?, email = ?, bio = ?, location = ?, linkedin = ?, github = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name || talent.name, email || talent.email, bio || talent.bio, location || talent.location, linkedin || talent.linkedin, github || talent.github, req.params.id);

    // Mettre à jour les skills si fournis
    if (skills) {
      db.prepare('DELETE FROM talent_skills WHERE talent_id = ?').run(req.params.id);
      for (const skillName of skills) {
        let skill = db.prepare('SELECT id FROM skills WHERE name = ?').get(skillName);
        if (!skill) {
          const skillResult = db.prepare('INSERT INTO skills (name) VALUES (?)').run(skillName);
          skill = { id: skillResult.lastInsertRowid };
        }
        db.prepare('INSERT OR IGNORE INTO talent_skills (talent_id, skill_id) VALUES (?, ?)').run(req.params.id, skill.id);
      }
    }

    // Mettre à jour les langues si fournies
    if (languages) {
      db.prepare('DELETE FROM talent_languages WHERE talent_id = ?').run(req.params.id);
      for (const langName of languages) {
        let lang = db.prepare('SELECT id FROM languages WHERE name = ?').get(langName);
        if (!lang) {
          const langResult = db.prepare('INSERT INTO languages (name) VALUES (?)').run(langName);
          lang = { id: langResult.lastInsertRowid };
        }
        db.prepare('INSERT OR IGNORE INTO talent_languages (talent_id, language_id) VALUES (?, ?)').run(req.params.id, lang.id);
      }
    }

    saveDatabase();
    const updatedTalent = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.id);
    res.json(enrichTalent(updatedTalent));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// DELETE supprimer un talent
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const talent = db.prepare('SELECT * FROM talents WHERE id = ?').get(req.params.id);
    if (!talent) {
      return res.status(404).json({ error: 'Talent non trouvé' });
    }

    if (talent.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    db.prepare('DELETE FROM talents WHERE id = ?').run(req.params.id);
    saveDatabase();
    res.json({ message: 'Talent supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// GET statistiques
router.get('/stats/overview', (req, res) => {
  try {
    const db = getDb();
    const totalTalents = db.prepare('SELECT COUNT(*) as count FROM talents').get().count;
    const verifiedTalents = db.prepare('SELECT COUNT(*) as count FROM talents WHERE verified = 1').get().count;
    const totalSkills = db.prepare('SELECT COUNT(DISTINCT id) as count FROM skills').get().count;
    const totalLanguages = db.prepare('SELECT COUNT(DISTINCT id) as count FROM languages').get().count;
    const cities = db.prepare('SELECT COUNT(DISTINCT location) as count FROM talents WHERE location IS NOT NULL').get().count;
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;

    res.json({
      totalTalents,
      verifiedTalents,
      totalSkills,
      totalLanguages,
      cities,
      totalProjects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET skills populaires
router.get('/stats/skills', (req, res) => {
  try {
    const db = getDb();
    const skills = db.prepare(`
      SELECT s.name, COUNT(ts.talent_id) as count
      FROM skills s
      LEFT JOIN talent_skills ts ON s.id = ts.skill_id
      GROUP BY s.id
      ORDER BY count DESC
      LIMIT 20
    `).all();

    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST ajouter aux favoris
router.post('/:id/favorite', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const talent = db.prepare('SELECT id FROM talents WHERE id = ?').get(req.params.id);
    if (!talent) {
      return res.status(404).json({ error: 'Talent non trouvé' });
    }

    db.prepare('INSERT OR IGNORE INTO favorites (user_id, talent_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    saveDatabase();
    res.json({ message: 'Ajouté aux favoris' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE retirer des favoris
router.delete('/:id/favorite', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND talent_id = ?').run(req.user.id, req.params.id);
    saveDatabase();
    res.json({ message: 'Retiré des favoris' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET mes favoris
router.get('/user/favorites', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const favorites = db.prepare(`
      SELECT t.* FROM talents t
      JOIN favorites f ON t.id = f.talent_id
      WHERE f.user_id = ?
    `).all(req.user.id);

    res.json(favorites.map(enrichTalent));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
