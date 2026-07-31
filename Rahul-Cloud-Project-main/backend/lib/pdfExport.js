import PDFDocument from "pdfkit";
export function generateUserPdf(user) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 56,
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fontSize(10).fillColor("#737373").text("USERHUB — CONTACT PROFILE");
    doc.moveDown(1.2);
    doc.fontSize(22).fillColor("#171717").text(user.name);
    doc.fontSize(11).fillColor("#737373").text(user.email);
    doc.moveDown(1);
    doc.moveTo(56, doc.y).lineTo(539, doc.y).strokeColor("#e4e4e4").stroke();
    doc.moveDown(1);
    const row = (label, value) => {
      if (!value) return;
      doc.fontSize(9).fillColor("#a3a3a3").text(label.toUpperCase());
      doc.fontSize(12).fillColor("#171717").text(value);
      doc.moveDown(0.8);
    };
    row("Company", user.company);
    row("Address", user.address);
    row("Phone", user.phone);
    row(
      "Joined",
      new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    doc.end();
  });
}
