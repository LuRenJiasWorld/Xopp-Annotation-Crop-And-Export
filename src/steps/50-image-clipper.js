import sharp from 'sharp';
import Pdf2Pic from 'pdf2pic'

import { SCALE_FACTOR_EXPORT } from '../constant.js';
import { getNestedRect } from '../utils.js'; 


export const getImageOfStrokedPages = async (mrbByPage, pdfFile, pdfWidth, pdfHeight) => {
    const imageByPage = new Array(mrbByPage.length);
    for (let idx = 0; idx < mrbByPage.length; idx++) {
        const mrbInPage = mrbByPage[idx];
        if (mrbInPage === undefined) continue;
        
        const currentPagePNGBase64 = (await Pdf2Pic.fromBuffer(pdfFile, {
            format: 'png',
            density: 144,
            width: parseInt(pdfWidth) * SCALE_FACTOR_EXPORT,
            height: parseInt(pdfHeight) * SCALE_FACTOR_EXPORT,
        })(idx + 1, true)).base64;

        imageByPage[idx] = Buffer.from(currentPagePNGBase64, 'base64');
    }

    return imageByPage;
}

export const clipImageFromPage = async (imageByPage, mrbByPage, pdfWidth, pdfHeight) => {
    const clipsByPage = new Array(mrbByPage.length);
    for (let idx = 0; idx < mrbByPage.length; idx++) {
        const mrbInPage = mrbByPage[idx];
        if (mrbInPage === undefined) continue;

        for (let i = 0; i < mrbInPage.length; i++) {
            const eachMrb = getNestedRect(
                parseInt(pdfWidth),
                parseInt(pdfHeight),
                10,
                mrbInPage[i]
            );

            const cropGeometry = { 
                left: parseInt(eachMrb[0][0]) * SCALE_FACTOR_EXPORT,
                top: parseInt(eachMrb[0][1]) * SCALE_FACTOR_EXPORT,
                width: parseInt(eachMrb[1][0] - eachMrb[0][0]) * SCALE_FACTOR_EXPORT,
                height: parseInt(eachMrb[1][1] - eachMrb[0][1]) * SCALE_FACTOR_EXPORT,
            };

            const croppedImage = await sharp(imageByPage[idx])
                .extract(cropGeometry)
                .png()
                .toBuffer();
            
            clipsByPage[idx] = [
                ...(clipsByPage[idx] || []),
                croppedImage,
            ];
        }
    }

    return clipsByPage;
}
