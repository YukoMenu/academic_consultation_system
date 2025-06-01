/* ----- START OF GENERATE-SUMMARY.JS */
(() => {
  // Wait for dynamic content to load
  const init = () => {
    const form = document.getElementById('generate-summary-form');
    const collegeTermSelect = document.getElementById('college_term');
    const bedShsTermSelect = document.getElementById('bed_shs_term');
    const yearLevelInput = document.getElementById('year_level');
    const generateSummaryBtn = document.getElementById('generate-summary-btn');

    // Check if elements exist
    if (!form || !collegeTermSelect || !bedShsTermSelect || !yearLevelInput || !generateSummaryBtn) {
      console.error('Required form elements not found');
      return;
    }

    // Generate Summary button click handler
    generateSummaryBtn.addEventListener('click', async function () {
      const spinner = this.querySelector('.loading-spinner');
      
      try {
        // Show loading state
        this.disabled = true;
        spinner.classList.remove('hidden');
        
        const year_level = form.year_level.value;
        const college_term = form.college_term.value;
        const bed_shs_term = form.bed_shs_term.value;

        // Validation: Ensure year_level and one term type is selected
        if (!year_level) {
          alert('Please select a Year Level');
          return;
        }
        if ((college_term && bed_shs_term) || (!college_term && !bed_shs_term)) {
          alert('Please select either College Term or BED/SHS Term, not both.');
          return;
        }

        // Fetch consultation data with calculated totals
        const res = await fetch(`/api/consultation-form/summary-source?year_level=${encodeURIComponent(year_level)}&college_term=${encodeURIComponent(college_term)}`);
        const data = await res.json();

        if (!data.number_of_students) {
          alert('No consultation records found for the selected criteria.');
          return;
        }

        // Auto-fill the calculated values
        form.number_of_students.value = data.number_of_students;
        form.total_hours.value = data.total_hours;

        // Generate summary from concatenated concerns
        const textToSummarize = [
          ...data.course_concerns,
          ...data.intervention,
          ...data.nature_of_concerns
        ].filter(Boolean).join('. ');

        // Get NLP summary
        const summaryRes = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToSummarize })
        });
        const summaryData = await summaryRes.json();

        // Display results
        document.getElementById('generated-summary').style.display = '';
        document.getElementById('summary-report').value = summaryData.summary || 'No summary generated.';

      } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate summary. Please try again.');
      } finally {
        // Reset loading state
        this.disabled = false;
        spinner.classList.add('hidden');
      }
    });

    // Term selection handlers
    collegeTermSelect.addEventListener('change', function () {
      const yearLevel = form.year_level.value;
      bedShsTermSelect.disabled = !!this.value;
      if (this.value && yearLevel) {
        generateSummaryBtn.click();
      }
    });

    bedShsTermSelect.addEventListener('change', function () {
      const yearLevel = form.year_level.value;
      collegeTermSelect.disabled = !!this.value;
      if (this.value && yearLevel) {
        generateSummaryBtn.click();
      }
    });

    // Year level change handler
    yearLevelInput.addEventListener('change', function () {
      const collegeTerm = collegeTermSelect.value;
      const bedShsTerm = bedShsTermSelect.value;
      if (this.value && (collegeTerm || bedShsTerm)) {
        generateSummaryBtn.click();
      }
    });

    // Add this event listener for the save button
    document.getElementById('save-summary-btn').addEventListener('click', async function() {
      const summaryReport = document.getElementById('summary-report');

      if (!form || !summaryReport || !summaryReport.value.trim()) {
        alert('Please generate a summary first');
        return;
      }

      try {
        const payload = {
          school: form.school.value,
          year_level: form.year_level.value,
          academic_year: form.academic_year.value,
          college_term: form.college_term.value || null,
          bed_shs_term: form.bed_shs_term.value || null,
          number_of_students: parseInt(form.number_of_students.value),
          total_hours: parseFloat(form.total_hours.value),
          summary_report: summaryReport.value
        };

        const res = await fetch('/api/consultation-form/save-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        
        if (data.success) {
          alert('Summary saved successfully!');
          // Redirect to history page
          loadPage('history/history.html');
        } else {
          throw new Error(data.error || 'Failed to save summary');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to save summary. Please try again.');
      }
    });
  };

  // Run initialization when content is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
/* ----- END OF GENERATE-SUMMARY.JS */