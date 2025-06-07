/* START OF GENERATE-PDF.JS */
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');

router.get('/appointment-html/:id', async (req, res) => {
    const id = req.params.id;
    // Fetch appointment and students as before...
    db.get(`
        SELECT cf.*, u.name AS faculty_name
        FROM consultation_form cf
        JOIN faculty f ON cf.faculty_id = f.user_id
        JOIN users u ON f.user_id = u.id
        WHERE cf.consultation_id = ?
    `, [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Not found' });

        db.all(`
            SELECT s.user_id, u.name
            FROM consultation_students cs
            JOIN students s ON cs.student_id = s.user_id
            JOIN users u ON s.user_id = u.id
            WHERE cs.consultation_id = ?
        `, [id], async (err, students) => {
            if (err) return res.status(500).json({ error: err.message });

            // Prepare data for template
            const concerns = (row.nature_of_concerns || '').toLowerCase();
            const othersMatch = concerns.match(/others[:\-]?\s*(.*)/i);
            const concernChecks = {
                decision_making: concerns.includes('decision') ? '✓' : '_',
                study_skills: concerns.includes('study') ? '✓' : '_',
                monitoring: concerns.includes('monitoring') ? '✓' : '_',
                others: othersMatch ? '✓' : '_',
                others_info: othersMatch && othersMatch[1] ? othersMatch[1].trim() : ''
            };

            const data = {
                date: row.date,
                faculty_name: row.faculty_name,
                student_names: students.map(s => s.name).join(', '),
                course_code: row.course_code,
                term: row.term,
                venue: row.venue,
                program: row.program,
                start_time: row.start_time,
                end_time: row.end_time,
                course_concerns: row.course_concerns,
                intervention: row.intervention,
                nature_of_concerns: row.nature_of_concerns,
                decision_making_check: concernChecks.decision_making,
                study_skills_check: concernChecks.study_skills,
                monitoring_check: concernChecks.monitoring,
                others_check: concernChecks.others,
                others_info: concernChecks.others_info
            };

            // Load and compile HTML template
            const templatePath = path.join(__dirname, '..', 'templates', 'fill-up-form.html');
            const html = fs.readFileSync(templatePath, 'utf8');
            const compiled = Handlebars.compile(html);
            const filledHtml = compiled(data);

            // Generate PDF with Puppeteer
            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();
            await page.setContent(filledHtml, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
            await browser.close();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=appointment_${id}.pdf`);
            res.send(pdfBuffer);
        });
    });
});

router.get('/summary-html/:id', async (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM consultation_summary WHERE id = ?`, [id], async (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Not found' });

        // Define possible terms
        const collegeTerms = ["Prelim", "Midterm", "PreFinal"];
        const bedShsTerms = ["1st_Qtr", "2nd_Qtr", "3rd_Qtr", "4th_Qtr"];

        // Prepare checkmarks for each term
        const collegeTermChecks = {};
        collegeTerms.forEach(term => {
            collegeTermChecks[term] = (row.college_term === term) ? '✓' : '_';
        });

        const bedShsTermChecks = {};
        bedShsTerms.forEach(term => {
            bedShsTermChecks[term] = (row.bed_shs_term === term) ? '✓' : '_';
        });

        // Prepare data for template
        const data = {
            school: row.school,
            year_level: row.year_level,
            academic_year: row.academic_year,
            number_of_students: row.number_of_students,
            total_hours: row.total_hours,
            date_created: row.date_created,
            summary_report: row.summary_report,
            prelim_check: collegeTermChecks["Prelim"],
            midterm_check: collegeTermChecks["Midterm"],
            prefinal_check: collegeTermChecks["PreFinal"],
            first_qtr_check: bedShsTermChecks["1st_Qtr"],
            second_qtr_check: bedShsTermChecks["2nd_Qtr"],
            third_qtr_check: bedShsTermChecks["3rd_Qtr"],
            fourth_qtr_check: bedShsTermChecks["4th_Qtr"]
        };

        // Load and compile HTML template
        const templatePath = path.join(__dirname, '..', 'templates', 'summary-form.html');
        const html = fs.readFileSync(templatePath, 'utf8');
        const compiled = Handlebars.compile(html);
        const filledHtml = compiled(data);

        // Generate PDF with Puppeteer
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setContent(filledHtml, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=summary_${id}.pdf`);
        res.send(pdfBuffer);
    });
});

module.exports = router;
/* END OF GENERATE-PDF.JS */