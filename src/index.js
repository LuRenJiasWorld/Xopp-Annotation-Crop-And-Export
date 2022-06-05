/*
 * 从 Xournal++ 获取 PDF 文件位置 & 每一页的批注内容
 * 批注内容计算并集，取相邻的批注聚合为一大片区域，再从 PDF 中将该片区域输出成图片
 */
import * as FileReader        from './steps/10-file-reader.js';
import * as XoppParser        from './steps/20-xopp-parser.js';
import * as GeometryConverter from './steps/30-geometry-converter.js';
import * as RtreeCluster      from './steps/40-rtree-cluster.js';
import * as ImageClipper      from './steps/50-image-clipper.js';
import * as FileSaver         from './steps/60-file-saver.js';


const exportAnnotationFromPDF = async (xoppPath, filePath, savePath) => {
    // -------------10-file-reader-------------
    // 读取 PDF 文件
    const pdfFile = await FileReader.readPdfFile(filePath);

    // 读取压缩的文件
    const compressedXoppFile = await FileReader.readCompressedXoppFile(xoppPath);

    // 解压数据
    const xoppData = await FileReader.uncompressCompressedXoppFile(compressedXoppFile);

    // 检查数据有无损坏
    FileReader.checkXmlValidation(xoppData);

    // 读取数据到 XML
    const xoppXmlData = FileReader.readXmlToJson(xoppData);
    // -------------10-file-reader-------------

    // -------------20-xopp-parser-------------
    // 获取 Xopp 数据
    const { pages, pdfMeta, pdfFileName, pdfHeight, pdfWidth } = XoppParser.getXoppData(xoppXmlData);

    // 遍历批注
    const strokeByPage = XoppParser.getStrokeByPage(pages);
    // -------------20-xopp-parser-------------

    // -------------30-geometry-converter-------------
    // 转换stroke数据为坐标数据
    const geometryByPage = GeometryConverter.strokeToGeometry(strokeByPage);

    // 对矩形进行膨胀处理，以便计算相邻
    const geometryWithPaddingByPage = GeometryConverter.addPaddingToGeometries(geometryByPage);
    // -------------30-geometry-converter-------------

    // -------------40-rtree-cluster-------------
    // 构建 R 树
    const rtreeByPage = RtreeCluster.rtreeBuilder(geometryWithPaddingByPage, pdfHeight, pdfWidth);
    
    // 构建每一页相邻矩形的最小外接矩形
    const mrbByPage = RtreeCluster.mrbFinder(rtreeByPage);
    // -------------40-rtree-cluster-------------


    // -------------50-image-clipper-------------
    // 将有批注的页面转换为图片
    const imageByPage = await ImageClipper.getImageOfStrokedPages(mrbByPage, pdfFile, pdfWidth, pdfHeight);

    // 将每一页批注所在区域剪切下来
    const clipsByPage = await ImageClipper.clipImageFromPage(imageByPage, mrbByPage, pdfWidth, pdfHeight)
    // -------------50-image-clipper-------------

    // -------------60-file-saver-------------
    // 将剪切下来的图片保存成文件
    await FileSaver.saveClipsToFile(clipsByPage, savePath)
    // -------------60-file-saver-------------
}

exportAnnotationFromPDF(
    '/home/lurenjiasworld/Downloads/R树 - 维基百科，自由的百科全书.xopp',
    '/home/lurenjiasworld/Downloads/R树 - 维基百科，自由的百科全书_xournal_exported.pdf',
    './export',
);
