export class PrintRequest {
  constructor(
    printerName,
    applicationName,
    filePath,
    chromacityType,
    mediaSize,
    fromPageNbr,
    toPageNbr
  ) {
    this.printerName = printerName;
    this.applicationName = applicationName;
    this.filePath = filePath;
    this.chromacityType = chromacityType;
    this.mediaSize = mediaSize;
    this.fromPageNbr = fromPageNbr;
    this.toPageNbr = toPageNbr;
  }
}
