import { promises as fsPromise } from "fs";
import { XMLParser, XMLValidator } from 'fast-xml-parser';

import zlib from 'zlib';
import { promisify } from 'util';

const gunzip = promisify(zlib.gunzip);


export const readCompressedXoppFile = async (xoppPath) => (
    await fsPromise.readFile(xoppPath)
);

export const readPdfFile = async (pdfPath) => (
    await fsPromise.readFile(pdfPath)
)

export const uncompressCompressedXoppFile = async (compressedXoppFile) => (
    (await gunzip(compressedXoppFile)).toString('utf-8')
);

export const checkXmlValidation = (xmlData) => {
    const xmlValidationResult = XMLValidator.validate(xmlData, { allowBooleanAttributes: true });
    if (xmlValidationResult !== true) {
        throw new Error('Xopp file corrupted, export aborted');
    }
}

export const readXmlToJson = (xoppData) => {
    const xmlParser = new XMLParser({ ignoreAttributes : false });
    const xoppXmlData = xmlParser.parse(xoppData);

    return xoppXmlData;
}
