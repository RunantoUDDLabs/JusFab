const express = require('express');

const { isAuth, isAdmin } = require('../middlewares/auth.middleware');
const upload = require('../config/multer.config');
const { listFolderRecursive, deleteAsset } = require('../services/assets.service');
const EError = require('../utils/EError');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

/**
 * @swagger
 * /asset/upload:
 *   post:
 *     tags:
 *       - asset
 *     security:
 *       - bearerAuth: []
 *     summary: Upload a single file
 *     description: Upload a file using multipart/form-data.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       "200":
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fieldname:
 *                   type: string
 *                 originalname:
 *                   type: string
 *                 encoding:
 *                   type: string
 *                 mimetype:
 *                   type: string
 *                 size:
 *                   type: integer
 *                 path:
 *                   type: string
 *                   description: Path where the file is stored
 *       "400":
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No file uploaded"
 */
router.post('/upload', isAdmin, upload.single('file'), (req, res, next) => {
  if (!req.file) {
    next(new EError(200, 'No file uploaded'));
  }
  res.status(200).json(
    req.file,
  );
});

/**
 * @swagger
 * /asset/all:
 *   get:
 *     tags:
 *       - asset
 *     security:
 *       - bearerAuth: []
 *     summary: Retrieve all files from the uploads folder
 *     description: Lists all files and directories recursively in the `/uploads` folder.
 *     responses:
 *       "200":
 *         description: List of files and directories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the file or directory
 *                   path:
 *                     type: string
 *                     description: Full path to the file or directory
 *                   type:
 *                     type: string
 *                     description: Type of asset (file or directory)
 *                     enum:
 *                       - file
 *                       - directory
 */
router.get('/all', async (req, res) => {
  let files = await listFolderRecursive('./uploads');
  res.status(200).json(files)
});

/**
 * @swagger
 * /asset/delete:
 *   delete:
 *     tags:
 *       - asset
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a file
 *     description: Deletes a file from the server based on the provided file path.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 *                 description: Path to the file to delete
 *                 example: "/uploads/file1.txt"
 *     responses:
 *       "200":
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File deleted successfully"
 *       "400":
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File path is required"
 *       "404":
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File not found"
 *       "500":
 *         description: Server error
 */
router.delete('/delete', isAdmin, async (req, res, next) => {
  try {
    const { filePath } = req.body;
    if (!filePath) {
      next(new EError(400, 'File path is required'));
      return;
    }
    if (await deleteAsset(filePath)) {
      res.status(200).json({ success: true, data: filePath });
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router; 