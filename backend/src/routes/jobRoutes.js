const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Public route to view listings
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

// Recruiter/Admin only routes
router.post('/', authMiddleware, authorizeRoles('recruiter', 'admin'), jobController.createJob);
router.put('/:id', authMiddleware, authorizeRoles('recruiter', 'admin'), jobController.updateJob);
router.delete('/:id', authMiddleware, authorizeRoles('recruiter', 'admin'), jobController.deleteJob);
router.patch('/:id/status', authMiddleware, authorizeRoles('recruiter', 'admin'), jobController.toggleJobStatus);

module.exports = router;
