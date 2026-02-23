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

  const nodes: any[] = [
    {
      ...(header.image
        ? {
            table: {
              widths: [120, '*'],
              body: [
                [
                  {
                    image: header.image,
                    fit: [120, 120],
                    alignment: 'left',
                    valign: 'middle',
                  },
                  {
                    stack: titleStack,
                    margin: [12, 0, 0, 0],
                    valign: 'middle',
                  },
                ],
              ],
            },
            layout: 'noBorders',
          }
        : { stack: titleStack }),
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
