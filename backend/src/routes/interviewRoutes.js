const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, authorizeRoles('recruiter', 'admin'), interviewController.scheduleInterview);
router.get('/', authMiddleware, interviewController.getInterviews);
router.patch('/:id', authMiddleware, authorizeRoles('recruiter', 'admin'), interviewController.updateInterviewStatus);

module.exports = router;
