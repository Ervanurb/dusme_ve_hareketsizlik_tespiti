const router = require('express').Router();
const auth = require('../../middleware/auth');
const c = require('./alert.controller');
router.use(auth);
router.get('/', c.listAlerts);
router.patch('/:id/resolve', c.resolveAlert);
module.exports = router;
