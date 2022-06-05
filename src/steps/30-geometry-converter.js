import { CLUSTER_FIND_AREA } from '../constant.js';


export const strokeToGeometry = (strokeByPage) => {
    const geometryByPage = new Array(strokeByPage.length);
    strokeByPage.forEach((strokeInPage, idx) => {
        const geometryInPage = strokeInPage.map((eachStroke) => {
            const strokeInfo = eachStroke['#text'].split(' ').map(str => parseFloat(str));
            const strokeWidth = parseFloat(eachStroke['@_width']);

            return [
                [strokeInfo[0], strokeInfo[1]],
                [strokeInfo[2], strokeInfo[3]],
                [strokeInfo[2], strokeInfo[3] + strokeWidth],
                [strokeInfo[0], strokeInfo[1] + strokeWidth],
            ];
        })

        geometryByPage[idx] = geometryInPage;
    });
    
    return geometryByPage;
};

export const addPaddingToGeometries = (geometryByPage) => {
    const geometryWithPaddingByPage = geometryByPage.map(geometryInPage => 
        geometryInPage.map(geometry => (
            [
                [geometry[0][0] - CLUSTER_FIND_AREA, geometry[0][1] - CLUSTER_FIND_AREA],
                [geometry[1][0] + CLUSTER_FIND_AREA, geometry[1][1] - CLUSTER_FIND_AREA],
                [geometry[2][0] + CLUSTER_FIND_AREA, geometry[2][1] + CLUSTER_FIND_AREA],
                [geometry[3][0] - CLUSTER_FIND_AREA, geometry[3][1] + CLUSTER_FIND_AREA],
            ]
        ))
    );

    return geometryWithPaddingByPage;
};
