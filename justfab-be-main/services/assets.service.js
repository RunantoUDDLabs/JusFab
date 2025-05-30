const fs = require('fs').promises;
const path = require('path');
const EError = require('../utils/EError');

const listFolderRecursive = async (folderPath) => {
  const results = [];
  const files = await fs.readdir(folderPath);

  for (let f in files) {
    const file = files[f];
    const fullPath = path.join(folderPath, file);
    const isDirectory = (await fs.stat(fullPath)).isDirectory();
    if (isDirectory) {
      results.push(...listFolderRecursive(fullPath)); // Recursively add subfolder contents
    } else {
      results.push(fullPath);
    }
  };

  return results;
};

const deleteAsset = async (filePath) => {
  try {
    const fullPath = path.resolve(filePath);
    await fs.unlink('./' + filePath);
    return true;
  } catch (e) {
    console.log(e);
    if (e.code === 'ENOENT') {
      throw (new EError(404, 'File not found'));
    }
    throw (new EError(400, 'Failed to delete file'));
  }
}

module.exports = { listFolderRecursive, deleteAsset };