import express from "express";
import cors from "cors";
import ptp from "pdf-to-printer";
import { PrintRequest } from "./printrequest.js";
import bodyParser from "body-parser";
import { PrintResponse } from "./PrintResponse.js";
import { execSync } from "node:child_process";

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("", async (req, res) => {
  try {
    var printers = await ptp.getPrinters();

    const output = execSync(`wmic printer get Name,WorkOffline /format:csv`, {
      encoding: "utf-8",
    });
    
    const onlineSet = new Set();

    output.split("\n").forEach((line) => {
      const parts = line.trim().split(",");
      const name = parts[1];
      const isOffline = parts[2];
      if (name && isOffline === "FALSE") {
        onlineSet.add(name);
      }
    });

    // Filter only printers that are online
    const onlinePrinters = printers.filter((p) => onlineSet.has(p.name));
    res.status(200).json(onlinePrinters.map((printer) => printer.name));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch printers",
      error: error.message,
    });
  }
});

app.post("", async (req, res) => {
  const printRequest = new PrintRequest(
    req.body.printerName,
    req.body.applicationName,
    req.body.fileName,
    req.body.chromacityType,
    req.body.mediaSize,
    req.body.fromPageNbr,
    req.body.toPageNbr
  );
  const options = {
    printer: printRequest.printerName,
    scale: "fit",
    side: "simplex",
    paperSize: printRequest.mediaSize,
  };

  if (printRequest.chromacityType != "Monochrome") {
    options.monochrome = false;
  } else {
    options.monochrome = true;
  }

  const filePath = printRequest.filePath;

  ptp
    .print(filePath, options)
    .then(() => {
      let response = new PrintResponse("Print Success", true);
      res.status(200).send(response);
    })
    .catch((error) => {
      let response = new PrintResponse(error, false);
      res.status(500).send(response);
    });
});

app.listen(port, () => {
  console.log(`PDF Printing Service listening on port ${port}`);
});
