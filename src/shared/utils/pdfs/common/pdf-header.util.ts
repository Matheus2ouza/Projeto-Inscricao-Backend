export type PdfHeaderDefinition = {
  title: string;
  titleDetail?: string;
  subtitle?: string;
  image?: string;
};

export const buildPdfHeaderSection = (header: PdfHeaderDefinition) => {
  const titleStack: any[] = [
    {
      text: header.title.toUpperCase(),
      style: 'headerTitle',
      alignment: 'left',
    },
  ];

  if (header.titleDetail) {
    titleStack.push({
      text: header.titleDetail,
      style: 'headerTitleDetail',
      margin: [0, 2, 0, 0],
    });
  }

  const textColumn = header.image
    ? {
        width: '*',
        stack: titleStack,
        margin: [12, 10, 0, 0],
      }
    : {
        width: '*',
        stack: titleStack,
      };

  const columns = header.image
    ? [
        {
          width: 90,
          image: header.image,
          fit: [90, 60],
          alignment: 'left',
        },
        textColumn,
      ]
    : [textColumn];

  const nodes: any[] = [
    {
      columns,
      columnGap: 16,
      margin: [0, 0, 0, header.subtitle ? 6 : 16],
    },
  ];

  if (header.subtitle) {
    nodes.push({
      text: header.subtitle.toUpperCase(),
      style: 'headerSubtitle',
      alignment: 'center',
      margin: [0, 20, 0, 16],
    });
  }

  return nodes;
};
