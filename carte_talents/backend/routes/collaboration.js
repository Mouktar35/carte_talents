import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDb, saveDatabase } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Envoyer une demande de collaboration
router.post('/request', authenticateToken, [
  body('receiverId').isInt(),
  body('message').trim().notEmpty()
], (req, res) => {
  try {
    const db = getDb();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    // Vérifier que le destinataire existe
    const receiver = db.prepare('SELECT id FROM users WHERE id = ?').get(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier qu'on n'envoie pas à soi-même
    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous envoyer une demande' });
    }

    // Vérifier qu'une demande n'existe pas déjà (pending)
    const existing = db.prepare(
      'SELECT id FROM collaboration_requests WHERE sender_id = ? AND receiver_id = ? AND status = ?'
    ).get(senderId, receiverId, 'pending');

    if (existing) {
      return res.status(400).json({ error: 'Une demande est déjà en attente' });
    }

    // Créer la demande
    const result = db.prepare(
      'INSERT INTO collaboration_requests (sender_id, receiver_id, message) VALUES (?, ?, ?)'
    ).run(senderId, receiverId, message);

    saveDatabase();

    res.status(201).json({
      message: 'Demande envoyée avec succès',
      requestId: result.lastInsertRowid
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la demande' });
  }
});

// Obtenir les demandes reçues
router.get('/received', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const requests = db.prepare(`
      SELECT cr.*, u.name as sender_name, u.email as sender_email,
             t.bio as sender_bio, t.location as sender_location
      FROM collaboration_requests cr
      JOIN users u ON cr.sender_id = u.id
      LEFT JOIN talents t ON t.user_id = u.id
      WHERE cr.receiver_id = ?
      ORDER BY cr.created_at DESC
    `).all(req.user.id);

    // Enrichir avec les skills du sender
    const enrichedRequests = requests.map(r => {
      const talent = db.prepare('SELECT id FROM talents WHERE user_id = ?').get(r.sender_id);
      let skills = [];
      if (talent) {
        skills = db.prepare(`
          SELECT s.name FROM skills s
          JOIN talent_skills ts ON s.id = ts.skill_id
          WHERE ts.talent_id = ?
        `).all(talent.id).map(s => s.name);
      }
      return { ...r, sender_skills: skills };
    });

    res.json(enrichedRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir les demandes envoyées
router.get('/sent', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const requests = db.prepare(`
      SELECT cr.*, u.name as receiver_name, u.email as receiver_email
      FROM collaboration_requests cr
      JOIN users u ON cr.receiver_id = u.id
      WHERE cr.sender_id = ?
      ORDER BY cr.created_at DESC
    `).all(req.user.id);

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Compter les demandes non lues
router.get('/count', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const count = db.prepare(
      'SELECT COUNT(*) as count FROM collaboration_requests WHERE receiver_id = ? AND status = ?'
    ).get(req.user.id, 'pending');

    res.json({ count: count.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Accepter une demande
router.put('/:id/accept', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const request = db.prepare('SELECT * FROM collaboration_requests WHERE id = ?').get(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    if (request.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
    }

    db.prepare(
      'UPDATE collaboration_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run('accepted', req.params.id);

    saveDatabase();

    res.json({ message: 'Demande acceptée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Refuser une demande
router.put('/:id/reject', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const request = db.prepare('SELECT * FROM collaboration_requests WHERE id = ?').get(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    if (request.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
    }

    db.prepare(
      'UPDATE collaboration_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run('rejected', req.params.id);

    saveDatabase();

    res.json({ message: 'Demande refusée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une demande (pour l'expéditeur)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const request = db.prepare('SELECT * FROM collaboration_requests WHERE id = ?').get(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    if (request.sender_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    db.prepare('DELETE FROM collaboration_requests WHERE id = ?').run(req.params.id);
    saveDatabase();

    res.json({ message: 'Demande supprimée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

