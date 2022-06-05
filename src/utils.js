export const getNestedRect = (maxWidth, maxHeight, padding, pos) => {
    const maxWidthWithPadding = maxWidth - padding;
    const maxHeightWithPadding = maxHeight - padding;

    const getNestedWidth = (x) => {
        if (x > maxWidthWithPadding) return maxWidthWithPadding;
        if (x < padding) return padding;
        return x;
    }

    const getNestedHeight = (y) => {
        if (y > maxHeightWithPadding) return maxHeightWithPadding;
        if (y < padding) return padding;
        return y;
    }

    const x1 = getNestedHeight(pos[0][0]);
    const y1 = getNestedHeight(pos[0][1]);

    const x2 = getNestedWidth(pos[1][0]);
    const y2 = getNestedHeight(pos[1][1]);

    return [
        [x1, y1],
        [x2, y2],
    ];
};

export const limitNumberToRange = (min, max, number) => (
    Math.min(Math.max(parseInt(number), min), max)
);
