import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../config/multer';
import { success } from '../utils/response';
import * as attachmentService from '../services/attachmentService';
import { registry } from '../config/swagger';

const router = Router();

// 🔹 Swagger
registry.registerPath({
  method: 'post',
  path: '/api/attachments/tickets/{ticketId}/attachments',
  tags: ['Attachments'],
  responses: {
    201: { description: 'Fichier uploadé' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/attachments/{id}',
  tags: ['Attachments'],
  responses: {
    200: { description: 'Pièce jointe supprimée' },
  },
});

// 🔹 Auth middleware
router.use(authenticate);

// ================= UPLOAD =================
router.post(
  '/tickets/:ticketId/attachments',
  upload.single('file'),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const attachment = await attachmentService.addAttachment(
        Number(req.params.ticketId),
        req.file,
        req.user.userId
      );

      return success(res, attachment, 'Fichier uploadé', 201);
    } catch (err) {
      next(err);
    }
  }
);

// ================= DELETE =================
router.delete('/:id', async (req: any, res, next) => {
  try {
    await attachmentService.deleteAttachment(
      Number(req.params.id),
      req.user.userId
    );

    return success(res, null, 'Pièce jointe supprimée');
  } catch (err) {
    next(err);
  }
});

export default router;