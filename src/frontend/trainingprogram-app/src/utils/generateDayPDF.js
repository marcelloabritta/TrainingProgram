import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

/**
 * Geração de PDF para o Plano do Dia
 * @param {Date} date - Data do dia
 * @param {Array} sessions - Sessões de treino do dia
 * @param {string} teamName - Nome do time/plano
 */
export const generateDayPDF = (date, sessions, teamName = "Training") => {
  try {
    const doc = new jsPDF();
    const formattedDate = format(date, "dd/MM/yyyy");
    const dayOfWeek = format(date, "EEEE");
    const timestamp = format(new Date(), "MM/dd/yyyy HH:mm");

    // Header
    doc.setFontSize(22);
    doc.setTextColor(31, 41, 55);
    doc.text("DAILY TRAINING PLAN", 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Team/Program: ${teamName}`, 14, 30);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(178, 230, 66); // Theme Lime Green
    doc.text(`Date: ${formattedDate} (${dayOfWeek})`, 14, 38);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(120);
    doc.text(`Generated on: ${timestamp}`, 14, 45);

    // --- PART 1: SESSION SCHEDULE ---
    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text("1. Activity Schedule", 14, 55);

    const scheduleBody = [];
    sessions.forEach(session => {
        if (session.IsRestDay) {
            scheduleBody.push([{ content: `${session.Period || 'Day'}: REST DAY`, colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: [240, 240, 240] } }]);
        } else {
            // Session Header
            scheduleBody.push([{ content: `PERIOD: ${session.Period}`, colSpan: 4, styles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold' } }]);
            
            // Session Activities
            const activities = session.Activities || [];
            if (activities.length === 0) {
                scheduleBody.push([{ content: "No activities planned", colSpan: 4, styles: { halign: 'center', italic: true } }]);
            } else {
                activities.forEach(act => {
                    const exercise = act.Exercise?.Name || "Activity";
                    // Priority: Observations > Variation > Combinations
                    const obs = act.Observations || act.Variation || act.Exercise?.Combinations || "-";
                    const category = act.Category?.Name || "-";
                    const duration = `${act.DurationMinutes || 0} min`;
                    
                    scheduleBody.push([category, exercise, duration, obs]);
                });
            }
        }
    });

    autoTable(doc, {
      startY: 60,
      head: [["Category", "Exercise/Activity", "Duration", "Observations"]],
      body: scheduleBody,
      theme: 'grid',
      headStyles: { fillColor: [178, 230, 66], textColor: [0, 0, 0], fontStyle: 'bold', valign: 'middle' },
      styles: { fontSize: 10, cellPadding: 3, valign: 'middle' },
    });

    // --- PART 2: SUMMARY BY CATEGORY BLOCKS ---
    let currentY = doc.lastAutoTable.finalY + 15;
    if (currentY > 230) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55);
    doc.text("2. Activity Summary (Grouped by Category)", 14, currentY);

    // Group activities: { Category: { exercises: {}, total: 0 } }
    const groupedData = {};
    sessions.forEach(session => {
        if (!session.IsRestDay) {
            (session.Activities || []).forEach(act => {
                const catName = act.Category?.Name || "Other";
                const exName = act.Exercise?.Name || "Unknown Activity";
                
                if (!groupedData[catName]) {
                    groupedData[catName] = { exercises: {}, total: 0 };
                }
                
                if (!groupedData[catName].exercises[exName]) {
                    groupedData[catName].exercises[exName] = 0;
                }
                const mins = (act.DurationMinutes || 0);
                groupedData[catName].exercises[exName] += mins;
                groupedData[catName].total += mins;
            });
        }
    });

    let currentTableY = currentY + 10;

    Object.entries(groupedData).forEach(([category, data]) => {
        const catBody = Object.entries(data.exercises)
          .sort(([, a], [, b]) => b - a)
          .map(([exName, time]) => [
            { content: exName, styles: { cellPadding: { left: 10 } } },
            { content: `${time} min`, styles: { halign: 'center' } }
          ]);

        autoTable(doc, {
          startY: currentTableY,
          head: [[
            { content: category, styles: { halign: 'left' } },
            { content: `Total: ${data.total} min`, styles: { halign: 'right' } }
          ]],
          body: catBody,
          theme: 'striped',
          headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold', valign: 'middle' },
          styles: { fontSize: 10, cellPadding: 3, valign: 'middle' },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 35, halign: 'center', fontStyle: 'bold' }
          },
          margin: { bottom: 5 },
          pageBreak: 'avoid'
        });

        currentTableY = doc.lastAutoTable.finalY + 5;
    });

    doc.save(`Training_Plan_${formattedDate.replace(/\//g, '-')}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Check console for details.");
  }
};
