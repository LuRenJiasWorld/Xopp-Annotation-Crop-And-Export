import path from 'path';
import { promises as fsPromise } from "fs";


export const saveClipsToFile = async (clipsByPage, savePath) => {
    for (let idx = 0; idx < clipsByPage.length; idx++) {
        const clipsInPage = clipsByPage[idx];
        if (clipsInPage === undefined) continue;

        for (let i = 0; i < clipsInPage.length; i++) {
            const clips = clipsInPage[i];
            
            await fsPromise.writeFile(path.join(savePath, `/${idx + 1}-${i + 1}.png`), clips);
        }
    }
}
