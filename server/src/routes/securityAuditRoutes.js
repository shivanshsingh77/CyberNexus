import { Router } from 'express';
import { runSecurityAudit } from '../controllers/securityAuditController.js';

const router = Router();

// Endpoint to run real-time security tests on the application
router.get('/run', runSecurityAudit);

export default router;
