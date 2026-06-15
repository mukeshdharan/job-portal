const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, authorizeRoles('candidate'), applicationController.applyForJob);
router.get('/', authMiddleware, applicationController.getApplications);
router.get('/:id', authMiddleware, applicationController.getApplicationById);
router.patch('/:id/status', authMiddleware, authorizeRoles('recruiter', 'admin'), applicationController.updateApplicationStatus);

module.exports = router;
