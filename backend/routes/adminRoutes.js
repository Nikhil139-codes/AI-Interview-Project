const express = require('express');
const router = express.Router();
const {
  getUsers,
  deleteUser,
  getAnalytics,
  getSystemPrompts,
  updateSystemPrompt
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// All routes require user to be logged in and be an admin
router.use(protect);
router.use(admin);

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .delete(deleteUser);

router.route('/analytics')
  .get(getAnalytics);

router.route('/prompts')
  .get(getSystemPrompts);

router.route('/prompts/:id')
  .put(updateSystemPrompt);

module.exports = router;
