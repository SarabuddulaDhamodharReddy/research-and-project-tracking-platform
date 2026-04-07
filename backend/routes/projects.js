const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { cloudinary, upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// ─── Helper: extract Cloudinary public_id from secure_url ─────────────────────
function getPublicId(fileUrl) {
  if (!fileUrl) return null;
  // e.g. https://res.cloudinary.com/<cloud>/raw/upload/v123/research-platform/abc123
  const parts = fileUrl.split('/');
  const folder = parts[parts.length - 2];
  const filename = parts[parts.length - 1].split('.')[0];
  return `${folder}/${filename}`;
}

// ─── GET /api/projects ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { department, year, status, search } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (year) filter.year = Number(year);
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(filter)
      .populate('ownerId', 'name email department')
      .populate('collaborators', 'name email')
      .populate('contributors.userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /api/projects/user/mine ───────────────────────────────────────────────
// ⚠️ Must be BEFORE /:id or Express will treat "mine" as an id
router.get('/user/mine', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { ownerId: req.user._id },
        { collaborators: req.user._id },
      ],
    })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── GET /api/projects/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('ownerId', 'name email department')
      .populate('collaborators', 'name email department')
      .populate('contributors.userId', 'name email department');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── POST /api/projects ────────────────────────────────────────────────────────
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, description, department, year, status } = req.body;

    if (!title || !description || !department || !year) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // req.file.path is the Cloudinary secure_url (persists on Render)
    const fileUrl = req.file ? req.file.path : '';

    const project = await Project.create({
      title,
      description,
      department,
      year: Number(year),
      ownerId: req.user._id,
      status: status || 'ongoing',
      fileUrl,
      contributors: [{ userId: req.user._id, role: 'owner' }],
    });

    const populated = await project.populate('ownerId', 'name email department');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PUT /api/projects/:id ─────────────────────────────────────────────────────
router.put('/:id', protect, upload.single('file'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.ownerId.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators
      .map((c) => c.toString())
      .includes(req.user._id.toString());

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Not authorized to edit this project' });
    }

    const { title, description, department, year, status } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;

    // Only owner can change department/year
    if (isOwner) {
      if (department) project.department = department;
      if (year) project.year = Number(year);
    }

    // If new file uploaded — delete old from Cloudinary, store new URL
    if (req.file) {
      const oldPublicId = getPublicId(project.fileUrl);
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'raw' });
      }
      project.fileUrl = req.file.path;
    }

    const updated = await project.save();
    await updated.populate('ownerId', 'name email department');
    await updated.populate('collaborators', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── DELETE /api/projects/:id ──────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete this project' });
    }

    // Delete file from Cloudinary
    const publicId = getPublicId(project.fileUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── POST /api/projects/:id/collaborators ──────────────────────────────────────
router.post('/:id/collaborators', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId, role } = req.body;

    if (!project.collaborators.map(c => c.toString()).includes(userId)) {
      project.collaborators.push(userId);
    }

    const alreadyContributor = project.contributors.find(
      (c) => c.userId.toString() === userId
    );
    if (!alreadyContributor) {
      project.contributors.push({ userId, role: role || 'collaborator' });
    }

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
