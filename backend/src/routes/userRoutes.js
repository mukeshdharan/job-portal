const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/profile/resume', authMiddleware, authorizeRoles('candidate'), upload.single('resume'), userController.uploadResume);
router.get('/notifications', authMiddleware, userController.getNotifications);
router.post('/notifications/read', authMiddleware, userController.markNotificationsRead);

// Stats dashboards
router.get('/admin/stats', authMiddleware, authorizeRoles('admin'), userController.getAdminStats);
router.get('/recruiter/stats', authMiddleware, authorizeRoles('recruiter', 'admin'), userController.getRecruiterStats);

module.exports = router;
