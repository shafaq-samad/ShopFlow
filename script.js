document.addEventListener('DOMContentLoaded', () => {
    const summarizeBtn = document.getElementById('summarizeBtn');
    const copyBtn = document.getElementById('copyBtn');
    const exportBtn = document.getElementById('exportBtn');
    const inputText = document.getElementById('inputText');
    const outputSection = document.getElementById('outputSection');
    const executiveSummaryDiv = document.querySelector('#executiveSummary .content');
    const actionItemsDiv = document.querySelector('#actionItems .content');
    const quickInsightsDiv = document.querySelector('#quickInsights .content');

    // Detect system theme for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    }

    // Function to simulate API call and get a brief
    async function getBrief(text, tone) {
        // In a real app, this would be an API call to OpenAI, Cohere, etc.
        // For this demo, we'll return a static, structured response.
        return {
            executiveSummary: "This project aims to streamline professional workflows by providing instant, AI-generated context. It solves the common problem of information overload and wasted time by offering a three-tiered brief.",
            actionItems: [
                "Implement the NLP API integration.",
                "Design and build the one-page user interface.",
                "Add 'Copy to Clipboard' and 'Export PDF' functionality."
            ],
            quickInsights: [
                "The primary risk is API cost management for high-volume usage.",
                "A key trend is the increasing demand for tools that reduce context-switching.",
                "Initial user feedback suggests the 'typing' animation is a highly engaging feature."
            ]
        };
    }

    // Function to add typing animation
    async function typeText(element, text) {
        element.innerHTML = ''; // Clear previous content
        let i = 0;
        const typingInterval = 20; // Typing speed in ms
        const cursor = document.createElement('span');
        cursor.classList.add('typing-cursor');

        element.appendChild(cursor);

        const typePromise = new Promise(resolve => {
            function type() {
                if (i < text.length) {
                    const char = text.charAt(i);
                    const span = document.createElement('span');
                    span.textContent = char;
                    element.insertBefore(span, cursor);
                    i++;
                    setTimeout(type, typingInterval);
                } else {
                    cursor.remove();
                    resolve();
                }
            }
            type();
        });

        return typePromise;
    }

    summarizeBtn.addEventListener('click', async () => {
        const text = inputText.value;
        if (!text) {
            alert("Please paste some text or a URL.");
            return;
        }
        
        // Hide previous output
        outputSection.style.display = 'none';
        
        // Simulating the API call
        summarizeBtn.disabled = true;
        summarizeBtn.textContent = 'Generating...';

        const tone = document.getElementById('toneSelect').value;
        const brief = await getBrief(text, tone);

        // Show output section and start typing animation
        outputSection.style.display = 'block';

        // Animate each section sequentially
        await typeText(executiveSummaryDiv, brief.executiveSummary);
        await typeText(actionItemsDiv, brief.actionItems.map(item => `- ${item}`).join('\n'));
        await typeText(quickInsightsDiv, brief.quickInsights.map(item => `- ${item}`).join('\n'));

        summarizeBtn.disabled = false;
        summarizeBtn.textContent = 'Summarize';
    });

    copyBtn.addEventListener('click', () => {
        const fullBrief = `
**Executive Summary:**
${executiveSummaryDiv.innerText}

**Action Items:**
${actionItemsDiv.innerText}

**Quick Insights:**
${quickInsightsDiv.innerText}
        `.trim();
        
        navigator.clipboard.writeText(fullBrief)
            .then(() => {
                alert("Brief copied to clipboard!");
            })
            .catch(err => {
                console.error("Failed to copy text: ", err);
                alert("Could not copy. Please try again or copy manually.");
            });
    });

    exportBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let yPos = 20;
        const margin = 15;
        const lineHeight = 10;
        
        doc.setFontSize(22);
        doc.text("Contextly Brief", margin, yPos);
        yPos += 15;
        
        doc.setFontSize(16);
        doc.text("Executive Summary", margin, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);
        const executiveSummaryLines = doc.splitTextToSize(executiveSummaryDiv.innerText, 180);
        doc.text(executiveSummaryLines, margin, yPos);
        yPos += (executiveSummaryLines.length * lineHeight) + 5;
        
        doc.setFontSize(16);
        doc.text("Action Items", margin, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);
        const actionItemsLines = doc.splitTextToSize(actionItemsDiv.innerText, 180);
        doc.text(actionItemsLines, margin, yPos);
        yPos += (actionItemsLines.length * lineHeight) + 5;
        
        doc.setFontSize(16);
        doc.text("Quick Insights", margin, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);
        const quickInsightsLines = doc.splitTextToSize(quickInsightsDiv.innerText, 180);
        doc.text(quickInsightsLines, margin, yPos);
        
        doc.save("Contextly_Brief.pdf");
    });
});