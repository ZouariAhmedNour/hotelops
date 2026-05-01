import { NextFunction, Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { upload } from "../config/multer";
import { success } from "../utils/response";
import * as attachmentService from '../services/attachmentService';

// 🔹 Type pour req.user (injecté par authenticate)
interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
  file?: Express.Multer.File;
}

const router = Router();

// 🔹 Middleware auth global
router.use(authenticate);

// ================= UPLOAD =================
router.post(
  '/tickets/:ticketId/attachments',
  upload.single('file'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw Object.assign(new Error('Non authentifié'), { statusCode: 401 });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Fichier manquant',
        });
      }

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
router.delete(
  '/attachments/:id',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw Object.assign(new Error('Non authentifié'), { statusCode: 401 });
      }

      await attachmentService.deleteAttachment(
        Number(req.params.id),
        req.user.userId
      );

      return success(res, null, 'Pièce jointe supprimée');
    } catch (err) {
      next(err);
    }
  }
);

export default router;