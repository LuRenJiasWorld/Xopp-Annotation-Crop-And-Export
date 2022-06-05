import RBush from 'rbush';

import { limitNumberToRange } from '../utils.js';


export const rtreeBuilder = (geometryWithPaddingByPage, pdfHeight, pdfWidth) => {
    const rtreeByPage = new Array(geometryWithPaddingByPage.length);
    geometryWithPaddingByPage.forEach((geometryInPage, idx) => {
        const tree = new RBush();
        geometryInPage.forEach(eachGeometry => {
            tree.insert({
                minX: limitNumberToRange(0, pdfWidth , eachGeometry[0][0]),
                minY: limitNumberToRange(0, pdfHeight, eachGeometry[0][1]),
                maxX: limitNumberToRange(0, pdfWidth , eachGeometry[2][0]),
                maxY: limitNumberToRange(0, pdfHeight, eachGeometry[2][1]),
            });
        });

        rtreeByPage[idx] = tree;
    });

    return rtreeByPage;
};

export const mrbFinder = (rtreeByPage) => {
    const mrbByPage = new Array(rtreeByPage.length);
    rtreeByPage.forEach((rtreeInPage, idx) => {
        let clusteredNodeInPage = [new Set()];

        while (rtreeInPage.all().length !== 0) {
            // 按 minY 排序
            // 如果不排序，聚类可能会因为pick无法按顺序进行，导致
            const allRemainingNodes = rtreeInPage.all().sort((a, b) => a.minY > b.minY ? 1 : -1);

            const needle = allRemainingNodes.shift();
            const intersectedNode = rtreeInPage.search(needle);
            
            // 有相邻矩形，将获得的相邻矩形放入当前聚类中
            intersectedNode.forEach(eachNode => {
                clusteredNodeInPage[0].add(eachNode);
            })

            // 接下来没有相邻矩形了，开始新的聚类
            // 如果只剩最后一个节点，就不需要再新建聚类了
            if (intersectedNode.length === 1 && allRemainingNodes.length !== 0) {
                clusteredNodeInPage.unshift(new Set());
            }

            // 从树中把 needle 删掉
            rtreeInPage.remove(needle);
        }

        // Set 转数组
        clusteredNodeInPage = clusteredNodeInPage.map(clusteredNode => Array.from(clusteredNode));

        // 获取每个聚类的最小坐标（左上角）和最大坐标（右下角）
        clusteredNodeInPage.forEach(clusteredNode => {
            const allX = [
                ...clusteredNode.map(eachNode => eachNode.minX),
                ...clusteredNode.map(eachNode => eachNode.maxX),
            ];

            const allY = [
                ...clusteredNode.map(eachNode => eachNode.minY),
                ...clusteredNode.map(eachNode => eachNode.maxY),
            ];

            mrbByPage[idx] = [
                ...(mrbByPage[idx] || []),
                [
                    [Math.min(...allX), Math.min(...allY)],
                    [Math.max(...allX), Math.max(...allY)],
                ]
            ];
        });
    });

    return mrbByPage;
}
