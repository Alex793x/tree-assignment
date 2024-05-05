const fsPromises = require('fs').promises;
const path = require('path');

async function listDirectories(directoryPath, indentationLevel) {
    try {
        const filesInDirectory = await fsPromises.readdir(directoryPath);

        for (const fileName of filesInDirectory) {
            const filePath = path.join(directoryPath, fileName);
            const fileStats = await fsPromises.stat(filePath);

            if (fileStats.isDirectory()) {                
                const indentationPrefix = indentationLevel === 0 ? '' : '│   '.repeat(indentationLevel - 1) + '├── ';
                console.log(indentationPrefix + fileName);

                await listDirectories(filePath, indentationLevel + 1);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

listDirectories(process.cwd(), 0);