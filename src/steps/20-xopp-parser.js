export const getXoppData = (xoppXmlData) => {
    const pages = xoppXmlData['xournal']['page'];

    const pdfMeta = pages
        .filter(eachPage => eachPage['background']['@_filename'])
            ['0'];
    const pdfFileName = pdfMeta['background']['@_filename'];
    const pdfHeight = pdfMeta['@_height'];
    const pdfWidth = pdfMeta['@_width'];

    return {
        pages,
        pdfMeta,
        pdfFileName,
        pdfHeight,
        pdfWidth,
    };
}

export const getStrokeByPage = (pages) => {
    const strokeByPage = new Array(pages.length);
    pages.forEach(eachPage => {
        const strokes = eachPage['layer']['stroke'];
        if (!strokes) return;

        // 暂时只识别线条
        const highlights = strokes
            .filter(eachstroke => (
                eachstroke['@_tool'] === 'highlighter'
                && eachstroke['#text'].split(' ').length === 4
            ));
        strokeByPage[eachPage['background']['@_pageno'] - 1] = highlights;
    });

    return strokeByPage;
}
