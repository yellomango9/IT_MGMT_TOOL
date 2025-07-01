def export_peripherals_pdf(peripherals, filename="peripherals.pdf"):
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas

    c = canvas.Canvas(filename, pagesize=A4)
    width, height = A4
    y = height - 40

    c.setFont("Helvetica-Bold", 16)
    c.drawString(30, y, "Peripheral Devices Report")
    y -= 30
    c.setFont("Helvetica", 10)

    headers = ["ID", "Type", "Model", "Serial No", "System ID"]
    for h in headers:
        c.drawString(30 + headers.index(h)*100, y, h)

    y -= 20

    for p in peripherals:
        c.drawString(30, y, str(p["peripheral_id"]))
        c.drawString(130, y, p["type"])
        c.drawString(230, y, p["model"] or "")
        c.drawString(330, y, p["serial_number"] or "")
        c.drawString(430, y, str(p["assigned_to_system_id"]) if p["assigned_to_system_id"] else "None")
        y -= 20
        if y < 60:
            c.showPage()
            y = height - 40

    c.save()
